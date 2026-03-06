-- Adicionar campos de data em OBRAS
-- Execute no phpMyAdmin
-- Ignore se as colunas já existirem

ALTER TABLE `obras` ADD COLUMN `data_inicio` date NULL;
ALTER TABLE `obras` ADD COLUMN `data_fim` date NULL;
