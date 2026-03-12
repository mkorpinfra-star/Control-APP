import { useState, useEffect } from 'react';
import { IconClock, IconAlertCircle, IconCheck, IconSend, IconBrandWhatsapp, IconBell, IconRefresh, IconSpeakerphone } from '@tabler/icons-react';

export default function Monitoramento() {
    const [apontamentos, setApontamentos] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [notifying, setNotifying] = useState(null);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [sendingBroadcast, setSendingBroadcast] = useState(false);

    useEffect(() => {
        loadMonitoramento();

        // Auto-refresh a cada 30 segundos
        if (autoRefresh) {
            const interval = setInterval(() => {
                loadMonitoramento();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const loadMonitoramento = async () => {
        try {
            setLoading(true);
            const res = await fetch('https://puntotouch.nextim.io/backend/api/monitoramento/real-time.php', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setApontamentos(data.apontamentos || []);
                setFuncionarios(data.funcionarios || []);
            }
        } catch (err) {
            console.error('Erro ao carregar monitoramento:', err);
        } finally {
            setLoading(false);
        }
    };

    const notificarFuncionario = async (funcionarioId, tipo) => {
        try {
            setNotifying(funcionarioId);

            const res = await fetch('https://puntotouch.nextim.io/backend/api/monitoramento/notify.php', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    funcionario_id: funcionarioId,
                    tipo: tipo
                })
            });

            const data = await res.json();

            if (data.success) {
                alert('Notificações enviadas com sucesso! (Push, In-App e WhatsApp)');
                loadMonitoramento();
            } else {
                alert('Erro ao enviar notificações: ' + (data.message || 'Erro desconhecido'));
            }
        } catch (err) {
            console.error('Erro ao notificar:', err);
            alert('Erro ao enviar notificações');
        } finally {
            setNotifying(null);
        }
    };

    const enviarBroadcast = async () => {
        if (!broadcastMessage.trim()) {
            alert('Digite uma mensagem antes de enviar');
            return;
        }
        if (!confirm('Enviar notificação para TODOS os usuários (Admins, Encargados e Empleados)?')) {
            return;
        }
        try {
            setSendingBroadcast(true);
            const res = await fetch('https://puntotouch.nextim.io/backend/api/monitoramento/broadcast.php', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mensagem: broadcastMessage })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Notificação enviada com sucesso para ${data.total_enviados} usuários!`);
                setBroadcastMessage('');
            } else {
                alert('Erro ao enviar broadcast: ' + (data.message || 'Erro desconhecido'));
            }
        } catch (err) {
            console.error('Erro ao enviar broadcast:', err);
            alert('Erro ao enviar broadcast');
        } finally {
            setSendingBroadcast(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'aprovado': return 'bg-green-100 text-green-700 border-green-300';
            case 'enviado': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'rascunho': return 'bg-gray-100 text-gray-700 border-gray-300';
            case 'rejeitado': return 'bg-red-100 text-red-700 border-red-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'aprovado': return 'Aprobado';
            case 'enviado': return 'Enviado';
            case 'rascunho': return 'Borrador';
            case 'rejeitado': return 'Rechazado';
            default: return status;
        }
    };

    // Calcular estatísticas
    const stats = {
        total: apontamentos.length,
        enviados: apontamentos.filter(a => a.status === 'enviado').length,
        aprovados: apontamentos.filter(a => a.status === 'aprovado').length,
        pendentes: apontamentos.filter(a => a.status === 'rascunho').length,
        rejeitados: apontamentos.filter(a => a.status === 'rejeitado').length,
        funcionariosAtivos: funcionarios.length,
        funcionariosPendentes: funcionarios.filter(f => !f.apontamento_hoje).length
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Stats Cards - Compactas */}
            <div className="shrink-0 bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => loadMonitoramento()}
                            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                            title="Actualizar"
                        >
                            <IconRefresh size={18} stroke={2} className={loading ? 'animate-spin text-red-600' : 'text-gray-700'} />
                        </button>
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="w-4 h-4 accent-red-600"
                            />
                            <span>Auto (30s)</span>
                        </label>
                    </div>
                    <span className="text-xs text-gray-500">{new Date().toLocaleTimeString('es-ES')}</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-600 mb-0.5">Total</div>
                        <div className="text-lg font-bold text-gray-900">{stats.total}</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <div className="text-xs text-blue-700 mb-0.5">Enviados</div>
                        <div className="text-lg font-bold text-blue-700">{stats.enviados}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                        <div className="text-xs text-green-700 mb-0.5">Aprobados</div>
                        <div className="text-lg font-bold text-green-700">{stats.aprovados}</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-2 text-center">
                        <div className="text-xs text-yellow-700 mb-0.5">Pendientes</div>
                        <div className="text-lg font-bold text-yellow-700">{stats.pendentes}</div>
                    </div>
                </div>
            </div>

            {/* Lista de Apontamentos em Tempo Real */}
            <div className="flex-1 overflow-y-auto p-4 pb-20">
                {loading && apontamentos.length === 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="skeleton h-24 rounded-xl"></div>
                        ))}
                    </div>
                ) : apontamentos.length === 0 ? (
                    <div className="bg-gray-50 rounded-2xl p-12 text-center">
                        <IconClock size={48} className="mx-auto text-gray-400 mb-3" stroke={1} />
                        <p className="text-gray-600">No hay registros de horas esta semana</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {apontamentos.map((apt) => (
                            <div key={apt.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900">{apt.funcionario_nome}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getStatusColor(apt.status)}`}>
                                                {getStatusLabel(apt.status)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700">{apt.obra_nome}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Semana: {new Date(apt.semana_inicio).toLocaleDateString('es-ES')}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-red-600">{apt.total_horas}h</div>
                                        <div className="text-xs text-gray-700 mt-1 space-y-0.5">
                                            {apt.horas_normais > 0 && <div>N: {apt.horas_normais}h</div>}
                                            {apt.horas_extra > 0 && <div className="text-blue-700">E: {apt.horas_extra}h</div>}
                                            {apt.horas_noturna > 0 && <div className="text-purple-700">Not: {apt.horas_noturna}h</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Ações */}
                                {apt.status === 'rascunho' && (
                                    <div className="pt-3 border-t border-gray-200 flex gap-2">
                                        <button
                                            onClick={() => notificarFuncionario(apt.funcionario_id, 'incompleto')}
                                            disabled={notifying === apt.funcionario_id}
                                            className="flex-1 h-9 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                                        >
                                            {notifying === apt.funcionario_id ? (
                                                'Enviando...'
                                            ) : (
                                                <>
                                                    <IconBell size={16} />
                                                    <span>Notificar</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => window.open(`https://wa.me/${apt.funcionario_telefone}?text=Hola ${apt.funcionario_nome}, tienes un registro de horas incompleto. Por favor, completa y envía tus horas.`, '_blank')}
                                            className="h-9 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                                        >
                                            <IconBrandWhatsapp size={16} />
                                        </button>
                                    </div>
                                )}

                                {apt.status === 'rejeitado' && apt.observacao_rejeicao && (
                                    <div className="pt-3 border-t border-gray-200">
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-800 font-medium">
                                            <strong>Motivo:</strong> {apt.observacao_rejeicao}
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                            <button
                                                onClick={() => notificarFuncionario(apt.funcionario_id, 'rejeitado')}
                                                disabled={notifying === apt.funcionario_id}
                                                className="flex-1 h-8 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-xs font-medium"
                                            >
                                                {notifying === apt.funcionario_id ? 'Enviando...' : 'Notificar Rechazo'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Funcionários sem apontamento hoje */}
                {funcionarios.filter(f => !f.apontamento_hoje).length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <IconAlertCircle className="text-yellow-600" size={20} />
                            Empleados sin registro hoy ({stats.funcionariosPendentes})
                        </h2>
                        <div className="space-y-2">
                            {funcionarios.filter(f => !f.apontamento_hoje).map((func) => (
                                <div key={func.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{func.nome}</h3>
                                        <p className="text-sm text-gray-700">{func.obra_nome || 'Sin obra asignada'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => notificarFuncionario(func.id, 'pendente')}
                                            disabled={notifying === func.id}
                                            className="h-9 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                                        >
                                            <IconBell size={16} />
                                            {notifying === func.id ? 'Enviando...' : 'Notificar'}
                                        </button>
                                        <button
                                            onClick={() => window.open(`https://wa.me/${func.telefone}?text=Hola ${func.nome}, no has registrado tus horas hoy. Por favor, marca tu punto.`, '_blank')}
                                            className="h-9 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                                        >
                                            <IconBrandWhatsapp size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* BROADCAST - Enviar notificação para todos */}
                <div className="mt-8 pt-6 border-t-2 border-gray-300">
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                                <IconSpeakerphone size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Enviar Aviso General</h2>
                                <p className="text-sm text-gray-600">Notificación para todos (Admins, Encargados y Empleados)</p>
                            </div>
                        </div>

                        <textarea
                            value={broadcastMessage}
                            onChange={(e) => setBroadcastMessage(e.target.value)}
                            placeholder="Escriba el mensaje que desea enviar a todos los usuarios..."
                            className="w-full h-24 px-4 py-3 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:border-red-500 text-sm"
                            disabled={sendingBroadcast}
                        />

                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-xs text-gray-600">
                                <strong>Importante:</strong> Este mensaje será enviado como notificación push a todos los usuarios activos.
                            </p>
                            <button
                                onClick={enviarBroadcast}
                                disabled={sendingBroadcast || !broadcastMessage.trim()}
                                className="h-11 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                            >
                                {sendingBroadcast ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Enviando...</span>
                                    </>
                                ) : (
                                    <>
                                        <IconSend size={18} />
                                        <span>Enviar a Todos</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
