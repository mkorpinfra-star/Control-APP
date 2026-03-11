import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import SignatureCanvas from 'react-signature-canvas'
import { IconCheck, IconX, IconClock, IconRefresh } from '@tabler/icons-react'

const API_URL = 'https://puntoclicks.com/backend/api'

export default function ApprovePublic() {
    const { token } = useParams()
    const [loading, setLoading] = useState(true)
    const [apontamento, setApontamento] = useState(null)
    const [encarregado, setEncarregado] = useState(null)
    const [error, setError] = useState(null)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [observacao, setObservacao] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [confirmado, setConfirmado] = useState(false)
    const [showAlertModal, setShowAlertModal] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const sigCanvas = useRef()

    useEffect(() => {
        loadData()
    }, [token])

    async function loadData() {
        try {
            const res = await fetch(`${API_URL}/apontamentos/approve-by-token.php?token=${token}`)
            const data = await res.json()

            if (!res.ok || !data.success) {
                setError(data.error || 'Token inválido')
                setLoading(false)
                return
            }

            setApontamento(data.apontamento)
            setEncarregado(data.encarregado)
            setLoading(false)
        } catch (err) {
            setError('Error al cargar datos')
            setLoading(false)
        }
    }

    async function handleApprove() {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            setAlertMessage('Por favor, firme antes de aprobar')
            setShowAlertModal(true)
            return
        }

        if (!confirmado) {
            setAlertMessage('Por favor, confirme que revisó las horas antes de aprobar')
            setShowAlertModal(true)
            return
        }

        const assinatura = sigCanvas.current.toDataURL()

        setSubmitting(true)
        try {
            const res = await fetch(`${API_URL}/apontamentos/approve-by-token.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    acao: 'aprovar',
                    assinatura
                })
            })

            const data = await res.json()

            if (data.success) {
                setSuccess(true)
            } else {
                alert(data.error || 'Error al aprobar')
            }
        } catch (err) {
            alert('Error al aprobar')
        } finally {
            setSubmitting(false)
        }
    }

    async function handleReject() {
        if (!observacao.trim()) {
            setAlertMessage('Por favor, indique el motivo del rechazo')
            setShowAlertModal(true)
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch(`${API_URL}/apontamentos/approve-by-token.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    acao: 'rejeitar',
                    observacao
                })
            })

            const data = await res.json()

            if (data.success) {
                setSuccess(true)
            } else {
                alert(data.error || 'Error al rechazar')
            }
        } catch (err) {
            alert('Error al rechazar')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconX className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Enlace inválido</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Listo!</h1>
                    <p className="text-gray-600">El registro ha sido procesado correctamente.</p>
                </div>
            </div>
        )
    }

    const DIAS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const DIAS_NOME = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <IconClock className="w-8 h-8" />
                            <h1 className="text-2xl font-bold">Aprobación de Horas</h1>
                        </div>
                        <p className="text-red-100">Revise y apruebe el registro de horas</p>
                    </div>

                    {/* Dados do Funcionário */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-4 mb-4">
                            {apontamento.funcionario_foto ? (
                                <img
                                    src={apontamento.funcionario_foto}
                                    alt={apontamento.funcionario_nome}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold text-xl">
                                    {apontamento.funcionario_nome?.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{apontamento.funcionario_nome}</h2>
                                <p className="text-sm text-gray-600">Passaporte: {apontamento.funcionario_passaporte}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Obra</p>
                                <p className="font-semibold text-gray-900">{apontamento.obra_numero}</p>
                                <p className="text-sm text-gray-600">{apontamento.obra_nome}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Semana</p>
                                <p className="font-semibold text-gray-900">
                                    {new Date(apontamento.semana_inicio).toLocaleDateString('es-ES')} - {new Date(new Date(apontamento.semana_inicio).setDate(new Date(apontamento.semana_inicio).getDate() + 5)).toLocaleDateString('es-ES')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Horas por Dia */}
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-4">Horas registradas</h3>

                        {/* Cabeçalho da tabela */}
                        <div className="flex justify-between items-center pb-2 border-b-2 border-gray-300 mb-2">
                            <span className="font-semibold text-gray-700 w-16">Día</span>
                            <div className="flex gap-6 text-sm font-semibold">
                                <span className="text-gray-600 w-12 text-center">N:</span>
                                <span className="text-orange-600 w-12 text-center">E:</span>
                                <span className="text-blue-600 w-12 text-center">Nc:</span>
                                <span className="text-gray-900 w-16 text-right">Total</span>
                            </div>
                        </div>

                        {/* Linhas de dados */}
                        <div className="space-y-2">
                            {DIAS.map((dia, idx) => {
                                const horasDia = apontamento.horas_diarias?.[dia]
                                if (!horasDia || (horasDia.normal === 0 && horasDia.extra === 0 && horasDia.noturna === 0)) return null

                                const totalDia = (horasDia.normal || 0) + (horasDia.extra || 0) + (horasDia.noturna || 0)

                                return (
                                    <div key={dia} className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="font-medium text-gray-700 w-16">{DIAS_NOME[idx]}</span>
                                        <div className="flex gap-6 text-sm items-center">
                                            <span className="text-gray-600 w-12 text-center">{horasDia.normal > 0 ? `${horasDia.normal}h` : '-'}</span>
                                            <span className="text-orange-600 w-12 text-center">{horasDia.extra > 0 ? `${horasDia.extra}h` : '-'}</span>
                                            <span className="text-blue-600 w-12 text-center">{horasDia.noturna > 0 ? `${horasDia.noturna}h` : '-'}</span>
                                            <span className="font-bold text-gray-900 w-16 text-right">{totalDia}h</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t-2 border-gray-300 flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">TOTAL SEMANA</span>
                            <span className="text-2xl font-bold text-red-600">{apontamento.total_horas}h</span>
                        </div>
                    </div>

                    {/* Assinatura */}
                    <div className="p-6">
                        <h3 className="font-bold text-gray-900 mb-3">Firma del encargado</h3>
                        <div className="border-2 border-gray-300 rounded-lg overflow-hidden mb-3">
                            <SignatureCanvas
                                ref={sigCanvas}
                                canvasProps={{
                                    className: 'w-full h-40 bg-white touch-none'
                                }}
                            />
                        </div>
                        <button
                            onClick={() => sigCanvas.current?.clear()}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                            <IconRefresh className="w-4 h-4" />
                            Limpiar firma
                        </button>

                        {/* Checkbox de Confirmação */}
                        <div className="mt-4 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <input
                                type="checkbox"
                                id="confirmCheckbox"
                                checked={confirmado}
                                onChange={(e) => setConfirmado(e.target.checked)}
                                className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                            <label htmlFor="confirmCheckbox" className="text-sm text-gray-900 cursor-pointer">
                                <span className="font-semibold">Confirmo que analicé las horas</span> y estoy plenamente de acuerdo con el registro presentado. Verifico que todos los datos son correctos antes de aprobar.
                            </label>
                        </div>
                    </div>

                    {/* Botões */}
                    <div className="p-6 bg-gray-50 flex gap-3">
                        <button
                            onClick={() => setShowRejectModal(true)}
                            disabled={submitting}
                            className="flex-1 py-3 px-4 bg-white border-2 border-red-600 text-red-600 rounded-xl font-semibold hover:bg-red-50 disabled:opacity-50"
                        >
                            <IconX className="w-5 h-5 inline mr-2" />
                            Rechazar
                        </button>
                        <button
                            onClick={handleApprove}
                            disabled={submitting}
                            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50"
                        >
                            {submitting ? (
                                'Procesando...'
                            ) : (
                                <>
                                    <IconCheck className="w-5 h-5 inline mr-2" />
                                    Aprobar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Rejeitar */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Motivo del rechazo</h3>
                        <textarea
                            value={observacao}
                            onChange={(e) => setObservacao(e.target.value)}
                            placeholder="Indique el motivo..."
                            className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32 resize-none"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={submitting}
                                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-semibold disabled:opacity-50"
                            >
                                {submitting ? 'Procesando...' : 'Confirmar rechazo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Alerta */}
            {showAlertModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <IconX className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Atención</h3>
                        </div>
                        <p className="text-gray-700 mb-6">{alertMessage}</p>
                        <button
                            onClick={() => setShowAlertModal(false)}
                            className="w-full py-3 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
