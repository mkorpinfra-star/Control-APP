-- Tabela de Notificações In-App
CREATE TABLE IF NOT EXISTS `notificacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `tipo` enum('pendente','incompleto','rejeitado','aprovado','geral') NOT NULL DEFAULT 'geral',
  `titulo` varchar(255) NOT NULL,
  `mensagem` text NOT NULL,
  `lida` tinyint(1) NOT NULL DEFAULT 0,
  `lida_em` datetime DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario_lida` (`usuario_id`,`lida`),
  KEY `idx_tenant` (`tenant_id`),
  KEY `idx_criado_em` (`criado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adicionar coluna fcm_token na tabela usuarios (para Push Notifications)
ALTER TABLE `usuarios`
ADD COLUMN `fcm_token` varchar(255) DEFAULT NULL COMMENT 'Firebase Cloud Messaging token para push notifications' AFTER `foto_url`;

-- Criar índice para fcm_token
CREATE INDEX `idx_fcm_token` ON `usuarios` (`fcm_token`);
