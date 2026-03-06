# 🔧 CORREÇÃO: Impostos Duplicados no Settings

## Problema Identificado

Os impostos estão aparecendo duplicados/triplicados na página Settings porque o arquivo de migração SQL foi executado múltiplas vezes no banco de dados.

### Sintoma Visual
![Print mostrando IGI, CAS Funcionário e CAS Empresa repetidos 3-4 vezes](screenshot_impostos_duplicados.png)

---

## ✅ Solução Rápida (Execute no phpMyAdmin)

### 1. Deletar Duplicados

Execute o arquivo:
```
backend/sql/fix_impostos_duplicados.sql
```

Ou copie e execute este SQL diretamente:

```sql
-- Deletar impostos duplicados, mantendo apenas 1 de cada
DELETE t1 FROM config_impostos t1
INNER JOIN config_impostos t2 
WHERE t1.id > t2.id 
  AND t1.imposto_nome = t2.imposto_nome 
  AND t1.aplicado_em = t2.aplicado_em;

-- Verificar resultado (deve ter apenas 3 linhas)
SELECT * FROM config_impostos ORDER BY id;
```

### 2. Resultado Esperado

Após executar, você deve ter **APENAS 3 registros**:

| ID | Imposto Nome      | Percentual | Aplicado Em        | Ativo |
|----|-------------------|------------|--------------------|-------|
| 1  | IGI               | 4.50       | faturamento        | 1     |
| 2  | CAS Funcionário   | 6.50       | folha_funcionario  | 1     |
| 3  | CAS Empresa       | 15.50      | folha_empresa      | 1     |

### 3. Adicionar Constraint UNIQUE (Prevenir Futuros Duplicados)

```sql
ALTER TABLE config_impostos 
ADD UNIQUE KEY `unique_imposto` (`imposto_nome`, `aplicado_em`);
```

Isso garante que **nunca** mais será possível inserir impostos duplicados.

---

## 🛡️ Prevenção Automática

O arquivo `FASE_1_MIGRATIONS_v4_SIMPLES.sql` foi atualizado com:

1. **UNIQUE KEY** na tabela para prevenir duplicados
2. **INSERT IGNORE** ao invés de INSERT comum
3. Remoção do `ON DUPLICATE KEY UPDATE`

Agora, mesmo que você execute a migração 100 vezes, nunca criará duplicados!

---

## 📋 Checklist de Verificação

- [ ] Executei o SQL de limpeza no phpMyAdmin
- [ ] Verifiquei que tenho apenas 3 impostos na tabela
- [ ] Adicionei a constraint UNIQUE
- [ ] Recarreguei a página Settings e os impostos aparecem corretamente (1x cada)

---

**Data:** 2026-02-06  
**Arquivos Modificados:**
- `backend/sql/fix_impostos_duplicados.sql` (NOVO)
- `FASE_1_MIGRATIONS_v4_SIMPLES.sql` (CORRIGIDO)
