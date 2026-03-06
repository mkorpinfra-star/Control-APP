import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ChevronLeft, ChevronRight, Send, Clock as ClockIcon, LogOut, Minus, Plus } from 'lucide-react'

const DIAS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const DIAS_NOME = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const DIAS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const PRESETS_HORAS = [
    { label: '4h', normal: 4, extra: 0, noturna: 0 },
    { label: '6h', normal: 6, extra: 0, noturna: 0 },
    { label: '8h', normal: 8, extra: 0, noturna: 0 },
    { label: '8h+2', normal: 8, extra: 2, noturna: 0 },
    { label: '8h+4', normal: 8, extra: 4, noturna: 0 },
    { label: 'Noite', normal: 0, extra: 0, noturna: 8 }
]

export default function BaterPonto() {
    const { user, logout } = useAuth()
    const [diaAtual, setDiaAtual] = useState(0)
    const [semanaInicio, setSemanaInicio] = useState(getMonday(new Date()))
    const [obraId, setObraId] = useState('')
    const [obras, setObras] = useState([])
    const [loading, setLoading] = useState(false)
    const [autoSaving, setAutoSaving] = useState(false)
    const [saveError, setSaveError] = useState(null)
    const [apontamento, setApontamento] = useState(null)
    const autoSaveTimer = useRef(null)
    const touchStartX = useRef(0)

    const [horas, setHoras] = useState({
        mon: { normal: '', extra: '', noturna: '' },
        tue: { normal: '', extra: '', noturna: '' },
        wed: { normal: '', extra: '', noturna: '' },
        thu: { normal: '', extra: '', noturna: '' },
        fri: { normal: '', extra: '', noturna: '' },
        sat: { normal: '', extra: '', noturna: '' }
    })

    function getMonday(date) {
        const d = new Date(date)
        const day = d.getDay()
        const diff = d.getDate() - day + (day === 0 ? -6 : 1)
        return new Date(d.setDate(diff)).toISOString().split('T')[0]
    }

    function formatDate(offset) {
        const d = new Date(semanaInicio)
        d.setDate(d.getDate() + offset)
        return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    }

    useEffect(() => {
        loadObras()
        // Auto-centrar no dia atual da semana (0=Lun … 5=Sáb; Dom=sem apontamento, fica em Lun)
        const dayOfWeek = new Date().getDay() // 0=Dom, 1=Lun … 6=Sáb
        if (dayOfWeek >= 1 && dayOfWeek <= 6) {
            setDiaAtual(dayOfWeek - 1) // 1→0, 2→1 … 6→5
        } else {
            setDiaAtual(0) // Domingo → mostra Lunes
        }
    }, [])

    useEffect(() => {
        if (obraId && semanaInicio) {
            loadApontamento()
        }
    }, [obraId, semanaInicio])

    async function loadObras() {
        try {
            const res = await fetch('https://j2s.ad/login/backend/api/obras/by-employee.php', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            const data = await res.json()
            if (data.success && data.obras?.length > 0) {
                setObras(data.obras)
                setObraId(data.obras[0].id)
            }
        } catch (err) {
            console.error(err)
        }
    }

    async function loadApontamento() {
        setLoading(true)
        try {
            const res = await fetch(
                `https://j2s.ad/login/backend/api/apontamentos/my-week.php?semana_inicio=${semanaInicio}&obra_id=${obraId}`,
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            )
            const data = await res.json()
            if (data.apontamento) {
                setApontamento(data.apontamento)
                // horas_diarias pode vir como objeto ou string — tratar os dois casos
                let parsed = {}
                try {
                    const raw = data.apontamento.horas_diarias
                    parsed = typeof raw === 'string' ? JSON.parse(raw) : (raw || {})
                } catch(e) { parsed = {} }
                const newHoras = {}
                DIAS.forEach(dia => {
                    newHoras[dia] = {
                        normal: parsed[dia]?.normal || '',
                        extra: parsed[dia]?.extra || '',
                        noturna: parsed[dia]?.noturna || ''
                    }
                })
                setHoras(newHoras)
            } else {
                setApontamento(null)
                const empty = {}
                DIAS.forEach(dia => { empty[dia] = { normal: '', extra: '', noturna: '' } })
                setHoras(empty)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    function updateHora(tipo, valor) {
        const dia = DIAS[diaAtual]
        const num = valor === '' ? '' : parseFloat(valor) || 0
        if (num !== '' && (num < 0 || num > 24)) return

        setHoras(prev => ({
            ...prev,
            [dia]: { ...prev[dia], [tipo]: num }
        }))

        clearTimeout(autoSaveTimer.current)
        autoSaveTimer.current = setTimeout(() => {
            handleAutoSave()
        }, 2000)
    }

    function aplicarPreset(preset) {
        const dia = DIAS[diaAtual]
        setHoras(prev => ({
            ...prev,
            [dia]: {
                normal: preset.normal,
                extra: preset.extra,
                noturna: preset.noturna
            }
        }))

        setTimeout(handleAutoSave, 500)
    }

    async function handleAutoSave() {
        if (bloqueado) return false

        setAutoSaving(true)
        setSaveError(null)
        try {
            const payload = {
                obra_id: obraId,
                semana_inicio: semanaInicio,
                horas_diarias: JSON.stringify(horas)
            }

            const res = await fetch('https://j2s.ad/login/backend/api/apontamentos/save.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            })

            setAutoSaving(false)

            if (!res.ok) {
                if (res.status === 403) {
                    // Apontamento já enviado/aprovado — recarregar para refletir estado real
                    loadApontamento()
                }
                return false
            }

            const data = await res.json()
            return data.success === true
        } catch (err) {
            setAutoSaving(false)
            return false
        }
    }

    async function handleSubmit() {
        // Se já tem ID, vai direto pro submit
        if (apontamento?.id) {
            try {
                const res = await fetch('https://j2s.ad/login/backend/api/apontamentos/submit.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ id: apontamento.id })
                })

                const data = await res.json()
                if (data.success) {
                    alert('✅ Enviado para aprobación')
                    loadApontamento()
                } else {
                    alert('❌ ' + (data.message || 'Error al enviar'))
                }
            } catch (err) {
                alert('❌ Error al enviar')
            }
            return
        }

        // Não tem ID ainda: salvar primeiro (UMA tentativa, sem loop)
        const saved = await handleAutoSave()
        if (!saved) {
            alert('❌ Error al guardar. Intenta de nuevo.')
            return
        }

        // Recarregar para obter o ID
        await loadApontamento()

        // Agora tenta enviar (apontamento state ainda pode não estar atualizado,
        // loadApontamento é async mas o state do React só atualiza no próximo render)
        // Usamos um pequeno delay para garantir que o state atualizou
        setTimeout(async () => {
            setApontamento(prev => {
                if (prev?.id) {
                    // Enviar de forma assíncrona sem depender do state
                    fetch('https://j2s.ad/login/backend/api/apontamentos/submit.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ id: prev.id })
                    })
                    .then(r => r.json())
                    .then(data => {
                        if (data.success) {
                            alert('✅ Enviado para aprobación')
                            loadApontamento()
                        } else {
                            alert('❌ ' + (data.message || 'Error al enviar'))
                        }
                    })
                    .catch(() => alert('❌ Error al enviar'))
                } else {
                    alert('❌ No se pudo obtener el registro. Intenta de nuevo.')
                }
                return prev
            })
        }, 300)
    }

    function nextDay() {
        if (diaAtual < 5) setDiaAtual(diaAtual + 1)
    }

    function prevDay() {
        if (diaAtual > 0) setDiaAtual(diaAtual - 1)
    }

    function handleTouchStart(e) {
        touchStartX.current = e.touches[0].clientX
    }

    function handleTouchEnd(e) {
        const touchEndX = e.changedTouches[0].clientX
        const diff = touchStartX.current - touchEndX

        if (Math.abs(diff) > 50) {
            if (diff > 0) nextDay()
            else prevDay()
        }
    }

    const bloqueado = apontamento?.status === 'enviado' || apontamento?.status === 'aprovado'
    const diaKey = DIAS[diaAtual]
    const horasDia = horas[diaKey]
    const totalDia = (parseFloat(horasDia.normal) || 0) + (parseFloat(horasDia.extra) || 0) + (parseFloat(horasDia.noturna) || 0)

    const totalSemana = DIAS.reduce((sum, dia) => {
        return sum + (parseFloat(horas[dia].normal) || 0) + (parseFloat(horas[dia].extra) || 0) + (parseFloat(horas[dia].noturna) || 0)
    }, 0)

    const obraAtual = obras.find(o => o.id == obraId)

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* Header Fixo com z-index menor que menu */}
            <div className="bg-white shadow-sm relative z-10">
                <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                                <ClockIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Bater Ponto</h1>
                                <p className="text-xs text-gray-500">{user?.nome}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {autoSaving && (
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                                    Guardando...
                                </div>
                            )}
                            <button
                                onClick={logout}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium"
                                title="Cerrar sesión"
                            >
                                <LogOut size={16} />
                                <span className="text-xs">Salir</span>
                            </button>
                        </div>
                    </div>

                    {/* Seleção Obra - NUNCA bloqueado, sempre pode trocar */}
                    <select
                        value={obraId}
                        onChange={(e) => {
                            setObraId(e.target.value)
                            setSemanaInicio(getMonday(new Date()))
                            setDiaAtual(0)
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-base focus:border-red-600 focus:outline-none bg-white cursor-pointer"
                    >
                        {obras.map(o => (
                            <option key={o.id} value={o.id}>{o.numero} - {o.nome}</option>
                        ))}
                    </select>

                </div>

                {/* Navegação de Dias */}
                <div className="px-4 py-2 bg-gray-50">
                    <div className="flex items-center justify-between gap-2">
                        {DIAS.map((dia, idx) => (
                            <button
                                key={dia}
                                onClick={() => setDiaAtual(idx)}
                                className={`flex-1 py-2 rounded-lg font-semibold text-xs transition-all ${
                                    idx === diaAtual
                                        ? 'bg-red-600 text-white shadow-lg scale-110'
                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <div>{DIAS_SHORT[idx]}</div>
                                <div className="text-[10px] opacity-75">{formatDate(idx)}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status */}
                {apontamento && (
                    <div className={`px-4 py-2 text-center text-sm font-semibold ${
                        apontamento.status === 'aprovado' ? 'bg-gray-200 text-gray-800' :
                        apontamento.status === 'enviado' ? 'bg-gray-200 text-gray-800' :
                        apontamento.status === 'rejeitado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                        {apontamento.status === 'aprovado' && '✅ APROBADO'}
                        {apontamento.status === 'enviado' && '⏳ ENVIADO - Esperando aprobación'}
                        {apontamento.status === 'rejeitado' && '❌ RECHAZADO: ' + (apontamento.observacao_rejeicao || '')}
                        {apontamento.status === 'rascunho' && '📝 BORRADOR - Guardado automáticamente'}
                    </div>
                )}
            </div>

            {/* Conteúdo Principal - Swipeable */}
            <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="px-4 py-6 pb-8"
            >
                {/* Título do Dia */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-900">{DIAS_NOME[diaAtual]}</h2>
                    <p className="text-gray-500 text-sm mt-1">{formatDate(diaAtual)}</p>
                    <div className="mt-2 inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full">
                        <ClockIcon className="w-4 h-4" />
                        <span className="font-bold text-lg">{totalDia.toFixed(1)}h</span>
                    </div>
                </div>

                {/* Presets Rápidos */}
                {!bloqueado && (
                    <div className="mb-6">
                        <p className="text-xs text-gray-500 mb-2 text-center font-semibold">RELLENO RÁPIDO</p>
                        <div className="grid grid-cols-3 gap-2">
                            {PRESETS_HORAS.map((preset, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => aplicarPreset(preset)}
                                    className="bg-white border-2 border-gray-300 hover:border-red-600 hover:bg-red-50 py-3 px-2 rounded-xl font-bold text-sm transition-all active:scale-95"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Inputs de Horas - GRANDE E FÁCIL */}
                <div className="space-y-4">
                    {/* Normal */}
                    <div className="bg-[#F5F5F5] rounded-2xl p-6 shadow-sm">
                        <label className="block text-center mb-3">
                            <span className="text-gray-800 font-bold text-lg">
                                <ClockIcon className="w-5 h-5 inline-block mr-2" />
                                NORMAL
                            </span>
                            <span className="block text-gray-600 text-xs mt-1">8:00 - 17:00</span>
                        </label>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => updateHora('normal', Math.max(0, parseFloat(horasDia.normal || 0) - 0.5))}
                                disabled={bloqueado || horasDia.normal <= 0}
                                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <Minus size={20} strokeWidth={3} />
                            </button>
                            <input
                                type="number"
                                inputMode="decimal"
                                step="0.5"
                                min="0"
                                max="24"
                                value={horasDia.normal}
                                onChange={(e) => updateHora('normal', e.target.value)}
                                disabled={bloqueado}
                                placeholder="0"
                                className="w-32 text-center text-3xl font-black py-3 px-2 rounded-xl bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-200 disabled:text-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => updateHora('normal', Math.min(24, parseFloat(horasDia.normal || 0) + 0.5))}
                                disabled={bloqueado || horasDia.normal >= 24}
                                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <Plus size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </div>

                    {/* Extra */}
                    <div className="bg-[#F5F5F5] rounded-2xl p-6 shadow-sm">
                        <label className="block text-center mb-3">
                            <span className="text-gray-800 font-bold text-lg">
                                <ClockIcon className="w-5 h-5 inline-block mr-2" />
                                EXTRA
                            </span>
                            <span className="block text-gray-600 text-xs mt-1">17:00 - 22:00</span>
                        </label>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => updateHora('extra', Math.max(0, parseFloat(horasDia.extra || 0) - 0.5))}
                                disabled={bloqueado || horasDia.extra <= 0}
                                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <Minus size={20} strokeWidth={3} />
                            </button>
                            <input
                                type="number"
                                inputMode="decimal"
                                step="0.5"
                                min="0"
                                max="24"
                                value={horasDia.extra}
                                onChange={(e) => updateHora('extra', e.target.value)}
                                disabled={bloqueado}
                                placeholder="0"
                                className="w-32 text-center text-3xl font-black py-3 px-2 rounded-xl bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-200 disabled:text-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => updateHora('extra', Math.min(24, parseFloat(horasDia.extra || 0) + 0.5))}
                                disabled={bloqueado || horasDia.extra >= 24}
                                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <Plus size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </div>

                    {/* Noturna */}
                    <div className="bg-[#F5F5F5] rounded-2xl p-6 shadow-sm">
                        <label className="block text-center mb-3">
                            <span className="text-gray-800 font-bold text-lg">
                                <ClockIcon className="w-5 h-5 inline-block mr-2" />
                                NOCTURNA
                            </span>
                            <span className="block text-gray-600 text-xs mt-1">22:00 - 6:00</span>
                        </label>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => updateHora('noturna', Math.max(0, parseFloat(horasDia.noturna || 0) - 0.5))}
                                disabled={bloqueado || horasDia.noturna <= 0}
                                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <Minus size={20} strokeWidth={3} />
                            </button>
                            <input
                                type="number"
                                inputMode="decimal"
                                step="0.5"
                                min="0"
                                max="24"
                                value={horasDia.noturna}
                                onChange={(e) => updateHora('noturna', e.target.value)}
                                disabled={bloqueado}
                                placeholder="0"
                                className="w-32 text-center text-3xl font-black py-3 px-2 rounded-xl bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-200 disabled:text-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => updateHora('noturna', Math.min(24, parseFloat(horasDia.noturna || 0) + 0.5))}
                                disabled={bloqueado || horasDia.noturna >= 24}
                                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                <Plus size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navegação Entre Dias com MAIS ESPAÇO */}
                <div className="flex items-center justify-between gap-4 mt-12 mb-8">
                    <button
                        onClick={prevDay}
                        disabled={diaAtual === 0}
                        className="flex-1 bg-gray-800 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <ChevronLeft className="w-6 h-6" />
                        Anterior
                    </button>
                    <button
                        onClick={nextDay}
                        disabled={diaAtual === 5}
                        className="flex-1 bg-gray-800 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        Siguiente
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Footer Fixo com MAIS ESPAÇO (pb-8 adicionado) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-gray-200 shadow-2xl p-4 pb-8 z-20">
                <div className="mb-3 text-center">
                    <div className="text-sm text-gray-500 font-semibold">TOTAL SEMANA</div>
                    <div className="text-3xl font-black text-red-600">{totalSemana.toFixed(1)}h</div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={bloqueado || totalSemana === 0}
                    className="w-full bg-red-600 text-white py-5 rounded-2xl font-bold text-xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 transition-transform flex items-center justify-center gap-3"
                >
                    <Send className="w-6 h-6" />
                    {bloqueado ? 'YA ENVIADO' : 'ENVIAR PARA APROBACIÓN'}
                </button>
            </div>
        </div>
    )
}
