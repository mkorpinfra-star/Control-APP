-- Tabela de configuração de valores por hora
-- Executar no banco de dados

CREATE TABLE IF NOT EXISTS config_valores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    valor_hora_normal DECIMAL(10,2) DEFAULT 21.00,
    valor_hora_extra DECIMAL(10,2) DEFAULT 28.00,
    valor_hora_noturna DECIMAL(10,2) DEFAULT 30.00,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir valores padrão (opcional)
INSERT INTO config_valores (valor_hora_normal, valor_hora_extra, valor_hora_noturna)
VALUES (21.00, 28.00, 30.00)
ON DUPLICATE KEY UPDATE id = id;
