# 🚀 GUIA PASSO-A-PASSO: PUBLICAR APP NA GOOGLE PLAY STORE

Este guia detalha EXATAMENTE o que fazer, tela por tela, para publicar o **J2S Horas** na Play Store.

---

## ⏱️ TEMPO ESTIMADO

- **Preparação:** 2-3 horas
- **Aprovação Google:** 1-7 dias
- **Total:** 2-10 dias

---

## 💰 CUSTO TOTAL

- **Registro Google Play Console:** $25 USD (uma vez na vida)
- **Renovação anual:** $0 (não há renovação)
- **Total:** $25 USD

---

## 📋 PRÉ-REQUISITOS

Antes de começar, você precisa ter:

- ✅ Conta Google (Gmail)
- ✅ Cartão de crédito internacional (para pagar os $25)
- ✅ Todos os arquivos preparados (veja checklist abaixo)

---

## 🗂️ CHECKLIST DE ARQUIVOS NECESSÁRIOS

Certifique-se de ter TODOS os arquivos prontos antes de começar:

### Arquivos Técnicos:
- [ ] **app-release.aab** - Android App Bundle assinado (gerado com `gerar-aab.bat`)
- [ ] **j2s-horas.keystore** - Arquivo de assinatura (guardado em 3 lugares seguros)
- [ ] **key.properties** - Configuração de assinatura (senhas anotadas)

### Arquivos Gráficos:
- [ ] **j2s-horas-feature-graphic-1024x500.png** - Banner principal
- [ ] **j2s-horas-icon-512x512.png** - Ícone alta resolução
- [ ] **screenshot-1.png** até **screenshot-8.png** - Mínimo 2, ideal 4-8 (1080 x 1920 cada)

### Arquivos de Texto:
- [ ] **DESCRICOES-PLAYSTORE.txt** - Descrições prontas para copiar/colar
- [ ] **privacy.html** - Política de privacidade (já hospedada em j2s.ad/privacy.html)

---

## 🎯 PARTE 1: GERAR OS ARQUIVOS NECESSÁRIOS

### Passo 1.1: Gerar Keystore (primeira vez)

```bash
# Execute o script:
gerar-keystore.bat

# O script vai pedir:
# 1. Senha do keystore (escolha uma senha forte, ex: J2sH0r@s2026!)
# 2. Senha da key (geralmente a mesma)
# 3. Nome: J2S Enginyeria
# 4. Unidade: TI
# 5. Organização: J2S Enginyeria
# 6. Cidade: [sua cidade]
# 7. Estado: [seu estado]
# 8. Código do país: ES

# Arquivo gerado: j2s-horas.keystore
```

**⚠️ IMPORTANTE:** Anote as senhas e guarde o arquivo `.keystore` em **3 lugares**:
1. No PC (pasta do projeto)
2. Google Drive / Dropbox
3. Pendrive externo

**Se perder o keystore, NUNCA mais conseguirá atualizar o app!**

---

### Passo 1.2: Configurar Assinatura

```bash
# Execute o script:
configurar-signing.bat

# O script vai pedir:
# 1. Senha do keystore (a mesma que você criou acima)
# 2. Senha da key (a mesma)

# Arquivo criado: android/key.properties
```

---

### Passo 1.3: Gerar AAB Assinado

```bash
# Execute o script:
gerar-aab.bat

# Aguarde 2-5 minutos...
# Arquivo gerado: android/app/build/outputs/bundle/release/app-release.aab
```

**Verifique:** O arquivo `app-release.aab` deve ter aproximadamente **8-12 MB**.

---

### Passo 1.4: Gerar Gráficos (Feature Graphic e Ícone)

```bash
# Abra o arquivo no navegador:
gerar-graficos-playstore.html

# Clique nos botões:
# 1. "Baixar Feature Graphic" → salva: j2s-horas-feature-graphic-1024x500.png
# 2. "Baixar Ícone 512x512" → salva: j2s-horas-icon-512x512.png
```

---

### Passo 1.5: Tirar Screenshots

**Veja instruções completas em:** `COMO-TIRAR-SCREENSHOTS.md`

**Resumo:**
1. Abra o app no emulador Android ou celular real
2. Navegue para as telas principais (login, timesheet, dashboard, etc)
3. Tire prints de cada tela (mínimo 2, ideal 4-8)
4. Salve como: `screenshot-1.png`, `screenshot-2.png`, etc.
5. Resolução ideal: **1080 x 1920 px**

---

### Passo 1.6: Subir Política de Privacidade para FTP

```bash
# 1. Acesse seu FTP (FileZilla, cPanel, etc)
# 2. Navegue para a pasta public_html/
# 3. Faça upload do arquivo: public/privacy.html
# 4. Acesse no navegador: https://j2s.ad/privacy.html
# 5. Verifique se carrega corretamente
```

---

## 🎯 PARTE 2: CRIAR CONTA GOOGLE PLAY CONSOLE

### Passo 2.1: Acessar Play Console

1. Abra: https://play.google.com/console/signup
2. Faça login com sua conta Google (Gmail)
3. Leia e aceite os **Termos de Serviço do Desenvolvedor**
4. Clique **"Continuar para pagamento"**

---

### Passo 2.2: Pagar Taxa de Registro ($25 USD)

1. Preencha dados do cartão de crédito:
   - Número do cartão
   - Data de validade
   - CVV
   - Nome no cartão
   - Endereço de cobrança

2. Clique **"Comprar"**

3. **Aguarde 24-48h** para aprovação da conta

4. Você receberá um email: **"Sua conta de desenvolvedor foi aprovada"**

---

### Passo 2.3: Configurar Perfil de Desenvolvedor

Depois de aprovado:

1. Acesse: https://play.google.com/console
2. Vá em **"Configurações"** → **"Conta do desenvolvedor"**
3. Preencha:
   - **Tipo de conta:** Organização (empresa)
   - **Nome do desenvolvedor:** J2S Enginyeria
   - **Site:** https://j2s.ad
   - **Email de contato:** admin@j2s.ad
   - **Telefone:** [seu telefone]
   - **Endereço completo:** [endereço da empresa]
4. Clique **"Salvar"**

---

## 🎯 PARTE 3: CRIAR E CONFIGURAR O APP

### Passo 3.1: Criar Novo App

1. No Play Console, clique **"Criar app"**
2. Preencha:
   - **Nome do app:** J2S Horas
   - **Idioma padrão:** Español (España)
   - **Tipo:** App (não é jogo)
   - **Gratuito ou pago:** Gratuito
3. Aceite as declarações:
   - ✅ "Cumpro as políticas do Google Play"
   - ✅ "Cumpro as leis de exportação dos EUA"
4. Clique **"Criar app"**

---

### Passo 3.2: Preencher Questionário Inicial

O Play Console vai guiar você por várias seções. Siga em ordem:

#### A) **Privacidade e Dados**

1. Vá em **"Política de privacidade"**
2. Cole a URL: `https://j2s.ad/privacy.html`
3. Clique **"Salvar"**

4. Vá em **"Segurança de dados"**
5. Responda:
   - **Coleta dados?** SIM
   - **Dados coletados:**
     - ✅ Nome
     - ✅ Email
     - ✅ Fotos (foto de perfil)
     - ✅ Informações de emprego
   - **Compartilha dados?** NÃO
   - **Dados encriptados?** SIM (HTTPS)
   - **Usuário pode solicitar exclusão?** SIM
6. Clique **"Salvar"**

---

#### B) **Acesso ao App**

1. Vá em **"Acesso ao app"**
2. Selecione: **"Requer login"**
3. Explique:
   ```
   Este app é de uso exclusivo para funcionários de J2S Enginyeria.
   Apenas usuários com credenciais corporativas válidas podem acessar.
   ```
4. **Credenciais de teste (para Google testar):**
   - Email: `admin@j2s.ad` (ou crie um usuário teste)
   - Senha: `[senha do usuário teste]`
5. Clique **"Salvar"**

---

#### C) **Anúncios**

1. Vá em **"Anúncios"**
2. Selecione: **"Não, este app não contém anúncios"**
3. Clique **"Salvar"**

---

#### D) **Classificação de Conteúdo**

1. Vá em **"Classificação de conteúdo"**
2. Clique **"Iniciar questionário"**
3. Email: `admin@j2s.ad`
4. Categoria: **Ferramentas de produtividade / Negócios**
5. Responda NÃO para tudo:
   - Violência: NÃO
   - Conteúdo sexual: NÃO
   - Linguagem obscena: NÃO
   - Drogas/álcool: NÃO
   - Discriminação: NÃO
6. Clique **"Calcular classificação"**
7. Resultado esperado: **PEGI 3 / Everyone**
8. Clique **"Aplicar classificação"**

---

#### E) **Público-alvo e Conteúdo**

1. Vá em **"Público-alvo"**
2. Selecione: **"Adultos (18+)"**
3. Clique **"Salvar"**

4. Vá em **"Notícias"**
5. Selecione: **"Não, não é um app de notícias"**

6. Vá em **"COVID-19**"
7. Selecione: **"Não, não é um app de rastreio COVID"**

---

### Passo 3.3: Preencher Ficha da Loja

#### A) **Detalhes do App**

1. Vá em **"Ficha da loja principal"** → **"Detalhes do app"**

2. **Título do app:**
   ```
   J2S Horas - Control de Asistencia
   ```

3. **Descrição curta:**
   ```
   Control de horas trabajadas para empleados de J2S Enginyeria
   ```

4. **Descrição completa:**
   (Copie do arquivo `DESCRICOES-PLAYSTORE.txt` - seção "DESCRIÇÃO COMPLETA")

5. Clique **"Salvar"**

---

#### B) **Arte Gráfica**

1. Vá em **"Ficha da loja principal"** → **"Arte gráfica"**

2. **Ícone do app (512 x 512):**
   - Clique **"Upload"**
   - Selecione: `j2s-horas-icon-512x512.png`

3. **Feature graphic (1024 x 500):**
   - Clique **"Upload"**
   - Selecione: `j2s-horas-feature-graphic-1024x500.png`

4. **Screenshots de telefone:**
   - Clique **"Adicionar screenshots de telefone"**
   - Selecione: `screenshot-1.png`, `screenshot-2.png`, etc. (mínimo 2)
   - Arraste para reordenar se necessário

5. Clique **"Salvar"**

---

#### C) **Categorização**

1. Vá em **"Ficha da loja principal"** → **"Categorização"**
2. **App ou jogo:** App
3. **Categoria:** Business (ou Productivity)
4. **Tags:** (opcional, deixe vazio por enquanto)
5. Clique **"Salvar"**

---

#### D) **Detalhes de Contato**

1. Vá em **"Ficha da loja principal"** → **"Detalhes de contato"**
2. **Site:** `https://j2s.ad`
3. **Email:** `admin@j2s.ad`
4. **Telefone:** (opcional)
5. Clique **"Salvar"**

---

### Passo 3.4: Upload do AAB

1. Vá em **"Produção"** (menu lateral esquerdo)
2. Clique **"Criar nova versão"**
3. **App signing by Google Play:**
   - Se aparecer, clique **"Continuar"** (Google vai gerenciar a assinatura)
   - Se não aparecer, pule este passo
4. **Upload do App Bundle:**
   - Clique **"Upload"**
   - Selecione: `android/app/build/outputs/bundle/release/app-release.aab`
   - Aguarde upload (pode levar 1-5 minutos)
5. **Nome da versão:** `1.0`
6. **Notas da versão (em Espanhol):**
   (Copie do arquivo `DESCRICOES-PLAYSTORE.txt` - seção "NOTAS DA VERSÃO")
7. Clique **"Salvar"**

---

### Passo 3.5: Revisar e Enviar

1. Play Console vai mostrar avisos/erros pendentes
2. Resolva TODOS os avisos (geralmente são questionários faltando)
3. Quando tudo estiver ✅ verde:
   - Clique **"Revisar versão"**
   - Verifique todas as informações
   - Clique **"Iniciar lançamento para produção"**
4. Confirme: **"Sim, enviar para revisão"**

---

## 🎯 PARTE 4: AGUARDAR APROVAÇÃO

### O que acontece agora:

1. **Status:** "Em revisão"
2. **Tempo:** 1-7 dias (média: 2-3 dias)
3. **Google vai:**
   - Analisar o AAB (código, malware, vírus)
   - Testar o app (login, funcionalidades básicas)
   - Verificar políticas (privacidade, conteúdo)
   - Validar gráficos e descrições

### Possíveis Resultados:

#### ✅ **APROVADO**
- Você recebe email: "Seu app foi publicado"
- Status muda para: **"Publicado"**
- App fica visível na Play Store em 2-4 horas
- URL do app: `https://play.google.com/store/apps/details?id=com.j2s.obras`

#### ❌ **REJEITADO**
- Você recebe email explicando o motivo
- Motivos comuns:
  - Política de privacidade inválida/inacessível
  - App crasha ao abrir
  - Credenciais de teste não funcionam
  - Descrição com erros graves
  - Violação de políticas Google
- **Solução:** Corrigir o problema e reenviar

---

## 🎯 PARTE 5: APÓS PUBLICAÇÃO

### Passo 5.1: Verificar se está na Play Store

1. Abra o Play Store no celular
2. Busque: **"J2S Horas"**
3. Ou acesse: https://play.google.com/store/apps/details?id=com.j2s.obras

### Passo 5.2: Compartilhar Link com Funcionários

**Link para download:**
```
https://play.google.com/store/apps/details?id=com.j2s.obras
```

**Mensagem para enviar (WhatsApp/Email):**
```
📱 J2S HORAS - APP OFICIAL

¡Ya está disponible la app oficial de J2S Horas en Google Play!

🔗 Descargar ahora:
https://play.google.com/store/apps/details?id=com.j2s.obras

📝 Instrucciones:
1. Haz clic en el enlace
2. Toca "Instalar"
3. Abre la app
4. Inicia sesión con tu email corporativo

💡 Ventajas:
✅ Registro de horas en segundos
✅ Consulta de nómina mensual
✅ Actualizaciones automáticas
✅ Notificaciones de aprobaciones

Cualquier duda: admin@j2s.ad
```

---

## 🔄 ATUALIZAR O APP (FUTURAS VERSÕES)

Quando precisar atualizar o app:

### Passo 1: Atualizar Código
```bash
# Edite o arquivo: android/app/build.gradle
# Linha 10-11:
versionCode 2          # Incrementar (era 1, agora 2)
versionName "1.1"      # Nova versão (era 1.0, agora 1.1)
```

### Passo 2: Gerar Novo AAB
```bash
# Execute novamente:
gerar-aab.bat

# IMPORTANTE: Use o MESMO keystore (j2s-horas.keystore)
# Se usar outro keystore, Google rejeita!
```

### Passo 3: Upload na Play Console
1. Vá em **"Produção"** → **"Criar nova versão"**
2. Upload do novo AAB
3. Preencha "Notas da versão" (o que mudou)
4. **"Iniciar lançamento para produção"**

### Passo 4: Aprovação
- Atualizações são revisadas mais rápido (1-3 dias)
- Usuários recebem update automático no Play Store

---

## ⚠️ PROBLEMAS COMUNS E SOLUÇÕES

### Erro: "Upload failed: Invalid signing configuration"
**Solução:** Keystore inválido. Verifique `android/key.properties` e senhas.

### Erro: "Your app bundle contains code for architectures that are not supported"
**Solução:** Ignore, é apenas aviso. Google vai gerar APKs otimizados automaticamente.

### Erro: "Privacy policy URL is not accessible"
**Solução:** Verifique se `https://j2s.ad/privacy.html` carrega corretamente no navegador.

### App rejeitado: "App crashes on launch"
**Solução:**
1. Teste o AAB localmente antes de upload
2. Use credenciais de teste válidas
3. Certifique-se de que `https://j2s.ad/login` está online

### App rejeitado: "Privacy policy does not match app behavior"
**Solução:** Atualize `privacy.html` para refletir exatamente os dados coletados.

---

## 📞 SUPORTE GOOGLE

Se tiver problemas técnicos:
- Central de Ajuda: https://support.google.com/googleplay/android-developer
- Fórum: https://support.google.com/googleplay/android-developer/community
- Email: Disponível apenas após criar conta

---

## ✅ CHECKLIST FINAL

Antes de submeter, verifique:

- [ ] Conta Play Console criada e aprovada
- [ ] $25 pagos
- [ ] AAB assinado gerado
- [ ] Keystore guardado em 3 lugares
- [ ] Senhas anotadas
- [ ] Feature Graphic (1024x500) uploadado
- [ ] Ícone (512x512) uploadado
- [ ] Mínimo 2 screenshots uploadados
- [ ] Título preenchido
- [ ] Descrição curta preenchida
- [ ] Descrição completa preenchida
- [ ] Política de privacidade URL válida
- [ ] Classificação de conteúdo completada
- [ ] Categoria selecionada (Business)
- [ ] Email de contato configurado
- [ ] Credenciais de teste fornecidas
- [ ] Todos questionários completados (sem avisos vermelhos)

---

## 🎉 PARABÉNS!

Se seguiu todos os passos, seu app está na Play Store! 🚀

**Próximos passos:**
1. Compartilhe o link com os funcionários
2. Monitore reviews e feedback
3. Atualize regularmente com melhorias
4. Responda comentários dos usuários

---

**BOA SORTE!** 🍀

Se tiver dúvidas durante o processo, consulte:
- Este guia (PASSO-A-PASSO-PLAYSTORE.md)
- GERAR-APK-PLAYSTORE.md (detalhes técnicos)
- DESCRICOES-PLAYSTORE.txt (textos prontos)
- COMO-TIRAR-SCREENSHOTS.md (prints do app)
