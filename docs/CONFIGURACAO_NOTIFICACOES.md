# Configuração do Sistema de Notificações

## ⚠️ IMPORTANTE: Executar SQL Primeiro

Antes de usar o Monitoramento, executar o SQL no banco de dados:

```sql
-- Executar: database/create_notificacoes_table.sql
```

Esse script cria:
- Tabela `notificacoes` para notificações in-app
- Coluna `fcm_token` na tabela `usuarios` para push notifications

---

## 📱 1. Firebase Cloud Messaging (Push Notifications)

### Passo 1: Criar Projeto no Firebase

1. Acessar [Firebase Console](https://console.firebase.google.com/)
2. Criar novo projeto (ou usar existente)
3. Adicionar aplicação Web e Android/iOS

### Passo 2: Obter Server Key

1. No Firebase Console → Project Settings → Cloud Messaging
2. Copiar **Server Key**

### Passo 3: Configurar no Backend

Adicionar no arquivo `.env` do servidor:

```env
FCM_SERVER_KEY=AAAA...seu_server_key_aqui
```

### Passo 4: Configurar no Frontend (Mobile App)

Se usar app mobile (React Native/Capacitor), instalar Firebase SDK e salvar o token:

```javascript
// Exemplo com @react-native-firebase/messaging
import messaging from '@react-native-firebase/messaging';

async function saveFCMToken() {
    const token = await messaging().getToken();

    // Enviar para backend
    await fetch('https://puntotouch.nextim.io/backend/api/usuarios/update-fcm-token.php', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fcm_token: token })
    });
}
```

---

## 💬 2. WhatsApp API

### Opção A: Evolution API (Recomendado - Open Source)

1. Instalar Evolution API: https://github.com/EvolutionAPI/evolution-api
2. Configurar instância WhatsApp
3. Obter API Key

Adicionar no `.env`:

```env
WHATSAPP_API_URL=https://sua-instancia-evolution.com/message/sendText
WHATSAPP_API_KEY=sua_api_key_aqui
```

### Opção B: Twilio

1. Criar conta em [Twilio](https://www.twilio.com/)
2. Configurar WhatsApp Business
3. Obter Account SID e Auth Token

Adicionar no `.env`:

```env
WHATSAPP_API_URL=https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json
WHATSAPP_API_KEY=seu_auth_token_aqui
```

Modificar `backend/api/monitoramento/notify.php` função `enviarWhatsApp()` para usar Twilio.

### Opção C: WhatsApp Business API Oficial

1. Aplicar para acesso: https://business.whatsapp.com/products/platform
2. Seguir documentação oficial
3. Configurar webhook e templates

---

## 🔔 3. Notificações In-App (Já Implementado)

As notificações in-app já funcionam automaticamente!

- Backend: `backend/api/monitoramento/notify.php` cria registros na tabela `notificacoes`
- Frontend: pode criar componente de notificações para exibir

### Exemplo de Componente de Notificações (Opcional)

```jsx
// src/components/NotificationBell.jsx
import { useState, useEffect } from 'react';
import { IconBell } from '@tabler/icons-react';

export default function NotificationBell() {
    const [notificacoes, setNotificacoes] = useState([]);
    const [naoLidas, setNaoLidas] = useState(0);

    useEffect(() => {
        loadNotificacoes();
        const interval = setInterval(loadNotificacoes, 30000);
        return () => clearInterval(interval);
    }, []);

    async function loadNotificacoes() {
        const res = await fetch('https://puntotouch.nextim.io/backend/api/notificacoes/list.php', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success) {
            setNotificacoes(data.notificacoes || []);
            setNaoLidas(data.notificacoes.filter(n => !n.lida).length);
        }
    }

    return (
        <div className="relative">
            <button className="relative">
                <IconBell size={24} />
                {naoLidas > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {naoLidas}
                    </span>
                )}
            </button>
            {/* Dropdown com notificações */}
        </div>
    );
}
```

---

## 🧪 Testar Notificações

### 1. Testar In-App (Funciona Agora)

1. Acessar `/monitoramento`
2. Clicar em "Notificar" em qualquer funcionário
3. Verificar tabela `notificacoes` no banco de dados

```sql
SELECT * FROM notificacoes ORDER BY criado_em DESC LIMIT 10;
```

### 2. Testar Push (Após Configurar FCM)

1. Configurar FCM_SERVER_KEY no .env
2. Ter `fcm_token` salvo no usuário
3. Clicar em "Notificar"
4. Verificar notificação no dispositivo

### 3. Testar WhatsApp (Após Configurar API)

1. Configurar WHATSAPP_API_URL e WHATSAPP_API_KEY
2. Ter telefone válido no cadastro do funcionário
3. Clicar em "Notificar"
4. Verificar mensagem no WhatsApp

---

## 📋 Checklist de Configuração

- [ ] Executar SQL `database/create_notificacoes_table.sql`
- [ ] Criar projeto no Firebase
- [ ] Adicionar FCM_SERVER_KEY no .env
- [ ] Escolher API de WhatsApp (Evolution/Twilio/Oficial)
- [ ] Configurar WHATSAPP_API_URL e WHATSAPP_API_KEY
- [ ] Testar notificação in-app
- [ ] Testar push notification (se mobile)
- [ ] Testar WhatsApp

---

## ⚡ Uso do Monitoramento

1. Acessar `/monitoramento` (link no header "Monitoreo")
2. Ver todos os registros de horas em tempo real
3. Identificar funcionários pendentes (sem registro hoje)
4. Clicar em "Notificar" para enviar:
   - ✅ Notificação In-App (sempre funciona)
   - ✅ Push Notification (se configurado)
   - ✅ Mensagem WhatsApp (se configurado)

---

## 🔐 Segurança

- Apenas admins podem acessar `/monitoramento`
- Apenas admins podem enviar notificações
- FCM_SERVER_KEY e WHATSAPP_API_KEY devem estar em `.env` (NUNCA no código)
- Adicionar `.env` no `.gitignore`

---

**Desenvolvido por:** Guilherme Gomes
**Data:** Março 2026
