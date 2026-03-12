<?php
$obraInfo = '';
if ($obra) {
    $obraInfo = ' de la obra *' . $obra['obra_numero'] . ' - ' . $obra['obra_nome'] . '*';
}

// Definir mensagens baseado no tipo
$mensagens = [
    'pendente' => [
        'titulo' => 'Registro de Horas Pendiente',
        'corpo' => 'No has registrado tus horas hoy' . str_replace('*', '', $obraInfo) . '. Por favor, marca tu punto.',
        'whatsapp' => "🕒 *Control de Horas - Registro Pendiente*\n\nHola *" . $funcionario['nome'] . "*,\n\nNo has registrado tus horas de trabajo hoy" . $obraInfo . ".\n\nPor favor, accede a la aplicación y marca tu punto lo antes posible.\n\n_Mensaje automático del sistema de control de horas._"
    ],
    'incompleto' => [
        'titulo' => 'Registro Incompleto',
        'corpo' => 'Tu registro de horas' . str_replace('*', '', $obraInfo) . ' está incompleto.',
        'whatsapp' => "⚠️ *Control de Horas - Registro Incompleto*\n\nHola *" . $funcionario['nome'] . "*,\n\nTu registro de horas" . $obraInfo . " está incompleto.\n\nPor favor, completa todos los campos y envía para aprobación.\n\n_Mensaje automático del sistema de control de horas._"
    ],
    'rejeitado' => [
        'titulo' => 'Registro Rechazado',
        'corpo' => 'Tu registro de horas' . str_replace('*', '', $obraInfo) . ' fue rechazado.',
        'whatsapp' => "❌ *Control de Horas - Registro Rechazado*\n\nHola *" . $funcionario['nome'] . "*,\n\nTu registro de horas" . $obraInfo . " fue rechazado.\n\nPor favor, revisa las observaciones del encargado y corrige la información.\n\n_Mensaje automático del sistema de control de horas._"
    ]
];
