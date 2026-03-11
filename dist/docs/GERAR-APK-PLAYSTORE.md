# 📱 CHECKLIST GOOGLE PLAY STORE - J2S HORAS

Data: 20/02/2026

---

## ✅ STATUS ATUAL DO APP

### ✅ REQUISITOS TÉCNICOS CUMPRIDOS

| Requisito | Status | Detalhes |
|-----------|--------|----------|
| **Target API Level** | ✅ API 36 | Acima do mínimo (API 35) para 2025 |
| **compileSdk** | ✅ API 36 | Versão mais recente |
| **minSdk** | ✅ API 24 | Android 7.0+ (cobre 95% dos devices) |
| **Ícone do App** | ✅ Presente | Ícones adaptativos em todas resoluções |
| **Splash Screen** | ✅ Configurado | Tela de abertura vermelha J2S |
| **Permissões** | ✅ Apenas Internet | Única permissão necessária |
| **versionCode** | ✅ 1 | Primeira versão |
| **versionName** | ✅ 1.0 | Primeira versão |

---

## ❌ REQUISITOS QUE FALTAM PARA PLAY STORE

### 1. ❌ **AAB (Android App Bundle) em vez de APK**

**O que é:** Google Play exige formato AAB desde 2021

**Status atual:** Você tem APK (funciona fora da loja, mas Play Store não aceita)

**Como gerar AAB:**
```bash
# No Android Studio:
Build → Generate Signed Bundle / APK → Android App Bundle

# Ou via Gradle:
cd android
./gradlew bundleRelease
```

**Arquivo gerado:** `android/app/build/outputs/bundle/release/app-release.aab`

---

### 2. ❌ **Assinatura Digital (Keystore)**

**O que é:** Certificado que identifica você como desenvolvedor

**Status atual:** APK não assinado (debug build)

**Como criar Keystore:**
```bash
# Gerar keystore pela primeira vez
keytool -genkey -v -keystore j2s-horas.keystore -alias j2s -keyalg RSA -keysize 2048 -validity 10000

# Responder perguntas:
- Senha do keystore: [ESCOLHA UMA SENHA FORTE]
- Nome: J2S Enginyeria
- Unidade organizacional: TI
- Organização: J2S Enginyeria
- Cidade: [sua cidade]
- Estado: [seu estado/província]
- Código do país: ES
```

**⚠️ IMPORTANTE:** Guarde o arquivo `.keystore` e a senha em local seguro! Se perder, NUNCA mais conseguirá atualizar o app na Play Store!

---

### 3. ❌ **Assinar o AAB com o Keystore**

Criar arquivo `android/key.properties`:
```properties
storePassword=SUA_SENHA_KEYSTORE
keyPassword=SUA_SENHA_KEY
keyAlias=j2s
storeFile=C:/caminho/para/j2s-horas.keystore
```

Editar `android/app/build.gradle` (adicionar antes de `android {`):
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

### 4. ❌ **Gráficos Obrigatórios**

**Feature Graphic:** 1024 x 500 px
- Banner no topo da listagem na Play Store
- Deve conter logo J2S + texto "J2S Horas - Control de Asistencia"

**Ícone Alta Resolução:** 512 x 512 px
- PNG com fundo transparente ou sólido
- Logo J2S

**Screenshots:** Mínimo 2, ideal 4-8
- Resolução: 1080 x 1920 px ou maior
- Mostrar telas principais:
  1. Tela de login
  2. Timesheet (registro de horas)
  3. Dashboard (se admin)
  4. Lista de aprovações

**Onde criar:** Canva, Photoshop, Figma ou apps como Screenshot Framer

---

### 5. ❌ **Política de Privacidade (OBRIGATÓRIA)**

**O que é:** URL pública explicando que dados o app coleta

**Status atual:** Não existe

**Como criar:**

Criar arquivo `public/privacy.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Política de Privacidad - J2S Horas</title>
</head>
<body>
  <h1>Política de Privacidad - J2S Horas</h1>

  <p><strong>Última actualización:</strong> 20 de febrero de 2026</p>

  <h2>1. Información que recopilamos</h2>
  <p>J2S Horas recopila la siguiente información de los empleados:</p>
  <ul>
    <li>Nombre completo</li>
    <li>Correo electrónico corporativo</li>
    <li>Fotografía de perfil</li>
    <li>Registro de horas trabajadas</li>
    <li>Asignación a obras/proyectos</li>
  </ul>

  <h2>2. Cómo usamos la información</h2>
  <p>Los datos se utilizan exclusivamente para:</p>
  <ul>
    <li>Gestión de asistencia y control horario</li>
    <li>Cálculo de nóminas</li>
    <li>Facturación a clientes</li>
    <li>Informes internos de productividad</li>
  </ul>

  <h2>3. Compartir datos</h2>
  <p>Los datos NO se comparten con terceros, excepto:</p>
  <ul>
    <li>Servicios de hosting (servidor web)</li>
    <li>Autoridades fiscales/laborales (cuando legalmente requerido)</li>
  </ul>

  <h2>4. Seguridad</h2>
  <p>Todos los datos están protegidos mediante:</p>
  <ul>
    <li>Conexión HTTPS encriptada</li>
    <li>Autenticación por contraseña</li>
    <li>Acceso restringido por roles</li>
  </ul>

  <h2>5. Derechos del usuario</h2>
  <p>Los empleados tienen derecho a:</p>
  <ul>
    <li>Acceder a sus datos personales</li>
    <li>Solicitar corrección de datos incorrectos</li>
    <li>Solicitar eliminación (sujeto a obligaciones legales)</li>
  </ul>

  <h2>6. Contacto</h2>
  <p>Para consultas sobre privacidad, contactar:</p>
  <p>Email: <strong>admin@j2s.ad</strong></p>

  <h2>7. Cambios en esta política</h2>
  <p>Esta política puede actualizarse. Los cambios se notificarán a los usuarios.</p>
</body>
</html>
```

**URL final:** https://j2s.ad/privacy.html (subir com FTP)

---

### 6. ❌ **Descrição do App**

**Título (máximo 50 caracteres):**
```
J2S Horas - Control de Asistencia
```

**Descrição Curta (máximo 80 caracteres):**
```
Control de horas trabajadas para empleados de J2S Enginyeria
```

**Descrição Completa (máximo 4000 caracteres):**
```
J2S Horas es la aplicación oficial de J2S Enginyeria para el control de asistencia y registro de horas trabajadas por los empleados en obras de construcción e instalaciones industriales.

🕐 FUNCIONALIDADES PRINCIPALES:
• Registro diario de horas trabajadas (Normal, Extra, Nocturna)
• Control semanal por obra/proyecto
• Aprobación de horas por supervisores
• Firma digital de aprobaciones
• Visualización de nóminas
• Histórico de asistencia
• Sistema multiidioma (Español, Portugués, Catalán)

👷 PARA EMPLEADOS:
• Registra tus horas trabajadas cada día
• Clasifica por tipo: Normal (8-17h), Extra (17-22h), Nocturna (22-6h)
• Envía tu timesheet semanal para aprobación
• Consulta el estado de tus registros (borrador/enviado/aprobado/rechazado)
• Visualiza tu nómina mensual

👔 PARA ENCARGADOS/SUPERVISORES:
• Aprueba o rechaza timesheets de empleados
• Firma digitalmente las aprobaciones
• Visualiza horas trabajadas por obra
• Gestiona asignaciones de personal

🏢 PARA ADMINISTRADORES:
• Dashboard completo con KPIs
• Gestión de empleados, clientes y obras
• Generación automática de nóminas
• Facturación por obra/cliente
• Reportes analíticos
• Configuración de valores de hora

🔒 SEGURIDAD:
• Autenticación segura con email y contraseña
• Foto de perfil obligatoria para validación
• Datos encriptados con HTTPS
• Acceso controlado por roles

📱 REQUISITOS:
• Android 7.0 o superior
• Conexión a Internet
• Ser empleado registrado en J2S Enginyeria

ℹ️ ACERCA DE J2S ENGINYERIA:
Empresa española especializada en instalaciones industriales, gestión de obras y proyectos de construcción.

⚠️ NOTA: Esta aplicación es de uso exclusivo para empleados de J2S Enginyeria. Es necesario tener credenciales corporativas para acceder.

Desarrollado con tecnología React + Capacitor para máximo rendimiento y actualizaciones automáticas.

📧 Soporte: admin@j2s.ad
```

**Categoría:** Business (Negocios)

**Classificação de Conteúdo:** PEGI 3 / Everyone (público geral)

---

### 7. ❌ **Conta Google Play Console**

**O que é:** Conta de desenvolvedor na Google

**Custo:** $25 USD (taxa única, paga uma vez na vida)

**Como criar:**
1. Acesse: https://play.google.com/console/signup
2. Login com conta Google
3. Aceite termos
4. Pague $25 com cartão de crédito
5. Preencha informações:
   - Tipo: Organização (empresa)
   - Nome: J2S Enginyeria
   - Site: https://j2s.ad
   - Email de contato: admin@j2s.ad

**Tempo de aprovação:** 24-48h após pagamento

---

## 📋 CHECKLIST FINAL

Antes de submeter, certifique-se:

- [ ] AAB assinado gerado (`app-release.aab`)
- [ ] Keystore criado e guardado com segurança
- [ ] Feature Graphic (1024x500)
- [ ] Ícone 512x512
- [ ] 2-8 Screenshots (1080x1920+)
- [ ] Política de Privacidade online (j2s.ad/privacy.html)
- [ ] Descrições em espanhol (título, curta, completa)
- [ ] Categoria selecionada (Business)
- [ ] Conta Play Console criada ($25 pagos)
- [ ] Email de suporte definido (admin@j2s.ad)

---

## 🚀 PROCESSO DE UPLOAD

### Passo 1: Criar App na Play Console
1. Login em https://play.google.com/console
2. "Criar app"
3. Nome: J2S Horas
4. Idioma padrão: Español (España)
5. Tipo: App
6. Gratuito/Pago: Gratuito
7. Aceitar políticas

### Passo 2: Completar Ficha da Loja
1. **Detalhes do app:**
   - Título, descrições
   - Ícone, gráficos, screenshots
   - Categoria: Business
   - Email de contato

2. **Política de Privacidade:**
   - URL: https://j2s.ad/privacy.html

3. **Classificação de Conteúdo:**
   - Responder questionário
   - Resultado: PEGI 3

### Passo 3: Upload do AAB
1. "Produção" → "Criar nova versão"
2. Upload `app-release.aab`
3. Preencher "Notas da versão":
   ```
   Versão inicial do J2S Horas.

   Funcionalidades:
   - Registro de horas trabajadas
   - Aprobación de timesheets
   - Visualización de nóminas
   - Dashboard analítico
   ```

### Passo 4: Submeter para Revisão
1. Revisar tudo
2. "Enviar para revisão"
3. **Aguardar 1-7 dias** para aprovação da Google

### Passo 5: Publicação
- Se aprovado: App publicado automaticamente
- Se rejeitado: Corrigir problemas e reenviar

---

## ⏱️ TEMPO ESTIMADO

| Tarefa | Tempo |
|--------|-------|
| Criar keystore | 5 min |
| Configurar signing | 10 min |
| Gerar AAB assinado | 5 min |
| Criar gráficos (Canva) | 30-60 min |
| Tirar screenshots | 10 min |
| Escrever política privacidade | 15 min |
| Criar conta Play Console | 10 min (+ 24h aprovação) |
| Preencher ficha da loja | 20 min |
| Upload AAB + submissão | 10 min |
| **TOTAL:** | **2-3 horas + 1-7 dias aprovação** |

---

## 💰 CUSTOS

- **Google Play Console:** $25 USD (uma vez na vida)
- **Total:** $25

---

## ⚠️ IMPORTANTE

### ⚠️ NUNCA PERCA O KEYSTORE!
Se perder o arquivo `.keystore` ou a senha:
- ❌ Não conseguirá atualizar o app NUNCA MAIS
- ❌ Terá que criar app novo com nome diferente
- ❌ Perderá todos os downloads/avaliações

**Solução:**
- Guarde 3 cópias do keystore:
  1. No PC
  2. Na nuvem (Google Drive/Dropbox)
  3. Backup externo (pendrive)

### ⚠️ ATUALIZAÇÕES FUTURAS
Para atualizar o app depois de publicado:
1. Aumentar `versionCode` (2, 3, 4...)
2. Atualizar `versionName` (1.1, 1.2, 2.0...)
3. Gerar novo AAB assinado com MESMO keystore
4. Upload na Play Console

---

## 🆘 PROBLEMAS COMUNS

**"O app foi rejeitado"**
- Motivos comuns:
  - Política de privacidade inválida/inexistente
  - Descrição com erros gramaticais graves
  - Screenshots de baixa qualidade
  - App crashes ao abrir
  - Violação de políticas Google (spam, conteúdo adulto, etc)

**Solução:** Ler email de rejeição, corrigir, reenviar

---

## 📞 PRÓXIMOS PASSOS

**Você precisa decidir:**
1. Pagar $25 agora e publicar na Play Store?
2. Ou manter distribuição via APK direto (grátis)?

**Vantagens Play Store:**
- ✅ Usuários confiam mais (loja oficial)
- ✅ Atualizações automáticas
- ✅ Não precisa ativar "Fontes desconhecidas"
- ✅ Aparece em buscas da Play Store
- ✅ Estatísticas de downloads/crashes

**Vantagens APK direto:**
- ✅ Grátis (sem $25)
- ✅ Controle total
- ✅ Distribuição imediata
- ❌ Usuários desconfiam ("Fontes desconhecidas")

---

**QUER QUE EU CRIE OS ARQUIVOS QUE FALTAM?**

Posso fazer:
1. ✅ Política de privacidade (privacy.html)
2. ✅ Script para gerar keystore
3. ✅ Configuração de signing no build.gradle
4. ✅ Instruções passo-a-passo para gerar AAB

Diga "sim" se quiser que eu prepare tudo! 🚀
