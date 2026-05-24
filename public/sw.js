self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};
  const title = payload.title || "D•sonofSolomon";
  const targetUrl = new URL(payload.url || "/writings", self.location.origin).href;
  const options = {
    body: payload.body || "New writing just dropped. Tap to read.",
    tag: payload.tag || `dsonofsolomon-${Date.now()}`,
    renotify: payload.renotify ?? true,
    timestamp: payload.timestamp || Date.now(),
    actions: payload.actions || [
      {
        action: "read",
        title: "Read",
      },
    ],
    data: {
      url: targetUrl,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/writings";
  const targetUrl = new URL(url, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client && client.url.includes(self.location.origin)) {
          if ("navigate" in client) {
            return client.navigate(targetUrl).then((navigatedClient) => {
              return (navigatedClient || client).focus();
            });
          }

          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
