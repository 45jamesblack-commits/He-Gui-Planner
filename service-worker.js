"use strict";

self.addEventListener("push", (event) => {
    let data = {};
    try { data = event.data?.json() || {}; } catch (error) { data = { title: "Hé Guǐ reminder", body: event.data?.text() || "You have a planner reminder." }; }
    event.waitUntil(self.registration.showNotification(data.title || "Hé Guǐ reminder", {
        body: data.body || "You have a planner reminder.",
        icon: "hegui-icon-192.png",
        badge: "favicon-32x32.png",
        tag: data.tag || "hegui-reminder",
        renotify: true,
        data: { url: data.url || "./" }
    }));
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const target = new URL(event.notification.data?.url || "./", self.location.origin).href;
    event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
        const existing = windows.find((client) => client.url.startsWith(self.location.origin));
        if (existing) return existing.navigate(target).then(() => existing.focus());
        return clients.openWindow(target);
    }));
});
