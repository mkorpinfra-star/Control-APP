-- ========================================
-- TABELA: encarregados
-- Encarregados são gestores que aprovam apontamentos
-- Não entram na folha de pagamento (diferente de funcionários)
-- ========================================

CREATE TABLE IF NOT EXISTS `encarregados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(50) DEFAULT NULL,
  `passaporte` varchar(50) DEFAULT NULL,
  `senha` varchar(255) DEFAULT NULL COMMENT 'Hash da senha para login',
  `ativo` tinyint(1) DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ATUALIZAR TABELA obras
-- Adicionar referência a encarregados (se ainda usar usuario_id como encarregado)
-- ========================================

-- Verificar se coluna encarregado_id existe
ALTER TABLE `obras`
ADD COLUMN `encarregado_id` int(11) DEFAULT NULL COMMENT 'ID do encarregado responsável pela obra' AFTER `cliente_id`,
ADD KEY `idx_encarregado` (`encarregado_id`);

-- Caso queira manter compatibilidade com o antigo sistema:
-- Os encarregados que estão em usuarios podem ser migrados para a nova tabela

-- Exemplo de migração (executar apenas se necessário):
-- INSERT INTO encarregados (nome, email, telefone, passaporte, senha, ativo)
-- SELECT nome, email, telefone, passaporte, senha, ativo
-- FROM usuarios
-- WHERE tipo = 'encarregado' OR role = 'encargado';

-- ========================================
-- COMENTÁRIOS
-- ========================================
-- 1. Encarregados NÃO têm salário, vale moradia, IBF, etc
-- 2. Encarregados apenas aprovam apontamentos de obras vinculadas
-- 3. A tabela usuarios continua com funcionários e admin
-- 4. Para login, encarregados usam email/senha próprios
