-- Adicionar campo valor_hora_venda na tabela usuarios
-- Execute no phpMyAdmin

ALTER TABLE `usuarios` ADD COLUMN `valor_hora_venda` DECIMAL(10,2) DEFAULT 24.00 COMMENT 'Valor cobrado do cliente por hora deste funcionário';

-- Atualizar funcionários existentes com valor padrão
UPDATE `usuarios` SET `valor_hora_venda` = 24.00 WHERE `tipo` = 'funcionario' AND `valor_hora_venda` IS NULL;
