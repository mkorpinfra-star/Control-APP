# 📊 Sistema de Folha de Pagamento e Faturamento

## 🚀 Instalação

### 1. Executar Migration SQL

Execute o arquivo de migração no seu banco de dados MySQL:

```bash
mysql -u seu_usuario -p seu_banco_de_dados < backend/sql/migration_payroll_billing.sql
```

Ou via phpMyAdmin:
1. Abra phpMyAdmin
2. Selecione seu banco de dados
3. Vá em "SQL"
4. Cole o conteúdo de `backend/sql/migration_payroll_billing.sql`
5. Clique em "Executar"

### 2. O que a Migration faz:

✅ Adiciona campos financeiros na tabela `usuarios`:
   - `funcao` (pedreiro, eletricista, encanador, plaquista, lampista, outro)
   - `salario_base` (salário base do funcionário)
   - `salario_hora` (valor por hora)
   - `vale_moradia` (benefício)
   - `ibf` (benefício)

✅ Cria tabela `config_fiscal`:
   - CAS funcionário: 6.5%
   - CAS empresa: 15.5%
   - IGI: 4.5%
   - Multiplicadores: 1.4x (extra), 1.6x (noturna)

✅ Adiciona colunas em `apontamentos`:
   - `horas_normais`
   - `horas_extra`
   - `horas_noturna`

✅ Cria tabela `folha_pagamento`:
   - Armazena folha mensal por funcionário/obra
   - Colunas auto-calculadas (GENERATED):
     - Valores de horas (normal, extra, noturna)
     - CAS descontos
     - Líquido a pagar
     - Custo total empresa

✅ Cria tabela `config_valores_faturamento`:
   - Valores cobrados do cliente (diferentes da folha)
   - Padrão: €30/h normal, €42/h extra, €48/h noturna

✅ Cria tabela `faturamento`:
   - Faturas geradas por obra/mês
   - IGI calculado automaticamente (4.5%)
   - Total da fatura = Serviços + IGI

✅ Cria VIEW `vw_dashboard_financeiro_obra`:
   - Consolida receita vs custo por obra
   - Calcula lucro e margem automaticamente

## 🎯 Como Usar

### 1. Configurar Dados dos Funcionários

1. Vá em **Empleados** (menu lateral)
2. Edite cada funcionário
3. Preencha os campos roxos (destacados em purple):
   - **Función**: Selecione a função (Pedreiro, Eletricista, etc.)
   - **Salário Base**: Valor base mensal (ex: €1200)
   - **Salário/Hora**: Valor por hora (ex: €15)
   - **Vale Moradia**: Benefício moradia (ex: €200)
   - **IBF**: Outro benefício (ex: €50)

### 2. Gerar Folha de Pagamento Mensal

1. Vá em **Folha de Pagamento** (menu lateral)
2. Selecione o mês de referência
3. Clique em **"Generar Folha del Mes"**
4. O sistema irá:
   - Buscar todos apontamentos aprovados do mês
   - Calcular automaticamente:
     - Valor horas normais
     - Valor horas extra (×1.4)
     - Valor horas noturnas (×1.6)
     - CAS funcionário (-6.5%)
     - CAS empresa (+15.5%)
     - Líquido a pagar
5. Você pode editar manualmente os campos roxos se necessário

### 3. Gerar Faturamento Mensal

**IMPORTANTE**: Configure primeiro os valores de faturamento em Settings!

1. Vá em **Configuración → Valores de Faturamento**
2. Configure quanto cobra do cliente por hora:
   - Hora normal (ex: €30)
   - Hora extra (ex: €42)
   - Hora noturna (ex: €48)
3. Vá em **Faturamento** (menu lateral)
4. Selecione o mês
5. Clique em **"Generar Facturas del Mes"**
6. O sistema calcula:
   - Total de serviços (horas × valores)
   - IGI 4.5%
   - Total da fatura

### 4. Ver Dashboard Financiero

1. Vá em **Dashboard Financiero** (menu lateral)
2. Selecione o mês
3. Veja por obra:
   - 💰 **Receita**: O que vai receber do cliente (faturamento)
   - 💸 **Custo**: O que vai pagar aos funcionários (folha)
   - ✅ **Lucro**: Receita - Custo
   - 📊 **Margem**: Percentual de lucro

## 💡 Conceitos Importantes

### Folha de Pagamento ≠ Faturamento

- **Folha**: Quanto PAGAMOS aos funcionários (CUSTO)
- **Faturamento**: Quanto COBRAMOS do cliente (RECEITA)
- **Lucro**: Faturamento - Folha

### CAS (Caixa Andorrana de Seguridade Social)

- **6.5%**: Descontado do funcionário (dedução)
- **15.5%**: Custo adicional da empresa

### IGI (Imposto Geral Indiret)

- **4.5%**: Sobre o valor total de serviços facturados

### Multiplicadores de Horas

- **Normal**: 1.0× (valor hora base)
- **Extra**: 1.4× (40% adicional)
- **Noturna**: 1.6× (60% adicional)

## 📊 Fluxo Completo

1. ✅ **Funcionários** registram horas no Timesheet
2. ✅ **Supervisor** aprova as horas
3. ✅ **Admin** gera Folha de Pagamento do mês
4. ✅ **Admin** gera Faturamento do mês
5. ✅ **Admin** vê lucro no Dashboard Financeiro
6. ✅ **Admin** paga funcionários (líquido)
7. ✅ **Admin** cobra cliente (total fatura)

## 🎨 Campos Roxos = Manual

Sempre que ver campos com fundo **roxo/purple**, significa que você precisa preencher manualmente:

- Salários (base e hora)
- Benefícios (vale moradia, IBF)
- Valores de faturamento

Os demais campos são **calculados automaticamente** pelo sistema.

## ⚠️ Importante

- Execute a migration ANTES de usar o sistema
- Configure os valores de faturamento em Settings
- Preencha dados financeiros de todos funcionários
- Gere a folha DEPOIS de aprovar os apontamentos do mês
