# ⚡ COMANDOS RÁPIDOS - APP MOBILE J2S

## 🎯 Escolha sua opção:

### OPÇÃO 1: PWA (MAIS SIMPLES) ✅ RECOMENDADO
```bash
# 1. Fazer build
npm run build

# 2. Enviar pasta dist/ inteira para FTP
# Incluir: manifest.json, sw.js, download.html, icon-*.png

# 3. Mandar link para funcionários:
# https://j2s.ad/download.html
```

---

### OPÇÃO 2: APK ANDROID 📦

#### Primeira vez (setup):
```bash
# 1. Adicionar plataforma Android (só 1x)
npm run cap:add
# OU
npx cap add android

# 2. Fazer build e abrir Android Studio
npm run app:build
# OU
npm run build
npx cap sync
npx cap open android
```

#### No Android Studio:
```
Build > Build Bundle(s) / APK(s) > Build APK(s)
```

#### Localizar APK:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

#### Depois de qualquer alteração:
```bash
# Atualizar app (faz build + sync)
npm run cap:sync

# Ou manualmente:
npm run build
npx cap sync
```

**⚠️ IMPORTANTE:** Como o app carrega de https://j2s.ad, você SÓ precisa:
```bash
npm run build
# Enviar dist/ para FTP
```
O APK NUNCA precisa ser recompilado! 🎉

---

## 📱 SCRIPTS DISPONÍVEIS

```bash
# Desenvolvimento
npm run dev              # Servidor local

# Build
npm run build            # Build para produção

# Capacitor (App)
npm run cap:add          # Adicionar Android + iOS (1x só)
npm run cap:sync         # Build + Sync
npm run cap:android      # Abrir Android Studio
npm run cap:ios          # Abrir Xcode (Mac)
npm run app:build        # Build + Sync + Android Studio

# Preview
npm run preview          # Preview do build
```

---

## 🔗 LINKS IMPORTANTES

### Para distribuir:
- **Página de download:** https://j2s.ad/download.html
- **APK direto:** https://j2s.ad/j2s-obras.apk (após gerar)
- **Site PWA:** https://j2s.ad

### Para funcionários:
Mande apenas este link no WhatsApp/Email:
```
📱 Baixe o app J2S Obras:
https://j2s.ad/download.html
```

---

## 🚀 FLUXO NORMAL DE TRABALHO

### Desenvolvimento:
```bash
# 1. Desenvolver
npm run dev

# 2. Testar no navegador
# http://localhost:5173

# 3. Quando terminar, fazer build
npm run build

# 4. Enviar dist/ para FTP
# (Use FileZilla, WinSCP, etc)
```

**✅ Pronto! Todos os apps já estão atualizados!**

---

## 📦 QUANDO GERAR APK NOVAMENTE?

**NUNCA!** 😄

O APK carrega do servidor, então você só precisa:
1. `npm run build`
2. Enviar para FTP

**Só gere APK novamente se:**
- ❌ Mudar o nome do app
- ❌ Mudar o ícone do app
- ❌ Mudar a URL do servidor (capacitor.config.json)
- ❌ Adicionar plugins nativos (câmera, GPS, etc)

**Para tudo mais (99% dos casos), só faça:**
```bash
npm run build
# Upload FTP
```

---

## 🎨 TROCAR ÍCONES DO APP

### 1. Gerar novos ícones:
- Abra `generate-icons.html` no navegador
- Ou use: https://favicon.io/

### 2. Substituir arquivos:
```
public/icon-192.png   (192x192)
public/icon-512.png   (512x512)
```

### 3. Build:
```bash
npm run build
npx cap sync
```

### 4. Recompilar APK (Android Studio):
```
Build > Clean Project
Build > Build APK
```

---

## 🐛 RESOLVER PROBLEMAS

### App não carrega no celular:
```bash
# Verificar se servidor está online
curl https://j2s.ad

# Limpar cache do Capacitor
npx cap sync --force
```

### Android Studio não abre:
```bash
# Verificar se Java está instalado
java -version

# Reinstalar plataforma
rm -rf android
npx cap add android
npx cap sync
```

### Service Worker não funciona:
```bash
# Verificar se está em HTTPS
# Limpar cache do navegador
# Recarregar página com Ctrl+Shift+R
```

---

## 📊 ARQUIVOS IMPORTANTES

```
📁 Projeto
├── 📄 capacitor.config.json      # Config do app (URL do servidor)
├── 📄 COMO-USAR-APP.md           # Guia completo (leia este!)
├── 📄 INSTRUCOES-APP.md          # Detalhes técnicos
├── 📄 COMANDOS-RAPIDOS.md        # Este arquivo (comandos rápidos)
│
├── 📁 public/
│   ├── 📄 manifest.json          # Manifest PWA
│   ├── 📄 sw.js                  # Service Worker
│   ├── 📄 download.html          # Página de download
│   ├── 🖼️ icon-192.png           # Ícone 192x192
│   ├── 🖼️ icon-512.png           # Ícone 512x512
│   └── 📦 j2s-obras.apk          # APK gerado (após build)
│
└── 📁 android/                   # Projeto Android (após npx cap add)
    └── 📁 app/build/outputs/apk/ # APK fica aqui
```

---

## ✅ CHECKLIST RÁPIDO

### Para atualizar o site/app:
- [ ] Fazer alterações no código
- [ ] `npm run build`
- [ ] Enviar `dist/` para FTP
- [ ] ✅ Pronto! App atualizado automaticamente

### Para gerar APK (primeira vez):
- [ ] `npm run cap:add`
- [ ] `npm run app:build`
- [ ] No Android Studio: Build > Build APK
- [ ] Copiar APK de `android/app/build/outputs/apk/debug/`
- [ ] Renomear para `j2s-obras.apk`
- [ ] Colocar em `public/`
- [ ] `npm run build`
- [ ] Enviar para FTP
- [ ] Distribuir link: `https://j2s.ad/j2s-obras.apk`

### Para distribuir PWA (mais simples):
- [ ] `npm run build`
- [ ] Enviar `dist/` para FTP
- [ ] Mandar link: `https://j2s.ad/download.html`
- [ ] ✅ Funcionários instalam em 2 cliques!

---

## 🎉 RESUMO FINAL

**Use PWA:** Mais simples, funciona em tudo, atualiza sozinho
**Use APK:** Se funcionários preferem baixar arquivo

**Ambos carregam do servidor, então você SÓ precisa fazer upload do build!**

**Link para distribuir:**
🔗 **https://j2s.ad/download.html**

**Qualquer dúvida, leia `COMO-USAR-APP.md`!**
