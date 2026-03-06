# PLANO DE IMPLEMENTAÇÃO - 6 FASES
## Sistema J2S Enginyeria

---

## ✅ JÁ IMPLEMENTADO (O que NÃO pode ser perdido)

### Banco de Dados
- ✅ Tabela `apontamentos` completa com campos snapshot, 3 tipos de horas, status de aprovação
- ✅ Tabela `config_valores` (valores de hora para FOLHA/CUSTO)
- ✅ Tabela `config_valores_faturamento` (valores de hora para FATURAMENTO/CLIENTE)
- ✅ Tabela `config_fiscal` (configurações da empresa)
- ✅ Tabela `obras` com: endereco, cliente_id, encarregado_id, email_financeiro
- ✅ Tabela `funcionario_obra` (vínculo funcionário-obra)
- ✅ Tabela `folha_pagamento` e `faturamento`
- ✅ View `vw_dashboard_financeiro_obra`

### Backend PHP
- ✅ `/auth/login.php` - Login com JWT
- ✅ `/usuarios/*` - CRUD funcionários
- ✅ `/obras/*` - CRUD obras com alocação de funcionários
- ✅ `/clientes/*` - CRUD clientes
- ✅ `/apontamentos/*` - Sistema completo de apontamentos
- ✅ `/dashboard/analytics.php` - KPIs e gráficos
- ✅ `/dashboard/financial.php` - Dashboard financeiro
- ✅ `/payroll/*` - Folha de pagamento
- ✅ `/billing/*` - Faturamento
- ✅ `/config/valores.php` - Configuração de valores

### Frontend React
- ✅ TimesheetCalendar.jsx - Calendário mensal para registro
- ✅ Approvals.jsx - Aprovação com assinatura digital
- ✅ Dashboard.jsx - KPIs básicos
- ✅ Projects.jsx - Gestão de obras COM alocação de funcionários
- ✅ Employees.jsx - CRUD funcionários
- ✅ Payroll.jsx - Folha com edição inline
- ✅ Billing.jsx - Faturamento
- ✅ Analytics.jsx - Analytics com recharts

---

## ⚠️ FALTANDO IMPLEMENTAR - 6 FASES

### FASE 1: Configuração Fiscal (Banco de Dados)

**Adicionar ao SQL:**

```sql
-- 1.1 Tabela config_impostos
CREATE TABLE config_impostos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  imposto_nome VARCHAR(50) NOT NULL,
  percentual DECIMAL(5,2) NOT NULL,
  aplicado_em ENUM('faturamento', 'folha_funcionario', 'folha_empresa'),
  descricao TEXT,
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO config_impostos (imposto_nome, percentual, aplicado_em, descricao) VALUES
('IGI', 4.50, 'faturamento', 'Imposto sobre faturamento ao cliente'),
('CAS Funcionário', 6.50, 'folha_funcionario', 'Desconto do salário do funcionário'),
('CAS Empresa', 15.50, 'folha_empresa', 'Custo patronal da empresa');

-- 1.2 Tabela funcoes (Cargos)
CREATE TABLE funcoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  ativo TINYINT(1) DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO funcoes (nome) VALUES
('Eletricista'),
('Encanador'),
('Pedreiro'),
('Plaquista'),
('Lampista');

-- 1.3 Adicionar campo funcao_id em usuarios
ALTER TABLE usuarios ADD COLUMN funcao_id INT NULL AFTER role;
ALTER TABLE usuarios ADD FOREIGN KEY (funcao_id) REFERENCES funcoes(id);

-- 1.4 Adicionar campo email_encarregado em obras
ALTER TABLE obras ADD COLUMN email_encarregado VARCHAR(255) NULL AFTER email_financeiro;
```

**Criar backend PHP:**
- `/api/config/impostos.php` - GET/POST config_impostos
- `/api/funcoes/list.php` - Listar funções

**Atualizar Frontend:**
- Settings.jsx: Adicionar seção "Impostos e Taxas"
- Employees.jsx: Adicionar select "Função/Cargo"
- Projects.jsx: Adicionar campo "Email Encarregado"

---

### FASE 2: Calendário Funcionário (JÁ IMPLEMENTADO ✅)
- ✅ TimesheetCalendar.jsx com calendário mensal
- ✅ 3 campos: Normal, Extra, Noturna
- ✅ Login com senha
- ⚠️ Biometria preparada mas não ativa

**Sem ação necessária** - Apenas garantir que funciona perfeitamente.

---

### FASE 3: Aprovação Cega (Encarregado)

**Problema Atual:**
- Approvals.jsx mostra valores em €

**Solução:**
```javascript
// Em Approvals.jsx
const { user } = useAuth();
const isEncarregado = user.role === 'encargado';

// Ocultar valores se for Encarregado
{!isEncarregado && (
  <div className="text-lg font-bold text-green-600">
    Total: {formatCurrency(calcularTotal(apt))}
  </div>
)}
```

**Regra:**
- `role === 'admin'` → VÊ TUDO
- `role === 'encargado'` → VÊ APENAS HORAS (sem €)
- `role === 'empleado'` → NÃO ACESSA

---

### FASE 4: Motor de Cálculo

**4.1 Faturamento (Cliente):**

**Backend:** `/api/billing/generate-monthly.php`

```php
// Aplicar IGI automaticamente
$igi_percentual = 4.5; // buscar de config_impostos
$total_bruto = $horas_normais * $valor_normal +
               $horas_extra * $valor_extra +
               $horas_noturna * $valor_noturna;

$igi_valor = $total_bruto * ($igi_percentual / 100);
$total_liquido = $total_bruto - $igi_valor;

INSERT INTO faturamento (..., igi_percentual, igi_valor, total_bruto, total_liquido)
```

**SQL:** Adicionar campos em `faturamento`:
```sql
ALTER TABLE faturamento
  ADD COLUMN igi_percentual DECIMAL(5,2) DEFAULT 4.50,
  ADD COLUMN igi_valor DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN total_bruto DECIMAL(10,2),
  ADD COLUMN total_liquido DECIMAL(10,2);
```

**4.2 Folha de Pagamento (Funcionário):**

**Backend:** `/api/payroll/generate-monthly.php`

```php
// Multiplicadores
$salario_base_hora = $funcionario['salario_mensal'] / 160; // 160h/mês
$valor_hora_extra = $salario_base_hora * 1.4;
$valor_hora_noturna = $salario_base_hora * 1.6;

$total_normal = $horas_normais * $salario_base_hora;
$total_extra = $horas_extra * $valor_hora_extra;
$total_noturno = $horas_noturna * $valor_hora_noturna;

$total_bruto = $total_normal + $total_extra + $total_noturno;

// CAS Funcionário (6.5% desconto)
$cas_funcionario = $total_bruto * 0.065;

// Inputs manuais (admin preenche)
$vale_moradia = $_POST['vale_moradia'] ?? 0;
$ibf = $_POST['ibf'] ?? 0;

$total_liquido = $total_bruto - $cas_funcionario + $vale_moradia - $ibf;

// CAS Empresa (15.5% custo patronal)
$cas_empresa = $total_bruto * 0.155;
$custo_total_empresa = $total_liquido + $cas_empresa;
```

**SQL:** Adicionar campos em `folha_pagamento`:
```sql
ALTER TABLE folha_pagamento
  ADD COLUMN salario_base_hora DECIMAL(10,2),
  ADD COLUMN multiplicador_extra DECIMAL(3,2) DEFAULT 1.40,
  ADD COLUMN multiplicador_noturna DECIMAL(3,2) DEFAULT 1.60,
  ADD COLUMN cas_funcionario_percentual DECIMAL(5,2) DEFAULT 6.50,
  ADD COLUMN cas_funcionario_valor DECIMAL(10,2),
  ADD COLUMN cas_empresa_percentual DECIMAL(5,2) DEFAULT 15.50,
  ADD COLUMN cas_empresa_valor DECIMAL(10,2),
  ADD COLUMN vale_moradia DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN ibf DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN total_bruto DECIMAL(10,2),
  ADD COLUMN total_liquido DECIMAL(10,2),
  ADD COLUMN custo_total_empresa DECIMAL(10,2);
```

**Frontend:** Payroll.jsx - Adicionar campos:
- Vale Moradia (input manual)
- IBF (input manual)
- Exibir "Total Bruto", "CAS -6.5%", "Total Líquido", "CAS Empresa +15.5%", "Custo Total"

---

### FASE 5: Relatórios Semanais Progressivos

**Lógica de Envio:**

```javascript
// Semana 1, 2, 3: Relatório SEM valores
const semana_numero = Math.ceil(dayOfMonth / 7);

if (semana_numero <= 3) {
  // Gerar PDF apenas com:
  // - Horas por dia
  // - Assinatura do Encarregado
  // SEM mostrar valores em €
  await gerarRelatorioSemValores(apontamento_id);
} else if (semana_numero === 4) {
  // Semana 4: Relatório COMPLETO
  // - Consolidado das 4 semanas
  // - Capa financeira com valores
  // - IGI calculado
  // - Valor total da nota
  await gerarRelatorioFinanceiro(mes_referencia, obra_id);
}
```

**Backend:** `/api/relatorios/gerar-semanal.php`

```php
<?php
// Verifica a semana do mês
$semana = ceil(date('j') / 7);

if ($semana <= 3) {
  // PDF simples: apenas horas + assinatura
  gerarPDFHorasSemValores($apontamento_id);
  enviarEmail($email_encarregado, $pdf, "Relatório Semanal - Semana $semana");
} else {
  // Semana 4: PDF completo com valores
  gerarPDFFinanceiroCompleto($mes, $obra_id);
  enviarEmail($email_financeiro_cliente, $pdf, "Faturamento Mensal - $mes");
}
?>
```

**Frontend:**
- Billing.jsx: Botão "Gerar Relatório Semanal" (para semanas 1-3)
- Billing.jsx: Botão "Gerar Faturamento Mensal" (para semana 4)

---

### FASE 6: Dashboards de Gestão

**6.1 Dashboard Operacional:**

```javascript
// Dashboard.jsx - Adicionar:
// - Gráfico de Frequência (recharts Line)
// - Ranking de Assiduidade (Table com badges)
// - Top Performers vs Faltas

<Card>
  <h3>Ranking de Assiduidade</h3>
  <table>
    <tr>
      <td>João Silva</td>
      <td><Badge variant="success">100% Presente</Badge></td>
    </tr>
    <tr>
      <td>Maria Santos</td>
      <td><Badge variant="warning">2 Faltas</Badge></td>
    </tr>
  </table>
</Card>
```

**Backend:** `/api/dashboard/ranking-assiduidade.php`

```php
<?php
// Calcular % de presença por funcionário
SELECT
  u.nome,
  COUNT(a.id) as total_semanas,
  SUM(CASE WHEN a.status = 'aprovado' THEN 1 ELSE 0 END) as aprovadas,
  (SUM(CASE WHEN a.status = 'aprovado' THEN 1 ELSE 0 END) / COUNT(a.id) * 100) as percentual
FROM usuarios u
LEFT JOIN apontamentos a ON a.funcionario_id = u.id
WHERE a.semana_inicio >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
GROUP BY u.id
ORDER BY percentual DESC;
?>
```

**6.2 Dashboard Financeiro (Lucratividade Real):**

```javascript
// FinancialDashboard.jsx - Adicionar:
// Por OBRA:

const lucroPorObra = {
  faturamento_total: 50000, // de faturamento
  igi: 2250,               // 4.5% do faturamento
  custo_folha: 30000,      // de folha_pagamento
  cas_empresa: 4650,       // 15.5% da folha
  vale_moradia_total: 2000,
  ibf_total: 500,
  lucro_liquido: 50000 - 2250 - 30000 - 4650 - 2000 - 500 // = 10600
};

<Card>
  <h3>Lucratividade por Obra</h3>
  <div>Faturamento: {formatCurrency(50000)}</div>
  <div className="text-red-600">- IGI (4.5%): {formatCurrency(2250)}</div>
  <div className="text-red-600">- Custo Folha: {formatCurrency(30000)}</div>
  <div className="text-red-600">- CAS Empresa (15.5%): {formatCurrency(4650)}</div>
  <div className="text-red-600">- Vale Moradia: {formatCurrency(2000)}</div>
  <div className="text-red-600">- IBF: {formatCurrency(500)}</div>
  <hr />
  <div className="text-2xl font-bold text-green-600">
    Lucro Líquido: {formatCurrency(10600)}
  </div>
</Card>
```

**Backend:** `/api/dashboard/lucratividade.php`

```php
<?php
// Por obra
SELECT
  o.nome as obra,
  -- FATURAMENTO
  SUM(f.total_bruto) as faturamento_bruto,
  SUM(f.igi_valor) as igi,
  SUM(f.total_liquido) as faturamento_liquido,
  -- CUSTOS
  SUM(fp.total_liquido) as custo_folha,
  SUM(fp.cas_empresa_valor) as cas_empresa,
  SUM(fp.vale_moradia) as vale_moradia,
  SUM(fp.ibf) as ibf,
  -- LUCRO
  (SUM(f.total_liquido) - SUM(fp.total_liquido) - SUM(fp.cas_empresa_valor) - SUM(fp.vale_moradia) - SUM(fp.ibf)) as lucro_liquido
FROM obras o
LEFT JOIN faturamento f ON f.obra_id = o.id
LEFT JOIN folha_pagamento fp ON fp.obra_id = o.id
WHERE f.mes = '2026-02' -- filtro por mês
GROUP BY o.id;
?>
```

---

## 📊 ORDEM DE IMPLEMENTAÇÃO

**DIA 1 - Fundação:**
1. ✅ Executar ALTER TABLEs do SQL (FASE 1)
2. ✅ Criar backend `/config/impostos.php` e `/funcoes/list.php`
3. ✅ Atualizar Settings.jsx com impostos
4. ✅ Atualizar Employees.jsx com função/cargo
5. ✅ Atualizar Projects.jsx com email_encarregado

**DIA 2 - Cálculos:**
6. ✅ Atualizar `/billing/generate-monthly.php` com IGI
7. ✅ Atualizar `/payroll/generate-monthly.php` com multiplicadores e CAS
8. ✅ Atualizar Billing.jsx e Payroll.jsx com novos campos

**DIA 3 - Aprovação e Relatórios:**
9. ✅ Atualizar Approvals.jsx para ocultar € do Encarregado
10. ✅ Criar `/relatorios/gerar-semanal.php`
11. ✅ Adicionar botões em Billing.jsx

**DIA 4 - Dashboards:**
12. ✅ Criar `/dashboard/ranking-assiduidade.php`
13. ✅ Criar `/dashboard/lucratividade.php`
14. ✅ Atualizar Dashboard.jsx e FinancialDashboard.jsx

**DIA 5 - Testes:**
15. ✅ Testar fluxo completo
16. ✅ Validar cálculos
17. ✅ Corrigir bugs

---

## 🎨 CORREÇÕES DE DESIGN

**Remover fundo preto, voltar para claro:**

```css
/* index.css */
body {
  background: #f0f2f5; /* Cinza claro */
  color: #111111; /* Preto escuro */
}

/* Todas as páginas */
.page-container {
  background: transparent; /* Sem fundo preto */
  color: #111111;
}

/* Cards */
.card {
  background: white;
  border: 1px solid #e5e7eb; /* Cinza claro */
  box-shadow: none; /* Sem sombras */
}
```

---

**FIM DO PLANO**
