# 📱 INSTRUÇÕES - APP MOBILE J2S OBRAS

## ✅ O QUE FOI CONFIGURADO

### 1. **Capacitor** (App Nativo)
- ✅ Instalado e configurado
- ✅ Aponta para `https://j2s.ad` (sempre atualizado automaticamente!)
- ✅ Pronto para gerar APK/IPA

### 2. **PWA** (Progressive Web App)
- ✅ manifest.json criado
- ✅ Service Worker configurado (funciona offline)
- ✅ Ícones do app criados

### 3. **Página de Download**
- ✅ `public/download.html` criada
- ✅ Detecta automaticamente Android/iOS/Desktop
- ✅ Oferece APK para Android
- ✅ Oferece PWA para iOS
- ✅ Instruções de instalação incluídas

---

## 🚀 COMO GERAR O APK (Android)

### Passo 1: Build do projeto
```bash
npm run build
```

### Passo 2: Adicionar plataforma Android
```bash
npx cap add android
```

### Passo 3: Sincronizar assets
```bash
npx cap sync
```

### Passo 4: Abrir no Android Studio
```bash
npx cap open android
```

### Passo 5: Gerar APK no Android Studio
1. No menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Aguarde a compilação (3-5 minutos)
3. Quando terminar, clique em **locate** para abrir a pasta
4. O APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

### Passo 6: Renomear e enviar para o servidor
```bash
# Renomear
mv android/app/build/outputs/apk/debug/app-debug.apk public/j2s-obras.apk

# Fazer build novamente para incluir o APK
npm run build

# Upload para FTP (use seu cliente FTP)
# Enviar tudo da pasta dist/ incluindo j2s-obras.apk
```

---

## 🍎 COMO GERAR IPA (iOS)

### Passo 1: Adicionar plataforma iOS
```bash
npx cap add ios
```

### Passo 2: Abrir no Xcode (só funciona no Mac)
```bash
npx cap open ios
```

### Passo 3: Configurar assinatura no Xcode
1. Selecione o projeto na barra lateral
2. Vá em **Signing & Capabilities**
3. Selecione sua equipe de desenvolvedor Apple
4. Conecte um iPhone via USB

### Passo 4: Distribuir via TestFlight
1. **Product > Archive**
2. Após arquivar, clique em **Distribute App**
3. Escolha **TestFlight & App Store**
4. Siga o assistente

**IMPORTANTE:** iOS exige conta de desenvolvedor Apple (99€/ano)

---

## 🌐 ALTERNATIVA SIMPLES: PWA (SEM ANDROID STUDIO)

Se você não quer instalar Android Studio, pode usar apenas PWA:

### Vantagens do PWA:
- ✅ Funciona em Android E iOS
- ✅ Não precisa de Android Studio/Xcode
- ✅ Atualiza automaticamente
- ✅ Ícone na tela inicial
- ✅ Funciona offline

### Como usar:
1. Acesse `https://j2s.ad/download.html` no celular
2. Android: Navegador oferece "Adicionar à tela inicial"
3. iOS: Toque em compartilhar > "Adicionar a Início"

---

## 📂 ESTRUTURA DE ARQUIVOS CRIADOS

```
app-cassio/
├── capacitor.config.json        # Configuração do Capacitor (aponta para j2s.ad)
├── public/
│   ├── manifest.json            # Manifest PWA
│   ├── sw.js                    # Service Worker (cache offline)
│   ├── download.html            # Página de download (j2s.ad/download.html)
│   ├── icon-192.png             # Ícone 192x192
│   ├── icon-512.png             # Ícone 512x512
│   └── j2s-obras.apk           # APK gerado (depois do build)
└── generate-icons.html          # Gerador de ícones (abrir no navegador)
```

---

## ⚙️ COMO FUNCIONA A ATUALIZAÇÃO AUTOMÁTICA

### O app SEMPRE carrega do servidor!

**capacitor.config.json:**
```json
"server": {
  "url": "https://j2s.ad"
}
```

Isso significa:
- ✅ Você faz upload do build para o FTP
- ✅ O app mobile carrega automaticamente a nova versão
- ✅ **NUNCA precisa gerar novo APK!**

**Você só gera o APK UMA VEZ!**

---

## 🎯 PRÓXIMOS PASSOS

### 1. Gerar os ícones PNG (falta fazer)
```bash
# Abra no navegador:
open generate-icons.html

# Ou acesse:
# file:///c:/Users/Guilherme/Desktop/app-cassio/generate-icons.html

# Os ícones serão baixados automaticamente
# Mova para public/:
# - icon-192.png
# - icon-512.png
```

### 2. Adicionar meta tags PWA no index.html
(Vou fazer isso agora)

### 3. Gerar o APK
```bash
npm run build
npx cap add android
npx cap sync
npx cap open android
# Build > Build APK
```

### 4. Testar a página de download
```bash
# Acesse no celular:
https://j2s.ad/download.html
```

---

## 🔧 TROUBLESHOOTING

### APK não instala
- Ative "Fontes desconhecidas" nas configurações do Android
- Configurações > Segurança > Permitir instalação de apps desconhecidos

### App não atualiza
- Limpe o cache do app
- Ou desinstale e reinstale

### iOS não instala PWA
- Use Safari (não Chrome)
- Toque em compartilhar (ícone ⎋)
- "Adicionar a Início"

### Service Worker não funciona
- Certifique-se que está em HTTPS
- Verifique no DevTools: Application > Service Workers

---

## 📊 RESUMO FINAL

| Recurso | Status | Observação |
|---------|--------|------------|
| Capacitor | ✅ Configurado | Aponta para j2s.ad |
| PWA Manifest | ✅ Criado | manifest.json |
| Service Worker | ✅ Criado | sw.js (offline) |
| Página Download | ✅ Criada | download.html |
| Ícones | ⚠️ Temporário | Gerar PNG reais |
| Meta Tags | ⏳ Pendente | Adicionar no index.html |
| APK Android | ⏳ Pendente | Gerar no Android Studio |
| IPA iOS | ⏳ Opcional | Requer conta Apple |

---

**🎉 Próximo:** Vou adicionar as meta tags PWA no index.html agora!
