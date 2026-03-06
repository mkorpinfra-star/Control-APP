# Script para instalar Android Studio e Java JDK automaticamente
# Execute como Administrador

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "INSTALADOR AUTOMÁTICO - ANDROID DEV TOOLS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se tem Chocolatey (gerenciador de pacotes Windows)
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Instalando Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    Write-Host "✅ Chocolatey instalado!" -ForegroundColor Green
} else {
    Write-Host "✅ Chocolatey já instalado" -ForegroundColor Green
}

Write-Host ""
Write-Host "Instalando Java JDK 17..." -ForegroundColor Yellow
choco install openjdk17 -y

Write-Host ""
Write-Host "Instalando Android Studio..." -ForegroundColor Yellow
choco install androidstudio -y

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "✅ INSTALAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. FECHE E REABRA o terminal (para carregar JAVA_HOME)"
Write-Host "2. Execute: npx cap open android"
Write-Host "3. No Android Studio: Build > Build APK"
Write-Host ""
Write-Host "Pressione qualquer tecla para fechar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
