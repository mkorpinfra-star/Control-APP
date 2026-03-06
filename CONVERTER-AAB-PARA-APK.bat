@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title CONVERTER AAB PARA APK - UNIVERSAL
color 0B
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║          🔄 CONVERTER AAB PARA APK UNIVERSAL                 ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

REM ============================================================================
REM BAIXAR BUNDLETOOL SE NÃO EXISTIR
REM ============================================================================

if not exist "bundletool.jar" (
    echo [1/4] Baixando bundletool do Google...
    echo    Aguarde...

    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/google/bundletool/releases/download/1.15.6/bundletool-all-1.15.6.jar' -OutFile 'bundletool.jar'"

    if not exist "bundletool.jar" (
        echo    ❌ ERRO: Não conseguiu baixar bundletool
        pause
        exit /b 1
    )
    echo    ✅ Bundletool baixado!
    echo.
) else (
    echo [1/4] Bundletool já existe
    echo.
)

REM ============================================================================
REM ENCONTRAR AAB MAIS RECENTE
REM ============================================================================

echo [2/4] Procurando AAB mais recente...

REM Pegar o AAB mais recente do padrão j2s-hores-*.aab
for /f "delims=" %%i in ('dir /b /od j2s-hores-v*.aab 2^>nul') do set LATEST_AAB=%%i

if not defined LATEST_AAB (
    echo    ❌ ERRO: Nenhum AAB encontrado (j2s-hores-v*.aab)
    pause
    exit /b 1
)

echo    ✅ AAB encontrado: %LATEST_AAB%
echo.

REM ============================================================================
REM CONFIGURAR JAVA 17
REM ============================================================================

echo [3/4] Configurando Java 17...
set "PATH=%CD%\tudo-playstore\jdk-17.0.2\bin;%PATH%"
set "JAVA_HOME=%CD%\tudo-playstore\jdk-17.0.2"
java -version 2>&1 | findstr "version"
echo.

REM ============================================================================
REM CONVERTER AAB PARA APK UNIVERSAL
REM ============================================================================

echo [4/4] Convertendo AAB para APK universal...
echo    Aguarde...

REM Gerar APKs (cria arquivo .apks que é um ZIP)
java -jar bundletool.jar build-apks --mode=universal --bundle="%LATEST_AAB%" --output=temp.apks --ks=j2s-horas.keystore --ks-pass=pass:J2S@Hores2026 --ks-key-alias=j2s --key-pass=pass:J2S@Hores2026

if not exist "temp.apks" (
    echo    ❌ ERRO: Não conseguiu gerar APKs
    pause
    exit /b 1
)

REM Extrair o APK universal do arquivo .apks
powershell -Command "Expand-Archive -Path 'temp.apks' -DestinationPath 'temp-apk' -Force"

if not exist "temp-apk\universal.apk" (
    echo    ❌ ERRO: APK universal não encontrado
    pause
    exit /b 1
)

REM Copiar APK com nome bonito
set OUTPUT_NAME=%LATEST_AAB:.aab=-TESTE.apk%
copy "temp-apk\universal.apk" "%OUTPUT_NAME%" >nul

REM Limpar arquivos temporários
del temp.apks >nul 2>&1
rmdir /s /q temp-apk >nul 2>&1

echo    ✅ APK gerado!
echo.

REM ============================================================================
REM RESUMO FINAL
REM ============================================================================

cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║          ✅ APK UNIVERSAL GERADO COM SUCESSO!                ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 📦 Arquivo gerado:
echo    %OUTPUT_NAME%
echo.
echo 📊 Origem:
echo    AAB: %LATEST_AAB%
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
echo ⚠️  ATENÇÃO:
echo    Este APK é UNIVERSAL (funciona em todas as arquiteturas)
echo    Está assinado com o keystore J2S
echo    Pode instalar no LDPlayer sem problemas!
echo.
pause
