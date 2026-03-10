-- =========================================
-- ADICIONAR tenant_id - VERSÃO SIMPLES
-- =========================================

-- 1. APONTAMENTOS
ALTER TABLE apontamentos
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_tenant_id (tenant_id),
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 2. CLIENTES
ALTER TABLE clientes
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_tenant_id (tenant_id),
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 3. CONFIG_FISCAL
ALTER TABLE config_fiscal
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_tenant_id (tenant_id),
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 4. CONFIG_IMPOSTOS
ALTER TABLE config_impostos
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_tenant_id (tenant_id),
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 5. CONFIG_VALORES
ALTER TABLE config_valores
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_tenant_id (tenant_id),
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 6. CONFIG_VALORES_FATURAMENTO
ALTER TABLE config_valores_faturamento
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_tenant_id (tenant_id),
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 7. CONFIGURACOES
ALTER TABLE configuracoes
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_tenant_id (tenant_id),
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 8. DESPESAS_INDIRETAS
ALTER TABLE despesas_indiretas
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_tenant_id (tenant_id),
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 9. ENCARREGADOS
ALTER TABLE encarregados
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_tenant_id (tenant_id),
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 10. FATURAMENTO
ALTER TABLE faturamento
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_tenant_id (tenant_id),
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 11. FOLHA_PAGAMENTO
ALTER TABLE folha_pagamento
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_tenant_id (tenant_id),
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 12. FUNCIONARIO_OBRA
ALTER TABLE funcionario_obra
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_tenant_id (tenant_id),
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 13. FUNCOES
ALTER TABLE funcoes
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_tenant_id (tenant_id),
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 14. NOTIFICACOES
ALTER TABLE notificacoes
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_tenant_id (tenant_id),
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 15. OBRA_FUNCIONARIOS
ALTER TABLE obra_funcionarios
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_tenant_id (tenant_id),
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 16. OBRAS
ALTER TABLE obras
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_tenant_id (tenant_id),
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 17. USUARIOS
ALTER TABLE usuarios
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_tenant_id (tenant_id),
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================
SELECT '✅ tenant_id adicionado em todas as tabelas!' as resultado;

SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME = 'tenant_id'
ORDER BY TABLE_NAME;
