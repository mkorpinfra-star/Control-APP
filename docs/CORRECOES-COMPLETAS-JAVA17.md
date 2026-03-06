# Correções Completas - Java 17 (TODAS)

## ❌ Problema Original
Capacitor versão 7+ é gerado com Java 21 por padrão.
Projeto só tem Java 17 local (`jdk-17.0.2/`).

## ✅ Solução Aplicada

Alterados **6 arquivos** de `VERSION_21` → `VERSION_17`:

### Arquivos do Projeto

1. **android/build.gradle** (config global)
```gradle
allprojects {
    tasks.withType(JavaCompile).configureEach {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
```

2. **android/app/build.gradle** (app principal)
```gradle
compileOptions {
    sourceCompatibility JavaVersion.VERSION_17
    targetCompatibility JavaVersion.VERSION_17
}
```

3. **android/app/capacitor.build.gradle** (config Capacitor no app)
```gradle
compileOptions {
    sourceCompatibility JavaVersion.VERSION_17
    targetCompatibility JavaVersion.VERSION_17
}
```

4. **android/capacitor-cordova-android-plugins/build.gradle** (plugins Cordova)
```gradle
compileOptions {
    sourceCompatibility JavaVersion.VERSION_17
    targetCompatibility JavaVersion.VERSION_17
}
```

### Arquivos em node_modules (biblioteca)

5. **node_modules/@capacitor/android/capacitor/build.gradle** (core Capacitor)
```gradle
compileOptions {
    sourceCompatibility JavaVersion.VERSION_17
    targetCompatibility JavaVersion.VERSION_17
}
```

6. **node_modules/@capacitor/splash-screen/android/build.gradle** (plugin splash)
```gradle
compileOptions {
    sourceCompatibility JavaVersion.VERSION_17
    targetCompatibility JavaVersion.VERSION_17
}
```

## ✅ Resultado Final

```bash
$ grep -r "VERSION_21" . --include="*.gradle"
# 0 resultados = nenhum Java 21 restante!
```

## 🔧 Como Verificar

```bash
cd android
gradlew.bat clean bundleRelease
```

Deve compilar **SEM** o erro:
> error: invalid source release: 21

## ⚠️ Atenção

Se executar `npm install` novamente, os arquivos em `node_modules/` serão sobrescritos.

**Solução:** Executar este script após `npm install`:

```bash
# fix-java-version.bat
sed -i 's/VERSION_21/VERSION_17/g' node_modules/@capacitor/android/capacitor/build.gradle
sed -i 's/VERSION_21/VERSION_17/g' node_modules/@capacitor/splash-screen/android/build.gradle
```

## 📦 Arquivo Principal

Tudo está automatizado em:

**GERAR-APK-PLAYSTORE.bat**

Clique duplo e pronto!

---

*Última atualização: 27/02/2026*
