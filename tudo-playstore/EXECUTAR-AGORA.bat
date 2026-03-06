@echo off
chcp 65001 >nul
title GERAR AAB PARA PLAY STORE
color 0A
cd ..

REM ============================================================================
REM VERIFICAR SE FOI CONFIGURADO
REM ============================================================================

if not exist "tudo-playstore\config.txt" (
    cls
    echo.
    echo ════════════════════════════════════════════════════════════════
    echo   ⚠️  ERRO: PROJETO NÃO CONFIGURADO!
    echo ════════════════════════════════════════════════════════════════
    echo.
    echo Você precisa executar CONFIGURAR.bat primeiro!
    echo.
    echo Execute:
    echo   cd tudo-playstore
    echo   CONFIGURAR.bat
    echo.
    pause
    exit /b 1
)

REM ============================================================================
REM CARREGAR CONFIGURAÇÃO
REM ============================================================================

for /f "tokens=1,* delims==" %%a in (tudo-playstore\config.txt) do (
    if "%%a"=="APP_NAME" set "APP_NAME=%%b"
    if "%%a"=="APP_ID" set "APP_ID=%%b"
    if "%%a"=="APP_VERSION" set "APP_VERSION=%%b"
    if "%%a"=="COMPANY_NAME" set "COMPANY_NAME=%%b"
    if "%%a"=="COUNTRY" set "COUNTRY=%%b"
    if "%%a"=="KEYSTORE_PASS" set "KEYSTORE_PASS=%%b"
    if "%%a"=="KEY_ALIAS" set "KEY_ALIAS=%%b"
)

cls
echo.
echo ════════════════════════════════════════════════════════════════
echo    GERAR AAB PARA PLAY STORE
echo ════════════════════════════════════════════════════════════════
echo.
echo 📱 App: %APP_NAME%
echo 🆔 ID: %APP_ID%
echo 📦 Versão: %APP_VERSION%
echo.
echo Pressione qualquer tecla para começar...
pause >nul

REM ============================================================================
REM CONFIGURAR JAVA
REM ============================================================================

echo.
echo [1/5] Configurando Java 17...
set "PATH=%CD%\tudo-playstore\jdk-17.0.2\bin;%PATH%"
set "JAVA_HOME=%CD%\tudo-playstore\jdk-17.0.2"
java -version 2>&1 | findstr "version"
echo ✅ OK!

REM ============================================================================
REM CRIAR/VERIFICAR KEYSTORE
REM ============================================================================

echo.
echo [2/5] Verificando keystore...
if exist "%APP_ID%.keystore" (
    echo ✅ Keystore já existe: %APP_ID%.keystore
) else (
    echo 🔐 Criando novo keystore...
    keytool -genkey -v -keystore %APP_ID%.keystore -alias %KEY_ALIAS% -keyalg RSA -keysize 2048 -validity 10000 -storepass %KEYSTORE_PASS% -keypass %KEYSTORE_PASS% -dname "CN=%COMPANY_NAME%,O=%COMPANY_NAME%,L=%COUNTRY%,ST=%COUNTRY%,C=%COUNTRY%"
    echo ✅ Keystore criado: %APP_ID%.keystore
)

REM ============================================================================
REM COPIAR KEYSTORE
REM ============================================================================

echo.
echo [3/5] Copiando keystore...
copy %APP_ID%.keystore android\app\%APP_ID%.keystore >nul 2>&1
echo ✅ OK!

REM ============================================================================
REM CONFIGURAR ASSINATURA
REM ============================================================================

echo.
echo [4/5] Configurando assinatura...
(
echo storePassword=%KEYSTORE_PASS%
echo keyPassword=%KEYSTORE_PASS%
echo keyAlias=%KEY_ALIAS%
echo storeFile=%APP_ID%.keystore
) > android\key.properties
echo ✅ OK!

REM ============================================================================
REM COMPILAR AAB
REM ============================================================================

echo.
echo [5/5] Compilando AAB (aguarde 5-10 minutos)...
echo.
cd android
call gradlew.bat clean bundleRelease
cd ..

REM ============================================================================
REM COPIAR AAB
REM ============================================================================

echo.
echo Organizando arquivos...
if not exist "playstore-assets\aab" mkdir "playstore-assets\aab"
copy "android\app\build\outputs\bundle\release\app-release.aab" "playstore-assets\aab\%APP_ID%-v%APP_VERSION%.aab" >nul 2>&1

REM ============================================================================
REM RESULTADO
REM ============================================================================

cls
if exist "playstore-assets\aab\%APP_ID%-v%APP_VERSION%.aab" (
    echo.
    echo ╔═══════════════════════════════════════════════════════════════╗
    echo ║                                                               ║
    echo ║          ✅ AAB GERADO COM SUCESSO!                          ║
    echo ║                                                               ║
    echo ╚═══════════════════════════════════════════════════════════════╝
    echo.
    echo 📦 Arquivo: playstore-assets\aab\%APP_ID%-v%APP_VERSION%.aab
    echo 🔑 Keystore: %APP_ID%.keystore
    echo 🔐 Senha: %KEYSTORE_PASS%
    echo.
    echo ════════════════════════════════════════════════════════════════
    echo.
    echo ⚠️  IMPORTANTE - BACKUP DO KEYSTORE:
    echo.
    echo    Faça backup de %APP_ID%.keystore em 3 lugares:
    echo    • PC (pasta segura)
    echo    • Nuvem (Google Drive/Dropbox)
    echo    • Pendrive/HD externo
    echo.
    echo    SE PERDER, NUNCA MAIS CONSEGUE ATUALIZAR O APP!
    echo.
    echo ════════════════════════════════════════════════════════════════
    echo.
    echo PRÓXIMO PASSO:
    echo.
    echo    cd tudo-playstore
    echo    python gerar-graficos.py
    echo.
) else (
    echo.
    echo ════════════════════════════════════════════════════════════════
    echo   ❌ ERRO: AAB NÃO FOI GERADO
    echo ════════════════════════════════════════════════════════════════
    echo.
    echo Verifique os erros acima e tente novamente.
    echo.
)

pause
cd tudo-playstore
