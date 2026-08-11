/**
 * Hé Guǐ Personal Calendar proxy — Cloudflare Worker
 *
 * Deploy this Worker once, then copy its https://...workers.dev URL into
 * PERSONAL_CALENDAR_PROXY_URL near the top of app.js.
 *
 * The user's private ICS URL is accepted only in a POST JSON body so it is
 * not exposed in the proxy URL. Do not add request-body logging.
 */

const ALLOWED_ORIGINS = new Set([
  "https://heguiplanner.com",
  "https://www.heguiplanner.com"
]);

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://heguiplanner.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
    "Cache-Control": "no-store"
  };
}

function response(text, status, origin, extra = {}) {
  return new Response(text, {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "text/plain; charset=utf-8",
      ...extra
    }
  });
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      if (!ALLOWED_ORIGINS.has(origin)) return response("Forbidden", 403, origin);
      return response("", 204, origin);
    }

    if (request.method !== "POST") return response("Method not allowed", 405, origin);
    if (!ALLOWED_ORIGINS.has(origin)) return response("Forbidden", 403, origin);

    let body;
    try {
      body = await request.json();
    } catch {
      return response("Invalid JSON", 400, origin);
    }

    let calendarUrl;
    try {
      calendarUrl = new URL(String(body?.url || "").replace(/^webcal:\/\//i, "https://"));
    } catch {
      return response("Invalid calendar URL", 400, origin);
    }

    if (calendarUrl.protocol !== "https:") return response("HTTPS calendar URLs only", 400, origin);

    // Prevent this tiny proxy from becoming a general-purpose open proxy.
    // Add another trusted calendar hostname here later if Hé Guǐ supports it.
    const allowedCalendarHosts = new Set([
      "calendar.google.com",
      "www.google.com"
    ]);
    if (!allowedCalendarHosts.has(calendarUrl.hostname.toLowerCase())) {
      return response("Calendar provider is not allowed", 403, origin);
    }

    let upstream;
    try {
      upstream = await fetch(calendarUrl.toString(), {
        method: "GET",
        redirect: "follow",
        headers: { "User-Agent": "HeGuiPlanner-Calendar/1.0" },
        cf: { cacheTtl: 0, cacheEverything: false }
      });
    } catch {
      return response("Calendar provider could not be reached", 502, origin);
    }

    if (!upstream.ok) return response(`Calendar provider returned ${upstream.status}`, 502, origin);

    const text = await upstream.text();
    if (!/BEGIN:VCALENDAR/i.test(text)) return response("Calendar provider did not return ICS data", 502, origin);

    return response(text, 200, origin, { "Content-Type": "text/calendar; charset=utf-8" });
  }
};
