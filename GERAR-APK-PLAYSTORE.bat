@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title GERAR AAB PLAY STORE - AUTOMÁTICO
color 0A
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║          📦 GERAR AAB PLAY STORE - AUTOMÁTICO                ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

REM ============================================================================
REM LER VERSÃO ATUAL E AUMENTAR AUTOMATICAMENTE
REM ============================================================================

echo [1/6] Lendo versão atual...

REM Ler versionCode atual do build.gradle
for /f "tokens=2" %%i in ('findstr /C:"versionCode" android\app\build.gradle') do set OLD_VERSION_CODE=%%i

REM Ler versionName atual (formato: versionName "1.2")
for /f "tokens=2" %%i in ('findstr /C:"versionName" android\app\build.gradle') do (
    set VERSION_NAME_RAW=%%i
    set VERSION_NAME=!VERSION_NAME_RAW:"=!
)

REM Calcular nova versão (versão atual + 1)
set /a NEW_VERSION_CODE=%OLD_VERSION_CODE%+1

REM Calcular novo versionName (ex: 1.0 -> 1.1)
for /f "tokens=1,2 delims=." %%a in ("%VERSION_NAME%") do (
    set MAJOR=%%a
    set /a MINOR=%%b+1
    set NEW_VERSION_NAME=!MAJOR!.!MINOR!
)

echo    Versão atual: %OLD_VERSION_CODE% (%VERSION_NAME%)
echo    Nova versão: %NEW_VERSION_CODE% (%NEW_VERSION_NAME%)
echo.

REM ============================================================================
REM ATUALIZAR build.gradle COM NOVA VERSÃO
REM ============================================================================

echo [2/6] Atualizando versão no build.gradle...

powershell -Command "(Get-Content 'android\app\build.gradle') -replace 'versionCode %OLD_VERSION_CODE%', 'versionCode %NEW_VERSION_CODE%' | Set-Content 'android\app\build.gradle'"
powershell -Command "(Get-Content 'android\app\build.gradle') -replace 'versionName \"%VERSION_NAME%\"', 'versionName \"%NEW_VERSION_NAME%\"' | Set-Content 'android\app\build.gradle'"

echo    ✅ Versão atualizada: versionCode %NEW_VERSION_CODE%
echo.

REM ============================================================================
REM GERAR ÍCONES E SPLASH SCREENS ANDROID
REM ============================================================================

echo [3/7] Gerando ícones Android em todos os tamanhos...
python gerar-icones-android.py
echo.

echo [4/7] Gerando splash screens personalizados...
python gerar-splash-android.py
echo.

REM ============================================================================
REM CONFIGURAR JAVA 17
REM ============================================================================

echo [5/7] Configurando Java 17...
set "PATH=%CD%\tudo-playstore\jdk-17.0.2\bin;%PATH%"
set "JAVA_HOME=%CD%\tudo-playstore\jdk-17.0.2"
java -version 2>&1 | findstr "version"
echo.

REM ============================================================================
REM COMPILAR AAB
REM ============================================================================

echo [6/7] Compilando AAB (5-10 minutos)...
echo    Aguarde...
echo    Salvando log em: build-log.txt
cd android
call gradlew.bat clean bundleRelease > ..\build-log.txt 2>&1
cd ..
if not exist "android\app\build\outputs\bundle\release\app-release.aab" (
    echo    ❌ ERRO: AAB não foi gerado!
    pause
    exit /b 1
)
echo    ✅ AAB compilado!
echo.

REM ============================================================================
REM COPIAR AAB E GERAR APK PARA TESTE
REM ============================================================================

echo [7/7] Copiando AAB final...

set OUTPUT_AAB=j2s-hores-v%NEW_VERSION_NAME%-playstore.aab
copy "android\app\build\outputs\bundle\release\app-release.aab" "%OUTPUT_AAB%" >nul

echo    ✅ AAB gerado: %OUTPUT_AAB%
echo.

REM ============================================================================
REM RESUMO FINAL
REM ============================================================================

cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║          ✅ AAB GERADO COM SUCESSO!                          ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 📦 Arquivo gerado:
echo    %OUTPUT_AAB%
echo.
echo 📊 Versão:
echo    versionCode: %NEW_VERSION_CODE%
echo    versionName: %NEW_VERSION_NAME%
echo.
echo 📝 Notas da versão (copie e cole na Play Store):
echo.
echo ^<es-ES^>
echo v%NEW_VERSION_NAME% - Actualizaciones
echo • Mejoras visuales
echo • Correcciones de errores
echo ^</es-ES^>
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo Próximos passos:
echo 1. Acesse: https://play.google.com/console
echo 2. Vá em Produção ^> Criar nova versão
echo 3. Faça upload do arquivo: %OUTPUT_AAB%
echo 4. Cole as notas da versão acima
echo 5. Publique!
echo.
pause
