@echo off
chcp 65001 >nul
cls

echo ════════════════════════════════════════════════════════════════
echo  CONVERTER AAB PARA APK - RÁPIDO
echo ════════════════════════════════════════════════════════════════
echo.

REM Configurar Java
set "PATH=%CD%\tudo-playstore\jdk-17.0.2\bin;%PATH%"
set "JAVA_HOME=%CD%\tudo-playstore\jdk-17.0.2"

REM Pegar AAB mais recente
for /f "delims=" %%i in ('dir /b /o-d j2s-hores-v*-playstore.aab 2^>nul') do (
    set "AAB=%%i"
    goto :found
)

echo ❌ Nenhum AAB encontrado!
pause
exit /b 1

:found
echo AAB encontrado: %AAB%
echo.

REM Baixar bundletool se necessário
if not exist "bundletool.jar" (
    echo Baixando bundletool...
    powershell -Command "try { Invoke-WebRequest -Uri 'https://github.com/google/bundletool/releases/download/1.15.6/bundletool-all-1.15.6.jar' -OutFile 'bundletool.jar' } catch { exit 1 }"
    if errorlevel 1 (
        echo ❌ Falhou em baixar bundletool
        pause
        exit /b 1
    )
)

echo Convertendo AAB para APK...

REM Gerar APKs
java -jar bundletool.jar build-apks --mode=universal --bundle="%AAB%" --output=temp.apks --ks=j2s-horas.keystore --ks-pass=pass:J2S@Hores2026 --ks-key-alias=j2s --key-pass=pass:J2S@Hores2026

if not exist "temp.apks" (
    echo ❌ Erro ao gerar APKs
    pause
    exit /b 1
)

REM Renomear .apks para .zip (PowerShell não reconhece .apks)
move temp.apks temp.zip >nul 2>&1

REM Extrair APK
powershell -Command "Expand-Archive -Path 'temp.zip' -DestinationPath 'temp-apk' -Force"

REM Copiar APK final
set "APK=%AAB:-playstore.aab=-TESTE.apk%"
copy "temp-apk\universal.apk" "%APK%" >nul 2>&1

REM Limpar
del temp.zip 2>nul
rmdir /s /q temp-apk 2>nul

if exist "%APK%" (
    echo.
    echo ✅ SUCESSO!
    echo.
    echo APK gerado: %APK%
    echo.
    echo Arraste para o LDPlayer!
) else (
    echo ❌ Falhou em gerar APK
)

echo.
pause
