import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBQlWXbT7CyZMqz9m4N0JZpB5QqZ8xJY6g",
  authDomain: "puntotouch-firebase.firebaseapp.com",
  projectId: "puntotouch-firebase",
  storageBucket: "puntotouch-firebase.firebasestorage.app",
  messagingSenderId: "978006558898",
  appId: "1:978006558898:web:c0a3f4e5d6b7c8d9e0f1a2"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Função para solicitar permissão e obter token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Permissão de notificação concedida');

      // Obter token FCM
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });

      if (token) {
        console.log('FCM Token:', token);

        // Enviar token para o backend
        await fetch('https://puntotouch.nextim.io/backend/api/usuarios/update-fcm-token.php', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fcm_token: token })
        });

        return token;
      } else {
        console.log('Não foi possível obter token FCM');
        return null;
      }
    } else {
      console.log('Permissão de notificação negada');
      return null;
    }
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificação:', error);
    return null;
  }
};

// Listener para mensagens em primeiro plano
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Mensagem recebida em primeiro plano:', payload);
      resolve(payload);
    });
  });

export { messaging };
