# ⚠️ MIGRAÇÃO CRÍTICA - PRESERVAR DADOS HISTÓRICOS

## 🚨 ATENÇÃO: EXECUTAR ESTA MIGRAÇÃO IMEDIATAMENTE

Este sistema atualmente tem um **PROBLEMA CRÍTICO** que pode causar **PERDA PERMANENTE DE DADOS HISTÓRICOS**.

## Problema Identificado

As tabelas do banco de dados estão configuradas com `ON DELETE CASCADE`, o que significa:
- ❌ Se um funcionário for deletado → TODOS os apontamentos dele são APAGADOS
- ❌ Se uma obra for deletada → TODOS os apontamentos dela são APAGADOS
- ❌ Dados históricos são PERDIDOS PERMANENTEMENTE

## Solução Implementada

Foi criada uma migração SQL que:
- ✅ Remove as foreign keys perigosas (CASCADE)
- ✅ Cria novas foreign keys seguras (RESTRICT)
- ✅ Impede deleção de funcionários/obras com histórico
- ✅ Adiciona snapshots para preservar nomes/números históricos
- ✅ Adiciona soft delete para apontamentos (se necessário no futuro)

## Como Executar a Migração

### 1. Backup do Banco (OBRIGATÓRIO)
```bash
# Fazer backup ANTES de qualquer alteração
mysqldump -u seu_usuario -p nome_do_banco > backup_antes_migracao_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Conectar ao MySQL
```bash
mysql -u seu_usuario -p nome_do_banco
```

### 3. Executar a Migração
```sql
SOURCE /caminho/para/backend/sql/fix_preserve_apontamentos.sql;
```

OU copiar e colar o conteúdo do arquivo diretamente no console MySQL.

### 4. Verificar Sucesso
```sql
-- Ver as novas constraints
SHOW CREATE TABLE apontamentos;

-- Verificar totais
SELECT COUNT(*) as total_apontamentos FROM apontamentos;
SELECT COUNT(DISTINCT funcionario_id) as funcionarios_com_apontamentos FROM apontamentos;
SELECT COUNT(DISTINCT obra_id) as obras_com_apontamentos FROM apontamentos;
```

## Proteções Adicionais Implementadas

### Backend (Já Aplicado)
- ✅ `usuarios/delete.php` - Bloqueia desativação se tiver apontamentos
- ✅ `obras/delete.php` - Bloqueia desativação se tiver apontamentos
- ✅ Mensagens de erro explicativas para o usuário

### Database
- ✅ Foreign keys com `RESTRICT` impedem deleção acidental
- ✅ Snapshots preservam dados históricos mesmo se nomes mudarem
- ✅ Soft delete disponível para "arquivar" sem perder dados

## Garantias Após Migração

1. **Apontamentos são ETERNOS**
   - Nunca serão deletados do banco
   - Sempre acessíveis para relatórios históricos
   - Dados preservados mesmo que funcionário/obra mude de nome

2. **Funcionários/Obras Protegidos**
   - Não podem ser deletados se tiverem histórico
   - Sistema avisa que dados devem ser preservados
   - Apenas soft delete (desativar) é permitido para novos sem histórico

3. **Auditoria Completa**
   - `criado_em` - quando foi criado
   - `atualizado_em` - última modificação
   - `aprovado_em` - quando foi aprovado
   - `enviado_em` - quando foi enviado
   - Snapshots de nomes para comparação histórica

## Queries Úteis para Auditorias Futuras

### Ver todos apontamentos de 2024
```sql
SELECT * FROM apontamentos
WHERE YEAR(semana_inicio) = 2024
ORDER BY semana_inicio DESC;
```

### Total de horas por funcionário (histórico completo)
```sql
SELECT
    u.nome,
    u.passaporte,
    COUNT(*) as total_semanas,
    SUM(a.total_horas) as total_horas
FROM apontamentos a
INNER JOIN usuarios u ON u.id = a.funcionario_id
GROUP BY u.id
ORDER BY total_horas DESC;
```

### Total de horas por obra (histórico completo)
```sql
SELECT
    o.numero,
    o.nome,
    COUNT(*) as total_semanas,
    SUM(a.total_horas) as total_horas
FROM apontamentos a
INNER JOIN obras o ON o.id = a.obra_id
GROUP BY o.id
ORDER BY total_horas DESC;
```

### Apontamentos aprovados em um período
```sql
SELECT
    a.*,
    u.nome as funcionario,
    o.nome as obra
FROM apontamentos a
INNER JOIN usuarios u ON u.id = a.funcionario_id
INNER JOIN obras o ON o.id = a.obra_id
WHERE a.status = 'aprovado'
AND a.aprovado_em BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY a.aprovado_em DESC;
```

## Status Atual

- [ ] **PENDENTE**: Executar migração SQL no banco de dados de produção
- [x] **COMPLETO**: Backend protegido contra deleções acidentais
- [x] **COMPLETO**: Migração SQL criada e testada
- [x] **COMPLETO**: Documentação completa

## Contato para Suporte

Se tiver dúvidas sobre a execução da migração, consulte o desenvolvedor do sistema.

**Data deste documento**: 2026-02-05
**Arquivo de migração**: `backend/sql/fix_preserve_apontamentos.sql`
