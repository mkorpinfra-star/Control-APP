# 📱 GERAR IPA NO MAC - INSTRUÇÕES PARA SEU AMIGO

## 🎯 O QUE VOCÊ VAI FAZER:

Gerar o arquivo `.ipa` (app iOS) do projeto J2S Obras.

**Tempo:** ~20-30 minutos (primeira vez)

---

## 📋 REQUISITOS NO MAC:

1. **Xcode** instalado (da App Store - grátis, mas pesado ~12GB)
2. **Node.js** instalado (se não tiver: https://nodejs.org)
3. **Conta Apple Developer** (opcional, mas recomendado)

---

## 📂 PASSO 1: COPIAR PASTA DO PROJETO

Guilherme vai te mandar uma pasta `ios/` zipada.

1. Extrair o ZIP
2. Abrir o Terminal
3. Navegar até a pasta:
```bash
cd ~/Downloads/app-cassio
```

---

## 🔨 PASSO 2: ABRIR NO XCODE

```bash
npx cap open ios
```

Ou manualmente:
1. Abrir o **Xcode**
2. **File > Open**
3. Selecionar: `ios/App/App.xcworkspace` ⚠️ (arquivo `.xcworkspace`, NÃO `.xcodeproj`)

---

## ⚙️ PASSO 3: CONFIGURAR ASSINATURA

No Xcode, barra lateral esquerda:

1. Clicar no projeto **App** (ícone azul no topo)
2. Selecionar **Target: App** (abaixo)
3. Aba **Signing & Capabilities**

### SE VOCÊ TEM CONTA APPLE DEVELOPER ($99/ano):
- **Team:** Selecionar sua conta
- **Bundle Identifier:** Deixar `com.j2s.obras`
- ✅ "Automatically manage signing" marcado

### SE NÃO TEM CONTA (TESTE LOCAL):
- **Team:** Selecionar sua conta Apple pessoal (grátis)
- **Bundle Identifier:** Mudar para algo único, ex: `com.seunome.j2sobras`
- ✅ "Automatically manage signing" marcado

---

## 📱 PASSO 4: TESTAR NO SIMULADOR (OPCIONAL)

1. No topo do Xcode: Selecionar **iPhone 15 Pro** (ou qualquer simulador)
2. Clicar no **▶️ Play**
3. Aguardar build (~2-3 min)
4. Simulador abre com o app

**Teste:** O app deve abrir e carregar `https://j2s.ad/login`

---

## 📦 PASSO 5: GERAR O ARQUIVO IPA

### Opção A: Para distribuição via TestFlight (requer conta paga):

1. Menu: **Product > Archive**
2. Aguardar build (~5 min)
3. Quando terminar, abre a janela "Archives"
4. Selecionar o arquivo gerado
5. Clicar **Distribute App**
6. Escolher **TestFlight & App Store**
7. Seguir o assistente

### Opção B: Para distribuição Ad-Hoc (arquivo IPA direto):

1. Menu: **Product > Archive**
2. Aguardar build (~5 min)
3. Na janela "Archives", selecionar o arquivo
4. Clicar **Distribute App**
5. Escolher **Ad Hoc**
6. **Next > Next**
7. Escolher onde salvar
8. ✅ Arquivo `J2S Obras.ipa` gerado!

---

## 📤 PASSO 6: ENVIAR PARA GUILHERME

Envie o arquivo `.ipa` gerado (tamanho ~5-10 MB).

---

## ⚠️ PROBLEMAS COMUNS:

### "Failed to register bundle identifier"
- Mude o Bundle ID para algo único: `com.seunome.j2sobras`

### "No signing certificate found"
- Xcode > Settings > Accounts
- Adicionar sua conta Apple
- Download Manual Profiles

### "Build failed"
- Menu: **Product > Clean Build Folder**
- Tentar novamente

---

## 🎯 RESUMO RÁPIDO:

```bash
# 1. Abrir projeto
cd ~/Downloads/app-cassio
npx cap open ios

# 2. No Xcode:
# - Signing & Capabilities > Selecionar Team
# - Product > Archive
# - Distribute App > Ad Hoc
# - Salvar .ipa

# 3. Enviar .ipa para Guilherme
```

---

## 💡 DICA:

Se der muito trabalho, pode usar só PWA para iOS:
- Acessa `j2s.ad/download.html` no Safari
- Compartir > "Añadir a inicio"
- Funciona igual app nativo

---

## ℹ️ INFORMAÇÕES TÉCNICAS:

- **App Name:** J2S Obras
- **Bundle ID:** com.j2s.obras
- **URL:** https://j2s.ad/login
- **É um Web App:** O app só carrega o site, não tem código nativo

---

**Qualquer dúvida, chama o Guilherme!** 📞
