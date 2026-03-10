# 📘 DOCUMENTAÇÃO COMPLETA DO SISTEMA PUNTOCLICKS
> **Sistema de Gestão de Horas e Obras para Constructoras**
> Versão 1.0 | Março 2026 | Guilherme Gomes

---

## 🎯 VISÃO GERAL

O **PuntoClicks** é um sistema **multi-tenant SaaS** completo para gestão de horas, nóminas, facturação e obras em empresas de construção civil.

### O Que Resolve

**Problema Real:**
- Constructoras usam Excel para controlar horas → 15 horas/mês perdidas
- Erros de cálculo de CASS (impostos) → multas e problemas legais
- Zero visibilidade de custos reais por obra → prejuízo oculto
- Confusão entre o que funcionário diz vs o que encarregado confirma

**Solução:**
- Funcionário ficha horas desde app móbil
- Encarregado aprova com firma digital
- Sistema calcula **AUTOMÁTICAMENTE**: salários, CASS (6,5% + 15,5%), provisão férias, facturação, IGI
- Dashboard mostra margens de lucro REAIS por obra em tempo real

---

## 📐 ARQUITECTURA DO SISTEMA

### Arquitectura de 3 Níveis

```
┌─────────────────────────────────────────────────────┐
│         Landing Page (puntoclicks.com)              │
│  → Copy de venda, screenshots, preço, FAQ           │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│    Painel Admin Central (admin.puntoclicks.com)     │
│  → Super Admin cria tenants (clientes)              │
│  → Gestão multi-tenant                              │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│     App do Cliente (j2s.puntoclicks.com)            │
│  → Cada cliente tem seu subdomínio                  │
│  → Admin do cliente gere suas obras/funcionários    │
└─────────────────────────────────────────────────────┘
```

### Como Funciona o Multi-Tenant

**Tenant = Cliente que paga os €699/ano**

Exemplo real:
- **Tenant 1**: J2S Hores (j2s.puntoclicks.com)
  - 50 funcionários
  - 15 obras activas
  - 2 admins, 5 encarregados

- **Tenant 2**: Construccions Andorra (construccions.puntoclicks.com)
  - 20 funcionários
  - 8 obras activas
  - 1 admin, 2 encarregados

**Isolamento Total:**
- Cada tenant vê APENAS seus dados
- Impossível tenant A ver dados de tenant B
- Base de dados: coluna `tenant_id` em TODAS as tabelas

---

## 🔐 AUTENTICAÇÃO E TIPOS DE UTILIZADORES

### 4 Tipos de Utilizadores

| Tipo | Acesso | Permissões | Exemplo Real |
|------|--------|-----------|--------------|
| **super_admin** | Painel Central | Criar tenants, ver stats globais | Guilherme (dono do sistema) |
| **admin** | App do Cliente | Gestão completa: obras, funcionários, nóminas, facturação | RH da J2S Hores |
| **encarregado** | App do Cliente | Ver SUAS obras, aprovar horas DOS SEUS funcionários | Chefe de obra 1, Chefe de obra 2 |
| **funcionario** | App Móbil | Fichar horas APENAS nas obras onde está assignado | Pedreiro, Electricista, etc. |

### Fluxo de Login

```
1. Utilizador acede j2s.puntoclicks.com/login
2. Entra passaporte (username) + senha
3. Backend valida credenciais
4. Backend gera JWT com: { user_id, tenant_id, tipo }
5. Frontend guarda JWT em localStorage
6. Todas as chamadas API incluem: Authorization: Bearer <JWT>
7. Backend SEMPRE valida tenant_id em TODAS as queries
```

**Segurança Crítica:**
- JWT contém `tenant_id` → impossível funcionário A aceder dados de tenant B
- Todas as queries SQL: `WHERE tenant_id = :tenant_id`
- Middleware valida JWT em TODAS as rotas protegidas

---

## 🎛️ MÓDULOS DO SISTEMA (EXPLICAÇÃO DETALHADA)

---

### 📊 MÓDULO 1: DASHBOARD (VISÃO GLOBAL)

**Localização:** `/dashboard`
**Acesso:** Admin, Encarregado (vê apenas suas obras)

#### O Que Mostra

**Métricas em Tempo Real:**
```
┌─────────────────────────────────────────────┐
│  4 Obras Activas                            │
│  10 Funcionários                            │
│  0 Aprovações Pendentes                     │
│  Custo Total Mês: 28.736€                   │
└─────────────────────────────────────────────┘
```

**Actividade Reciente:**
- "Obra #20260303 - Encamp Sport editada hace 15h"
- "Obra #20260303 - Encamp Sport modificada por Cassio Luis"
- "Nova obra creada #20260503 - Hotel Blue Sea Formentera"

#### Lógica do Dashboard

**API:** `backend/api/dashboard/summary.php`

```php
// Busca obras activas DO TENANT
SELECT COUNT(*) FROM obras
WHERE tenant_id = :tenant_id AND ativo = 1

// Busca funcionários activos DO TENANT
SELECT COUNT(*) FROM usuarios
WHERE tenant_id = :tenant_id AND ativo = 1 AND tipo = 'funcionario'

// Busca aprovações pendentes DO TENANT
SELECT COUNT(*) FROM apontamentos
WHERE tenant_id = :tenant_id AND status = 'enviado'

// Calcula custo total do mês DO TENANT
SELECT SUM(custo_total_empresa) FROM folha_pagamento
WHERE tenant_id = :tenant_id AND mes_referencia = '2026-03'
```

**Por Que É Importante:**
- Admin abre sistema e em **5 segundos** sabe EXACTAMENTE como está tudo
- Sem abrir 10 ficheiros Excel
- Sem perguntar a ninguém
- Números reais, actualizados em tempo real

---

### 🏗️ MÓDULO 2: GESTÃO DE OBRAS

**Localização:** `/projects`
**Acesso:** Admin (vê todas), Encarregado (vê apenas suas obras)

#### Criar Obra

**Formulário:**
```
Número: 20260303 (único, obrigatório)
Nome: Encamp Sport
Cliente: AC Construccions (Jordi) ← selecção de lista
Encarregado: Cassio Luis ← selecção de lista
Endereço: Passeig de l'Alguer S/N Encamp
Email Financeiro: administracion@mantenopolis.com
Estado: Activa / Inactiva
```

**API:** `backend/api/obras/create.php`

```php
INSERT INTO obras (
  tenant_id, numero, nome, cliente_id, encarregado_id, endereco, email_financeiro, ativo
) VALUES (
  :tenant_id, :numero, :nome, :cliente_id, :encarregado_id, :endereco, :email_financeiro, 1
)
```

#### Assignar Funcionários a Obra

**Fluxo:**
1. Admin entra em obra
2. Clica "Assignar Funcionários"
3. Selecciona checkbox: João, Maria, Pedro
4. Clica "Guardar"

**API:** `backend/api/obras/assign-employees.php`

```php
// Apaga assignações antigas
DELETE FROM obra_funcionarios WHERE obra_id = :obra_id

// Insere novas assignações
INSERT INTO obra_funcionarios (obra_id, funcionario_id)
VALUES (:obra_id, :funcionario_id)
```

**Por Que É Importante:**
- Funcionário só pode fichar horas em obras onde está assignado
- Evita erro: "Fichei na obra errada"
- Encarregado só vê funcionários DA SUA obra

#### Dashboard de Custos por Obra

**Dados Mostrados:**
```
Obra #20260303 - Encamp Sport
─────────────────────────────────────
Total Horas Fichadas:    1.248h
Custo Acumulado:         18.736€
  → Salários:            12.400€
  → CASS Empresa:         2.480€
  → Provisão Férias:      3.856€

Facturação Acumulada:    28.992€
  → Valor Bruto:         30.400€
  → IGI (4,5%):          -1.408€

Margem de Lucro:         10.256€ (35,4%)
```

**API:** `backend/api/dashboard/analytics.php`

**Cálculo Real:**
```php
// 1. Busca todas horas aprovadas da obra
SELECT SUM(horas_normais + horas_extra + horas_noturna)
FROM apontamentos
WHERE obra_id = :obra_id AND status IN ('aprovado', 'aprovado_encarregado')

// 2. Busca custo total (nómina da obra)
SELECT SUM(custo_total_empresa)
FROM folha_pagamento
WHERE obra_id = :obra_id

// 3. Busca facturação (o que cobras ao cliente)
SELECT SUM(total_liquido)
FROM faturamento
WHERE obra_id = :obra_id

// 4. Calcula margem
$margem = $faturacao - $custo
$margem_percentual = ($margem / $faturacao) * 100
```

**Por Que É Importante:**
- Admin vê SE a obra está a dar lucro ou prejuízo
- Em tempo real, não apenas no fim do mês
- Pode ajustar preços ANTES de perder dinheiro

---

### ⏱️ MÓDULO 3: CONTROLO DE HORAS (APONTAMENTOS)

**Localização:** `/hours` (app móbil: `/my-week`)
**Acesso:** Funcionário (ficha), Encarregado (aprova), Admin (aprova final)

#### Fluxo Completo (CRÍTICO ENTENDER ISTO)

**PASSO 1: Funcionário Ficha Horas**

**Interface:**
```
┌─────────────────────────────────────────────┐
│  Semana: 03/03/2026 - 09/03/2026            │
│  Obra: #20260303 - Encamp Sport             │
├─────────────────────────────────────────────┤
│  D  S  T  Q  Q  S  S                        │
│  03 04 05 06 07 08 09                       │
│  8h 8h 8h 10h 8h 0h 0h  [Tipo: Normal ▼]   │
│                                              │
│  ✓ Dias Festivos: Nenhum                    │
│  ✓ Horas Extra: 2h (dia 06)                 │
│  ✓ Horas Nocturnas: 0h                      │
│                                              │
│  Total Semana: 42h                          │
│  [Enviar para Aprovação]                    │
└─────────────────────────────────────────────┘
```

**API:** `backend/api/apontamentos/save.php`

```php
// Grava JSON com horas diárias
$horasDiarias = [
  "2026-03-03" => ["tipo" => "normal", "horas" => 8],
  "2026-03-04" => ["tipo" => "normal", "horas" => 8],
  "2026-03-05" => ["tipo" => "normal", "horas" => 8],
  "2026-03-06" => ["tipo" => "extra", "horas" => 10],
  "2026-03-07" => ["tipo" => "normal", "horas" => 8],
  "2026-03-08" => ["tipo" => "festivo", "horas" => 0],
  "2026-03-09" => ["tipo" => "festivo", "horas" => 0]
];

INSERT INTO apontamentos (
  tenant_id, funcionario_id, obra_id, semana_inicio, horas_diarias, status
) VALUES (
  :tenant_id, :funcionario_id, :obra_id, '2026-03-03', :horas_diarias_json, 'rascunho'
)
```

**Status:** `rascunho` (funcionário pode ainda editar)

---

**PASSO 2: Funcionário Submete para Aprovação**

```
Funcionário clica "Enviar para Aprovação"
Status muda: rascunho → enviado
Encarregado recebe notificação
```

**API:** `backend/api/apontamentos/submit.php`

```php
UPDATE apontamentos
SET status = 'enviado', enviado_em = NOW()
WHERE id = :apontamento_id AND tenant_id = :tenant_id
```

---

**PASSO 3: Encarregado Aprova (PRIMEIRA APROVAÇÃO)**

**Interface:**
```
┌─────────────────────────────────────────────┐
│  Funcionário: João Silva                    │
│  Obra: #20260303 - Encamp Sport             │
│  Semana: 03/03/2026 - 09/03/2026            │
├─────────────────────────────────────────────┤
│  D  S  T  Q  Q  S  S                        │
│  8h 8h 8h 10h 8h 0h 0h                      │
│                                              │
│  Total: 42h (40h normais + 2h extra)        │
│                                              │
│  [Rejeitar]  [Aprovar com Firma] ───────┐   │
│                                          ↓   │
│  ╔══════════════════════════════════════╗   │
│  ║  Firma Digital Aqui                  ║   │
│  ╚══════════════════════════════════════╝   │
└─────────────────────────────────────────────┘
```

**API:** `backend/api/apontamentos/approve.php`

```php
// Valida que encarregado tem permissão nesta obra
SELECT * FROM apontamentos a
JOIN obras o ON o.id = a.obra_id
WHERE a.id = :apontamento_id
  AND o.encarregado_id = :user_id // ← CRÍTICO: só sua obra
  AND a.status = 'enviado'

// Aprova
UPDATE apontamentos
SET status = 'aprovado_encarregado',
    aprovado_em = NOW(),
    aprovado_por = :encarregado_id,
    assinatura_base64 = :assinatura
WHERE id = :apontamento_id

// Envia email ao financeiro DO CLIENTE
// ⚠️ ATENÇÃO: só envia quando TODOS funcionários da semana forem aprovados
$todosAprovados = verificarTodosFuncionariosAprovados($obraId, $semanaInicio);
if ($todosAprovados) {
  enviarEmailFinanceiro($cliente_email, $resumoSemanal);
}
```

**Email Enviado ao Cliente:**
```
Assunto: Resumo Semanal Obra #20260303 - Encamp Sport

Semana: 03/03/2026 - 09/03/2026

Funcionários:
- João Silva: 42h (40h normais + 2h extra)
- Maria Costa: 40h (40h normais)
- Pedro Santos: 38h (38h normais)

Total Horas: 120h
Aprovado por: Cassio Luis (Encarregado)
Data: 10/03/2026 09:15

Anexo: PDF com detalhes
```

**Status:** `aprovado_encarregado` (ainda precisa aprovação Admin/RH)

---

**PASSO 4: Admin/RH Aprova (APROVAÇÃO FINAL)**

**Interface Admin:**
```
┌─────────────────────────────────────────────┐
│  🟡 Pendente Aprovação Final (RH)           │
│                                              │
│  Funcionário: João Silva                    │
│  Obra: #20260303 - Encamp Sport             │
│  Semana: 03/03/2026                         │
│  Total: 42h                                 │
│                                              │
│  ✓ Aprovado por: Cassio Luis (Encarregado)  │
│    Data: 10/03/2026 09:15                   │
│                                              │
│  [Aprovar Definitivamente] ──────────┐      │
│                                       ↓      │
│  ╔═══════════════════════════════════╗      │
│  ║  Firma Digital RH                 ║      │
│  ╚═══════════════════════════════════╝      │
└─────────────────────────────────────────────┘
```

**API:** `backend/api/apontamentos/approve.php` (mesmo endpoint, lógica diferente)

```php
// Admin aprova registos já aprovados pelo encarregado
UPDATE apontamentos
SET status = 'aprovado',
    aprovado_admin_em = NOW(),
    aprovado_admin_por = :admin_id,
    assinatura_admin_base64 = :assinatura_admin
WHERE id = :apontamento_id AND status = 'aprovado_encarregado'

// Envia email final para J2S (empresa)
enviarEmailJ2S($emailJ2S, $resumoFinal);
```

**Email Enviado a J2S:**
```
Assunto: Aprovação Final - Obra #20260303 - Semana 03/03/2026

Funcionário: João Silva
Obra: #20260303 - Encamp Sport
Semana: 03/03/2026 - 09/03/2026
Total: 42h (40h normais + 2h extra)

Aprovações:
✓ Encarregado: Cassio Luis - 10/03/2026 09:15
✓ RH/Admin: Maria Admin - 10/03/2026 14:30

Status: APROVADO DEFINITIVAMENTE
Pronto para gerar nómina e facturação.
```

**Status:** `aprovado` (FINAL - vai automático para nómina e facturação)

---

#### Cálculo de Horas (FÓRMULAS REAIS)

**Multiplicadores:**
- Horas Normais: 1.0x
- Horas Extra: 1.4x
- Horas Nocturnas: 1.6x
- Festivos: conta ou não, depende do cálculo (ver abaixo)

**Para Nómina (custo empresa):**
```php
// Festivos contam como 8h trabalhadas
if ($dia['tipo'] == 'festivo') {
  $horasNormais += 8;
}

// Total para empresa
$totalHoras = $horasNormais + ($horasExtra * 1.4) + ($horasNoturna * 1.6);
```

**Para Facturação (cobrar ao cliente):**
```php
// Festivos NÃO contam (cliente não paga por festivos)
if ($dia['tipo'] == 'festivo') {
  continue; // pula
}

// Total para cliente
$totalHoras = $horasNormais + ($horasExtra * 1.4) + ($horasNoturna * 1.6);
```

**Exemplo Real:**
```
Funcionário trabalhou:
- Segunda: 8h normal
- Terça: 8h normal
- Quarta: 10h (8h normal + 2h extra)
- Quinta: 8h normal
- Sexta: 8h normal
- Sábado: 0h (festivo)
- Domingo: 0h (festivo)

Para Nómina:
Total = 40h normais + 2h extra + 8h festivo = 50h
Valor = (40 × 14€) + (2 × 14€ × 1,4) + (8 × 14€) = 560€ + 39,2€ + 112€ = 711,2€

Para Facturação:
Total = 40h normais + 2h extra (festivo NÃO conta) = 42h
Valor = (40 × 24€) + (2 × 24€ × 1,4) = 960€ + 67,2€ = 1.027,2€

Margem = 1.027,2€ - 711,2€ = 316€ (30,8%)
```

---

### 💰 MÓDULO 4: NÓMINA (FOLHA DE PAGAMENTO)

**Localização:** `/payroll`
**Acesso:** Admin

#### Gerar Nómina do Mês

**Interface:**
```
┌─────────────────────────────────────────────┐
│  Mês: Março 2026 ▼                          │
│  Obra: Todas as obras ▼                     │
│                                              │
│  [Gerar Nómina Automática]                  │
└─────────────────────────────────────────────┘
```

**O Que Faz Ao Clicar:**

**API:** `backend/api/payroll/generate-monthly.php`

```php
// 1. Busca TODAS horas aprovadas do mês
SELECT
  a.funcionario_id,
  a.obra_id,
  a.horas_diarias,
  u.salario_base,
  u.salario_hora,
  u.vale_moradia,
  u.ibf,
  u.bonificacao
FROM apontamentos a
JOIN usuarios u ON u.id = a.funcionario_id
WHERE a.tenant_id = :tenant_id
  AND a.status IN ('aprovado', 'aprovado_encarregado')
  AND a.semana_inicio >= '2026-03-01'
  AND a.semana_inicio <= '2026-03-31'

// 2. Agrupa por funcionario + obra
$grouped = [];
foreach ($apontamentos as $apt) {
  $key = $apt['funcionario_id'] . '_' . $apt['obra_id'];

  // Calcula horas do JSON
  $horas = calcularHorasJson($apt['horas_diarias'], false); // false = para empresa

  $grouped[$key]['total_horas_normais'] += $horas['normais'];
  $grouped[$key]['total_horas_extra']   += $horas['extra'];
  $grouped[$key]['total_horas_noturna'] += $horas['noturna'];
  $grouped[$key]['total_festivos']      += $horas['festivos'];
}

// 3. Para cada funcionário+obra, calcula nómina
foreach ($grouped as $item) {
  // ── Valores do funcionário ──
  $salarioBase  = 2000; // valor fixo declarado
  $salarioHora  = 14;   // valor hora trabalhada
  $valeMoradia  = 200;  // ajuda moradia mensal fixa
  $ibf          = 50;   // prima mensal fixa
  $bonificacao  = 0;    // bonus manual (se houver)

  // ── Multiplicadores ──
  $multiplicadorExtra   = 1.40;
  $multiplicadorNoturna = 1.60;

  // ── Subtotal de horas ──
  $subtotalHoras = ($item['total_horas_normais'] * $salarioHora)
                 + ($item['total_horas_extra']   * $salarioHora * 1.4)
                 + ($item['total_horas_noturna'] * $salarioHora * 1.6);

  // ── CASS (impostos sociais) ──
  $casFuncionarioValor = $salarioBase * 0.065;  // 6,5% do funcionário
  $casEmpresaValor     = $salarioBase * 0.155;  // 15,5% da empresa

  // ── Provisão de Férias Mensual ──
  $feriasProvisao = ($salarioHora * 176) / 12;  // reserva mensal para férias futuras

  // ── Total Bruto (o que funcionário ganhou) ──
  $totalBruto = $subtotalHoras + $valeMoradia + $ibf + $bonificacao;

  // ── Líquido a Pagar (o que funcionário recebe) ──
  $totalLiquido = $subtotalHoras + $valeMoradia + $ibf + $bonificacao - $casFuncionarioValor;

  // ── Custo Total Empresa ──
  $custoTotalEmpresa = $totalLiquido + $casEmpresaValor + $feriasProvisao;

  // 4. Grava na base de dados
  INSERT INTO folha_pagamento (
    tenant_id, funcionario_id, obra_id, mes_referencia,
    horas_normais, horas_extra, horas_noturna,
    salario_base, salario_hora,
    multiplicador_extra, multiplicador_noturna,
    bonificacao, ferias_provisao, total_bruto,
    cas_funcionario_percentual, cas_funcionario_valor,
    vale_moradia, ibf, total_liquido,
    cas_empresa_percentual, cas_empresa_valor
  ) VALUES (...)
}
```

#### Exemplo de Registo Gerado

**Funcionário:** João Silva
**Obra:** #20260303 - Encamp Sport
**Mês:** Março 2026

```
Horas Trabalhadas:
─────────────────────────────────────
Horas Normais:        160h
Horas Extra:            8h
Horas Nocturnas:        0h
Festivos:               8 dias

Valores Base:
─────────────────────────────────────
Salário Base:         2.000€
Salário/Hora:            14€
Vale Moradia:           200€
IBF (Prima):             50€
Bonificação:              0€

Cálculos:
─────────────────────────────────────
Subtotal Horas:
  160h × 14€           = 2.240,00€
  8h × (14€ × 1,4)     =   156,80€
  Total                = 2.396,80€

CASS Funcionário (6,5%):  -130,00€
Vale Moradia:             +200,00€
IBF:                       +50,00€

Total Bruto:           2.646,80€
Total Líquido:         2.516,80€ ← O que funcionário recebe

Encargos Empresa:
─────────────────────────────────────
CASS Empresa (15,5%):    +310,00€
Provisão Férias:         +205,33€
  → Fórmula: (14€ × 176h) ÷ 12 = 205,33€

Custo Total Empresa:   3.032,13€ ← O que empresa paga de verdade
```

#### Exportar Nómina

**Formatos:**
- **Excel**: todas linhas com fórmulas
- **PDF**: formatado para imprimir e entregar aos funcionários
- **CSV**: importar noutro sistema contabilidade

**API:** `backend/api/payroll/export.php`

```php
// Busca nómina do mês
SELECT
  u.nome as funcionario,
  u.passaporte,
  o.numero as obra,
  f.horas_normais,
  f.horas_extra,
  f.total_bruto,
  f.cas_funcionario_valor,
  f.total_liquido,
  f.custo_total_empresa
FROM folha_pagamento f
JOIN usuarios u ON u.id = f.funcionario_id
JOIN obras o ON o.id = f.obra_id
WHERE f.tenant_id = :tenant_id
  AND f.mes_referencia = '2026-03'
ORDER BY u.nome, o.numero

// Gera Excel usando PhpSpreadsheet
$spreadsheet = new Spreadsheet();
// ... popula células com dados
// ... aplica fórmulas SUM, etc
// ... exporta para /tmp/nomina_marco_2026.xlsx
```

---

### 📄 MÓDULO 5: FACTURAÇÃO (BILLING)

**Localização:** `/billing`
**Acesso:** Admin

#### Gerar Facturação do Mês

**Diferença Crítica vs Nómina:**
- **Nómina:** custo para empresa (salários + encargos)
- **Facturação:** o que COBRAS ao cliente (com margem de lucro)

**Interface:**
```
┌─────────────────────────────────────────────┐
│  Mês: Março 2026 ▼                          │
│  Obra: Todas as obras ▼                     │
│                                              │
│  [Gerar Facturação Automática]              │
└─────────────────────────────────────────────┘
```

**API:** `backend/api/billing/generate-monthly.php`

```php
// 1. Busca MESMAS horas aprovadas que nómina
SELECT
  a.obra_id,
  a.horas_diarias,
  u.valor_hora_venda  // ← DIFERENTE: valor que cobras ao cliente
FROM apontamentos a
JOIN usuarios u ON u.id = a.funcionario_id
WHERE a.tenant_id = :tenant_id
  AND a.status IN ('aprovado', 'aprovado_encarregado')
  AND a.semana_inicio >= '2026-03-01'
  AND a.semana_inicio <= '2026-03-31'

// 2. Agrupa por obra
$grouped = [];
foreach ($apontamentos as $apt) {
  $horas = calcularHorasJson($apt['horas_diarias'], true); // true = para cliente (festivos NÃO contam)

  $totalHorasFuncionario = $horas['normais'] + $horas['extra'] + $horas['noturna'];
  $valorHoraVenda = 24; // valor que cobras ao cliente (≠ salário funcionário)

  $valorTotalFuncionario = $totalHorasFuncionario * $valorHoraVenda;

  $grouped[$apt['obra_id']]['valor_total'] += $valorTotalFuncionario;
  $grouped[$apt['obra_id']]['total_horas'] += $totalHorasFuncionario;
}

// 3. Para cada obra, calcula factura
foreach ($grouped as $obraId => $dados) {
  $valorTotalServicos = $dados['valor_total'];  // ex: 11.520€
  $totalHoras         = $dados['total_horas'];  // ex: 480h

  // IGI (Imposto Geral Indirecto) - 4,5%
  $igiPercentual = 4.5;
  $totalBruto    = $valorTotalServicos;
  $igiValor      = $totalBruto * 0.045;
  $totalLiquido  = $totalBruto - $igiValor;

  // Grava facturação
  INSERT INTO faturamento (
    tenant_id, obra_id, mes_referencia,
    horas_normais, horas_extra, horas_noturna,
    valor_hora_normal, valor_hora_extra, valor_hora_noturna,
    total_horas, valor_total_servicos,
    total_bruto, igi_percentual, total_liquido
  ) VALUES (...)
}
```

#### Exemplo de Registo Gerado

**Obra:** #20260303 - Encamp Sport
**Mês:** Março 2026

```
Horas Facturadas:
─────────────────────────────────────
Total Horas:          480h
  → 3 funcionários × 160h cada

Valores de Venda:
─────────────────────────────────────
Valor/Hora Normal:       24€
Valor/Hora Extra:     33,6€ (24€ × 1,4)
Valor/Hora Nocturna:  38,4€ (24€ × 1,6)

Cálculos:
─────────────────────────────────────
Facturação Bruta:
  480h × 24€           = 11.520,00€

IGI (4,5%):               -518,40€

Facturação Líquida:    11.001,60€ ← O que cliente paga

Comparação com Custo:
─────────────────────────────────────
Facturação:          11.001,60€
Custo Obra (nómina):  8.736,00€
────────────────────────────────────
Margem de Lucro:      2.265,60€ (20,6%)
```

#### Dashboard Financeiro

**Visão Combinada Nómina + Facturação:**

```
Obra #20260303 - Encamp Sport - Março 2026
═════════════════════════════════════════════

CUSTOS (O que pagas)
─────────────────────────────────────
Salários:                 6.720,00€
CASS Empresa:             1.344,00€
Provisão Férias:            672,00€
─────────────────────────────────────
Custo Total:              8.736,00€


RECEITAS (O que cobras)
─────────────────────────────────────
Facturação Bruta:        11.520,00€
IGI (4,5%):                -518,40€
─────────────────────────────────────
Facturação Líquida:      11.001,60€


RESULTADO
─────────────────────────────────────
Margem:                   2.265,60€
Margem %:                     20,6%
═════════════════════════════════════════════

✓ Obra RENTÁVEL
```

**API:** `backend/api/dashboard/lucratividade.php`

---

### 👥 MÓDULO 6: GESTÃO DE FUNCIONÁRIOS

**Localização:** `/employees`
**Acesso:** Admin

#### Criar Funcionário

**Formulário:**
```
Nome: João Silva
Passaporte: ABC123456 (username de login)
Email: joao.silva@example.com
Senha: ••••••••
Função: Pedreiro / Electricista / Pintor / etc
Tipo: funcionario / encarregado / admin

Valores Salariais:
─────────────────────────────────────
Salário Base:         2.000€  ← base de cálculo CASS
Salário/Hora:            14€  ← custo empresa por hora
Valor/Hora Venda:        24€  ← o que cobras ao cliente
Vale Moradia:           200€  ← ajuda mensal fixa
IBF (Prima):             50€  ← prima mensal fixa
Bonificação:              0€  ← bonus manual (opcional)

Estado: Activo / Inactivo
```

**API:** `backend/api/usuarios/create.php`

```php
// Hash da senha
$senhaHash = password_hash($senha, PASSWORD_BCRYPT);

INSERT INTO usuarios (
  tenant_id, nome, passaporte, email, senha_hash, funcao, tipo,
  salario_base, salario_hora, valor_hora_venda, vale_moradia, ibf, bonificacao, ativo
) VALUES (
  :tenant_id, :nome, :passaporte, :email, :senha_hash, :funcao, :tipo,
  :salario_base, :salario_hora, :valor_hora_venda, :vale_moradia, :ibf, :bonificacao, 1
)
```

#### Importância dos Valores Salariais

**Por Que 3 Valores Diferentes?**

1. **Salário Base (2.000€):**
   - Base de cálculo CASS
   - Fixa todos meses (não muda com horas trabalhadas)
   - Exemplo: CASS funcionário = 2.000 × 6,5% = 130€

2. **Salário/Hora (14€):**
   - Custo real empresa por hora trabalhada
   - Usado em nómina para calcular líquido a pagar
   - Exemplo: 160h × 14€ = 2.240€

3. **Valor/Hora Venda (24€):**
   - O que cobras ao cliente
   - Usado em facturação
   - Diferença = margem de lucro
   - Exemplo: 160h × 24€ = 3.840€ (factura) vs 2.240€ (custo) = 1.600€ margem

---

### 🔔 MÓDULO 7: NOTIFICAÇÕES

**Localização:** `/notifications` (ícone sino no header)
**Acesso:** Todos

#### Tipos de Notificações

**Para Funcionário:**
- "Horas rejeitadas por encarregado - Semana 03/03"
- "Horas aprovadas - Semana 03/03"

**Para Encarregado:**
- "Nova submissão de horas aguardando aprovação - João Silva"
- "5 funcionários com horas pendentes esta semana"

**Para Admin:**
- "10 registos aprovados pelo encarregado aguardam aprovação final"
- "Nova obra criada #20260303 - Encamp Sport"
- "Funcionário João Silva sem fichagem há 7 dias"

**API:** `backend/api/notificacoes/list.php`

```php
SELECT
  n.id,
  n.tipo,
  n.titulo,
  n.mensagem,
  n.icone,
  n.cor,
  n.url,
  n.lido,
  n.created_at
FROM notificacoes n
WHERE n.tenant_id = :tenant_id
  AND (n.usuario_id = :user_id OR n.usuario_id IS NULL) // NULL = todos
ORDER BY n.created_at DESC
LIMIT 50
```

---

### 📊 MÓDULO 8: RELATÓRIOS E ANALYTICS

**Localização:** `/analytics`
**Acesso:** Admin

#### Relatórios Disponíveis

**1. Relatório Mensal de Obra**

**Conteúdo:**
```
Obra #20260303 - Encamp Sport
Período: Março 2026

FUNCIONÁRIOS (4)
─────────────────────────────────────
João Silva
  Horas: 168h (160h normais + 8h extra)
  Custo: 2.912,13€
  Facturação: 4.032€

Maria Costa
  Horas: 160h (160h normais)
  Custo: 2.780,00€
  Facturação: 3.840€

[... mais funcionários]

TOTAIS
─────────────────────────────────────
Total Horas:             640h
Custo Total:          11.384€
Facturação Total:     15.360€
Margem:                3.976€ (25,9%)
```

**API:** `backend/api/relatorios/mensal.php`

**2. Ranking de Assiduidade**

**Mostra:**
- Funcionários com mais horas trabalhadas
- Funcionários com mais faltas
- Funcionários sem fichagem há X dias

**API:** `backend/api/dashboard/ranking-assiduidade.php`

**3. Análise de Custos**

**Gráficos:**
- Evolução custo mensal por obra
- Distribuição custos: salários vs encargos vs provisões
- Comparação custo previsto vs real

**API:** `backend/api/dashboard/analytics-advanced.php`

---

## 🔐 SEGURANÇA (CRÍTICO)

### Validação de Tenant em TODAS as Queries

**ERRADO (vulnerabilidade grave):**
```php
// ❌ NUNCA FAZER ISTO
SELECT * FROM obras WHERE id = :obra_id
```

**CORRECTO:**
```php
// ✓ SEMPRE assim
SELECT * FROM obras
WHERE id = :obra_id AND tenant_id = :tenant_id
```

**Por Quê?**
- Sem validação `tenant_id`: tenant A pode aceder dados de tenant B
- Com validação: impossível aceder dados de outro tenant

### Middleware de Autenticação

**Arquivo:** `backend/includes/tenant_middleware.php`

```php
function validateTenantAccess($allowed_types = ['admin', 'encarregado', 'funcionario']) {
  // 1. Valida JWT
  $jwt = getJWTFromHeader();
  $user = validateJWT($jwt);

  if (!$user) {
    http_response_code(401);
    die(json_encode(['error' => 'Não autorizado']));
  }

  // 2. Valida tipo de utilizador
  if (!in_array($user['tipo'], $allowed_types)) {
    http_response_code(403);
    die(json_encode(['error' => 'Sem permissão']));
  }

  // 3. Retorna dados validados
  return [
    'user_id'   => $user['user_id'],
    'tenant_id' => $user['tenant_id'],
    'tipo'      => $user['tipo'],
    'nome'      => $user['nome']
  ];
}
```

**Uso em Todas as APIs:**
```php
require_once '../../includes/tenant_middleware.php';

// Valida e obtém dados
$auth = validateTenantAccess(['admin']); // só admin pode aceder

// Usa tenant_id em queries
$stmt = $pdo->prepare("
  SELECT * FROM obras
  WHERE tenant_id = :tenant_id
");
$stmt->execute(['tenant_id' => $auth['tenant_id']]);
```

---

## 📧 SISTEMA DE EMAILS

### Configuração SMTP

**Arquivo:** `backend/includes/email.php`

```php
require 'vendor/phpmailer/phpmailer/src/PHPMailer.php';
require 'vendor/phpmailer/phpmailer/src/SMTP.php';

$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host = 'smtp.hostinger.com';
$mail->SMTPAuth = true;
$mail->Username = 'noreply@puntoclicks.com';
$mail->Password = '********';
$mail->SMTPSecure = 'tls';
$mail->Port = 587;
```

### Emails Enviados

**1. Aprovação Encarregado → Cliente**
```
Para: cliente@example.com
Assunto: Resumo Semanal Aprovado - Obra #20260303

Conteúdo: PDF anexo com horas de todos funcionários
Quando: Quando encarregado aprova E todos funcionários da semana foram aprovados
```

**2. Aprovação Final Admin → J2S**
```
Para: contactes@j2s.ad
Assunto: Aprovação Final RH - Obra #20260303

Conteúdo: Confirmação aprovação definitiva
Quando: Admin aprova após encarregado
```

**3. Rejeição → Funcionário**
```
Para: funcionario@example.com
Assunto: Horas Rejeitadas - Semana 03/03

Conteúdo: Motivo rejeição + link para corrigir
Quando: Encarregado rejeita horas
```

---

## 🗄️ ESTRUTURA DA BASE DE DADOS

### Tabelas Principais

**1. `usuarios`**
```sql
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  nome VARCHAR(255),
  passaporte VARCHAR(50) UNIQUE,  -- username login
  email VARCHAR(255),
  senha_hash VARCHAR(255),
  funcao VARCHAR(100),
  tipo ENUM('super_admin', 'admin', 'encarregado', 'funcionario'),
  salario_base DECIMAL(10,2),
  salario_hora DECIMAL(10,2),
  valor_hora_venda DECIMAL(10,2),
  vale_moradia DECIMAL(10,2) DEFAULT 0,
  ibf DECIMAL(10,2) DEFAULT 0,
  bonificacao DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT 1,
  INDEX(tenant_id),
  INDEX(passaporte)
);
```

**2. `obras`**
```sql
CREATE TABLE obras (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  numero VARCHAR(50) NOT NULL,
  nome VARCHAR(255),
  cliente_id INT,
  encarregado_id INT,
  endereco TEXT,
  email_financeiro VARCHAR(255),
  ativo BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, numero),
  INDEX(tenant_id),
  INDEX(encarregado_id)
);
```

**3. `apontamentos`**
```sql
CREATE TABLE apontamentos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  funcionario_id INT NOT NULL,
  obra_id INT NOT NULL,
  semana_inicio DATE NOT NULL,
  horas_diarias JSON NOT NULL,  -- {"2026-03-03": {"tipo": "normal", "horas": 8}, ...}
  status ENUM('rascunho', 'enviado', 'aprovado_encarregado', 'aprovado', 'rejeitado'),
  aprovado_por INT,
  aprovado_em TIMESTAMP,
  assinatura_base64 LONGTEXT,
  aprovado_admin_por INT,
  aprovado_admin_em TIMESTAMP,
  assinatura_admin_base64 LONGTEXT,
  enviado_em TIMESTAMP,
  rejeitado_em TIMESTAMP,
  motivo_rejeicao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(tenant_id),
  INDEX(funcionario_id),
  INDEX(obra_id),
  INDEX(status)
);
```

**4. `folha_pagamento`**
```sql
CREATE TABLE folha_pagamento (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  funcionario_id INT NOT NULL,
  obra_id INT NOT NULL,
  mes_referencia VARCHAR(7) NOT NULL,  -- '2026-03'
  horas_normais DECIMAL(10,2) DEFAULT 0,
  horas_extra DECIMAL(10,2) DEFAULT 0,
  horas_noturna DECIMAL(10,2) DEFAULT 0,
  salario_base DECIMAL(10,2),
  salario_hora DECIMAL(10,2),
  multiplicador_extra DECIMAL(5,2) DEFAULT 1.40,
  multiplicador_noturna DECIMAL(5,2) DEFAULT 1.60,
  bonificacao DECIMAL(10,2) DEFAULT 0,
  ferias_provisao DECIMAL(10,2) DEFAULT 0,
  total_bruto DECIMAL(10,2),
  cas_funcionario_percentual DECIMAL(5,2),
  cas_funcionario_valor DECIMAL(10,2),
  vale_moradia DECIMAL(10,2) DEFAULT 0,
  ibf DECIMAL(10,2) DEFAULT 0,
  total_liquido DECIMAL(10,2),
  cas_empresa_percentual DECIMAL(5,2),
  cas_empresa_valor DECIMAL(10,2),
  custo_total_empresa DECIMAL(10,2) GENERATED ALWAYS AS (
    total_liquido + cas_empresa_valor + ferias_provisao
  ) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, funcionario_id, obra_id, mes_referencia),
  INDEX(tenant_id),
  INDEX(mes_referencia)
);
```

**5. `faturamento`**
```sql
CREATE TABLE faturamento (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  obra_id INT NOT NULL,
  mes_referencia VARCHAR(7) NOT NULL,
  horas_normais DECIMAL(10,2) DEFAULT 0,
  horas_extra DECIMAL(10,2) DEFAULT 0,
  horas_noturna DECIMAL(10,2) DEFAULT 0,
  valor_hora_normal DECIMAL(10,2),
  valor_hora_extra DECIMAL(10,2),
  valor_hora_noturna DECIMAL(10,2),
  total_horas DECIMAL(10,2),
  valor_total_servicos DECIMAL(10,2),
  total_bruto DECIMAL(10,2),
  igi_percentual DECIMAL(5,2) DEFAULT 4.50,
  total_liquido DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, obra_id, mes_referencia),
  INDEX(tenant_id),
  INDEX(mes_referencia)
);
```

---

## 🎨 FRONTEND (REACT + TAILWIND + DAISYUI)

### Estrutura de Pastas

```
src/
├── pages/
│   ├── landing/
│   │   └── Home.jsx              # Landing page (CA + ES)
│   ├── admin-central/
│   │   ├── Dashboard.jsx         # Super admin dashboard
│   │   └── TenantManagement.jsx  # Criar tenants
│   └── app/
│       ├── Dashboard.jsx         # Dashboard cliente
│       ├── Projects.jsx          # Gestão obras
│       ├── Hours.jsx             # Apontamentos
│       ├── Payroll.jsx           # Nómina
│       ├── Billing.jsx           # Facturação
│       ├── Employees.jsx         # Funcionários
│       └── Analytics.jsx         # Relatórios
├── components/
│   ├── Navigation.jsx            # Menu lateral
│   ├── Header.jsx                # Topo
│   └── NotificationBell.jsx      # Sino notificações
└── utils/
    ├── api.js                    # Chamadas API
    └── auth.js                   # JWT handling
```

### Roteamento

```javascript
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  const domain = window.location.hostname;

  // Landing page
  if (domain === 'puntoclicks.com') {
    return <LandingHome />;
  }

  // Admin central
  if (domain === 'admin.puntoclicks.com') {
    return <AdminCentralRoutes />;
  }

  // App do cliente (qualquer outro subdomínio)
  return <ClientAppRoutes />;
}
```

### Componentes DaisyUI Usados

- `btn` - Botões
- `card` - Cards
- `table` - Tabelas
- `modal` - Modais
- `drawer` - Menu lateral
- `dropdown` - Dropdowns
- `badge` - Badges de status
- `skeleton` - Loading states
- `alert` - Alertas
- `toast` - Notificações toast

---

## 🚀 DEPLOYMENT

### Servidor

**Especificações Mínimas:**
- VPS com 4GB RAM
- 40GB SSD
- PHP 8.1+
- MySQL 8.0+
- Apache ou Nginx

**Estrutura de Ficheiros:**
```
/var/www/puntoclicks.com/
├── dist/                    # Build React (frontend)
│   ├── index.html
│   └── assets/
│       ├── index-*.js
│       └── index-*.css
├── backend/
│   ├── api/                 # Endpoints PHP
│   ├── config/              # Database config
│   └── includes/            # Auth, middleware
└── .env                     # Credenciais (fora webroot)
```

### DNS Wildcard

**Configuração no Cloudflare:**
```
Tipo    Nome    Conteúdo         Proxy
────────────────────────────────────────
A       @       IP_SERVIDOR      ✓
A       *       IP_SERVIDOR      ✓
```

Resultado:
- puntoclicks.com → Landing
- admin.puntoclicks.com → Admin Central
- j2s.puntoclicks.com → App Cliente J2S
- **qualquer**.puntoclicks.com → App Cliente

### Apache Virtual Host

```apache
<VirtualHost *:443>
    ServerName puntoclicks.com
    ServerAlias *.puntoclicks.com

    DocumentRoot /var/www/puntoclicks.com/dist

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/puntoclicks.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/puntoclicks.com/privkey.pem

    # API backend
    Alias /api /var/www/puntoclicks.com/backend/api
    <Directory /var/www/puntoclicks.com/backend/api>
        Require all granted
    </Directory>

    # Frontend SPA
    <Directory /var/www/puntoclicks.com/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        # React Router
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ index.html [L]
    </Directory>
</VirtualHost>
```

---

## 📝 RESUMO EXECUTIVO (PARA MARKETING)

### O Que É PuntoClicks?

Sistema SaaS que **elimina Excel** de empresas de construção.

### O Que Resolve?

**Antes (com Excel):**
- 15 horas/mês perdidas em cópias, cálculos, erros
- Impostos calculados mal → multas
- Zero visão de margens reais por obra
- Caos entre o que funcionário diz vs o que encarregado confirma

**Depois (com PuntoClicks):**
- 30 minutos/mês (14,5h economizadas)
- Impostos calculados automáticamente 100% correcto
- Margens visíveis em tempo real
- Dupla aprovação (encarregado + admin) com firma digital

### Fluxo de Valor

```
Funcionário ficha horas (app móbil, 10 segundos)
            ↓
Encarregado aprova (firma digital)
            ↓
Admin/RH aprova (firma digital)
            ↓
Sistema calcula AUTOMÁTICAMENTE:
  • Nómina (salários + CASS 6,5% + 15,5% + provisão férias)
  • Facturação (valor venda + IGI 4,5%)
  • Margens de lucro por obra
            ↓
Admin vê dashboard: "Obra X deu 2.265€ lucro (20,6%)"
            ↓
Admin exporta Excel/PDF (1 clic) e envia ao cliente
```

### Diferenciais Competitivos

1. **Dupla Aprovação**: encarregado + admin → zero fraude
2. **Cálculo Automático Completo**: não é apenas registo horas, calcula TUDO (impostos, férias, margens)
3. **Multi-Tenant Real**: cada cliente isolado, impossível ver dados de outros
4. **Festivos Inteligentes**: conta para nómina, não conta para facturação
5. **Valor/Hora Dual**: salário ≠ valor venda → margem clara
6. **Emails Automáticos**: cliente recebe resumo sem tu fazeres nada

### Mercado Alvo

- Constructoras 5-200 funcionários
- Andorra, Espanha, França
- Sector: construção civil, instalações, manutenção
- Dor: usam Excel, cometem erros, perdem tempo, não vêem margens

### Preço e Modelo de Negócio

- **€699/ano** por tenant (empresa cliente)
- Ilimitado: funcionários, obras, utilizadores, horas
- Renovação anual opcional (não há permanência)
- Suporte incluído (email + WhatsApp, resposta 24h)

### ROI Para o Cliente

**Investimento:** €699/ano = 58€/mês

**Economias:**
- 14,5h/mês economizadas × valor hora admin (20-50€) = 290-725€/mês
- Zero erros de CASS → zero multas (300-2000€ por erro)
- Visão de margens → evita obras com prejuízo (milhares €)

**Payback:** 1-2 meses

---

## 📞 CONTACTOS E SUPORTE

**Desenvolvedor:** Guilherme Gomes
**Website:** guilhermesites.com.br
**Email:** contactes@j2s.ad
**WhatsApp:** [número]

**Documentação Técnica:** Este ficheiro
**Código Fonte:** GitHub (privado)
**Servidor:** Hostinger VPS

---

*Última actualização: 9 Março 2026*
