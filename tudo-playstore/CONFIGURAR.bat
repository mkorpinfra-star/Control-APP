@echo off
chcp 65001 >nul
title CONFIGURAR PROJETO - PLAY STORE
color 0B
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║          ⚙️  CONFIGURAR PROJETO PARA PLAY STORE             ║
echo ║                                                               ║
echo ║     Execute isso UMA VEZ no começo do projeto                ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo Este assistente vai coletar informações do seu app
echo e criar uma configuração personalizada.
echo.
pause

REM Voltar para pasta do projeto
cd ..

REM ============================================================================
REM COLETAR INFORMAÇÕES DO USUÁRIO
REM ============================================================================

echo.
echo ════════════════════════════════════════════════════════════════
echo  INFORMAÇÕES DO APP
echo ════════════════════════════════════════════════════════════════
echo.

set /p APP_NAME="Nome do app (ex: Meu Sistema): "
set /p APP_ID="ID do app (ex: meusistema, sem espaços): "
set /p APP_VERSION="Versão inicial (padrão: 1.0): " || set "APP_VERSION=1.0"
set /p COMPANY_NAME="Nome da empresa: "
set /p COUNTRY="País (ex: BR, ES, PT): " || set "COUNTRY=BR"

echo.
echo ════════════════════════════════════════════════════════════════
echo  SEGURANÇA - KEYSTORE
echo ════════════════════════════════════════════════════════════════
echo.
echo IMPORTANTE: Anote essas senhas! Você vai precisar delas sempre!
echo.

set /p KEYSTORE_PASS="Senha do keystore (mínimo 6 caracteres): "
set /p KEY_ALIAS="Alias da chave (ex: %APP_ID%): " || set "KEY_ALIAS=%APP_ID%"

echo.
echo ════════════════════════════════════════════════════════════════
echo  CORES DO APP (OPCIONAL)
echo ════════════════════════════════════════════════════════════════
echo.
echo Para gráficos personalizados. Se não souber, deixe em branco.
echo.

set /p COLOR_PRIMARY="Cor primária em HEX (ex: FF5722): " || set "COLOR_PRIMARY=2196F3"
set /p COLOR_SECONDARY="Cor secundária em HEX (ex: 03A9F4): " || set "COLOR_SECONDARY=1976D2"

REM ============================================================================
REM SALVAR CONFIGURAÇÃO
REM ============================================================================

echo.
echo ════════════════════════════════════════════════════════════════
echo  SALVANDO CONFIGURAÇÃO...
echo ════════════════════════════════════════════════════════════════
echo.

(
echo # Configuração gerada automaticamente
echo # NÃO edite manualmente, use CONFIGURAR.bat
echo.
echo APP_NAME=%APP_NAME%
echo APP_ID=%APP_ID%
echo APP_VERSION=%APP_VERSION%
echo COMPANY_NAME=%COMPANY_NAME%
echo COUNTRY=%COUNTRY%
echo KEYSTORE_PASS=%KEYSTORE_PASS%
echo KEY_ALIAS=%KEY_ALIAS%
echo COLOR_PRIMARY=%COLOR_PRIMARY%
echo COLOR_SECONDARY=%COLOR_SECONDARY%
echo CONFIGURED=true
) > tudo-playstore\config.txt

echo ✅ Configuração salva em: tudo-playstore\config.txt
echo.

REM ============================================================================
REM RESUMO
REM ============================================================================

cls
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║          ✅ CONFIGURAÇÃO CONCLUÍDA!                          ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo RESUMO:
echo.
echo 📱 Nome do app: %APP_NAME%
echo 🆔 ID: %APP_ID%
echo 📦 Versão: %APP_VERSION%
echo 🏢 Empresa: %COMPANY_NAME%
echo 🌍 País: %COUNTRY%
echo 🔑 Keystore: %APP_ID%.keystore
echo 🎨 Cor primária: #%COLOR_PRIMARY%
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo ⚠️  IMPORTANTE - ANOTE ESSAS INFORMAÇÕES:
echo.
echo    Senha do keystore: %KEYSTORE_PASS%
echo    Alias da chave: %KEY_ALIAS%
echo.
echo    Guarde em local seguro! Você vai precisar delas sempre!
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo PRÓXIMOS PASSOS:
echo.
echo 1. cd tudo-playstore
echo 2. CORRIGIR-JAVA.bat
echo 3. EXECUTAR-AGORA.bat
echo 4. python gerar-graficos.py
echo.
pause

cd tudo-playstore
