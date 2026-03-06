-- ============================================
-- MIGRAÇÃO: PRESERVAR APONTAMENTOS PERMANENTEMENTE
-- Data: 2026-02-05
-- Objetivo: NUNCA apagar apontamentos históricos
-- ============================================

-- 1. REMOVER as foreign keys CASCADE que deletam apontamentos
ALTER TABLE `apontamentos` DROP FOREIGN KEY `apontamentos_ibfk_1`;
ALTER TABLE `apontamentos` DROP FOREIGN KEY `apontamentos_ibfk_2`;
ALTER TABLE `apontamentos` DROP FOREIGN KEY `apontamentos_ibfk_3`;

-- 2. RECRIAR as foreign keys com ON DELETE RESTRICT
-- Isso IMPEDE a deleção de funcionários/obras que têm apontamentos
ALTER TABLE `apontamentos`
    ADD CONSTRAINT `fk_apontamentos_funcionario`
    FOREIGN KEY (`funcionario_id`)
    REFERENCES `usuarios`(`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

ALTER TABLE `apontamentos`
    ADD CONSTRAINT `fk_apontamentos_obra`
    FOREIGN KEY (`obra_id`)
    REFERENCES `obras`(`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

ALTER TABLE `apontamentos`
    ADD CONSTRAINT `fk_apontamentos_aprovador`
    FOREIGN KEY (`aprovado_por`)
    REFERENCES `usuarios`(`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- 3. Adicionar campo deletado_em para soft delete (caso queiram "arquivar" visualmente)
ALTER TABLE `apontamentos`
    ADD COLUMN `deletado_em` DATETIME NULL DEFAULT NULL AFTER `atualizado_em`,
    ADD INDEX `idx_deletado` (`deletado_em`);

-- 4. Adicionar campos de snapshot para preservar dados mesmo se obra/funcionário mudarem
ALTER TABLE `apontamentos`
    ADD COLUMN `funcionario_nome_snapshot` VARCHAR(200) NULL AFTER `funcionario_id`,
    ADD COLUMN `funcionario_passaporte_snapshot` VARCHAR(50) NULL AFTER `funcionario_nome_snapshot`,
    ADD COLUMN `obra_nome_snapshot` VARCHAR(200) NULL AFTER `obra_id`,
    ADD COLUMN `obra_numero_snapshot` VARCHAR(50) NULL AFTER `obra_nome_snapshot`;

-- 5. Popular snapshots dos dados existentes
UPDATE `apontamentos` a
INNER JOIN `usuarios` u ON u.id = a.funcionario_id
SET a.funcionario_nome_snapshot = u.nome,
    a.funcionario_passaporte_snapshot = u.passaporte;

UPDATE `apontamentos` a
INNER JOIN `obras` o ON o.id = a.obra_id
SET a.obra_nome_snapshot = o.nome,
    a.obra_numero_snapshot = o.numero;

-- 6. GARANTIR que usuarios/obras NÃO podem ser deletados se tiverem apontamentos
-- Atualizar soft delete nos endpoints para verificar apontamentos primeiro

-- ============================================
-- VERIFICAÇÃO PÓS-MIGRAÇÃO
-- ============================================
-- Execute para confirmar as constraints:
-- SHOW CREATE TABLE apontamentos;

-- Para verificar se há apontamentos que seriam perdidos:
-- SELECT COUNT(*) as total_apontamentos FROM apontamentos;
-- SELECT COUNT(DISTINCT funcionario_id) as funcionarios_com_apontamentos FROM apontamentos;
-- SELECT COUNT(DISTINCT obra_id) as obras_com_apontamentos FROM apontamentos;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Apontamentos NUNCA são deletados fisicamente do banco
-- 2. Se precisar "deletar" visualmente, usar deletado_em (soft delete)
-- 3. Funcionários/Obras com apontamentos NÃO podem ser deletados (RESTRICT)
-- 4. Snapshots preservam dados históricos mesmo se nome/número mudarem
-- 5. Aprovador pode ser NULL se usuário for deletado (SET NULL)
