-- ============================================
-- MIGRAÇÃO: Adiciona email_financeiro ao cliente
-- Execute no phpMyAdmin
-- ============================================

-- Adiciona campo email_financeiro ao cliente (para onde vai o relatório aprovado)
ALTER TABLE `clientes` 
ADD COLUMN `email_financeiro` VARCHAR(200) AFTER `email`;

-- Copia o email normal para financeiro como padrão
UPDATE `clientes` SET `email_financeiro` = `email` WHERE `email_financeiro` IS NULL;

-- Atualiza cliente de teste
UPDATE `clientes` SET `email_financeiro` = 'contactes@j2s.ad' WHERE id = 1;
