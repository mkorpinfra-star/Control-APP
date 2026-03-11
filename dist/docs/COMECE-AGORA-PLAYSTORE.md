# ⚡ COMEÇAR AGORA - UPLOAD NA PLAY STORE

Você já criou o app na Play Console. Agora siga estes passos **NA ORDEM**:

---

## ✅ CHECKLIST RÁPIDO

Execute na ordem:

### 1️⃣ GERAR KEYSTORE (5 min)

```bash
# Abra PowerShell/Terminal na pasta do projeto:
cd android
keytool -genkey -v -keystore j2s-horas.keystore -alias j2s -keyalg RSA -keysize 2048 -validity 10000
```

**Vai pedir:**
- Senha (ex: `J2sH0r@s2026!`) ← **ANOTE!**
- Nome: `J2S Enginyeria`
- Organização: `J2S Enginyeria`
- Cidade: `Andorra`
- País: `AD` ou `ES`

**⚠️ GUARDE O ARQUIVO `j2s-horas.keystore` E A SENHA EM 3 LUGARES!**

---

### 2️⃣ CONFIGURAR ASSINATURA (2 min)

Crie o arquivo `android/key.properties`:

```properties
storePassword=J2sH0r@s2026!
keyPassword=J2sH0r@s2026!
keyAlias=j2s
storeFile=../j2s-horas.keystore
```

(Troque pela sua senha!)

---

### 3️⃣ GERAR AAB ASSINADO (5 min)

```bash
# Execute o script:
gerar-aab.bat

# OU manualmente:
cd android
gradlew.bat bundleRelease
```

**Arquivo gerado:**
`android/app/build/outputs/bundle/release/app-release.aab` (~8-12 MB)

---

### 4️⃣ GERAR GRÁFICOS (3 min)

Abra no navegador: `gerar-graficos-playstore.html`

Clique:
- "Baixar Feature Graphic" → `j2s-horas-feature-graphic-1024x500.png`
- "Baixar Ícone 512x512" → `j2s-horas-icon-512x512.png`

---

### 5️⃣ TIRAR SCREENSHOTS (10 min)

**Opção rápida: Emulador**

1. Android Studio → Tools → Device Manager
2. Inicie um device (Pixel 6)
3. Instale APK: `adb install dist/j2s-obras.apk`
4. Abra o app, navegue pelas telas
5. Clique no ícone de câmera no emulador

**Tire prints de:**
- Login
- Timesheet
- Dashboard (se admin)
- Aprovações (se supervisor)

**Mínimo:** 2 screenshots
**Ideal:** 4-8 screenshots
**Resolução:** 1080 x 1920 (ou similar)

---

### 6️⃣ UPLOAD PRIVACY NO FTP (2 min)

1. FTP → `public_html/`
2. Upload: `dist/privacy.html`
3. Teste: https://j2s.ad/privacy.html

---

## 🚀 UPLOAD NA PLAY CONSOLE

### PASSO 1: Upload do AAB

1. https://play.google.com/console
2. Clique no app **"J2S Horas"**
3. Menu: **"Produção"**
4. **"Criar nova versão"**
5. Se aparecer "App signing": **"Continuar"**
6. **"Upload"** → Selecione `app-release.aab`
7. Aguarde upload (1-3 min)

### PASSO 2: Notas da Versão

Na mesma tela, em **"Notas da versão"**:

**Idioma:** Español (España)

**Texto:**
```
Lanzamiento de la primera versión de J2S Horas.

Funcionalidades:
• Registro de horas trabajadas (Normal, Extra, Nocturna)
• Aprobación con firma digital
• Dashboard con KPIs en tiempo real
• Gestión de empleados y obras
• Generación automática de nóminas
• Multiidioma (ES/PT/CA)

Requisitos: Android 7.0+
Soporte: admin@j2s.ad
```

Clique **"Guardar"**

---

### PASSO 3: Upload Gráficos

1. Menu: **"Ficha da loja principal"** → **"Arte gráfica"**
2. Upload:
   - Ícone 512x512 → `j2s-horas-icon-512x512.png`
   - Feature Graphic 1024x500 → `j2s-horas-feature-graphic-1024x500.png`
   - Screenshots (mínimo 2) → suas imagens
3. **"Guardar"**

---

### PASSO 4: Descrições

1. Menu: **"Detalhes do app"**
2. Copie do arquivo `DESCRICOES-PLAYSTORE.txt`:

**Título:**
```
J2S Horas - Control de Asistencia
```

**Descrição curta:**
```
Control de horas trabajadas para empleados de J2S Enginyeria
```

**Descrição completa:**
(Copie todo o texto da seção "DESCRIÇÃO COMPLETA")

3. **"Guardar"**

---

### PASSO 5: Política de Privacidade

1. Menu: **"Privacidade e dados"** → **"Política de privacidade"**
2. URL: `https://j2s.ad/privacy.html`
3. **"Guardar"**

---

### PASSO 6: Segurança de Dados

1. Menu: **"Segurança de dados"** → **"Começar"**
2. Responda:
   - Coleta dados? **SIM**
   - Compartilha? **NÃO**
   - Encriptado? **SIM**
   - Usuário pode excluir? **SIM**
3. Dados coletados:
   - ✅ Nome
   - ✅ Email
   - ✅ Fotos
   - ✅ Informações de emprego
4. Complete o questionário

---

### PASSO 7: Submeter

1. Volte para: **"Produção"**
2. **"Revisar versão"**
3. Resolva avisos vermelhos (se houver)
4. **"Iniciar lançamento para produção"**
5. **"Lançar"**

---

## ✅ PRONTO!

**Status:** Em revisão
**Tempo:** 1-7 dias (média 2-3 dias)

Aguarde email da Google.

**Se aprovado:** App publicado! 🎉
**Link:** https://play.google.com/store/apps/details?id=com.j2s.obras

---

## 📞 PROBLEMAS?

**AAB não gera:**
- Verifique se `key.properties` existe
- Verifique senha no `key.properties`
- Tente: `cd android && gradlew.bat clean bundleRelease`

**Upload falha:**
- Verifique tamanho do AAB (~8-12 MB)
- Certifique-se de que está assinado

**Privacy URL inválida:**
- Teste https://j2s.ad/privacy.html no navegador
- Deve carregar sem erro

---

**BOA SORTE! 🚀**
