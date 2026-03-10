-- Tabela para tokens únicos de aprovação via WhatsApp
-- Permite que encarregado aprove sem login, apenas com link único

CREATE TABLE IF NOT EXISTS aprovacao_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(64) UNIQUE NOT NULL,
    apontamento_id INT NOT NULL,
    encarregado_id INT NOT NULL,
    tenant_id INT NOT NULL,
    usado TINYINT(1) DEFAULT 0,
    usado_em DATETIME NULL,
    expira_em DATETIME NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_token (token),
    INDEX idx_apontamento (apontamento_id),
    INDEX idx_encarregado (encarregado_id),
    INDEX idx_tenant (tenant_id),

    FOREIGN KEY (apontamento_id) REFERENCES apontamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES usuarios(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
