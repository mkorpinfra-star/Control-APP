# 📖 INSTRUÇÕES COMPLETAS DO SISTEMA - DO ZERO

## 🎯 O QUE É ESTE SISTEMA?

Sistema completo para gerenciar:
- ⏰ **Horas trabalhadas** (timesheet)
- ✅ **Aprovações** de horas
- 💰 **Folha de Pagamento** (quanto pagar aos funcionários)
- 📄 **Faturamento** (quanto cobrar dos clientes)
- 📊 **Lucro** por obra

---

## 👥 3 TIPOS DE USUÁRIO

### 1. 👷 **FUNCIONÁRIO** (Peão/Trabalhador)
**O que faz:** Preenche suas horas trabalhadas na semana
**Acesso:** Apenas Timesheet

### 2. 👔 **ENCARREGADO** (Supervisor)
**O que faz:** Aprova as horas dos funcionários (SEM ver valores/dinheiro)
**Acesso:** Apenas Aprovações

### 3. 🔑 **ADMINISTRADOR** (Você/Financeiro)
**O que faz:** Tudo - Gera folha, faturamento, vê lucro
**Acesso:** Menu completo

---

## 🔄 FLUXO COMPLETO DO SISTEMA

```
1. FUNCIONÁRIO → Preenche horas no Timesheet
                ↓
2. ENCARREGADO → Aprova (vê só horas, sem $)
                ↓
3. ADMIN → Vê valores calculados
                ↓
4. ADMIN → Gera Folha de Pagamento (custo)
                ↓
5. ADMIN → Gera Faturamento (receita)
                ↓
6. ADMIN → Vê Lucro no Dashboard
```

---

## 📱 MENU COMPLETO (ADMIN)

### 📊 **Dashboard**
**O que é:** Visão geral do sistema
**Mostra:** Resumo de obras, horas, aprovações pendentes

### 💰 **Dashboard Financiero**
**O que é:** Lucro por obra
**Mostra:**
- 💵 Receita (o que vai receber do cliente)
- 💸 Custo (o que vai pagar aos funcionários)
- ✅ Lucro (receita - custo)
- 📊 Margem % (quanto % de lucro)

**Exemplo:**
```
Obra: 001 - Edifício Central
Receita: €5.000 (faturamento ao cliente)
Custo:   €3.000 (folha dos funcionários)
Lucro:   €2.000
Margem:  40%
```

### ✅ **Aprovados c/ Valores** ⭐ NOVO
**O que é:** Ver apontamentos aprovados COM valores
**Para que:** Saber quanto vai faturar após encarregado aprovar
**Mostra:**
- Todas as semanas aprovadas
- Horas × Valores = Total a faturar
- Breakdown por tipo de hora (normal, extra, noturna)

**Quando usar:** Depois que encarregado aprovou, antes de gerar folha

### 📄 **Folha de Pagamento**
**O que é:** Quanto pagar a cada funcionário por mês
**Mostra:**
- Horas trabalhadas (normal, extra, noturna)
- Valores calculados automaticamente
- CAS (imposto): 6.5% descontado + 15.5% custo empresa
- Benefícios (Vale Moradia, IBF)
- **Líquido a Pagar** (valor final para funcionário)
- **Custo Total Empresa** (quanto custa pra você)

**Como funciona:**
1. Clica em "Generar Folha del Mes"
2. Escolhe o mês
3. Sistema busca todas horas aprovadas
4. Calcula automaticamente tudo
5. Você pode editar campos ROXOS se precisar

**Campos ROXOS (você preenche):**
- Salário Base
- Salário por Hora
- Vale Moradia
- IBF

**Campos AUTO-CALCULADOS (não pode mudar):**
- Valor Horas Normais = horas × salário/hora
- Valor Horas Extra = horas × salário/hora × 1.4
- Valor Horas Noturnas = horas × salário/hora × 1.6
- CAS Desconto Funcionário = salário base × 6.5%
- CAS Custo Empresa = salário base × 15.5%
- Líquido = (horas + benefícios) - CAS funcionário
- Custo Total = líquido + CAS empresa

### 📑 **Faturamento**
**O que é:** Quanto cobrar do cliente por mês
**Mostra:**
- Horas trabalhadas por obra
- Valores de faturamento (DIFERENTES da folha - com markup)
- IGI (imposto): 4.5% automaticamente
- **Total da Fatura** (valor final para cliente)

**Diferença Folha vs Faturamento:**
```
FOLHA (custo):
- Hora Normal: €15 (pago ao funcionário)

FATURAMENTO (receita):
- Hora Normal: €30 (cobrado do cliente)

LUCRO: €30 - €15 = €15 por hora
```

**Como funciona:**
1. Clica em "Generar Facturas del Mes"
2. Escolhe o mês
3. Sistema busca todas horas aprovadas
4. Multiplica pelas tarifas de cliente
5. Adiciona IGI 4.5%

### 👥 **Empleados**
**O que é:** Cadastro de funcionários
**Para que:** Adicionar/editar funcionários

**Campos importantes:**
- Nome, Passaporte, Email, Telefone
- Tipo: Funcionário / Encarregado / Admin
- **Función:** Pedreiro, Eletricista, Encanador, Plaquista, Lampista

**Seção ROXA (Dados Financeiros):**
- Salário Base (ex: €1.200)
- Salário por Hora (ex: €15)
- Vale Moradia (ex: €200)
- IBF (ex: €50)

**IMPORTANTE:** Preencha os dados roxos de TODOS funcionários antes de gerar folha!

### 🏢 **Clientes**
**O que é:** Cadastro de clientes
**Para que:** Associar obras a clientes

### 🏗️ **Proyectos** (Obras)
**O que é:** Cadastro de obras/projetos
**Para que:** Criar obras onde funcionários trabalham
**Campos:**
- Número da Obra (ex: 001)
- Nome (ex: Edifício Central)
- Cliente
- Data início/fim
- Status: Ativa/Concluída

### ✔️ **Aprobaciones**
**O que é:** Aprovar/Rejeitar horas dos funcionários
**Quem usa:** Encarregado (mas Admin também pode)
**Como funciona:**
1. Vê lista de apontamentos pendentes
2. Clica em "Aprobar"
3. Assina digitalmente
4. Sistema envia email ao financeiro

**IMPORTANTE:** Encarregado vê APENAS horas, SEM valores!

### 📊 **Informes**
**O que é:** Relatórios semanais por email
**Para que:** Enviar resumo semanal ao financeiro/cliente

### 📈 **Analytics**
**O que é:** Análises avançadas e gráficos
**Mostra:** Tendências, comparações, estatísticas

### ⚙️ **Configuración**
**O que é:** Configurações do sistema
**O que configurar:**

#### 1. Valores de Hora (Folha - Custo)
- Hora Normal: €15-21 (quanto PAGA ao funcionário)
- Hora Extra: €21-28
- Hora Noturna: €25-30

#### 2. Valores de Faturamento (Receita)
- Hora Normal: €25-35 (quanto COBRA do cliente)
- Hora Extra: €35-45
- Hora Noturna: €40-50

**IMPORTANTE:** Configure ANTES de usar o sistema!

---

## 📋 PASSO A PASSO - PRIMEIRO USO

### 1️⃣ CONFIGURAR O SISTEMA (UMA VEZ)

#### A. Executar Migration SQL
```bash
# No phpMyAdmin ou terminal MySQL:
mysql -u usuario -p banco < backend/sql/migration_payroll_billing.sql
```

#### B. Configurar Valores (Settings)
1. Login como Admin
2. Menu → **Configuración**
3. Preencher:
   - Valores de Hora (folha)
   - Valores de Faturamento (cliente)
4. Salvar

#### C. Cadastrar Funcionários
1. Menu → **Empleados**
2. Clicar "Nuevo Usuario"
3. Preencher dados básicos
4. Escolher **Función** (Pedreiro, Eletricista, etc)
5. Preencher campos **ROXOS**:
   - Salário Base
   - Salário por Hora
   - Vale Moradia
   - IBF
6. Salvar

**Repetir para TODOS funcionários!**

#### D. Cadastrar Obras
1. Menu → **Proyectos**
2. Clicar "Nueva Obra"
3. Preencher:
   - Número (ex: 001)
   - Nome
   - Cliente
   - Datas
4. Salvar

---

### 2️⃣ USAR SEMANALMENTE

#### Segunda-feira:
**Funcionários** preenchem Timesheet da semana anterior
- Login com seu usuário
- Página Timesheet abre automaticamente
- Preencher quadradinhos:
  - Horas Normais (8h por dia)
  - Horas Extra (se trabalhou além das 8h)
  - Horas Noturnas (se trabalhou à noite)
- Clicar "Enviar para Aprovação"

#### Terça-feira:
**Encarregado** aprova
- Login como Encarregado
- Página Aprovações abre automaticamente
- Ver lista de pendentes
- Clicar "Aprobar"
- Assinar digitalmente
- Email é enviado automaticamente ao financeiro

#### Quarta-feira:
**Admin** vê valores
- Menu → **Aprovados c/ Valores**
- Ver breakdown: horas × valores
- Conferir se está tudo correto

---

### 3️⃣ USAR MENSALMENTE (FIM DO MÊS)

#### Dia 30/31:
**Admin** gera folha e faturamento

**PASSO 1: Gerar Folha de Pagamento**
1. Menu → **Folha de Pagamento**
2. Escolher mês (ex: 2025-02)
3. Clicar "Generar Folha del Mes"
4. Sistema busca todas horas aprovadas
5. Calcula automaticamente
6. Revisar valores
7. Editar campos roxos se precisar

**PASSO 2: Gerar Faturamento**
1. Menu → **Faturamento**
2. Escolher mês (ex: 2025-02)
3. Clicar "Generar Facturas del Mes"
4. Sistema gera faturas por obra
5. IGI 4.5% calculado automaticamente

**PASSO 3: Ver Lucro**
1. Menu → **Dashboard Financiero**
2. Escolher mês
3. Ver por obra:
   - Receita (faturamento)
   - Custo (folha)
   - Lucro
   - Margem %

---

## 💡 DICAS IMPORTANTES

### 🟣 Campos Roxos = Você Preenche
Todo campo com fundo **roxo/purple** você precisa preencher manualmente:
- Salário Base
- Salário por Hora
- Vale Moradia
- IBF

### ⚙️ Resto = Automático
Todo o resto é calculado automaticamente pelo sistema:
- Horas × Valores
- CAS (6.5% e 15.5%)
- IGI (4.5%)
- Líquido a Pagar
- Custo Total Empresa

### 📊 Duas Etapas
1. **Encarregado:** Vê SÓ horas (sem dinheiro)
2. **Financeiro/Admin:** Vê valores calculados

### 💰 Folha ≠ Faturamento
- **Folha** = Custo (quanto PAGA)
- **Faturamento** = Receita (quanto COBRA)
- **Lucro** = Faturamento - Folha

### 🔢 Multiplicadores
- Hora Normal: 1.0×
- Hora Extra: 1.4× (40% a mais)
- Hora Noturna: 1.6× (60% a mais)

---

## ❓ PERGUNTAS FREQUENTES

### Como adicionar novo funcionário?
**Menu → Empleados → Nuevo Usuario → Preencher dados + campos roxos → Salvar**

### Onde vejo quanto vou lucrar?
**Menu → Dashboard Financiero → Escolher mês**

### Como pagar funcionário?
**Menu → Folha de Pagamento → Gerar do mês → Ver coluna "Líquido a Pagar"**

### Como cobrar cliente?
**Menu → Faturamento → Gerar do mês → Ver coluna "Total Fatura"**

### Posso mudar valores depois?
**Sim! Campos ROXOS podem ser editados. Resto é auto-calculado.**

### E se encarregado errou na aprovação?
**Admin pode reprovar e pedir ajuste**

### Quanto custa um funcionário?
**Folha → Coluna "Custo Total Empresa" (inclui salário + CAS 15.5%)**

---

## 🎯 RESUMO RÁPIDO

### Para Funcionário:
1. Login
2. Preencher Timesheet (quadradinhos)
3. Enviar para aprovação

### Para Encarregado:
1. Login
2. Aprovar apontamentos
3. Assinar

### Para Admin:
1. Configurar sistema (1x)
2. Cadastrar funcionários com dados roxos (1x)
3. Toda semana: Ver "Aprovados c/ Valores"
4. Todo mês: Gerar Folha + Faturamento
5. Ver lucro no Dashboard Financeiro

---

## 🚀 PRÓXIMO PASSO

1. ✅ Executar migration SQL
2. ✅ Configurar valores em Settings
3. ✅ Cadastrar funcionários com dados financeiros
4. ✅ Testar fluxo completo
5. ✅ Usar!

**Sistema pronto para uso!** 🎉
