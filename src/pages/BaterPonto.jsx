import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { IconChevronLeft, IconChevronRight, IconSend, IconClock, IconMinus, IconPlus } from '@tabler/icons-react'
import CustomSelect from '../components/CustomSelect'

const DIAS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const DIAS_NOME = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const DIAS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function BaterPonto() {
    const { user } = useAuth()
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
            const res = await fetch('https://puntoclicks.com/backend/api/obras/by-employee.php', {
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
                `https://puntoclicks.com/backend/api/apontamentos/my-week.php?semana_inicio=${semanaInicio}&obra_id=${obraId}`,
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

            const res = await fetch('https://puntoclicks.com/backend/api/apontamentos/save.php', {
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
                const res = await fetch('https://puntoclicks.com/backend/api/apontamentos/submit.php', {
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
                    fetch('https://puntoclicks.com/backend/api/apontamentos/submit.php', {
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
            {/* Header Fixo */}
            <div className="bg-white shadow-sm relative z-10">
                <div className="px-4 pt-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                                <IconClock stroke={1} className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Bater Ponto</h1>
                                <p className="text-sm text-gray-500">{user?.nome}</p>
                            </div>
                        </div>
                        {autoSaving && (
                            <div className="flex items-center gap-2 text-gray-600 text-xs">
                                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                                Guardando...
                            </div>
                        )}
                    </div>

                    {/* Seleção Obra */}
                    <CustomSelect
                        value={obraId}
                        onChange={(value) => {
                            setObraId(value);
                            setSemanaInicio(getMonday(new Date()));
                            setDiaAtual(0);
                        }}
                        options={obras.map(o => ({
                            value: o.id,
                            label: `${o.numero} — ${o.nome}`
                        }))}
                    />

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
                    <div className={`px-4 py-2.5 text-center text-xs font-semibold ${
                        apontamento.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                        apontamento.status === 'enviado' ? 'bg-blue-100 text-blue-800' :
                        apontamento.status === 'rejeitado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                        {apontamento.status === 'aprovado' && '✅ APROBADO'}
                        {apontamento.status === 'enviado' && '⏳ ENVIADO - Esperando aprobación'}
                        {apontamento.status === 'rejeitado' && '❌ RECHAZADO: ' + (apontamento.observacao_rejeicao || '')}
                        {apontamento.status === 'rascunho' && '💾 Guardado automáticamente'}
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
                    <h2 className="text-2xl font-bold text-gray-900">{DIAS_NOME[diaAtual]}</h2>
                    <p className="text-gray-600 text-xs mt-0.5">{formatDate(diaAtual)}</p>
                </div>

                {/* Inputs de Horas - COMPACTO */}
                <div className="space-y-2">
                    {/* Normal */}
                    <div className="bg-[#F5F5F5] rounded-xl p-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-gray-900">Normal</div>
                                <div className="text-xs text-gray-600">8-17h</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateHora('normal', Math.max(0, parseFloat(horasDia.normal || 0) - 0.5))}
                                    disabled={bloqueado || horasDia.normal <= 0}
                                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <IconMinus stroke={1} size={16} />
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
                                    className="w-16 text-center text-xl font-black py-1.5 px-1 rounded-lg bg-white border-0 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-200 disabled:text-gray-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => updateHora('normal', Math.min(24, parseFloat(horasDia.normal || 0) + 0.5))}
                                    disabled={bloqueado || horasDia.normal >= 24}
                                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <IconPlus stroke={1} size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Extra */}
                    <div className="bg-[#F5F5F5] rounded-xl p-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-gray-900">Extra</div>
                                <div className="text-xs text-gray-600">17-22h</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateHora('extra', Math.max(0, parseFloat(horasDia.extra || 0) - 0.5))}
                                    disabled={bloqueado || horasDia.extra <= 0}
                                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <IconMinus stroke={1} size={16} />
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
                                    className="w-16 text-center text-xl font-black py-1.5 px-1 rounded-lg bg-white border-0 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-200 disabled:text-gray-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => updateHora('extra', Math.min(24, parseFloat(horasDia.extra || 0) + 0.5))}
                                    disabled={bloqueado || horasDia.extra >= 24}
                                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <IconPlus stroke={1} size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Noturna */}
                    <div className="bg-[#F5F5F5] rounded-xl p-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-gray-900">Nocturna</div>
                                <div className="text-xs text-gray-600">22-6h</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateHora('noturna', Math.max(0, parseFloat(horasDia.noturna || 0) - 0.5))}
                                    disabled={bloqueado || horasDia.noturna <= 0}
                                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <IconMinus stroke={1} size={16} />
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
                                    className="w-16 text-center text-xl font-black py-1.5 px-1 rounded-lg bg-white border-0 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-200 disabled:text-gray-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => updateHora('noturna', Math.min(24, parseFloat(horasDia.noturna || 0) + 0.5))}
                                    disabled={bloqueado || horasDia.noturna >= 24}
                                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <IconPlus stroke={1} size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total do Dia */}
                <div className="mt-4 bg-gray-900 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-white text-sm font-semibold">Total hoje</span>
                    <div className="flex items-center gap-2">
                        <IconClock stroke={1} className="w-4 h-4 text-white" />
                        <span className="text-white font-black text-xl">{totalDia.toFixed(1)}h</span>
                    </div>
                </div>

                {/* Navegação Entre Dias - Compacta */}
                <div className="flex items-center justify-between gap-2 mt-6">
                    <button
                        onClick={prevDay}
                        disabled={diaAtual === 0}
                        className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-1"
                    >
                        <IconChevronLeft stroke={1} className="w-4 h-4" />
                        Ant
                    </button>
                    <button
                        onClick={nextDay}
                        disabled={diaAtual === 5}
                        className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-1"
                    >
                        Sig
                        <IconChevronRight stroke={1} className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Footer Fixo - COM ESPAÇO PARA MENU FLUTUANTE */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 pb-32 z-10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600 font-semibold">Total semana</span>
                    <div className="flex items-center gap-1.5">
                        <IconClock stroke={1} className="w-4 h-4 text-red-600" />
                        <span className="text-xl font-black text-red-600">{totalSemana.toFixed(1)}h</span>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={bloqueado || totalSemana === 0}
                    className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 flex items-center justify-center gap-2"
                >
                    <IconSend stroke={1} className="w-4 h-4" />
                    {bloqueado ? 'Ya enviado' : 'Enviar para aprobación'}
                </button>
            </div>
        </div>
    )
}
