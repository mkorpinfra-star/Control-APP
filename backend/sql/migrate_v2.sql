-- =============================================
-- MIGRAÇÃO v2 - J2S Sistema de Controle Horário
-- IGNORE OS ERROS "Coluna duplicada" - significa que já existe!
-- =============================================

-- 1. Modificar tipo para incluir admin (EXECUTE ISSO PRIMEIRO!)
ALTER TABLE usuarios MODIFY COLUMN tipo ENUM('funcionario', 'encarregado', 'admin') DEFAULT 'funcionario';

-- 2. Criar tabela obra_funcionarios se não existir
CREATE TABLE IF NOT EXISTS obra_funcionarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    obra_id INT NOT NULL,
    funcionario_id INT NOT NULL,
    UNIQUE KEY unique_obra_funcionario (obra_id, funcionario_id)
);

-- 3. Criar ou atualizar usuário admin (EXECUTE SEPARADO)
INSERT INTO usuarios (passaporte, senha_hash, nome, email, tipo, ativo)
VALUES ('ADMIN', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin@j2s.ad', 'admin', 1)
ON DUPLICATE KEY UPDATE tipo = 'admin';

-- SE JÁ EXISTE UM ADMIN, use este comando para atualizar:
-- UPDATE usuarios SET tipo = 'admin' WHERE passaporte = 'ADMIN';
