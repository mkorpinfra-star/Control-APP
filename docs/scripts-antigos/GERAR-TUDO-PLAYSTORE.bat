@echo off
chcp 65001 >nul
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║          🚀 GERAR TUDO PARA PLAY STORE - J2S HORES          ║
echo ║                                                               ║
echo ║     Este script faz TUDO automaticamente:                    ║
echo ║     ✅ Cria keystore (assinatura digital)                    ║
echo ║     ✅ Configura assinatura no projeto                       ║
echo ║     ✅ Gera AAB assinado                                     ║
echo ║     ✅ Gera todos os gráficos Play Store                     ║
echo ║     ✅ Organiza tudo numa pasta pronta                       ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo ⏱️  Tempo estimado: 5-10 minutos
echo.
pause

REM =============================================================================
REM ETAPA 1: VERIFICAR JAVA
REM =============================================================================
echo.
echo ┌────────────────────────────────────────────────────────────┐
echo │ [1/5] Verificando Java JDK...                             │
echo └────────────────────────────────────────────────────────────┘
echo.

java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ [ERRO] Java não encontrado!
    echo.
    echo 📥 Baixe e instale o Java JDK:
    echo    https://www.oracle.com/java/technologies/downloads/
    echo.
    echo Ou execute: INSTALAR-JAVA-RAPIDO.md
    echo.
    pause
    exit /b 1
)

echo ✅ Java encontrado!
java -version 2>&1 | findstr "version"
timeout /t 2 >nul

REM =============================================================================
REM ETAPA 2: CRIAR KEYSTORE (se não existir)
REM =============================================================================
echo.
echo ┌────────────────────────────────────────────────────────────┐
echo │ [2/5] Criando Keystore (assinatura digital)...            │
echo └────────────────────────────────────────────────────────────┘
echo.

if exist "j2s-horas.keystore" (
    echo ✅ Keystore já existe: j2s-horas.keystore
    echo    (Pulando criação)
    timeout /t 2 >nul
) else (
    echo 🔐 IMPORTANTE: Você precisará criar uma senha forte!
    echo    Exemplo: J2S@Hores2026
    echo.
    echo 📝 ANOTE A SENHA - você vai precisar dela!
    echo.
    pause

    keytool -genkey -v -keystore j2s-horas.keystore -alias j2s -keyalg RSA -keysize 2048 -validity 10000 -storepass J2S@Hores2026 -keypass J2S@Hores2026 -dname "CN=J2S Enginyeria, OU=Mobile, O=J2S, L=Andorra, ST=Andorra, C=AD"

    if %errorlevel% equ 0 (
        echo.
        echo ✅ Keystore criado com sucesso!
        echo    Localização: %CD%\j2s-horas.keystore
        timeout /t 2 >nul
    ) else (
        echo.
        echo ❌ [ERRO] Falha ao criar keystore!
        pause
        exit /b 1
    )
)

REM =============================================================================
REM ETAPA 3: CONFIGURAR ASSINATURA
REM =============================================================================
echo.
echo ┌────────────────────────────────────────────────────────────┐
echo │ [3/5] Configurando assinatura no projeto...               │
echo └────────────────────────────────────────────────────────────┘
echo.

if not exist "android" (
    echo ⚠️  Pasta android/ não existe!
    echo    Inicializando Capacitor Android...
    echo.
    call npx cap add android
    if %errorlevel% neq 0 (
        echo ❌ Erro ao inicializar Android
        pause
        exit /b 1
    )
)

REM Criar arquivo key.properties
(
echo storePassword=J2S@Hores2026
echo keyPassword=J2S@Hores2026
echo keyAlias=j2s
echo storeFile=%CD%\j2s-horas.keystore
) > android\key.properties

echo ✅ Arquivo key.properties criado!
timeout /t 2 >nul

REM =============================================================================
REM ETAPA 4: GERAR AAB ASSINADO
REM =============================================================================
echo.
echo ┌────────────────────────────────────────────────────────────┐
echo │ [4/5] Gerando AAB assinado...                             │
echo │      (Isso pode levar 3-5 minutos)                        │
echo └────────────────────────────────────────────────────────────┘
echo.

cd android
call gradlew.bat bundleRelease

if %errorlevel% equ 0 (
    echo.
    echo ✅ AAB gerado com sucesso!
    echo    Localização: android\app\build\outputs\bundle\release\app-release.aab
    timeout /t 2 >nul
) else (
    echo.
    echo ❌ [ERRO] Falha ao gerar AAB!
    echo.
    echo Verifique:
    echo 1. Android Studio está instalado?
    echo 2. Gradle foi inicializado corretamente?
    echo.
    cd ..
    pause
    exit /b 1
)

cd ..

REM =============================================================================
REM ETAPA 5: GERAR GRÁFICOS PLAY STORE
REM =============================================================================
echo.
echo ┌────────────────────────────────────────────────────────────┐
echo │ [5/5] Gerando gráficos Play Store...                      │
echo └────────────────────────────────────────────────────────────┘
echo.

cd playstore-assets
python gerar-tudo.py

if %errorlevel% equ 0 (
    echo.
    echo ✅ Gráficos gerados com sucesso!
    timeout /t 2 >nul
) else (
    echo.
    echo ❌ [ERRO] Falha ao gerar gráficos!
    echo.
    echo Verifique se Python está instalado:
    echo    python --version
    echo.
    cd ..
    pause
    exit /b 1
)

cd ..

REM =============================================================================
REM FINALIZAÇÃO - COPIAR AAB PARA PASTA PLAYSTORE
REM =============================================================================
echo.
echo ┌────────────────────────────────────────────────────────────┐
echo │ Organizando arquivos finais...                            │
echo └────────────────────────────────────────────────────────────┘
echo.

if not exist "playstore-assets\aab" mkdir "playstore-assets\aab"
copy "android\app\build\outputs\bundle\release\app-release.aab" "playstore-assets\aab\j2s-hores-v1.0.aab" >nul

echo ✅ AAB copiado para: playstore-assets\aab\j2s-hores-v1.0.aab

REM =============================================================================
REM SUCESSO TOTAL!
REM =============================================================================
echo.
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║                    ✅ TUDO PRONTO! 🎉                        ║
echo ║                                                               ║
echo ║  Tudo foi gerado automaticamente:                            ║
echo ║                                                               ║
echo ║  📦 playstore-assets\                                        ║
echo ║     ├── aab\                                                 ║
echo ║     │   └── j2s-hores-v1.0.aab  ⬅️ UPLOAD NA PLAY STORE    ║
echo ║     ├── graficos\                                            ║
echo ║     │   ├── icone-512x512.png                               ║
echo ║     │   └── feature-graphic-1024x500.png                    ║
echo ║     ├── screenshots\ (6 imagens)                            ║
echo ║     ├── textos\ (6 arquivos .txt)                           ║
echo ║     └── PRONTO-PLAYSTORE.md  ⬅️ LEIA ISSO AGORA!           ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo.
echo 📖 PRÓXIMOS PASSOS:
echo.
echo 1. Abra: playstore-assets\PRONTO-PLAYSTORE.md
echo 2. Siga o passo a passo (5 minutos)
echo 3. Faça upload na Play Console
echo.
echo ⚠️  BACKUP IMPORTANTE:
echo    Copie o arquivo j2s-horas.keystore para 3 lugares seguros!
echo    (Se perder, nunca mais consegue atualizar o app)
echo.
echo.
pause
