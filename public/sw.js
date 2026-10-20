self.addEventListener("push", (event) => {
  event.waitUntil(fetch("/api/notifications/latest", { cache: "no-store" }).then((response) => response.json()).then((data) => self.registration.showNotification(data.title || "MEDYNA", { body: data.body || "Nueva publicación disponible.", icon: "/favicon.svg", badge: "/favicon.svg", tag: "medyna-bulletin", data: { url: data.url || "/bulletin" } })));
});
self.addEventListener("notificationclick", (event) => { event.notification.close(); event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => { const url = event.notification.data?.url || "/bulletin"; const existing = windows.find((client) => new URL(client.url).pathname === url); return existing ? existing.focus() : clients.openWindow(url); })); });
