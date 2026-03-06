-- Adicionar colunas de valores de faturamento individuais por funcionário
-- Estes valores serão usados para calcular o faturamento ao cliente
-- Se estiverem NULL, o sistema usará os valores globais de config_valores_faturamento

ALTER TABLE usuarios
ADD COLUMN valor_hora_normal_fatura DECIMAL(10,2) NULL DEFAULT NULL COMMENT 'Valor por hora normal para faturamento (cobrar ao cliente)',
ADD COLUMN valor_hora_extra_fatura DECIMAL(10,2) NULL DEFAULT NULL COMMENT 'Valor por hora extra para faturamento (cobrar ao cliente)',
ADD COLUMN valor_hora_noturna_fatura DECIMAL(10,2) NULL DEFAULT NULL COMMENT 'Valor por hora noturna para faturamento (cobrar ao cliente)';
