# 📸 COMO TIRAR SCREENSHOTS PARA PLAY STORE

Google Play exige **mínimo 2 screenshots** (recomendado 4-8) em alta resolução.

---

## 📏 REQUISITOS TÉCNICOS

- **Quantidade:** Mínimo 2, máximo 8
- **Resolução mínima:** 320 px (lado menor)
- **Resolução máxima:** 3840 px (lado maior)
- **Proporção recomendada:** 16:9 (ex: 1080 x 1920)
- **Formato:** PNG ou JPG
- **Sem transparência:** Fundo sólido obrigatório

---

## 🎯 SCREENSHOTS RECOMENDADOS

Tire prints das seguintes telas (em ordem de prioridade):

1. **Tela de Login** - Primeira impressão do usuário
2. **Timesheet (Registro de Horas)** - Funcionalidade principal
3. **Lista de Aprovações** - Para supervisores
4. **Dashboard com KPIs** - Para administradores
5. **Perfil do Funcionário** - Tela de dados pessoais
6. **Calendário/Visualização Semanal** - Controle visual
7. **Nómina (Folha de Pagamento)** - Consulta de salário
8. **Splash Screen Animado** - Abertura do app

---

## 🛠️ MÉTODO 1: Usar Emulador Android Studio (RECOMENDADO)

### Passo 1: Abrir Android Studio
1. Abra o Android Studio
2. Vá em **Tools** → **Device Manager**
3. Crie um device virtual:
   - Nome: **Pixel 6 Pro** (ou similar)
   - Resolução: **1440 x 3120** (escala para 1080 x 2340)
   - Android: **API 34** (Android 14)

### Passo 2: Rodar o App no Emulador
```bash
# No terminal:
cd android
./gradlew installDebug

# Ou pelo Android Studio:
# Run → Run 'app'
```

### Passo 3: Tirar Screenshots
1. Com o app aberto no emulador
2. Navegue para cada tela (login, timesheet, etc)
3. Clique no ícone de **câmera** na barra lateral do emulador
4. Ou use **Ctrl + S** (Windows) / **Cmd + S** (Mac)
5. Screenshots salvos em: `C:\Users\Guilherme\Pictures\` (Windows)

### Passo 4: Recortar/Ajustar (opcional)
- Use **Paint**, **Photoshop** ou **Canva**
- Corte bordas se necessário
- Certifique-se de que está em 1080 x 1920 (ou proporcional)

---

## 🛠️ MÉTODO 2: Usar Celular Android Real

### Passo 1: Ativar Opções de Desenvolvedor
1. No celular: **Configurações** → **Sobre o telefone**
2. Toque 7 vezes em **Número da versão**
3. Mensagem: "Você agora é um desenvolvedor"

### Passo 2: Ativar Depuração USB
1. **Configurações** → **Opções de desenvolvedor**
2. Ative **Depuração USB**

### Passo 3: Conectar ao PC
1. Conecte o celular ao PC via USB
2. No celular, autorize o PC (popup "Permitir depuração USB")

### Passo 4: Instalar o APK
```bash
# Método 1: Via ADB
adb install dist/j2s-obras.apk

# Método 2: Transferir APK para o celular e instalar manualmente
```

### Passo 5: Tirar Screenshots
1. Abra o app no celular
2. Navegue para cada tela
3. Tire prints:
   - **Android:** Pressione **Power + Volume Down**
   - Screenshots salvos na **Galeria**
4. Transfira as imagens para o PC:
   - Via cabo USB (pasta DCIM/Screenshots)
   - Via WhatsApp Web
   - Via Google Fotos

---

## 🛠️ MÉTODO 3: Usar Ferramentas Online (MAIS FÁCIL)

### Opção A: Screely.com
1. Acesse: https://screely.com
2. Faça upload dos prints simples
3. Adiciona moldura de celular automaticamente
4. Baixe em alta resolução

### Opção B: MockUPhone.com
1. Acesse: https://mockuphone.com
2. Escolha modelo: **Android** → **Google Pixel 6**
3. Faça upload dos prints
4. Baixe com moldura profissional

### Opção C: Canva (Design personalizado)
1. Acesse: https://canva.com
2. Crie design: **1080 x 1920 px**
3. Adicione fundo gradiente (vermelho J2S)
4. Insira screenshot do app
5. Adicione texto destacando features:
   - "Registro de horas em segundos"
   - "Aprovação digital com assinatura"
   - "Dashboard em tempo real"
6. Baixe como PNG

---

## 📋 CHECKLIST DE SCREENSHOTS

Certifique-se de incluir:

- [ ] Pelo menos 2 screenshots (mínimo obrigatório)
- [ ] Máximo 8 screenshots (limite da Play Store)
- [ ] Resolução mínima: 1080 x 1920 (ou proporcional)
- [ ] Fundo sólido (sem transparência)
- [ ] Telas principais do app visíveis
- [ ] Texto legível (não borrado)
- [ ] Sem informações sensíveis (senhas, dados reais de clientes)
- [ ] Nomes dos arquivos: `screenshot-1.png`, `screenshot-2.png`, etc.

---

## 🎨 DICAS PARA SCREENSHOTS PROFISSIONAIS

### ✅ BOM:
- Telas completas e nítidas
- Dados de exemplo realistas (não "teste teste 123")
- Cores vibrantes e contrastantes
- Texto legível mesmo em tamanho pequeno
- Foco na funcionalidade principal

### ❌ EVITE:
- Screenshots borrados ou pixelados
- Telas vazias ou de erro
- Dados pessoais reais (LGPD/RGPD)
- Muitos screenshots da mesma tela
- Capturas de tela de outros apps/configurações

---

## 📂 ORGANIZAÇÃO DOS ARQUIVOS

Salve os screenshots em uma pasta organizada:

```
screenshots-playstore/
├── 01-login.png           (1080 x 1920)
├── 02-timesheet.png       (1080 x 1920)
├── 03-approvals.png       (1080 x 1920)
├── 04-dashboard.png       (1080 x 1920)
├── 05-profile.png         (1080 x 1920)
├── 06-calendar.png        (1080 x 1920)
├── 07-payroll.png         (1080 x 1920)
└── 08-splash.png          (1080 x 1920)
```

---

## 🚀 PRÓXIMOS PASSOS

Depois de gerar os screenshots:

1. ✅ Valide o tamanho de cada imagem (mínimo 1080 x 1920)
2. ✅ Renomeie os arquivos sequencialmente
3. ✅ Prepare os outros gráficos (Feature Graphic, Ícone 512x512)
4. ✅ Faça upload na Play Console em "Arte gráfica"

---

## 📞 FERRAMENTAS ÚTEIS

- **Photopea** (Photoshop online grátis): https://photopea.com
- **Canva** (Design gráfico): https://canva.com
- **Screely** (Molduras automáticas): https://screely.com
- **Resize Image** (Redimensionar): https://resizeimage.net

---

**PRONTO!** Agora você sabe como tirar screenshots profissionais para a Play Store! 📸
