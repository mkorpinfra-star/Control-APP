@echo off
echo ============================================
echo GERANDO APK SEM PRECISAR INSTALAR JAVA
echo ============================================
echo.

echo Baixando Java JDK portable...
curl -L -o jdk.zip "https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_windows-x64_bin.zip"

echo.
echo Extraindo Java...
powershell -command "Expand-Archive -Path jdk.zip -DestinationPath .\ -Force"

echo.
echo Configurando JAVA_HOME...
set JAVA_HOME=%CD%\jdk-17.0.2
set PATH=%JAVA_HOME%\bin;%PATH%

echo.
echo Gerando APK...
cd android
call gradlew.bat assembleDebug

echo.
echo ============================================
echo APK GERADO!
echo ============================================
echo.
echo Localizacao: android\app\build\outputs\apk\debug\app-debug.apk
echo.

pause
