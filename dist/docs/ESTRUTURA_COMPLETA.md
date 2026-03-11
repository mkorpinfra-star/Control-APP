# 🏗️ ESTRUTURA COMPLETA DO SISTEMA

## 📁 Estrutura de Pastas

```
app-cassio/
│
├── 📂 src/                          # Frontend (React)
│   ├── 📂 components/
│   │   ├── Layout.jsx              # Sidebar + Bottom Nav
│   │   ├── PhotoUpload.jsx         # Upload de foto obrigatório
│   │   └── SignaturePad.jsx        # Assinatura digital
│   │
│   ├── 📂 contexts/
│   │   └── AuthContext.jsx         # Autenticação global
│   │
│   ├── 📂 pages/
│   │   ├── Login.jsx               # Tela de login (passaporte)
│   │   ├── Timesheet.jsx           # Funcionário lança horas ⭐
│   │   ├── Approvals.jsx           # Encarregado aprova ⭐
│   │   ├── Employees.jsx           # Admin gerencia usuários
│   │   ├── Projects.jsx            # Admin gerencia obras ⭐
│   │   ├── Clients.jsx             # Admin gerencia clientes
│   │   ├── Reports.jsx             # Relatórios
│   │   ├── Dashboard.jsx           # Dashboard gerencial
│   │   └── Settings.jsx            # Configurações + Valores € ⭐
│   │
│   ├── 📂 services/
│   │   └── api.js                  # Centralizador de chamadas API
│   │
│   ├── 📂 i18n/
│   │   ├── index.js                # Configuração i18next
│   │   ├── es.json                 # Traduções Espanhol
│   │   └── ca.json                 # Traduções Catalão
│   │
│   ├── App.jsx                      # Rotas principais
│   ├── main.jsx                     # Entry point
│   ├── App.css                      # Estilos customizados
│   └── index.css                    # Estilos base + Tailwind
│
├── 📂 backend/                      # Backend (PHP)
│   ├── 📂 api/
│   │   ├── 📂 auth/
│   │   │   └── login.php           # Autenticação JWT
│   │   │
│   │   ├── 📂 usuarios/
│   │   │   ├── list.php            # Listar usuários
│   │   │   ├── create.php          # Criar usuário
│   │   │   ├── update.php          # Atualizar usuário
│   │   │   ├── delete.php          # Deletar usuário
│   │   │   └── upload-foto.php     # Upload foto funcionário
│   │   │
│   │   ├── 📂 clientes/
│   │   │   ├── list.php
│   │   │   ├── create.php
│   │   │   ├── update.php
│   │   │   └── delete.php
│   │   │
│   │   ├── 📂 obras/
│   │   │   ├── list.php            # Listar obras
│   │   │   ├── create.php          # Criar obra
│   │   │   ├── update.php          # Atualizar obra
│   │   │   ├── delete.php          # Deletar obra
│   │   │   ├── by-employee.php     # Obras do funcionário ⭐
│   │   │   ├── employees.php       # Funcionários da obra
│   │   │   └── assign-employees.php # Vincular funcionários ⭐
│   │   │
│   │   ├── 📂 apontamentos/
│   │   │   ├── my-week.php         # Horas da semana (load)
│   │   │   ├── save.php            # Salvar rascunho
│   │   │   ├── submit.php          # Enviar para aprovação
│   │   │   ├── pending.php         # Listar pendentes ⭐
│   │   │   ├── approve.php         # Aprovar (encarregado/admin) ⭐
│   │   │   └── reject.php          # Rejeitar
│   │   │
│   │   ├── 📂 config/
│   │   │   ├── get.php             # Obter configs
│   │   │   ├── save.php            # Salvar configs
│   │   │   └── valores.php         # Valores por hora (€) ⭐
│   │   │
│   │   └── 📂 relatorios/
│   │       ├── mensal.php          # Relatório mensal ⭐
│   │       └── enviar-email.php    # Envio manual de emails
│   │
│   ├── 📂 config/
│   │   └── database.php            # Conexão DB + JWT Secret
│   │
│   ├── 📂 includes/
│   │   ├── auth.php                # Helpers de autenticação
│   │   ├── db.php                  # Helpers de banco
│   │   ├── jwt.php                 # Geração/validação JWT
│   │   └── email.php               # Envio de emails SMTP ⭐
│   │
│   ├── 📂 sql/
│   │   ├── schema.sql              # Schema inicial
│   │   ├── migration_completa_v3.sql # Migration para atualizar ⭐
│   │   ├── config_valores.sql      # Criar tabela config_valores
│   │   └── migrate_*.sql           # Outras migrations
│   │
│   ├── 📂 uploads/                 # Fotos de usuários
│   │
│   ├── setup.php                    # Setup inicial
│   ├── setup-admin.php              # Criar admin
│   └── test.php                     # Testar backend
│
├── 📂 dist/                         # Build de produção ⭐
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].css
│   │   └── index-[hash].js
│   └── vite.svg
│
├── 📄 DEPLOY.md                     # Guia de deploy ⭐
├── 📄 RESUMO_COMPLETO.md            # Resumo de tudo ⭐
├── 📄 ESTRUTURA_COMPLETA.md         # Este arquivo
├── 📄 package.json                  # Dependências npm
├── 📄 vite.config.js                # Configuração Vite
├── 📄 tailwind.config.js            # Configuração Tailwind
└── 📄 .env.production               # Variáveis de ambiente

⭐ = Arquivo/pasta chave para o sistema
```

---

## 🔄 FLUXO DE DADOS

### 1. Login
```
Frontend                     Backend
  Login.jsx                    auth/login.php
     ↓                              ↓
  passaporte + senha          Valida no banco
     ↓                              ↓
  Recebe JWT + user data      Gera JWT (expira 8h)
     ↓                              ↓
  Salva no localStorage       Retorna: {token, user}
     ↓
  Redireciona baseado em tipo:
  - funcionario → /timesheet
  - encarregado → /approvals
  - admin → /dashboard
```

### 2. Timesheet (Funcionário)
```
Frontend                     Backend
  Timesheet.jsx
     ↓
  Carrega obras vinculadas → obras/by-employee.php
     ↓                           (SELECT FROM funcionario_obra)
  Seleciona obra + semana
     ↓
  Carrega horas salvas → apontamentos/my-week.php
     ↓
  Preenche horas (normal/extra/noturna)
     ↓
  [Salvar] → apontamentos/save.php
     ↓           (INSERT/UPDATE status='rascunho')
  [Enviar] → apontamentos/submit.php
     ↓           (UPDATE status='enviado')
  Envia assinatura digital     Envia email para encarregado
```

### 3. Aprovação (Encarregado)
```
Frontend                     Backend
  Approvals.jsx
     ↓
  Carrega pendentes → apontamentos/pending.php
     ↓                  (SELECT WHERE obra.encarregado_id = user.id
     ↓                   AND status='enviado')
  Clica "Aprobar"
     ↓
  Modal com assinatura + email_copia
     ↓
  [Aprobar] → apontamentos/approve.php
     ↓           (UPDATE status='aprovado_encarregado')
     ↓           (INSERT assinatura)
     ↓
                  📧 Chama sendToFinance() em email.php
                     ↓
                  1. Email semanal para CLIENTE (sem valores)
                     ↓
                  2. Verifica se é última semana do mês
                     ↓
                  3. Se SIM: chama sendMonthlyReportToFinance()
                     ↓
                  4. Email mensal para CLIENTE (COM valores €€€)
```

### 4. Configuração de Valores (Admin)
```
Frontend                     Backend
  Settings.jsx
     ↓
  Carrega valores → config/valores.php (GET)
     ↓                (SELECT FROM config_valores)
  Exibe inputs:
  - Hora Normal: €21.00
  - Hora Extra: €28.00
  - Hora Nocturna: €30.00
     ↓
  [Guardar] → config/valores.php (POST)
     ↓          (UPDATE config_valores)
  Valores salvos!
```

### 5. Relatório Mensal (Admin)
```
Frontend                     Backend
  Settings.jsx (seção relatório)
     ↓
  Seleciona: obra + mês
     ↓
  [Generar] → relatorios/mensal.php
     ↓           (SELECT apontamentos aprovados do mês)
     ↓           (GROUP BY funcionario_id)
     ↓           (SUM horas_normal, horas_extra, horas_noturna)
     ↓           (CALCULA valores = horas × valor_hora)
     ↓
  Exibe tabela:
  - Funcionário | Normal | Extra | Noturna | Total h | Valor €
  - Totais gerais
  - TOTAL A FATURAR em destaque
```

---

## 🗄️ ESTRUTURA DO BANCO

### Tabelas Principais

#### 1. `usuarios` (Funcionários, Encarregados, Admin)
```sql
id, passaporte, senha_hash, nome, email, telefone,
tipo (funcionario/encarregado/admin),
foto_url, ativo, criado_em, atualizado_em
```

#### 2. `clientes`
```sql
id, nome, documento, email, email_financeiro,
telefone, ativo, criado_em, atualizado_em
```

#### 3. `obras`
```sql
id, numero, nome, cliente_id, encarregado_id,
email_financeiro, endereco,
ativa, criado_em, atualizado_em
```

#### 4. `funcionario_obra` (Vínculos) ⭐
```sql
id, funcionario_id, obra_id, vinculado_em
```
**IMPORTANTE:** Esta tabela define quais funcionários podem lançar horas em quais obras!

#### 5. `apontamentos` (Timesheet) ⭐
```sql
id, funcionario_id, obra_id, semana_inicio (DATE),
horas_diarias (JSON: {"mon":{normal:8, extra:2}, ...}),
total_horas (DECIMAL),
status (rascunho/enviado/aprovado_encarregado/aprovado/rejeitado),
assinatura_base64 (LONGTEXT),
aprovado_em, aprovado_por,
aprovado_admin_em, aprovado_admin_por,
assinatura_admin_base64,
observacao_rejeicao, criado_em, atualizado_em
```
**UNIQUE KEY:** (funcionario_id, obra_id, semana_inicio) → 1 apontamento por semana

#### 6. `config_valores` (Valores por hora) ⭐
```sql
id, valor_hora_normal, valor_hora_extra, valor_hora_noturna,
atualizado_em
```

#### 7. `configuracoes` (Config geral)
```sql
id, chave, valor, atualizado_em

Exemplos:
- smtp_host: email-ssl.com.br
- smtp_port: 465
- smtp_user: contactes@j2s.ad
- smtp_password: ***
```

---

## 🔐 AUTENTICAÇÃO E SEGURANÇA

### JWT (JSON Web Token)
```php
// Gerado em: backend/includes/jwt.php
// Secret: definido em backend/config/database.php

Payload do Token:
{
  "id": 123,
  "passaporte": "FUNC001",
  "nome": "Juan García",
  "tipo": "funcionario",
  "email": "juan@j2s.ad",
  "exp": 1707321600  // Expira em 8h
}
```

### Headers nas Requisições
```javascript
headers: {
  'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbG...',
  'Content-Type': 'application/json'
}
```

### Proteção de Rotas (Backend)
```php
// Todos os endpoints checam:
1. Header Authorization existe?
2. Token é válido?
3. Token não expirou?
4. Usuário tem permissão para este endpoint?
```

### Proteção de Rotas (Frontend)
```jsx
// Em App.jsx: <ProtectedRoute>
1. Verifica se tem token no localStorage
2. Verifica se tipo de usuário tem acesso
3. Redireciona para login se não autorizado
```

---

## 📧 SISTEMA DE EMAILS

### Arquivo: `backend/includes/email.php`

#### Funções Disponíveis:

##### 1. `sendEmail($to, $subject, $htmlBody)`
Base para envio SMTP via SSL (porta 465)

##### 2. `sendToFinance($apontamento, $assinatura, $emailDestino)` ⭐
**Chamado quando:** Encarregado aprova
**Envia para:** Cliente (email_financeiro)
**Conteúdo:**
- Email semanal (SEM valores)
- Foto do funcionário
- Horas detalhadas (normal/extra/noturna)
- Assinatura do encarregado
- **SE última semana:** Chama `sendMonthlyReportToFinance()`

##### 3. `sendMonthlyReportToFinance($obraId, $mes, $emailDestino)` ⭐
**Chamado quando:** Última semana do mês aprovada
**Envia para:** Cliente (email_financeiro)
**Conteúdo:**
- Relatório consolidado COM VALORES
- Tabela de todos funcionários
- Total de horas por tipo
- **Valores em €** calculados
- Total a faturar em destaque

##### 4. `sendApprovalNotification($encarregadoEmail, ...)`
Notifica encarregado que tem horas pendentes

##### 5. `sendRejectionNotification($funcionarioEmail, ...)`
Notifica funcionário que horas foram rejeitadas

##### 6. `sendAdminNotification($apontamento, $adminEmail)`
Notifica admin que há aprovação pendente (2ª instância)

##### 7. `sendFinalApproval($apontamento, $assinatura, $emailJ2S)`
Email final quando admin aprova (vai para J2S, não cliente)

---

## 🎨 DESIGN SYSTEM

### Cores Principais
```css
--j2s-red: #CE0201        /* Vermelho J2S */
--black: #0a0a0a          /* Preto principal */
--white: #ffffff          /* Branco */
--gray-50: #f9fafb        /* Background claro */
--gray-200: #e5e7eb       /* Bordas */
--gray-600: #6b7280       /* Textos secundários */

/* Categorias de Horas */
--normal: #dcfce7 / #166534    /* Verde claro/escuro */
--extra: #fef3c7 / #92400e     /* Amarelo claro/escuro */
--noturna: #e0e7ff / #3730a3   /* Azul claro/escuro */
```

### Tipografia
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

Pesos:
- 400: Regular
- 500: Medium
- 600: Semibold
- 700: Bold
```

### Componentes Comuns
- Cards com hover (translateY(-2px))
- Botões com border-radius: 8px
- Inputs com border: 2px solid
- Modais com backdrop blur
- Badges coloridos por categoria
- Skeleton loading com shimmer animation

---

## 🌍 INTERNACIONALIZAÇÃO (i18n)

### Idiomas Suportados
- Espanhol (es) - Padrão
- Catalão (ca)

### Arquivo: `src/i18n/es.json`
```json
{
  "nav": {
    "timesheet": "Timesheet",
    "approvals": "Aprobaciones",
    "employees": "Empleados",
    "projects": "Obras",
    "clients": "Clientes"
  },
  ...
}
```

### Uso no Código
```jsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <h1>{t('nav.timesheet')}</h1>;
}
```

---

## 🚀 COMANDOS ÚTEIS

### Desenvolvimento
```bash
npm install          # Instalar dependências
npm run dev          # Iniciar dev server (http://localhost:5173)
```

### Build
```bash
npm run build        # Gerar build de produção (dist/)
npm run preview      # Preview do build
```

### Backend (PHP)
```bash
php backend/test.php           # Testar conexão
php backend/setup-admin.php    # Criar usuário admin
```

### Banco de Dados
```bash
# Importar schema inicial
mysql -u user -p db < backend/sql/schema.sql

# Executar migration v3 (IMPORTANTE!)
mysql -u user -p db < backend/sql/migration_completa_v3.sql
```

---

**Sistema pronto para produção! 🎉**

Qualquer dúvida, consulte `DEPLOY.md` ou `RESUMO_COMPLETO.md`
