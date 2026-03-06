# 🔴 CORREÇÃO TOTAL DO SISTEMA - URGENTE

**PROBLEMA: NADA ESTÁ FUNCIONANDO**

---

## 🚨 DIAGNÓSTICO DOS PROBLEMAS:

### 1. **Menu de obras abrindo para dentro (BaterPonto)**
**Sintoma:** Dropdown do select não aparece, fica cortado

**Causa:** `sticky top-0` no header cortando o dropdown

**Correção aplicada:**
- Mudado de `sticky top-0` para `relative`
- Select agora terá espaço para abrir

### 2. **Botão GUARDAR branco em Obras**
**Sintoma:** Botão invisível (branco no branco)

**Causa:** CSS sendo sobrescrito novamente

**Ação necessária:** Verificar TODAS as classes de botões

### 3. **Datas e informações não salvam em Obras**
**Sintoma:** Ao preencher data_inicio, data_fim, emails, não salva no banco

**Possível causa:**
- Coluna não existe no banco
- Backend não processa

**Ação necessária:** Comparar estrutura SQL com código backend

### 4. **Obras vinculadas não aparecem no painel do funcionário**
**Sintoma:** Vinculei funcionário à obra mas ele não vê no BaterPonto

**Possível causa:**
- Tabela `funcionario_obra` não tem registro
- Endpoint `assign-employees.php` com erro
- Endpoint `by-employee.php` não retorna dados

---

## ✅ PLANO DE CORREÇÃO (EM ORDEM):

### PASSO 1: VERIFICAR ESTRUTURA DO BANCO DE DADOS

Execute no phpMyAdmin:

```sql
-- Verificar se colunas existem em obras
DESCRIBE obras;

-- Verificar estrutura de funcionario_obra
DESCRIBE funcionario_obra;

-- Ver se tem registros em funcionario_obra
SELECT * FROM funcionario_obra;

-- Ver obras cadastradas
SELECT id, numero, nome, data_inicio, data_fim, email_financeiro, email_encarregado FROM obras;
```

**O QUE PROCURAR:**
- `obras` deve ter: `data_inicio`, `data_fim`, `email_financeiro`, `email_encarregado`
- `funcionario_obra` deve ter: `id`, `funcionario_id`, `obra_id`, `ativo`

**SE ALGUMA COLUNA FALTAR:**
```sql
-- Adicionar colunas faltantes em obras
ALTER TABLE obras ADD COLUMN data_inicio DATE NULL;
ALTER TABLE obras ADD COLUMN data_fim DATE NULL;
ALTER TABLE obras ADD COLUMN email_financeiro VARCHAR(255) NULL;
ALTER TABLE obras ADD COLUMN email_encarregado VARCHAR(255) NULL;
```

---

### PASSO 2: TESTAR VINCULAÇÃO MANUAL

Execute no phpMyAdmin para testar:

```sql
-- Vincular manualmente funcionário ID 2 à obra ID 1
INSERT INTO funcionario_obra (funcionario_id, obra_id, ativo, fecha_asignacion)
VALUES (2, 1, 1, NOW());

-- Verificar se inseriu
SELECT * FROM funcionario_obra WHERE funcionario_id = 2;
```

---

### PASSO 3: FAZER BUILD NOVO

```bash
npm run build
```

---

### PASSO 4: TESTAR FLUXO COMPLETO

#### A) Criar uma obra nova:
1. Ir em **Obras** → **Nueva Obra**
2. Preencher:
   - Número: TEST-001
   - Nome: Teste Sistema
   - Fecha Inicio: 2026-02-01
   - Fecha Fin: 2026-12-31
   - Email Financiero: test@j2s.com
   - Email Encargado: encarg@j2s.com
   - Selecionar um funcionário
3. Clicar **GUARDAR** (deve estar VERMELHO)
4. Verificar se salvou

#### B) Vincular funcionário:
1. Na obra criada, clicar no ícone **👥 PERSONAL**
2. Selecionar funcionário
3. Clicar **GUARDAR**
4. Verificar se salvou

#### C) Verificar no BaterPonto:
1. Fazer login como o funcionário vinculado
2. Ir em **Bater Ponto**
3. Clicar no dropdown de obras
4. **DEVE APARECER** a obra TEST-001

---

## 🔍 VERIFICAÇÃO DE ERROS

### Console do navegador (F12 → Console):
Procurar erros vermelhos tipo:
- `500 (Internal Server Error)`
- `Column not found`
- `Failed to fetch`

### Network (F12 → Network):
Ao salvar obra:
- Ver requisição POST para `/api/obras/create.php`
- Ver Response → se tem erro SQL

Ao vincular funcionário:
- Ver requisição POST para `/api/obras/assign-employees.php`
- Ver Response → deve ter `success: true`

Ao carregar obras no BaterPonto:
- Ver requisição GET para `/api/obras/by-employee.php`
- Ver Response → deve ter array `obras: [...]`

---

## 📋 CHECKLIST DE VERIFICAÇÃO:

- [ ] Executei `DESCRIBE obras` e vi que tem `data_inicio`, `data_fim`, `email_financeiro`, `email_encarregado`
- [ ] Executei `SELECT * FROM funcionario_obra` e vi registros
- [ ] Fiz build novo com `npm run build`
- [ ] Botão GUARDAR aparece VERMELHO em Obras
- [ ] Consegui criar obra TEST-001
- [ ] Data de início e fim salvaram
- [ ] Emails salvaram
- [ ] Consegui vincular funcionário
- [ ] Funcionário aparece no painel BaterPonto
- [ ] Dropdown de obras abre completamente (não corta)

---

## ❌ SE AINDA NÃO FUNCIONAR:

### Se botão GUARDAR continua branco:
1. Abrir DevTools (F12)
2. Ir na aba **Elements**
3. Clicar no botão GUARDAR
4. Ver quais classes CSS estão aplicadas
5. Procurar por classes que estejam sobrescrevendo `bg-j2s-red`
6. Me enviar print dessa informação

### Se datas não salvam:
1. Abrir DevTools → Network
2. Criar obra preenchendo datas
3. Clicar GUARDAR
4. Ver requisição `create.php`
5. Aba **Payload** → ver se `data_inicio` e `data_fim` estão sendo enviadas
6. Aba **Response** → copiar erro completo
7. Me enviar

### Se obras não aparecem no BaterPonto:
1. Fazer login como funcionário
2. Abrir DevTools → Network
3. Ir em Bater Ponto
4. Ver requisição `by-employee.php`
5. Aba **Response** → copiar JSON completo
6. Me enviar

---

## 🎯 RESULTADO ESPERADO:

Após seguir TODOS os passos:

✅ Botões VERMELHOS e visíveis
✅ Obras salvam com TODAS informações (datas, emails)
✅ Funcionários vinculados às obras
✅ Obras aparecem no dropdown do BaterPonto
✅ Dropdown abre completamente
✅ Menu hamburguer funciona (z-index correto)

---

## 🔄 DEPOIS DE TUDO ISSO:

Me envie:

1. **Resultado do DESCRIBE obras** (copiar tabela completa)
2. **Resultado do SELECT * FROM funcionario_obra** (primeiras 5 linhas)
3. **Print do botão GUARDAR** (mostrar que está vermelho)
4. **Print do dropdown de obras no BaterPonto** (aberto e funcionando)
5. **Qualquer erro que aparecer no console**

---

**NÃO PULE NENHUM PASSO!**

Siga exatamente nessa ordem. Cada passo depende do anterior.
