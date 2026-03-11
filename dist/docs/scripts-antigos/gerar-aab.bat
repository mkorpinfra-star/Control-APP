@echo off
echo ========================================
echo     GERAR AAB ASSINADO - J2S HORAS
echo ========================================
echo.

REM Verificar se key.properties existe
if not exist "android\key.properties" (
    echo [ERRO] Arquivo key.properties nao encontrado!
    echo.
    echo Por favor, execute primeiro: configurar-signing.bat
    echo.
    pause
    exit /b
)

echo [OK] Configuracao de assinatura encontrada!
echo.

REM Verificar se Gradle existe (Android Studio instalado)
if not exist "android\gradlew.bat" (
    echo [ERRO] Gradle nao encontrado!
    echo.
    echo Certifique-se de que o Android Studio esta instalado
    echo e que a pasta android/ foi inicializada com:
    echo   npx cap add android
    echo.
    pause
    exit /b
)

echo [OK] Gradle encontrado!
echo.
echo Gerando Android App Bundle (AAB) assinado...
echo Isso pode levar alguns minutos...
echo.

REM Navegar para pasta android e executar build
cd android
call gradlew.bat bundleRelease

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo [SUCESSO] AAB gerado com sucesso!
    echo ========================================
    echo.
    echo Arquivo gerado:
    echo android\app\build\outputs\bundle\release\app-release.aab
    echo.
    echo Tamanho do arquivo:
    dir /s app\build\outputs\bundle\release\app-release.aab | find "app-release.aab"
    echo.
    echo PROXIMOS PASSOS:
    echo 1. Criar conta Google Play Console (US$ 25)
    echo 2. Upload do AAB na Play Console
    echo 3. Preencher ficha da loja
    echo 4. Submeter para revisao
    echo.
    echo Veja instrucoes completas em:
    echo GERAR-APK-PLAYSTORE.md
    echo.
) else (
    echo.
    echo [ERRO] Falha ao gerar AAB!
    echo.
    echo Verifique:
    echo 1. Android Studio esta instalado?
    echo 2. Senhas no key.properties estao corretas?
    echo 3. Caminho do keystore esta correto?
    echo.
)

cd ..
pause
