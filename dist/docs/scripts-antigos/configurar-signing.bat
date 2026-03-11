@echo off
echo ========================================
echo   CONFIGURAR ASSINATURA - J2S HORAS
echo ========================================
echo.

REM Verificar se o keystore existe
if not exist "j2s-horas.keystore" (
    echo [ERRO] Arquivo j2s-horas.keystore nao encontrado!
    echo.
    echo Por favor, execute primeiro: gerar-keystore.bat
    echo.
    pause
    exit /b
)

echo [OK] Keystore encontrado!
echo.
echo Este script vai criar o arquivo key.properties
echo com as configuracoes de assinatura.
echo.

REM Solicitar senhas
set /p STORE_PASSWORD="Digite a senha do keystore: "
set /p KEY_PASSWORD="Digite a senha da key (geralmente a mesma): "

echo.
echo Criando arquivo key.properties...

REM Criar arquivo key.properties
(
echo storePassword=%STORE_PASSWORD%
echo keyPassword=%KEY_PASSWORD%
echo keyAlias=j2s
echo storeFile=%CD%\j2s-horas.keystore
) > android\key.properties

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo [SUCESSO] Configuracao concluida!
    echo ========================================
    echo.
    echo Arquivo criado: android\key.properties
    echo.
    echo PROXIMOS PASSOS:
    echo 1. Gerar AAB assinado com: gerar-aab.bat
    echo 2. Upload do AAB na Play Console
    echo.
    echo ATENCAO:
    echo - Nao compartilhe o arquivo key.properties!
    echo - Nao comite no Git (contem senhas)!
    echo.
) else (
    echo [ERRO] Falha ao criar key.properties
)

pause
