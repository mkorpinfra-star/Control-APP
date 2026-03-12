# 🔥 CONFIGURAÇÃO COMPLETA FIREBASE PUSH NOTIFICATIONS

## ✅ O QUE JÁ ESTÁ PRONTO

### Frontend (React)
- ✅ Firebase SDK instalado (`npm install firebase`)
- ✅ Arquivo `/src/firebase.js` configurado
- ✅ Service Worker `/public/firebase-messaging-sw.js` criado
- ✅ `.env` com VAPID key configurado
- ✅ Build compilado com Firebase integrado

### Backend (PHP)
- ✅ Endpoint `/api/usuarios/update-fcm-token.php` pronto
- ✅ Endpoint `/api/notificacoes/list.php` pronto
- ✅ Endpoint `/api/monitoramento/notify.php` com FCM integrado
- ✅ Coluna `fcm_token` na tabela `usuarios` criada
- ✅ Tabela `notificacoes` criada

### Monitoramento
- ✅ Página `/monitoramento` funcionando
- ✅ Botões "Notificar" enviando 3 tipos de notificação:
  - In-App (✅ funcionando)
  - Push (⚠️ precisa da chave do Firebase)
  - WhatsApp (✅ link direto wa.me)

---

## 📋 O QUE VOCÊ PRECISA FAZER AGORA

### 1️⃣ BAIXAR A CHAVE PRIVADA DO FIREBASE

1. Acesse: [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: **puntotouch-firebase**
3. Clique na engrenagem ⚙️ (canto superior esquerdo) → **Configurações do projeto**
4. Vá na aba: **Contas de serviço**
5. Clique em: **Gerar nova chave privada**
6. Será baixado um arquivo JSON tipo: `puntotouch-firebase-firebase-adminsdk-xxxxx.json`

### 2️⃣ CONFIGURAR NO SERVIDOR

Copiar o arquivo JSON para uma pasta **FORA** do webroot (para segurança):

```bash
# Exemplo de estrutura:
/home/usuario/
  ├── public_html/          # Webroot
  │   └── backend/
  └── private/              # Fora do webroot
      └── firebase-key.json # ← COLOCAR AQUI
```

### 3️⃣ ATUALIZAR O `.env` DO BACKEND

Editar: `backend/.env`

Adicionar:

```env
# Firebase Cloud Messaging (OBRIGATÓRIO para push)
FCM_SERVER_KEY=/home/usuario/private/firebase-key.json
```

**IMPORTANTE:** Use o caminho ABSOLUTO do arquivo JSON.

### 4️⃣ INSTALAR BIBLIOTECA PHP FIREBASE (OPCIONAL)

Se quiser usar a biblioteca oficial (recomendado para produção):

```bash
cd backend
composer require kreait/firebase-php
```

Se usar, editar `backend/api/monitoramento/notify.php`:

```php
// No lugar da função enviarPushNotification(), usar:
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;

$factory = (new Factory)->withServiceAccount(getenv('FCM_SERVER_KEY'));
$messaging = $factory->createMessaging();

$message = CloudMessage::withTarget('token', $fcmToken)
    ->withNotification([
        'title' => $titulo,
        'body' => $corpo
    ]);

$messaging->send($message);
```

**MAS** o código atual já funciona com cURL + Legacy API (funciona até junho 2024).

---

## 🧪 TESTAR NOTIFICAÇÕES

1. **Fazer login no app** (desktop ou mobile)
2. **Permitir notificações** quando o navegador pedir
3. **Ir em `/monitoramento`**
4. **Clicar em "Notificar"** em qualquer funcionário
5. **Verificar:**
   - ✅ Notificação in-app aparece na lista
   - ✅ Push notification aparece no navegador/celular
   - ✅ Link WhatsApp abre com mensagem pronta

---

## 🔍 DEBUGGING

Se não funcionar, verificar:

### 1. Service Worker registrado?
Abrir DevTools (F12) → **Application** → **Service Workers**
Deve aparecer: `firebase-messaging-sw.js` ativo

### 2. Token FCM foi obtido?
Abrir DevTools (F12) → **Console**
Deve aparecer: `FCM Token: xxxxxxxxxx`

### 3. Token foi salvo no banco?
```sql
SELECT id, nome, fcm_token FROM usuarios WHERE id = SEU_ID;
```

Deve ter um token longo (tipo: `dXxxxxxxxxxxxxx...`)

### 4. Backend recebe o token corretamente?
```bash
curl -X POST https://puntotouch.nextim.io/backend/api/usuarios/update-fcm-token.php \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"fcm_token":"teste123"}'
```

Deve retornar: `{"success":true}`

### 5. FCM_SERVER_KEY está configurado?
```bash
php -r "echo getenv('FCM_SERVER_KEY');"
```

Deve retornar o caminho do arquivo JSON.

### 6. Erro 401/403 do Firebase?
- API V1 (nova) requer OAuth2 token
- API Legacy (antiga) requer Server Key
- Código atual usa Legacy API

Para usar API V1 (recomendado):
```php
$factory = (new Factory)->withServiceAccount('/caminho/firebase-key.json');
```

---

## 📱 TESTAR NO CELULAR

1. **Abrir o site** no navegador do celular
2. **Adicionar à tela inicial** (PWA)
3. **Permitir notificações**
4. **Fazer login**
5. **Teste:** admin clica "Notificar" → funcionário recebe push

---

## 🚨 ERROS COMUNS

### "Permission denied" ao ler firebase-key.json
```bash
chmod 600 /caminho/firebase-key.json
chown www-data:www-data /caminho/firebase-key.json
```

### "FCM_SERVER_KEY não configurado"
Verificar se o `.env` foi carregado:
```php
var_dump(getenv('FCM_SERVER_KEY')); // deve retornar string
```

### "Invalid registration token"
O token FCM expirou ou é inválido. Funcionário precisa fazer login novamente.

---

## ✅ CHECKLIST FINAL

- [ ] Arquivo JSON do Firebase baixado
- [ ] Arquivo JSON colocado fora do webroot
- [ ] `.env` atualizado com caminho do JSON
- [ ] Service Worker registrado (verificar no DevTools)
- [ ] Token FCM obtido (verificar no Console)
- [ ] Token salvo no banco (SELECT na tabela usuarios)
- [ ] Teste: clicar "Notificar" e receber push

---

## 🎉 PRONTO!

Depois disso, quando o admin clicar em **"Notificar"** no `/monitoramento`:

1. ✅ Cria notificação na tabela `notificacoes` (in-app)
2. ✅ Envia push notification via FCM (aparece no celular/navegador)
3. ✅ Abre link WhatsApp com mensagem pronta (wa.me)

---

## 🔗 LINKS ÚTEIS

- [Firebase Console](https://console.firebase.google.com/)
- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Admin SDK PHP](https://firebase-php.readthedocs.io/)
- [Evolution WhatsApp API](https://github.com/EvolutionAPI/evolution-api)
