self.addEventListener('push', event => {
  console.log('Push recibido');

  let data = {};

  try {
    data = event.data.json();
  } catch {
    data = {
      title: 'Notificación',
      body: event.data?.text() || 'Sin contenido'
    };
  }

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/assets/icons/icon-192x192.png',
    data: data.data // importante para el click
  });
  // AVISAR A LA APP
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'NUEVA_NOTIFICACION',
            mensaje: data.body || 'Nueva notificación'
          });
        });
      })
  );
});

self.addEventListener('notificationclick', event => {
  console.log('CLICK DATA:', event.notification.data);
  event.notification.close();

  const url = event.notification.data?.url || '/user-panel';
  

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});