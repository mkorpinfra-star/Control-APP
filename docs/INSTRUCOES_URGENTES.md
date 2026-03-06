# 🚨 INSTRUÇÕES URGENTES - EXECUTAR AGORA

## ⚠️ PROBLEMAS IDENTIFICADOS

Você está com 3 erros críticos causados por **colunas faltantes no banco de dados**:

1. ❌ **Erro ao editar usuário:** `Column not found: 'biometria' in 'SET'`
2. ❌ **Erro ao gerar faturas:** `Column not found: 'total_horas' in 'SET'`
3. ❌ **Analytics retornando 500:** Faltam colunas de horas

---

## ✅ SOLUÇÃO: EXECUTAR SQL NO PHPMYADMIN

### PASSO 1: Abrir phpMyAdmin
1. Acesse o cPanel da Hostinger
2. Clique em **phpMyAdmin**
3. Selecione o banco de dados: **u268549871_saas**

### PASSO 2: Executar o SQL

1. Clique na aba **SQL** (no topo)
2. **COPIE E COLE** todo o código abaixo:

```sql
-- ============================================
-- FIX URGENT - ADICIONAR COLUNAS FALTANTES
-- ============================================

-- 1. ADD COLUNA BIOMETRIA EM USUARIOS
ALTER TABLE `usuarios`
ADD COLUMN `biometria` TINYINT(1) DEFAULT 0 COMMENT 'Se tem biometria cadastrada';

-- 2. ADD COLUNAS DE HORAS EM APONTAMENTOS
ALTER TABLE `apontamentos`
ADD COLUMN `horas_normais` DECIMAL(10,2) DEFAULT 0 COMMENT 'Horas normais (8-17h)',
ADD COLUMN `horas_extra` DECIMAL(10,2) DEFAULT 0 COMMENT 'Horas extras (17-22h)',
ADD COLUMN `horas_noturna` DECIMAL(10,2) DEFAULT 0 COMMENT 'Horas noturnas (22-6h)',
ADD COLUMN `total_horas` DECIMAL(10,2) DEFAULT 0 COMMENT 'Total de horas';

-- 3. ADD COLUNA TOTAL_HORAS EM FATURAMENTO
ALTER TABLE `faturamento`
ADD COLUMN `total_horas` DECIMAL(10,2) DEFAULT 0 COMMENT 'Total de horas faturadas';

-- 4. ATUALIZAR VALORES NULL
UPDATE `usuarios` SET `biometria` = 0 WHERE `biometria` IS NULL;
```

3. Clique no botão **Executar** (ou **Go**)

### PASSO 3: Verificar se funcionou

Execute este SQL para verificar:

```sql
-- Verificar estrutura das tabelas
SHOW COLUMNS FROM usuarios LIKE 'biometria';
SHOW COLUMNS FROM apontamentos LIKE 'total_horas';
SHOW COLUMNS FROM faturamento LIKE 'total_horas';
```

**Resultado esperado:** Deve mostrar as colunas criadas.

---

## 📋 O QUE FOI CORRIGIDO NO CÓDIGO

### 1. ✅ Botões Brancos → Vermelhos
- **Arquivo:** `src/components/ui/Button.jsx`
- **Fix:** Adicionado `!important` para forçar cor vermelha nos botões "Guardar"
- **Status:** ✅ Corrigido e build feito

### 2. ✅ Erro ao gerar faturas
- **Arquivo:** `backend/api/billing/generate-monthly.php`
- **Fix:** Código agora verifica se coluna `total_horas` existe antes de usar
- **Status:** ✅ Corrigido - funcionará MESMO sem executar SQL (mas execute o SQL para dados completos)

### 3. ✅ Cálculo de horas nos apontamentos
- **Arquivo:** `backend/api/apontamentos/save.php`
- **Fix:** Agora calcula e salva `horas_normais`, `horas_extra`, `horas_noturna`, `total_horas`
- **Status:** ✅ Corrigido - novos apontamentos terão dados corretos

### 4. ✅ Analytics 500 errors
- **Arquivo:** `backend/api/analytics/insights.php`
- **Fix:** Retorna sempre JSON válido, mesmo com erro
- **Status:** ✅ Parcialmente corrigido - melhorará após executar SQL

---

## 🧪 TESTE APÓS EXECUTAR O SQL

### Teste 1: Editar Usuário
1. Vá em **Empleados**
2. Clique em **Editar** em qualquer usuário
3. Preencha o **Salario Mensal Base** (ex: 2000)
4. Clique em **Guardar** (deve estar vermelho agora!)
5. **✅ Deve salvar SEM ERRO**

### Teste 2: Gerar Faturas
1. Vá em **Facturación**
2. Selecione o mês atual
3. Clique em **Generar Facturas**
4. **✅ Deve gerar SEM ERRO**

### Teste 3: Analytics
1. Vá em **Analytics Advanced**
2. **✅ Deve carregar os gráficos sem erro 500**

### Teste 4: Botões Vermelhos
1. Vá em **Obras**, **Clientes**, **Empleados**
2. Clique em **Editar** em qualquer item
3. **✅ Botão "Guardar" deve estar VERMELHO, não branco**

---

## ❓ SE DER ERRO AO EXECUTAR O SQL

### Erro: "Duplicate column name 'biometria'"
**Solução:** Coluna já existe, ignore este erro. Prossiga.

### Erro: "Table 'usuarios' doesn't exist"
**Solução:** Você está no banco de dados errado. Selecione **u268549871_saas**.

### Erro: "Access denied"
**Solução:** Usuário sem permissão. Use o usuário **u268549871_saas** com a senha do banco.

---

## 🔧 ARQUIVOS MODIFICADOS (JÁ NO BUILD)

1. ✅ `src/components/ui/Button.jsx` - Botões vermelhos
2. ✅ `backend/api/billing/generate-monthly.php` - Proteção contra coluna faltante
3. ✅ `backend/api/apontamentos/save.php` - Cálculo de horas
4. ✅ `backend/api/apontamentos/submit.php` - Validações
5. ✅ `backend/api/analytics/insights.php` - JSON sempre válido

---

## 📞 PRÓXIMOS PASSOS

1. **AGORA:** Execute o SQL no phpMyAdmin
2. **DEPOIS:** Teste todos os 4 itens acima
3. **CONFIRME:** Me avise quais erros sumiram
4. **SE TIVER MAIS ERROS:** Envie print e mensagem exata do erro

---

## 📊 STATUS GERAL DO SISTEMA

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Login | ✅ OK | Funcionando |
| Bater Ponto | ✅ OK | Interface mobile nova |
| Aprobar Horas | ✅ OK | Assinatura funcionando |
| Empleados | ⚠️ AGUARDANDO | Executar SQL para editar |
| Obras | ✅ OK | |
| Clientes | ✅ OK | |
| Facturación | ⚠️ AGUARDANDO | Executar SQL para gerar |
| Analytics | ⚠️ AGUARDANDO | Executar SQL |
| Email Relatórios | ✅ OK | Valores individuais corretos |
| Botões Vermelhos | ✅ OK | Corrigido no build |

---

## ⏱️ TEMPO ESTIMADO

- **Executar SQL:** 2 minutos
- **Testar tudo:** 5 minutos
- **TOTAL:** 7 minutos

---

**IMPORTANTE:** Após executar o SQL, **TODOS os erros devem desaparecer**. Se algum persistir, me avise imediatamente com o erro exato.
