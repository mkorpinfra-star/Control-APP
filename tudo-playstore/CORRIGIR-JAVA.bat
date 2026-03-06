@echo off
title CORRIGIR JAVA 21 para 17
color 0E
echo.
echo ========================================
echo   CORRIGIR JAVA 21 -^> JAVA 17
echo ========================================
echo.
echo Este script corrige AUTOMATICAMENTE
echo todos os arquivos Gradle do projeto.
echo.
pause

REM Voltar para pasta do projeto
cd ..

echo.
echo Corrigindo 6 arquivos Gradle...
echo.

echo [1/6] android/build.gradle
powershell -Command "(Get-Content 'android\build.gradle') -replace 'VERSION_21', 'VERSION_17' | Set-Content 'android\build.gradle'"
echo OK!

echo [2/6] android/app/build.gradle
powershell -Command "(Get-Content 'android\app\build.gradle') -replace 'VERSION_21', 'VERSION_17' | Set-Content 'android\app\build.gradle'"
echo OK!

echo [3/6] android/app/capacitor.build.gradle
powershell -Command "(Get-Content 'android\app\capacitor.build.gradle') -replace 'VERSION_21', 'VERSION_17' | Set-Content 'android\app\capacitor.build.gradle'"
echo OK!

echo [4/6] android/capacitor-cordova-android-plugins/build.gradle
powershell -Command "(Get-Content 'android\capacitor-cordova-android-plugins\build.gradle') -replace 'VERSION_21', 'VERSION_17' | Set-Content 'android\capacitor-cordova-android-plugins\build.gradle'"
echo OK!

echo [5/6] node_modules/@capacitor/android/capacitor/build.gradle
powershell -Command "(Get-Content 'node_modules\@capacitor\android\capacitor\build.gradle') -replace 'VERSION_21', 'VERSION_17' | Set-Content 'node_modules\@capacitor\android\capacitor\build.gradle'"
echo OK!

echo [6/6] node_modules/@capacitor/splash-screen/android/build.gradle
powershell -Command "(Get-Content 'node_modules\@capacitor\splash-screen\android\build.gradle') -replace 'VERSION_21', 'VERSION_17' | Set-Content 'node_modules\@capacitor\splash-screen\android\build.gradle'"
echo OK!

echo.
echo ========================================
echo   SUCESSO!
echo ========================================
echo.
echo Todos os 6 arquivos corrigidos!
echo Java 21 -^> Java 17
echo.
echo Agora volte para tudo-playstore/
echo E execute: EXECUTAR-AGORA.bat
echo.
pause
cd tudo-playstore
