@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title GERAR APK PARA TESTE - LDPLAYER
color 0E
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║          📱 GERAR APK PARA TESTE (LDPLAYER)                  ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

REM ============================================================================
REM LER VERSÃO ATUAL (SEM INCREMENTAR)
REM ============================================================================

echo [1/5] Lendo versão atual...

REM Ler versionCode atual do build.gradle
for /f "tokens=2" %%i in ('findstr /C:"versionCode" android\app\build.gradle') do set VERSION_CODE=%%i

REM Ler versionName atual (formato: versionName "1.2")
for /f "tokens=2" %%i in ('findstr /C:"versionName" android\app\build.gradle') do (
    set VERSION_NAME_RAW=%%i
    set VERSION_NAME=!VERSION_NAME_RAW:"=!
)

echo    Versão atual: %VERSION_CODE% (%VERSION_NAME%)
echo    (sem incrementar - apenas para teste)
echo.

REM ============================================================================
REM GERAR ÍCONES E SPLASH SCREENS ANDROID
REM ============================================================================

echo [2/5] Gerando ícones Android em todos os tamanhos...
python gerar-icones-android.py
echo.

echo [3/5] Gerando splash screens personalizados...
python gerar-splash-android.py
echo.

REM ============================================================================
REM CONFIGURAR JAVA 17
REM ============================================================================

echo [4/5] Configurando Java 17...
set "PATH=%CD%\tudo-playstore\jdk-17.0.2\bin;%PATH%"
set "JAVA_HOME=%CD%\tudo-playstore\jdk-17.0.2"
java -version 2>&1 | findstr "version"
echo.

REM ============================================================================
REM COMPILAR APK ASSINADO PARA TESTE
REM ============================================================================

echo [5/5] Compilando APK ASSINADO (3-5 minutos)...
echo    Aguarde...
echo    Salvando log em: build-log-apk.txt
cd android
call gradlew.bat assembleRelease > ..\build-log-apk.txt 2>&1
cd ..

REM Verificar se APK foi gerado
if not exist "android\app\build\outputs\apk\release\app-release.apk" (
    echo    ❌ ERRO: APK não foi gerado!
    echo    Verifique o arquivo: build-log-apk.txt
    pause
    exit /b 1
)

echo    ✅ APK compilado e assinado!
echo.

REM ============================================================================
REM COPIAR APK COM NOME BONITO
REM ============================================================================

echo Copiando APK final...

set OUTPUT_NAME=j2s-hores-v%VERSION_NAME%-TESTE.apk
copy "android\app\build\outputs\apk\release\app-release.apk" "%OUTPUT_NAME%" >nul

echo    ✅ APK gerado: %OUTPUT_NAME%
echo.

REM ============================================================================
REM RESUMO FINAL
REM ============================================================================

cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║          ✅ APK DE TESTE GERADO COM SUCESSO!                 ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 📦 Arquivo gerado:
echo    %OUTPUT_NAME%
echo.
echo 📊 Versão:
echo    versionCode: %VERSION_CODE%
echo    versionName: %VERSION_NAME%
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo 📱 Como instalar no LDPlayer:
echo.
echo 1. Arraste o arquivo %OUTPUT_NAME% para a janela do LDPlayer
echo 2. Ou clique no ícone APK Install no painel direito do LDPlayer
echo 3. Selecione o arquivo: %OUTPUT_NAME%
echo 4. Aguarde a instalação
echo 5. Teste o aplicativo!
echo.
echo ⚠️  ATENÇÃO: Este é um APK assinado para TESTE
echo    Pode instalar no LDPlayer sem problemas!
echo    Para Play Store (AAB), use: GERAR-APK-PLAYSTORE.bat
echo.
pause
