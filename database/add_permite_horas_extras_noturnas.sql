-- Adicionar colunas para controlar quais tipos de horas são permitidos por obra
ALTER TABLE obras
ADD COLUMN permite_hora_extra TINYINT(1) DEFAULT 1 COMMENT 'Se a obra permite marcar horas extras',
ADD COLUMN permite_hora_noturna TINYINT(1) DEFAULT 1 COMMENT 'Se a obra permite marcar horas noturnas';

-- Atualizar obras existentes para permitir tudo (comportamento padrão)
UPDATE obras SET permite_hora_extra = 1, permite_hora_noturna = 1 WHERE permite_hora_extra IS NULL OR permite_hora_noturna IS NULL;
