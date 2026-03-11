# 🔥 BUILDAR IPA - COMANDOS MANUAIS

EAS precisa de interação, então você precisa rodar os comandos:

## 📝 PASSO A PASSO:

### 1. Abra o terminal e vá para a pasta:

```bash
cd C:\Users\Guilherme\Desktop\app-cassio\j2s-ios-temp
```

### 2. Inicialize o projeto EAS:

```bash
eas init
```

Quando perguntar:
- **Create EAS project?** → Aperte ENTER (Yes)

### 3. Configure o build:

```bash
eas build:configure
```

Quando perguntar:
- **Which platforms?** → Escolha `ios` (use setas e ESPAÇO, depois ENTER)

### 4. Inicie o build na nuvem:

```bash
eas build --platform ios
```

Quando perguntar:
- **Generate a new Apple Distribution Certificate?** → YES
- **Log in to your Apple account?** → Se tiver conta developer ($99/ano)
  - Se NÃO tiver: escolha "simulator build" ou "development build"

### 5. Aguarde o build (15-20 minutos)

O EAS vai:
- Fazer upload do projeto
- Buildar no servidor Mac deles
- Gerar o .ipa
- Te dar um link para download

### 6. Baixar o IPA

Quando terminar, vai aparecer:
```
✔ Build finished
Download: https://expo.dev/artifacts/...
```

Clique no link e baixe o .ipa!

---

## ⚠️ IMPORTANTE:

**Se não tiver conta Apple Developer ($99/ano):**

Você pode gerar um build de desenvolvimento que funciona em dispositivos registrados, mas é mais complexo.

**Alternativa:** PWA funciona perfeitamente no iPhone também!

---

**RODE OS COMANDOS ACIMA E ME AVISA SE DER ALGUM ERRO!** 🚀
