import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const REST_URL = `${SUPABASE_URL}/rest/v1`;
const ALLOWED_ORIGINS = new Set(["https://heguiplanner.com", "https://www.heguiplanner.com"]);
const dbHeaders = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" };

function cors(req: Request) {
    const origin = req.headers.get("origin") || "";
    return {
        "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://heguiplanner.com",
        "Access-Control-Allow-Headers": "content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        Vary: "Origin"
    };
}

function json(req: Request, body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json" } });
}

async function sha256(value: string) {
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function select(path: string) {
    const response = await fetch(`${REST_URL}/${path}`, { headers: dbHeaders });
    if (!response.ok) throw new Error(`Database read failed: ${response.status}`);
    return await response.json();
}

async function mutate(path: string, method: string, body?: unknown, prefer = "return=minimal") {
    const response = await fetch(`${REST_URL}/${path}`, {
        method, headers: { ...dbHeaders, Prefer: prefer }, body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`Database write failed: ${response.status} ${await response.text()}`);
    return response;
}

async function setting(key: string) {
    const rows = await select(`hegui_notification_settings?key=eq.${encodeURIComponent(key)}&select=value`);
    return rows[0]?.value || "";
}

async function authorisedDevice(deviceId: string, token: string) {
    if (!deviceId || !token) return null;
    const rows = await select(`hegui_notification_devices?device_id=eq.${encodeURIComponent(deviceId)}&select=*`);
    const device = rows[0];
    return device && device.token_hash === await sha256(token) ? device : null;
}

async function send(subscription: Record<string, unknown>, payload: Record<string, unknown>) {
    const vapidPublic = await setting("vapid_public_key");
    const vapidPrivate = await setting("vapid_private_key");
    webpush.setVapidDetails("mailto:45james.black@gmail.com", vapidPublic, vapidPrivate);
    return await webpush.sendNotification(subscription, JSON.stringify(payload), { TTL: 86400, urgency: "high" });
}

async function dispatch(req: Request) {
    const cronToken = await setting("cron_token");
    if (!cronToken || req.headers.get("x-hegui-cron") !== cronToken) return json(req, { error: "Forbidden" }, 403);
    const now = new Date();
    const oldest = new Date(now.getTime() - 10 * 60000).toISOString();
    const due = await select(`hegui_notification_reminders?sent_at=is.null&scheduled_at=gte.${encodeURIComponent(oldest)}&scheduled_at=lte.${encodeURIComponent(now.toISOString())}&select=*&order=scheduled_at.asc&limit=100`);
    let sent = 0;
    for (const reminder of due) {
        try {
            const starts = new Date(reminder.event_starts_at).toLocaleString("en-AU", { timeZone: "Australia/Sydney", weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
            await send(reminder.subscription, {
                title: reminder.kind === "day" ? "Hé Guǐ — tomorrow" : "Hé Guǐ — in 2 hours",
                body: `${reminder.title} · ${starts}`,
                tag: `hegui-${reminder.id}`,
                url: `/?plannerDate=${reminder.event_date}`
            });
            await mutate(`hegui_notification_reminders?id=eq.${reminder.id}`, "PATCH", { sent_at: new Date().toISOString() });
            sent += 1;
        } catch (error) {
            console.error("Reminder delivery failed", reminder.id, error);
        }
    }
    return json(req, { checked: due.length, sent });
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
    if (req.method !== "POST") return json(req, { error: "POST required" }, 405);
    try {
        const body = await req.json();
        if (body.action === "dispatch") return await dispatch(req);
        if (!ALLOWED_ORIGINS.has(req.headers.get("origin") || "")) return json(req, { error: "Origin not allowed" }, 403);

        if (body.action === "register") {
            const existing = await select(`hegui_notification_devices?device_id=eq.${encodeURIComponent(body.device_id)}&select=token_hash`);
            const tokenHash = await sha256(body.device_token || "");
            if (existing.length && existing[0].token_hash !== tokenHash) return json(req, { error: "Phone identity could not be verified." }, 403);
            await mutate("hegui_notification_devices?on_conflict=device_id", "POST", {
                device_id: body.device_id, token_hash: tokenHash, subscription: body.subscription,
                timezone: body.timezone || "Australia/Sydney", updated_at: new Date().toISOString()
            }, "resolution=merge-duplicates,return=minimal");
            return json(req, { ok: true });
        }

        const device = await authorisedDevice(body.device_id, body.device_token);
        if (!device) return json(req, { error: "Phone identity could not be verified." }, 403);

        if (body.action === "unregister") {
            await mutate(`hegui_notification_devices?device_id=eq.${encodeURIComponent(body.device_id)}`, "DELETE");
            return json(req, { ok: true });
        }
        if (body.action === "test") {
            await send(device.subscription, { title: "Hé Guǐ notifications are on", body: "Planner reminders will appear here.", tag: "hegui-test", url: "/" });
            return json(req, { ok: true });
        }
        if (body.action === "sync") {
            await mutate(`hegui_notification_reminders?device_id=eq.${encodeURIComponent(body.device_id)}&sent_at=is.null`, "DELETE");
            const reminders = Array.isArray(body.reminders) ? body.reminders.slice(0, 200) : [];
            if (reminders.length) await mutate("hegui_notification_reminders", "POST", reminders.map((item: Record<string, unknown>) => ({
                device_id: body.device_id, subscription: device.subscription, ...item
            })));
            return json(req, { ok: true, reminders: reminders.length });
        }
        return json(req, { error: "Unknown action" }, 400);
    } catch (error) {
        console.error(error);
        return json(req, { error: "The reminder service could not complete that request." }, 500);
    }
});
