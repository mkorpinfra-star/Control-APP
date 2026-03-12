// Service Worker para notificações em segundo plano

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBQlWXbT7CyZMqz9m4N0JZpB5QqZ8xJY6g",
  authDomain: "puntotouch-firebase.firebaseapp.com",
  projectId: "puntotouch-firebase",
  storageBucket: "puntotouch-firebase.firebasestorage.app",
  messagingSenderId: "978006558898",
  appId: "1:978006558898:web:c0a3f4e5d6b7c8d9e0f1a2"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handler para mensagens em segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('Mensagem recebida em segundo plano:', payload);

  const notificationTitle = payload.notification.title || 'Nueva notificación';
  const notificationOptions = {
    body: payload.notification.body || '',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: payload.data,
    requireInteraction: true
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handler para clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event);
  event.notification.close();

  // Abrir ou focar na aba do app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('puntotouch.nextim.io') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('https://puntotouch.nextim.io');
      }
    })
  );
});
