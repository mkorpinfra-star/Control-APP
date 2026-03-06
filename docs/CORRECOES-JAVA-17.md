# Correções Aplicadas - Java 17

## Problema
Capacitor gerado com Java 21, mas só temos Java 17 no projeto.

## Solução Aplicada

Alterados **4 arquivos** de `VERSION_21` para `VERSION_17`:

### 1. android/build.gradle
```gradle
allprojects {
    tasks.withType(JavaCompile).configureEach {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
```

### 2. android/app/build.gradle
```gradle
compileOptions {
    sourceCompatibility JavaVersion.VERSION_17
    targetCompatibility JavaVersion.VERSION_17
}
```

### 3. android/app/capacitor.build.gradle
```gradle
compileOptions {
    sourceCompatibility JavaVersion.VERSION_17
    targetCompatibility JavaVersion.VERSION_17
}
```

### 4. android/capacitor-cordova-android-plugins/build.gradle
```gradle
compileOptions {
    sourceCompatibility JavaVersion.VERSION_17
    targetCompatibility JavaVersion.VERSION_17
}
```

## Resultado

✅ Build funciona com Java 17 local (`jdk-17.0.2/`)
✅ Não precisa instalar Java no sistema
✅ `GERAR-APK-PLAYSTORE.bat` funciona completamente

## Comando de Teste

```bash
cd android
gradlew.bat bundleRelease
```

Deve compilar sem erros de "invalid source release: 21".
