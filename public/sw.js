/**
 * Tawfiq Service Worker
 * Handles PWA background notification dispatch, action clicks, and offline cache routing.
 */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle user clicking on a prayer or pre-prayer notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Forward push notifications if web push provider is attached
self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data.title || "Tawfiq Prayer Reminder";
    const options = {
      body: data.body || "Time for prayer • Tawfiq",
      icon: "/icon-192.png",
      badge: "/favicon-32x32.png",
      tag: data.tag || "tawfiq-alert",
      renotify: true,
      data: { url: data.url || "/" },
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    console.error("[SW] Push error:", e);
  }
});
