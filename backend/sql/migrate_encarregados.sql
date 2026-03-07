-- ========================================
-- MIGRAÇÃO: Mover encarregados de usuarios para tabela encarregados
-- ========================================

-- 1. Verificar encarregados já existentes (cadastrados manualmente)
SELECT 'Encarregados já existentes:' as info, COUNT(*) as total FROM encarregados;

-- 2. Inserir APENAS encarregados que NÃO existem ainda (evita erro de PRIMARY KEY duplicada)
-- ID será auto-incrementado (não usa ID de usuarios)
INSERT INTO encarregados (nome, email, telefone, passaporte, senha, ativo, criado_em)
SELECT
    u.nome,
    u.email,
    u.telefone,
    u.passaporte,
    u.senha_hash,
    u.ativo,
    u.criado_em
FROM usuarios u
WHERE u.tipo = 'encarregado'
  AND NOT EXISTS (
      SELECT 1 FROM encarregados e
      WHERE e.passaporte = u.passaporte
  );

-- 3. Atualizar obras.encarregado_id para apontar para o novo ID (se necessário)
-- ⚠️ ATENÇÃO: Só executar se houver obras vinculadas a encarregados antigos de usuarios
-- UPDATE obras o
-- INNER JOIN usuarios u ON u.id = o.encarregado_id AND u.tipo = 'encarregado'
-- INNER JOIN encarregados e ON e.passaporte = u.passaporte
-- SET o.encarregado_id = e.id;

-- 4. Verificar se migration funcionou
SELECT
    'usuarios com tipo=encarregado' as tabela,
    COUNT(*) as total
FROM usuarios
WHERE tipo = 'encarregado'
UNION ALL
SELECT
    'encarregados na nova tabela' as tabela,
    COUNT(*) as total
FROM encarregados;

-- 3. OPCIONAL: Deletar encarregados de usuarios (CUIDADO!)
-- Executar APENAS se confirmou que migration funcionou
-- DELETE FROM usuarios WHERE tipo = 'encarregado';

-- 4. OPCIONAL: Remover valor 'encarregado' da ENUM tipo (requer ALTER TABLE)
-- ALTER TABLE usuarios MODIFY COLUMN tipo ENUM('admin','funcionario') NOT NULL DEFAULT 'funcionario';
