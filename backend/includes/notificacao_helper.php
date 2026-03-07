<?php
/**
 * Helper para criar notificações de forma simples
 * Usar em qualquer endpoint após criar/editar/aprovar/rejeitar entidades
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Cria uma notificação no sistema
 *
 * @param string $tipo Tipo da notificação (obra_criada, cliente_criado, apontamento_aprovado, etc)
 * @param string $titulo Título curto da notificação
 * @param string $mensagem Mensagem descritiva
 * @param array $options Opções adicionais: icone, cor, url, entidade_tipo, entidade_id, usuario_id, usuario_nome, usuario_tipo
 * @return bool True se criada com sucesso
 */
function criarNotificacao($tipo, $titulo, $mensagem, $options = []) {
    try {
        $pdo = getConnection();

        $sql = "INSERT INTO notificacoes (
            tipo, titulo, mensagem, icone, cor,
            url, entidade_tipo, entidade_id,
            usuario_id, usuario_nome, usuario_tipo
        ) VALUES (
            :tipo, :titulo, :mensagem, :icone, :cor,
            :url, :entidade_tipo, :entidade_id,
            :usuario_id, :usuario_nome, :usuario_tipo
        )";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'tipo' => $tipo,
            'titulo' => $titulo,
            'mensagem' => $mensagem,
            'icone' => $options['icone'] ?? 'bell',
            'cor' => $options['cor'] ?? 'gray',
            'url' => $options['url'] ?? null,
            'entidade_tipo' => $options['entidade_tipo'] ?? null,
            'entidade_id' => $options['entidade_id'] ?? null,
            'usuario_id' => $options['usuario_id'] ?? null,
            'usuario_nome' => $options['usuario_nome'] ?? null,
            'usuario_tipo' => $options['usuario_tipo'] ?? null
        ]);

        return true;
    } catch (Exception $e) {
        error_log("Erro ao criar notificação: " . $e->getMessage());
        return false;
    }
}

/**
 * Configurações padrão de ícones e cores por tipo
 */
function getNotificacaoConfig($tipo) {
    $configs = [
        // Obras
        'obra_criada' => ['icone' => 'briefcase', 'cor' => 'blue'],
        'obra_editada' => ['icone' => 'edit', 'cor' => 'orange'],
        'obra_finalizada' => ['icone' => 'check-circle', 'cor' => 'green'],

        // Clientes
        'cliente_criado' => ['icone' => 'building-2', 'cor' => 'blue'],
        'cliente_editado' => ['icone' => 'edit', 'cor' => 'orange'],

        // Funcionários
        'funcionario_criado' => ['icone' => 'user-plus', 'cor' => 'blue'],
        'funcionario_editado' => ['icone' => 'user', 'cor' => 'orange'],
        'funcionario_vinculado_obra' => ['icone' => 'user-check', 'cor' => 'green'],
        'funcionario_desvinculado_obra' => ['icone' => 'user-x', 'cor' => 'red'],

        // Encarregados
        'encarregado_criado' => ['icone' => 'shield-plus', 'cor' => 'blue'],
        'encarregado_editado' => ['icone' => 'shield', 'cor' => 'orange'],

        // Apontamentos
        'apontamento_submetido' => ['icone' => 'clock', 'cor' => 'blue'],
        'apontamento_aprovado' => ['icone' => 'check-circle', 'cor' => 'green'],
        'apontamento_rejeitado' => ['icone' => 'x-circle', 'cor' => 'red'],

        // Payroll e Billing
        'payroll_gerado' => ['icone' => 'dollar-sign', 'cor' => 'green'],
        'billing_gerado' => ['icone' => 'file-text', 'cor' => 'blue'],
    ];

    return $configs[$tipo] ?? ['icone' => 'bell', 'cor' => 'gray'];
}
