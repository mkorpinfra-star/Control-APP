# ⚡ INSTALAR JAVA E GERAR APK (10 MINUTOS)

## 1️⃣ BAIXAR JAVA JDK (2 minutos)

Acesse: **https://adoptium.net/temurin/releases/**

Ou use este link direto:
**https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.12%2B7/OpenJDK17U-jdk_x64_windows_hotspot_17.0.12_7.msi**

- Baixar o arquivo `.msi` (150 MB)
- Executar
- **Next > Next > Next > Install**
- Esperar (2 minutos)
- **Finish**

✅ PRONTO! Java instalado!

---

## 2️⃣ FECHAR E REABRIR TERMINAL

**IMPORTANTE:** O terminal precisa recarregar as variáveis de ambiente!

1. Feche o terminal atual
2. Abra um NOVO terminal
3. Vá para a pasta do projeto:
```bash
cd C:\Users\Guilherme\Desktop\app-cassio
```

---

## 3️⃣ GERAR O APK (5 minutos)

```bash
cd android
gradlew.bat assembleDebug
```

Vai aparecer:
```
> Task :app:assembleDebug
BUILD SUCCESSFUL in 3m 45s
```

✅ APK GERADO!

---

## 4️⃣ COPIAR APK

```bash
# Voltar para raiz
cd ..

# Copiar APK
copy android\app\build\outputs\apk\debug\app-debug.apk public\j2s-obras.apk

# Build com APK incluído
npm run build
```

✅ PRONTO! APK está em `dist/j2s-obras.apk`

---

## 5️⃣ TESTAR

```bash
# Abrir pasta do APK
explorer dist
```

Copie `j2s-obras.apk` para seu celular Android e teste!

---

## 📱 ENVIAR PARA FTP

Envie a pasta `dist/` INTEIRA para o FTP, incluindo `j2s-obras.apk`

---

**TEMPO TOTAL: ~10 minutos**
