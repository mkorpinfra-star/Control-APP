-- Migração para Dupla Aprovação
-- Execute no banco de dados do servidor

-- Adicionar colunas para a segunda aprovação (Admin/RH)
ALTER TABLE apontamentos 
ADD COLUMN IF NOT EXISTS aprovado_admin_em DATETIME NULL,
ADD COLUMN IF NOT EXISTS aprovado_admin_por INT NULL,
ADD COLUMN IF NOT EXISTS assinatura_admin_base64 LONGTEXT NULL;

-- Índice para melhor performance na busca por status
ALTER TABLE apontamentos 
ADD INDEX IF NOT EXISTS idx_status (status);

-- Opcional: Migrar registros antigos
-- Se houver registros com status 'aprovado' que foram aprovados antes desta mudança,
-- eles já estão "finalizados" e não precisam de segunda aprovação.
-- Novos registros seguirão o fluxo: enviado -> aprovado_encarregado -> aprovado
