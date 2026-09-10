"use strict";

(() => {
    const API_URL = "https://uxkwtmbdxtsynvblyazq.supabase.co/functions/v1/hegui-reminders";
    const VAPID_PUBLIC_KEY = "B14alJ84nrHQ_xZlqo5d22CUb0hTx0i8Zvpk5gk5Q0R0QDhsRbuVwj2n7wZ55PJfiYGq6T94d1VyhWa0-9dk7D4";
    const STORAGE_DEVICE_TOKEN = "heguiNotificationDeviceTokenV1";

    function base64UrlToUint8Array(value) {
        const padding = "=".repeat((4 - value.length % 4) % 4);
        const raw = atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"));
        return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
    }

    function isIos() {
        return /iphone|ipad|ipod/i.test(navigator.userAgent);
    }

    function isInstalled() {
        return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    }

    function deviceCredentials() {
        const deviceId = window.getHeguiDeviceId?.() || localStorage.getItem("hegui_device_id") || crypto.randomUUID();
        localStorage.setItem("hegui_device_id", deviceId);
        let token = localStorage.getItem(STORAGE_DEVICE_TOKEN);
        if (!token) {
            token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, "0")).join("");
            localStorage.setItem(STORAGE_DEVICE_TOKEN, token);
        }
        return { deviceId, token };
    }

    async function api(action, details = {}) {
        const { deviceId, token } = deviceCredentials();
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, device_id: deviceId, device_token: token, ...details })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "The reminder service is unavailable.");
        return result;
    }

    function eventStart(event) {
        if (!event?.date) return null;
        const time = event.allDay ? "09:00" : (event.time || `${String(event.hour ?? 9).padStart(2, "0")}:00`);
        const value = new Date(`${event.date}T${time}:00`);
        return Number.isNaN(value.getTime()) ? null : value;
    }

    function reminderPayload(events) {
        return events.flatMap((event) => {
            if (!event.reminder || event.reminder === "none") return [];
            const start = eventStart(event);
            if (!start) return [];
            const offsets = event.reminder === "both"
                ? [{ kind: "day", milliseconds: 86400000 }, { kind: "two_hours", milliseconds: 7200000 }]
                : [{ kind: event.reminder, milliseconds: event.reminder === "day" ? 86400000 : 7200000 }];
            return offsets.map(({ kind, milliseconds }) => ({
                event_id: event.id,
                kind,
                title: event.summary || "Planner event",
                event_date: event.date,
                event_starts_at: start.toISOString(),
                scheduled_at: new Date(start.getTime() - milliseconds).toISOString()
            }));
        }).filter((reminder) => new Date(reminder.scheduled_at).getTime() > Date.now() - 60000);
    }

    async function registrationAndSubscription() {
        if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
            throw new Error("This browser does not support phone notifications.");
        }
        if (isIos() && !isInstalled()) {
            throw new Error("On iPhone, first use Share → Add to Home Screen, then open Hé Guǐ from its icon.");
        }
        const permission = await Notification.requestPermission();
        if (permission !== "granted") throw new Error("Allow notifications when your phone asks, then try again.");
        const registration = await navigator.serviceWorker.register("./service-worker.js");
        await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: base64UrlToUint8Array(VAPID_PUBLIC_KEY)
            });
        }
        return subscription;
    }

    async function enable(events) {
        const subscription = await registrationAndSubscription();
        await api("register", { subscription: subscription.toJSON(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
        await api("sync", { reminders: reminderPayload(events), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
        await api("test");
    }

    async function sync(events) {
        if (localStorage.getItem("heguiNotificationsEnabledV1") !== "true") return;
        try {
            await api("sync", { reminders: reminderPayload(events), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
        } catch (error) {
            console.warn("Hé Guǐ reminder sync:", error);
        }
    }

    async function restore(events, status) {
        try {
            const subscription = await registrationAndSubscription();
            await api("register", { subscription: subscription.toJSON(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
            await sync(events);
        } catch (error) {
            status?.(error.message, "warning");
        }
    }

    async function disable() {
        await api("unregister");
        const registration = await navigator.serviceWorker?.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        await subscription?.unsubscribe();
    }

    if ("serviceWorker" in navigator) navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    window.HeguiNotifications = { enable, disable, sync, restore };
})();
