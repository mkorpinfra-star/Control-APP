# 📱 COMO USAR O APP MOBILE J2S OBRAS

## 🎯 RESUMO RÁPIDO

✅ **TUDO ESTÁ PRONTO!** Você tem 2 opções:

### Opção 1: PWA (MAIS SIMPLES) ⚡
- Não precisa de Android Studio
- Funciona em Android E iOS
- Atualiza automaticamente
- Basta acessar no celular e "adicionar à tela inicial"

### Opção 2: APK Nativo (Android) 📦
- Precisa instalar Android Studio (1x só)
- Gera arquivo .apk
- Funcionários instalam como app normal
- App carrega sempre do servidor (atualiza sozinho)

---

## 🚀 OPÇÃO 1: PWA (RECOMENDADO)

### Passo 1: Fazer build e upload
```bash
npm run build
```

Envie a pasta `dist/` inteira para o FTP, incluindo:
- ✅ manifest.json
- ✅ sw.js
- ✅ download.html
- ✅ icon-192.png
- ✅ icon-512.png

### Passo 2: Acessar no celular
Mande para os funcionários:

**🔗 https://j2s.ad/download.html**

### Passo 3: Instalar

**Android (Chrome/Edge):**
1. Acesse o link
2. Vai aparecer um popup "Adicionar à tela inicial"
3. Clique em "Adicionar"
4. Pronto! Ícone aparece na tela inicial

**iOS (Safari):**
1. Acesse o link
2. Toque no botão de compartilhar (⎋)
3. Role e toque em "Adicionar a Início"
4. Toque em "Adicionar"
5. Pronto! Ícone aparece na tela inicial

**✅ Vantagem:** Quando você atualizar o site, o app atualiza automaticamente!

---

## 📦 OPÇÃO 2: APK ANDROID

### Requisitos
- Windows/Mac/Linux
- Android Studio instalado
- Java JDK 11+

### Passo 1: Instalar Android Studio
https://developer.android.com/studio

### Passo 2: Gerar APK (uma vez só)
```bash
# Build do projeto
npm run build

# Adicionar plataforma Android (só a primeira vez)
npx cap add android

# Sincronizar
npx cap sync

# Abrir no Android Studio
npx cap open android
```

### Passo 3: Build no Android Studio
1. Aguarde o Gradle sincronizar (pode demorar 5-10min na primeira vez)
2. Menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. Aguarde a compilação (3-5 minutos)
4. Clique em **locate** quando terminar

### Passo 4: Localizar o APK
O arquivo estará em:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Passo 5: Renomear e distribuir
```bash
# Renomear
cp android/app/build/outputs/apk/debug/app-debug.apk public/j2s-obras.apk

# Fazer build novamente
npm run build

# Enviar para FTP (incluindo j2s-obras.apk)
```

### Passo 6: Distribuir para funcionários

**Mande o link:**
🔗 **https://j2s.ad/j2s-obras.apk**

Ou coloque na página de download (já está configurada!):
🔗 **https://j2s.ad/download.html**

### Instalação no Android
1. Baixe o APK no celular
2. Abra o arquivo
3. Se aparecer aviso de "Fonte desconhecida":
   - Configurações > Segurança
   - Ative "Permitir instalação de apps desconhecidos"
4. Instale normalmente

**✅ Importante:** O app carrega do servidor https://j2s.ad, então NUNCA precisa gerar APK novamente!

---

## 🍎 OPÇÃO 3: IPA iOS (AVANÇADO)

### Requisitos
- ✅ Mac com Xcode
- ✅ Conta Apple Developer (99€/ano)
- ✅ Certificado de distribuição

### Passos
```bash
npx cap add ios
npx cap sync
npx cap open ios
```

No Xcode:
1. Selecione o projeto
2. **Signing & Capabilities** > Escolha seu Team
3. **Product > Archive**
4. Distribua via TestFlight ou App Store

**⚠️ Complexo!** Recomendo usar PWA para iOS (Opção 1).

---

## 🔄 COMO FUNCIONA A ATUALIZAÇÃO AUTOMÁTICA

### Configuração atual (capacitor.config.json):
```json
"server": {
  "url": "https://j2s.ad"
}
```

**Isso significa:**
1. ✅ O app é só um "container"
2. ✅ Ele SEMPRE carrega o site do servidor
3. ✅ Você atualiza o site no FTP
4. ✅ O app já mostra a nova versão!

**Você SÓ gera o APK UMA VEZ na vida!**

Depois é só:
```bash
npm run build
# Enviar dist/ para FTP
```

E todos os apps já ficam atualizados automaticamente! 🎉

---

## 📊 COMPARAÇÃO DAS OPÇÕES

| Recurso | PWA | APK | IPA |
|---------|-----|-----|-----|
| Funciona em Android | ✅ | ✅ | ❌ |
| Funciona em iOS | ✅ | ❌ | ✅ |
| Precisa Android Studio | ❌ | ✅ | ❌ |
| Precisa Xcode (Mac) | ❌ | ❌ | ✅ |
| Precisa conta Apple | ❌ | ❌ | ✅ (99€/ano) |
| Atualiza automaticamente | ✅ | ✅ | ✅ |
| Funciona offline | ✅ | ✅ | ✅ |
| Ícone na tela inicial | ✅ | ✅ | ✅ |
| Instalação | 2 cliques | 3 cliques | TestFlight |
| Dificuldade | 🟢 Fácil | 🟡 Média | 🔴 Difícil |

**🏆 Recomendação:** Use PWA! É mais simples e funciona em tudo.

---

## 🎨 GERANDO OS ÍCONES (OPCIONAL)

Se quiser ícones PNG perfeitos (em vez dos temporários):

### Opção A: Abrir o gerador no navegador
```bash
# Abra este arquivo no navegador:
generate-icons.html

# Os ícones icon-192.png e icon-512.png serão baixados automaticamente
# Mova para public/
```

### Opção B: Usar ferramentas online
- https://favicon.io/
- https://realfavicongenerator.net/

Gere ícones 192x192 e 512x512 com:
- Fundo vermelho #CE0201
- Texto branco "J2S"
- Bordas arredondadas

---

## 🐛 PROBLEMAS COMUNS

### 1. "App não instala" (Android)
**Solução:**
- Configurações > Segurança
- Ative "Fontes desconhecidas" ou "Instalar apps desconhecidos"

### 2. "App não atualiza"
**Solução:**
- Feche o app completamente (Force Stop)
- Abra novamente
- Ou limpe o cache: Configurações > Apps > J2S Obras > Limpar cache

### 3. "PWA não aparece para instalar" (iOS)
**Solução:**
- Use Safari (não Chrome)
- Certifique-se que está em HTTPS
- Toque no botão de compartilhar ⎋

### 4. "Service Worker não funciona"
**Solução:**
- O site PRECISA estar em HTTPS
- Verifique se sw.js está sendo servido
- No Chrome DevTools: Application > Service Workers

### 5. "Android Studio não abre o projeto"
**Solução:**
- Instale Java JDK 11+
- Atualize o Android Studio
- Aguarde o Gradle sincronizar (pode demorar 10min)

---

## 📝 CHECKLIST FINAL

### Para usar PWA (mais simples):
- [x] Fazer `npm run build`
- [x] Enviar `dist/` inteiro para FTP
- [ ] Acessar `https://j2s.ad/download.html` no celular
- [ ] Adicionar à tela inicial
- [ ] Mandar link para funcionários

### Para usar APK:
- [ ] Instalar Android Studio
- [ ] Rodar `npx cap add android`
- [ ] Rodar `npx cap sync`
- [ ] Rodar `npx cap open android`
- [ ] Build > Build APK
- [ ] Copiar APK para `public/j2s-obras.apk`
- [ ] Fazer `npm run build`
- [ ] Enviar para FTP
- [ ] Mandar link `https://j2s.ad/j2s-obras.apk` para funcionários

---

## 🎉 PRONTO!

Agora você tem um app mobile completo que:
✅ Funciona em Android e iOS
✅ Atualiza automaticamente
✅ Funciona offline
✅ Tem ícone na tela inicial
✅ Nunca precisa recompilar

**Link para distribuir:**
🔗 **https://j2s.ad/download.html**

Qualquer dúvida, consulte `INSTRUCOES-APP.md` para detalhes técnicos!
