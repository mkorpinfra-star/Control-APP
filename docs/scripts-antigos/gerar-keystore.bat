@echo off
echo ========================================
echo     GERAR KEYSTORE - J2S HORAS
echo ========================================
echo.

REM Verificar se Java está instalado
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Java nao encontrado!
    echo.
    echo Por favor, instale o Java JDK primeiro:
    echo https://www.oracle.com/java/technologies/downloads/
    echo.
    pause
    exit /b
)

echo [OK] Java encontrado!
echo.
echo Este script vai criar o arquivo de assinatura (keystore)
echo necessario para publicar o app na Google Play Store.
echo.
echo IMPORTANTE: Guarde este arquivo e as senhas em local seguro!
echo Se perder, NUNCA mais conseguira atualizar o app!
echo.
pause

echo.
echo ========================================
echo Criando keystore...
echo ========================================
echo.

REM Criar keystore
keytool -genkey -v -keystore j2s-horas.keystore -alias j2s -keyalg RSA -keysize 2048 -validity 10000

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo [SUCESSO] Keystore criado com sucesso!
    echo ========================================
    echo.
    echo Arquivo gerado: j2s-horas.keystore
    echo Localizacao: %CD%\j2s-horas.keystore
    echo.
    echo PROXIMOS PASSOS:
    echo 1. Guarde este arquivo em 3 lugares seguros:
    echo    - No PC
    echo    - Na nuvem (Google Drive/Dropbox)
    echo    - Backup externo (pendrive)
    echo.
    echo 2. Anote as senhas que voce digitou!
    echo.
    echo 3. Execute o script: configurar-signing.bat
    echo.
) else (
    echo.
    echo [ERRO] Falha ao criar keystore!
    echo.
)

pause
