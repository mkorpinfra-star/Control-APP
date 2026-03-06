# 📦 O QUE ENVIAR PARA SEU AMIGO NO MAC

## 🎯 RESUMO:

Você precisa enviar **2 arquivos** para ele:

1. ✅ **Pasta `ios/` (zipada)**
2. ✅ **Arquivo `INSTRUCOES-MAC.md`**

---

## 📂 PASSO A PASSO:

### 1. Zipar a pasta iOS

**No Windows:**

```bash
# PowerShell
Compress-Archive -Path ios -DestinationPath ios-j2s-obras.zip
```

**Ou manualmente:**
1. Clicar com botão direito na pasta `ios/`
2. **Enviar para > Pasta compactada**
3. Renomear para `ios-j2s-obras.zip`

---

### 2. Copiar instruções

Copiar o arquivo:
```
INSTRUCOES-MAC.md
```

Para dentro do ZIP, ou enviar separado.

---

### 3. Enviar para seu amigo

**Via WeTransfer (grátis até 2GB):**
- https://wetransfer.com
- Upload: `ios-j2s-obras.zip` + `INSTRUCOES-MAC.md`
- Email do amigo
- Enviar

**Via Google Drive / Dropbox:**
- Upload dos arquivos
- Compartilhar link

**Via WhatsApp/Telegram:**
- Se o ZIP for < 100 MB, pode mandar direto

---

## 📧 MENSAGEM PARA SEU AMIGO:

```
Opa, beleza?

Preciso que tu gere um arquivo IPA (app iOS) pra mim.

Tá aqui o projeto:
- ios-j2s-obras.zip (pasta do projeto)
- INSTRUCOES-MAC.md (passo a passo)

Basicamente é:
1. Extrair o ZIP
2. Abrir no Xcode
3. Product > Archive
4. Distribute App > Ad Hoc
5. Salvar o .ipa e me mandar

Leva uns 20-30 min na primeira vez.

Se tiver alguma dúvida, me chama!

Valeu! 🙏
```

---

## 🔧 ALTERNATIVA: SE ELE NÃO CONSEGUIR

Usar só **PWA para iOS**:

- Funcionários acessam `j2s.ad/download.html` no Safari
- Compartir → "Añadir a inicio"
- Ícone aparece na tela
- Funciona igual app

**Funciona perfeitamente!** O IPA é só uma "versão premium" 😄

---

## 📊 TAMANHO DOS ARQUIVOS:

- `ios-j2s-obras.zip`: ~5-10 MB
- `INSTRUCOES-MAC.md`: ~5 KB

**Total:** ~10 MB → Dá pra mandar por WhatsApp tranquilo!

---

## ⚡ RESUMO RÁPIDO:

```bash
# 1. Zipar
Compress-Archive -Path ios -DestinationPath ios-j2s-obras.zip

# 2. Enviar para amigo:
# - ios-j2s-obras.zip
# - INSTRUCOES-MAC.md

# 3. Ele vai te mandar de volta:
# - J2S Obras.ipa (~5-10 MB)

# 4. Você coloca em:
# public/j2s-obras.ipa

# 5. Build e FTP:
npm run build
# Upload dist/
```

---

**PRONTO!** 🎉
