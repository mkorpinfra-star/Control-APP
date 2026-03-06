# J2S ENGINYERIA - Sistema de Gestão de Obras
## Documentação Completa do Sistema

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Páginas e Funcionalidades](#páginas-e-funcionalidades)
5. [Backend API](#backend-api)
6. [Autenticação e Permissões](#autenticação-e-permissões)
7. [Tecnologias Utilizadas](#tecnologias-utilizadas)
8. [Guia de Reconstrução](#guia-de-reconstrução)

---

## 🎯 VISÃO GERAL

**Sistema completo de gestão de obras** para J2S Enginyeria, empresa espanhola de instalações industriais. O sistema gerencia:

- ✅ **Apontamento de Horas** (3 tipos: Normal, Extra, Noturna)
- ✅ **Aprovação de Horas** por supervisores
- ✅ **Folha de Pagamento** automática
- ✅ **Faturamento** por obra/cliente
- ✅ **Dashboard Analytics** com gráficos
- ✅ **Gestão de Funcionários** com biometria
- ✅ **Gestão de Obras** e alocação de pessoal
- ✅ **Gestão de Clientes**
- ✅ **Sistema Multilíngue** (ES/PT/CA)
- ✅ **Upload de Fotos** obrigatório

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabelas Principais

#### 1. `usuarios`
```sql
Campos principais:
- id (PRIMARY KEY)
- nombre (nome completo)
- email (único)
- password (hash bcrypt)
- role (admin/encargado/empleado)
- activo (boolean)
- foto_url (URL da foto obrigatória)
- idioma (es/pt/ca)
- biometria_data (JSON com dados biométricos)
- created_at, updated_at
```

**Roles (Permissões):**
- **admin**: Acesso total, aprova horas, gerencia tudo
- **encargado**: Supervisor de obra, aprova horas dos funcionários
- **empleado**: Funcionário, aponta horas

#### 2. `clientes`
```sql
Campos principais:
- id
- nombre (nome da empresa)
- contacto (pessoa de contato)
- email
- telefono
- direccion
- created_at, updated_at
```

#### 3. `obras` (Projetos/Construcciones)
```sql
Campos principais:
- id
- numero (número da obra, ex: "OB-2025-001")
- nombre (nome do projeto)
- cliente_id (FK -> clientes)
- encargado_id (FK -> usuarios - supervisor)
- fecha_inicio
- fecha_fin
- estado (activo/pausado/finalizado)
- created_at, updated_at
```

#### 4. `funcionario_obra` (Alocação de Funcionários)
```sql
Relaciona funcionários com obras:
- id
- funcionario_id (FK -> usuarios)
- obra_id (FK -> obras)
- fecha_asignacion
- activo (boolean)
```

#### 5. `apontamentos` (Registro de Horas)
```sql
Campos principais:
- id
- funcionario_id (FK -> usuarios)
- obra_id (FK -> obras)
- semana_inicio (data da segunda-feira)
- horas_diarias (JSON com estrutura abaixo)
- status (rascunho/enviado/aprovado/rejeitado)
- observacao_rejeicao (motivo se rejeitado)
- aprovado_por (FK -> usuarios - quem aprovou)
- data_aprovacao
- assinatura_url (URL da assinatura digital)
- created_at, updated_at
```

**Estrutura do JSON `horas_diarias`:**
```json
{
  "mon": {
    "normal": 8,
    "extra": 2,
    "noturna": 0,
    "fecha": "2025-03-17"
  },
  "tue": {
    "normal": 8,
    "extra": 0,
    "noturna": 0,
    "fecha": "2025-03-18"
  },
  ...
}
```

#### 6. `folha_pagamento`
```sql
Campos principais:
- id
- funcionario_id (FK -> usuarios)
- mes (YYYY-MM)
- horas_normais
- horas_extras
- horas_noturnas
- valor_hora_normal (€/h)
- valor_hora_extra (€/h)
- valor_hora_noturna (€/h)
- total_normal (calculado)
- total_extra (calculado)
- total_noturno (calculado)
- total_geral (soma total)
- status (pendente/pago)
- data_pagamento
- created_at, updated_at
```

#### 7. `faturamento`
```sql
Campos principais:
- id
- obra_id (FK -> obras)
- cliente_id (FK -> clientes)
- mes (YYYY-MM)
- horas_normais
- horas_extras
- horas_noturnas
- valor_hora_normal (€/h - preço cobrado do cliente)
- valor_hora_extra (€/h)
- valor_hora_noturna (€/h)
- total_normal
- total_extra
- total_noturno
- total_faturado (soma)
- margem (% de lucro)
- status (pendente/enviado/pago)
- data_envio
- data_pagamento
- created_at, updated_at
```

#### 8. `config_valores`
```sql
Valores padrão de horas para CUSTO (folha):
- id
- tipo_hora (normal/extra/noturna)
- valor_euro (€/h pagos ao funcionário)
- ativo (boolean)
- created_at, updated_at
```

#### 9. `config_valores_faturamento`
```sql
Valores padrão de horas para FATURAMENTO (cliente):
- id
- tipo_hora (normal/extra/noturna)
- valor_euro (€/h cobrados do cliente)
- margem_percentual (% de lucro)
- ativo (boolean)
- created_at, updated_at
```

#### 10. `config_fiscal`
```sql
Configurações fiscais da empresa:
- id
- empresa_nome
- empresa_nif
- empresa_direccion
- empresa_email
- empresa_telefono
- iban (conta bancária)
- iva_percentual (IVA padrão)
- created_at, updated_at
```

---

## 🏗️ ARQUITETURA DO SISTEMA

### Frontend (React 19 + Vite)

```
src/
├── pages/
│   ├── Login.jsx                 # Login com email/senha
│   ├── Dashboard.jsx             # Dashboard admin com KPIs
│   ├── Timesheet.jsx             # Registro de horas (funcionário)
│   ├── TimesheetCalendar.jsx     # Alternativa com calendário
│   ├── Approvals.jsx             # Aprovação de horas (supervisor)
│   ├── Employees.jsx             # Gestão de funcionários
│   ├── Clients.jsx               # Gestão de clientes
│   ├── Projects.jsx              # Gestão de obras
│   ├── Payroll.jsx               # Folha de pagamento
│   ├── Billing.jsx               # Faturamento
│   ├── Analytics.jsx             # Analytics avançado
│   ├── ApprovedFinancial.jsx     # Aprovados financeiro
│   ├── FinancialDashboard.jsx    # Dashboard financeiro
│   ├── Settings.jsx              # Configurações de valores
│   ├── SetupObrigatorio.jsx      # Setup inicial de foto
│   └── Reports.jsx               # Relatórios
│
├── components/
│   ├── Layout.jsx                # Layout principal com sidebar
│   ├── PhotoUpload.jsx           # Upload de foto obrigatório
│   ├── ui/
│   │   ├── Button.jsx            # Botão reutilizável
│   │   ├── Card.jsx              # Card reutilizável
│   │   ├── Modal.jsx             # Modal reutilizável
│   │   ├── Loading.jsx           # Loading spinner
│   │   └── Alert.jsx             # Alertas
│   └── CloudflareUI.jsx          # (legado, não usado)
│
├── contexts/
│   └── AuthContext.jsx           # Context de autenticação
│
├── services/
│   └── api.js                    # Serviços de API
│
├── lib/
│   └── utils.js                  # Utilitários (cn, etc)
│
├── locales/
│   ├── es.json                   # Traduções espanhol
│   ├── pt.json                   # Traduções português
│   └── ca.json                   # Traduções catalão
│
├── styles/
│   └── cloudflare-design.js      # (legado)
│
├── index.css                     # CSS global + Tailwind
├── App.jsx                       # Router principal
└── main.jsx                      # Entry point
```

### Backend (PHP 8 + MySQL)

```
backend/
├── api/
│   ├── auth/
│   │   └── login.php             # POST - Login com JWT
│   │
│   ├── usuarios/
│   │   ├── list.php              # GET - Listar usuários
│   │   ├── create.php            # POST - Criar usuário
│   │   ├── update.php            # PUT - Atualizar usuário
│   │   ├── delete.php            # DELETE - Deletar usuário
│   │   └── upload-foto.php       # POST - Upload foto
│   │
│   ├── clientes/
│   │   ├── list.php              # GET - Listar clientes
│   │   ├── create.php            # POST - Criar cliente
│   │   ├── update.php            # PUT - Atualizar cliente
│   │   └── delete.php            # DELETE - Deletar cliente
│   │
│   ├── obras/
│   │   ├── list.php              # GET - Listar obras
│   │   ├── create.php            # POST - Criar obra
│   │   ├── update.php            # PUT - Atualizar obra
│   │   ├── delete.php            # DELETE - Deletar obra
│   │   ├── by-employee.php       # GET - Obras do funcionário
│   │   ├── assign-employees.php  # POST - Alocar funcionários
│   │   └── employees.php         # GET - Funcionários da obra
│   │
│   ├── apontamentos/
│   │   ├── my-week.php           # GET - Apontamento da semana
│   │   ├── save.php              # POST - Salvar rascunho
│   │   ├── submit.php            # POST - Enviar para aprovação
│   │   ├── pending.php           # GET - Pendentes aprovação
│   │   ├── approve.php           # POST - Aprovar (com assinatura)
│   │   ├── reject.php            # POST - Rejeitar
│   │   └── approved-financial.php # GET - Aprovados para financeiro
│   │
│   ├── payroll/
│   │   ├── list.php              # GET - Folha de pagamento
│   │   ├── generate-monthly.php  # POST - Gerar folha do mês
│   │   └── update.php            # PUT - Atualizar folha
│   │
│   ├── billing/
│   │   ├── list.php              # GET - Listar faturamento
│   │   ├── generate-monthly.php  # POST - Gerar faturamento
│   │   └── update.php            # PUT - Atualizar faturamento
│   │
│   ├── dashboard/
│   │   ├── analytics.php         # GET - KPIs do dashboard
│   │   ├── financial.php         # GET - Dashboard financeiro
│   │   ├── analytics-export.php  # POST - Exportar para Excel
│   │   ├── export-pdf.php        # POST - Exportar PDF
│   │   └── enviar-email.php      # POST - Enviar por email
│   │
│   ├── config/
│   │   ├── valores.php           # GET/POST - Config valores hora
│   │   ├── get.php               # GET - Config fiscal
│   │   └── save.php              # POST - Salvar config fiscal
│   │
│   └── biometria/
│       ├── registrar.php         # POST - Registrar biometria
│       └── verificar.php         # POST - Verificar biometria
│
├── includes/
│   ├── db.php                    # Conexão MySQL
│   ├── auth.php                  # Middleware autenticação
│   ├── jwt.php                   # Geração/validação JWT
│   └── email.php                 # Envio de emails
│
├── config/
│   └── database.php              # Config do banco
│
└── setup.php                     # Script de setup inicial
```

---

## 📱 PÁGINAS E FUNCIONALIDADES

### 1. **Login** (`Login.jsx`)
- Email + Senha
- Geração de token JWT
- Redirecionamento baseado em role
- Seletor de idioma (ES/PT/CA)

### 2. **Dashboard** (`Dashboard.jsx`)
**Visível para:** admin, encargado

**KPIs exibidos:**
- Total de horas trabalhadas (semana/mês)
- Horas por tipo (Normal/Extra/Noturna)
- Total de funcionários ativos
- Total de obras ativas
- Aprovações pendentes
- Faturamento do mês
- Custo de folha do mês
- Margem de lucro

**Gráficos (Chart.js):**
- Distribuição de horas por tipo
- Horas por obra
- Evolução semanal

**Ações:**
- Exportar para PDF
- Exportar para Excel
- Enviar por email

### 3. **Timesheet** (`Timesheet.jsx`)
**Visível para:** empleado

**Funcionalidades:**
- Seletor de semana (Mon-Sat)
- Grid com 3 colunas: Normal (8-17h), Extra (17-22h), Noturna (22-6h)
- Input numérico para cada dia/tipo
- Total automático
- Salvar rascunho (status: rascunho)
- Enviar para aprovação (status: enviado)
- Bloqueio se status = aprovado/enviado
- Alerta se rejeitado com motivo

**Regras:**
- Foto obrigatória antes de usar
- Só pode editar se status = rascunho ou rejeitado
- Máximo 24h por dia

### 4. **Approvals** (`Approvals.jsx`)
**Visível para:** admin, encargado

**Funcionalidades:**
- Lista de apontamentos pendentes
- Filtro por funcionário/obra
- Visualização detalhada de cada semana
- **Canvas para assinatura digital**
- Aprovar (com assinatura obrigatória)
- Rejeitar (com motivo obrigatório)
- Histórico de aprovações

**Fluxo:**
1. Funcionário envia apontamento
2. Supervisor vê na lista de pendentes
3. Supervisor revisa horas
4. Assina digitalmente no canvas
5. Aprova ou rejeita
6. Se rejeitado, funcionário pode corrigir

### 5. **Employees** (`Employees.jsx`)
**Visível para:** admin

**Funcionalidades:**
- CRUD completo de funcionários
- Campos: Nome, Email, Senha, Role, Foto
- Upload de foto obrigatório
- Toggle de status (ativo/inativo)
- Cadastro de biometria (opcional)
- Filtro e busca
- Cards responsivos

**Validações:**
- Email único
- Senha mínima 6 caracteres
- Foto obrigatória

### 6. **Clients** (`Clients.jsx`)
**Visível para:** admin

**Funcionalidades:**
- CRUD completo de clientes
- Campos: Nome, Contato, Email, Telefone, Endereço
- Busca por nome
- Cards com ícones (lucide-react)
- Modal para criar/editar

### 7. **Projects** (`Projects.jsx`)
**Visível para:** admin, encargado

**Funcionalidades:**
- CRUD completo de obras
- Campos: Número, Nome, Cliente, Supervisor, Datas, Status
- **Alocação de funcionários** (modal separado)
- Badge com número da obra
- Foto circular do supervisor
- Status colorido (activo/pausado/finalizado)

**Alocação de Funcionários:**
- Modal com lista de funcionários disponíveis
- Checkbox para selecionar
- Salva na tabela `funcionario_obra`

### 8. **Payroll** (`Payroll.jsx`)
**Visível para:** admin

**Funcionalidades:**
- Tabela com folha de pagamento mensal
- Colunas: Funcionário, Horas, Valores, Total
- **Edição inline** (clique duplo)
- Gerar folha do mês automaticamente
- Total geral com destaque
- Exportar para Excel

**Cálculo automático:**
```javascript
total_normal = horas_normais × valor_hora_normal
total_extra = horas_extras × valor_hora_extra
total_noturno = horas_noturnas × valor_hora_noturna
total_geral = total_normal + total_extra + total_noturno
```

### 9. **Billing** (`Billing.jsx`)
**Visível para:** admin

**Funcionalidades:**
- Tabela com faturamento por obra/cliente
- 10 colunas: Obra, Cliente, Mês, Horas, Valores, Totais, Margem
- Gerar faturamento do mês
- Status: Pendente/Enviado/Pago
- Exportar/Enviar por email/Gerar PDF

**Cálculo de Margem:**
```javascript
custo_total = (folha_pagamento da obra no mês)
faturamento_total = (faturamento da obra no mês)
margem_€ = faturamento_total - custo_total
margem_% = (margem_€ / faturamento_total) × 100
```

### 10. **Analytics** (`Analytics.jsx`)
**Visível para:** admin

**Funcionalidades:**
- Dashboard avançado com recharts
- Gráficos de linha (evolução)
- Gráficos de barra (comparação)
- Gráficos de pizza (distribuição)
- Filtros por período/obra/funcionário
- Métricas avançadas:
  - Horas por funcionário
  - Custo por obra
  - Lucratividade por cliente
  - Tendências

### 11. **FinancialDashboard** (`FinancialDashboard.jsx`)
**Visível para:** admin

**Funcionalidades:**
- Dashboard financeiro consolidado
- Cards com totais:
  - Faturamento total
  - Custo total (folha)
  - Lucro líquido
  - Margem média
- Gráficos financeiros
- Filtro por mês/ano

### 12. **Settings** (`Settings.jsx`)
**Visível para:** admin

**Funcionalidades:**
- **Configuração de Valores de Hora:**
  - Valor hora normal (custo)
  - Valor hora extra (custo)
  - Valor hora noturna (custo)
  - Valor hora normal (faturamento)
  - Valor hora extra (faturamento)
  - Valor hora noturna (faturamento)
  - Margem % de cada tipo

- **Configuração Fiscal:**
  - Nome da empresa
  - NIF
  - Endereço
  - Email/Telefone
  - IBAN
  - IVA %

**Inputs com cores:**
- Verde: valores de custo
- Azul: valores de faturamento
- Roxo: margem

### 13. **SetupObrigatorio** (`SetupObrigatorio.jsx`)
**Visível para:** todos na primeira vez

**Funcionalidades:**
- Modal OBRIGATÓRIO para upload de foto
- Não pode fechar sem enviar foto
- Preview da foto
- Validação de formato (jpg, png)
- Salva em `usuarios.foto_url`

---

## 🔐 AUTENTICAÇÃO E PERMISSÕES

### JWT Authentication
```javascript
// Login
POST /api/auth/login.php
{
  "email": "admin@j2s.com",
  "password": "senha123"
}

// Resposta
{
  "token": "eyJ0eXAiOiJKV1...",
  "user": {
    "id": 1,
    "nombre": "Admin",
    "email": "admin@j2s.com",
    "role": "admin",
    "foto_url": "..."
  }
}
```

### Headers em todas as requisições:
```javascript
Authorization: Bearer {token}
```

### Matriz de Permissões:

| Funcionalidade              | admin | encargado | empleado |
|-----------------------------|-------|-----------|----------|
| Dashboard                   | ✅    | ✅        | ❌       |
| Timesheet (próprio)         | ✅    | ✅        | ✅       |
| Approvals                   | ✅    | ✅        | ❌       |
| Employees                   | ✅    | ❌        | ❌       |
| Clients                     | ✅    | ❌        | ❌       |
| Projects                    | ✅    | ✅ (view) | ❌       |
| Payroll                     | ✅    | ❌        | ❌       |
| Billing                     | ✅    | ❌        | ❌       |
| Analytics                   | ✅    | ❌        | ❌       |
| Financial                   | ✅    | ❌        | ❌       |
| Settings                    | ✅    | ❌        | ❌       |

---

## 🛠️ TECNOLOGIAS UTILIZADAS

### Frontend
- **React 19** - Library UI
- **Vite 7.3** - Build tool
- **React Router v7** - Roteamento
- **Tailwind CSS v4** - Estilização (com @tailwindcss/vite)
- **lucide-react** - Ícones modernos
- **chart.js** - Gráficos no Dashboard
- **recharts** - Gráficos no Analytics
- **react-i18next** - Internacionalização (ES/PT/CA)
- **clsx + tailwind-merge** - Utilitários de className

### Backend
- **PHP 8.0+** - Linguagem servidor
- **MySQL 8.0** - Banco de dados
- **JWT** - Autenticação
- **CORS habilitado** - Para frontend React

### Infraestrutura
- **Hostinger** - Hospedagem
- **cPanel** - Gerenciamento
- **SSL/HTTPS** - Segurança

---

## 🚀 GUIA DE RECONSTRUÇÃO

### Passo 1: Configurar Banco de Dados

```sql
-- Importar schema
mysql -u usuario -p database_name < u268549871_saas.sql

-- Criar usuário admin inicial
INSERT INTO usuarios (nombre, email, password, role, activo, idioma)
VALUES ('Admin', 'admin@j2s.com', '$2y$10$...', 'admin', 1, 'es');

-- Configurar valores padrão
INSERT INTO config_valores (tipo_hora, valor_euro, ativo) VALUES
('normal', 15.00, 1),
('extra', 22.50, 1),
('noturna', 30.00, 1);

INSERT INTO config_valores_faturamento (tipo_hora, valor_euro, margem_percentual, ativo) VALUES
('normal', 25.00, 40, 1),
('extra', 37.50, 40, 1),
('noturna', 50.00, 40, 1);
```

### Passo 2: Configurar Backend

```php
// backend/config/database.php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u268549871_saas');
define('DB_USER', 'u268549871_saas');
define('DB_PASS', 'sua_senha');
define('JWT_SECRET', 'chave_secreta_aleatoria');
define('FRONTEND_URL', 'https://seu-dominio.com');
```

### Passo 3: Estrutura de Pastas

```bash
# Backend
mkdir -p backend/api/{auth,usuarios,clientes,obras,apontamentos,payroll,billing,dashboard,config,biometria}
mkdir -p backend/{includes,config}
mkdir -p backend/uploads/{fotos,assinaturas}
chmod 777 backend/uploads/{fotos,assinaturas}

# Frontend
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom@7 lucide-react chart.js react-chartjs-2 recharts react-i18next i18next clsx tailwind-merge
npm install -D tailwindcss@next @tailwindcss/vite
```

### Passo 4: Configurar Tailwind v4

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

```css
/* src/index.css */
@import "tailwindcss";

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --j2s-red: #CE0201;
  --j2s-red-dark: #8a0000;
  --font-body: 'Inter', sans-serif;
  --font-heading: 'Inter', sans-serif;
}

body {
  font-family: var(--font-body);
  background: #f0f2f5;
  color: #111111;
}
```

### Passo 5: Router Principal

```javascript
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
// ... importar todas as páginas

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="timesheet" element={<Timesheet />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="employees" element={<Employees />} />
            <Route path="clients" element={<Clients />} />
            <Route path="projects" element={<Projects />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="billing" element={<Billing />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="financial" element={<FinancialDashboard />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

### Passo 6: Context de Autenticação

```javascript
// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      // Validar token e buscar usuário
      fetch('https://api.j2s.com/api/auth/verify.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setUser(data.user)
        } else {
          logout()
        }
      })
    }
  }, [token])

  const login = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('token', userToken)
    navigate('/dashboard')
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

### Passo 7: Serviços de API

```javascript
// src/services/api.js
const API_URL = 'https://api.j2s.com/api'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

export const authService = {
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return res.json()
  }
}

export const apontamentosService = {
  getMyWeek: async (weekStart) => {
    const res = await fetch(`${API_URL}/apontamentos/my-week.php?semana_inicio=${weekStart}`, {
      headers: getHeaders()
    })
    return res.json()
  },

  save: async (data) => {
    const res = await fetch(`${API_URL}/apontamentos/save.php`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  },

  submit: async (id) => {
    const res = await fetch(`${API_URL}/apontamentos/submit.php`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ id })
    })
    return res.json()
  }
}

// ... outros serviços (obrasService, usuariosService, etc)
```

---

## 📊 FLUXOS PRINCIPAIS

### Fluxo 1: Apontamento de Horas
1. Funcionário faz login
2. Acessa "Mis Horas"
3. Seleciona a semana
4. Preenche horas por dia/tipo
5. Clica "Guardar borrador" (salva como rascunho)
6. Clica "Enviar para aprobación" (muda status para enviado)
7. Supervisor recebe notificação

### Fluxo 2: Aprovação
1. Supervisor acessa "Aprobaciones"
2. Vê lista de pendentes
3. Clica em um apontamento
4. Revisa as horas
5. Assina digitalmente no canvas
6. Aprova ou rejeita
7. Se aprova: status = aprovado
8. Se rejeita: status = rejeitado + motivo

### Fluxo 3: Folha de Pagamento
1. Admin acessa "Nómina"
2. Clica "Generar Nómina del Mes"
3. Sistema busca todos apontamentos aprovados do mês
4. Agrupa por funcionário
5. Calcula totais usando config_valores
6. Gera registros na tabela folha_pagamento
7. Admin pode editar valores inline
8. Exporta para Excel

### Fluxo 4: Faturamento
1. Admin acessa "Facturación"
2. Clica "Generar Facturación del Mes"
3. Sistema busca todos apontamentos aprovados do mês
4. Agrupa por obra/cliente
5. Calcula totais usando config_valores_faturamento
6. Calcula margem (faturamento - custo)
7. Gera registros na tabela faturamento
8. Admin pode enviar por email/PDF

---

## 🎨 DESIGN SYSTEM

### Cores
```css
--j2s-red: #CE0201        /* Vermelho principal */
--j2s-red-dark: #8a0000   /* Vermelho escuro (hover) */
--j2s-black: #111111      /* Preto textos */
--gray-50: #f8f9fa        /* Background claro */
--gray-100: #e9ecef       /* Bordas leves */
--gray-500: #6c757d       /* Textos secundários */
--success: #198754        /* Verde sucesso */
--warning: #ffc107        /* Amarelo aviso */
--danger: #dc3545         /* Vermelho erro */
```

### Tipografia
- **Fonte:** Inter (Google Fonts)
- **Tamanhos:**
  - Títulos: 1.5rem-2rem (font-bold)
  - Corpo: 1rem (font-normal)
  - Pequeno: 0.875rem

### Componentes
- **Botões:** Tailwind com variantes (primary, secondary, danger)
- **Cards:** bg-white border-2 border-gray-200 rounded-lg
- **Modais:** Fullscreen mobile, centered desktop
- **Tabelas:** Responsivas com scroll horizontal

---

## 📝 NOTAS IMPORTANTES

### Validações Críticas
1. **Foto obrigatória** - Usuário não pode usar sistema sem foto
2. **Assinatura obrigatória** - Supervisor deve assinar aprovações
3. **Horas máximas** - Máximo 24h por dia
4. **Permissões** - Validar role em TODAS as rotas

### Segurança
1. **Passwords** - Hash bcrypt (PHP: `password_hash()`)
2. **JWT** - Expiração de 24h
3. **CORS** - Configurado apenas para domínio do frontend
4. **SQL Injection** - Usar prepared statements SEMPRE
5. **XSS** - Sanitizar inputs no frontend e backend

### Performance
1. **Lazy Loading** - Carregar componentes sob demanda
2. **Paginação** - Listas com +50 itens
3. **Cache** - Token JWT armazenado no localStorage
4. **Debounce** - Buscas com delay de 300ms

### Responsividade
- **Mobile First** - Design começa em 375px
- **Breakpoints:**
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

---

## 🐛 PROBLEMAS CONHECIDOS E SOLUÇÕES

### Problema: Build grande (830 KB)
**Solução:** Code splitting com React.lazy()
```javascript
const Dashboard = lazy(() => import('./pages/Dashboard'))
```

### Problema: Fontes não carregam
**Solução:** Mover @import para ANTES do @import "tailwindcss"

### Problema: JWT expira
**Solução:** Implementar refresh token ou aumentar expiração

### Problema: Upload de foto falha
**Solução:** Verificar permissões da pasta uploads/ (chmod 777)

---

## 📞 CONTATOS E SUPORTE

**Desenvolvedor:** Claude AI (Anthropic)
**Cliente:** Guilherme (J2S Enginyeria)
**Data:** Fevereiro 2026

---

**FIM DO DOCUMENTO**

Este documento contém TODAS as informações necessárias para reconstruir o sistema do ZERO. Guarde bem!
