import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { obrasService, apontamentosService } from '../services/api';
import { IconChevronLeft, IconChevronRight, IconDeviceFloppy, IconSend, IconCircleCheck, IconAlertCircle } from '@tabler/icons-react';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import CustomSelect from '../components/CustomSelect';

const createEmptyHours = (weekStart) => {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const result = {};

    days.forEach((day, index) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + index);
        result[day] = {
            normal: 0,
            extra: 0,
            noturna: 0,
            festivo: false,
            fecha: date.toISOString().split('T')[0]
        };
    });

    return result;
};

const migrateHoursStructure = (hours, weekStart) => {
    if (!hours) return createEmptyHours(weekStart);

    if (hours.mon && typeof hours.mon === 'object') {
        return hours;
    }

    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const result = {};

    days.forEach((day, index) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + index);
        const oldValue = hours[day] || 0;

        result[day] = {
            normal: oldValue,
            extra: 0,
            noturna: 0,
            festivo: false,
            fecha: date.toISOString().split('T')[0]
        };
    });

    return result;
};

export default function Timesheet() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [obras, setObras] = useState([]);
    const [selectedObra, setSelectedObra] = useState('');
    const [weekStart, setWeekStart] = useState(getMonday(new Date()));
    const [hours, setHours] = useState(() => createEmptyHours(getMonday(new Date())));
    const [apontamento, setApontamento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    function getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    function formatWeekRange(start) {
        const end = new Date(start);
        end.setDate(end.getDate() + 5);

        const options = { day: '2-digit', month: 'short' };
        return `${start.toLocaleDateString('es-ES', options)} - ${end.toLocaleDateString('es-ES', options)}`;
    }

    function formatShortDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }

    useEffect(() => {
        async function loadObras() {
            try {
                const response = await obrasService.getByEmployee(user.id);
                if (response.obras && response.obras.length > 0) {
                    setObras(response.obras);
                    setSelectedObra(response.obras[0].id);
                }
            } catch (error) {
                console.error('Error loading obras:', error);
            }
        }
        loadObras();
    }, [user.id]);

    useEffect(() => {
        async function loadApontamento() {
            if (!selectedObra) return;

            setLoading(true);
            try {
                const response = await apontamentosService.getMyWeek(formatDate(weekStart), selectedObra?.id || null);
                if (response.apontamento) {
                    setApontamento(response.apontamento);
                    setHours(migrateHoursStructure(response.apontamento.horas_diarias, weekStart));
                } else {
                    setApontamento(null);
                    setHours(createEmptyHours(weekStart));
                }
            } catch (error) {
                console.error('Error loading apontamento:', error);
                setApontamento(null);
                setHours(createEmptyHours(weekStart));
            }
            setLoading(false);
        }
        loadApontamento();
    }, [selectedObra, weekStart]);

    const toggleFestivo = (dayKey) => {
        setHours(prev => {
            const day = prev[dayKey];
            const isFestivo = !day.festivo;
            return {
                ...prev,
                [dayKey]: {
                    ...day,
                    festivo: isFestivo,
                    // quando marca festivo, zera as horas (não se trabalha)
                    normal:  isFestivo ? 0 : day.normal,
                    extra:   isFestivo ? 0 : day.extra,
                    noturna: isFestivo ? 0 : day.noturna,
                }
            };
        });
    };

    const calculateTotals = () => {
        let normal = 0, extra = 0, noturna = 0, festivos = 0;
        Object.values(hours).forEach(day => {
            if (typeof day === 'object') {
                if (day.festivo) {
                    festivos += 1;
                } else {
                    normal  += parseFloat(day.normal)  || 0;
                    extra   += parseFloat(day.extra)   || 0;
                    noturna += parseFloat(day.noturna) || 0;
                }
            }
        });
        return { normal, extra, noturna, festivos, total: normal + extra + noturna };
    };

    const totals = calculateTotals();

    const isReadOnly = apontamento && !['rascunho', 'rejeitado'].includes(apontamento.status);

    // Detectar se pode enviar:
    // - Semanas PASSADAS: sempre pode (regularização)
    // - Semana ATUAL ou FUTURA: só sábado/domingo
    const canSubmit = (() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekStartDate = new Date(weekStart);
        weekStartDate.setHours(0, 0, 0, 0);

        // Se a semana é passada (segunda-feira da semana é antes de hoje)
        if (weekStartDate < today) {
            console.log('✅ Semana passada - PODE ENVIAR a qualquer momento');
            return true;
        }

        // Se é semana atual ou futura, só pode no fim de semana
        const dayOfWeek = today.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        console.log('🗓️ Hoje é:', today.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }));
        console.log('📅 Dia da semana:', dayOfWeek, '(0=Domingo, 6=Sábado)');
        console.log('📆 Semana início:', weekStart);
        console.log('✅ É semana passada?', weekStartDate < today);
        console.log('✅ É fim de semana?', isWeekend);

        return isWeekend;
    })();

    const prevWeek = () => {
        const newDate = new Date(weekStart);
        newDate.setDate(newDate.getDate() - 7);
        setWeekStart(newDate);
    };

    const nextWeek = () => {
        const newDate = new Date(weekStart);
        newDate.setDate(newDate.getDate() + 7);
        setWeekStart(newDate);
    };

    const handleHourChange = (day, type, value) => {
        const numValue = value === '' ? 0 : Math.min(24, Math.max(0, parseFloat(value) || 0));
        setHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [type]: numValue
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            await apontamentosService.save({
                id: apontamento?.id,
                obra_id: selectedObra,
                semana_inicio: formatDate(weekStart),
                horas_diarias: hours
            });
            setMessage({ type: 'success', text: t('timesheet.savedSuccess') });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
        setSaving(false);
    };

    const handleSubmit = async () => {
        if (totals.total === 0 && totals.festivos === 0) {
            setMessage({ type: 'warning', text: t('timesheet.noHours') });
            return;
        }

        setSubmitting(true);
        setMessage(null);

        try {
            const saveResponse = await apontamentosService.save({
                id: apontamento?.id,
                obra_id: selectedObra,
                semana_inicio: formatDate(weekStart),
                horas_diarias: hours
            });

            await apontamentosService.submit(saveResponse.id);
            setMessage({ type: 'success', text: t('timesheet.submittedSuccess') });

            const response = await apontamentosService.getMyWeek(formatDate(weekStart), selectedObra?.id || null);
            if (response.apontamento) {
                setApontamento(response.apontamento);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
        setSubmitting(false);
    };

    const days = [
        { key: 'mon', label: t('days.mon') },
        { key: 'tue', label: t('days.tue') },
        { key: 'wed', label: t('days.wed') },
        { key: 'thu', label: t('days.thu') },
        { key: 'fri', label: t('days.fri') },
        { key: 'sat', label: t('days.sat') },
    ];

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* Header */}
            <div className="px-4 pt-6 pb-4">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t('timesheet.title')}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{t('timesheet.subtitle')}</p>
                    </div>
                    {/* Status Badge */}
                    {apontamento && (
                        <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${
                            apontamento.status === 'aprovado'
                                ? 'bg-green-100 text-green-700'
                                : apontamento.status === 'enviado'
                                ? 'bg-blue-100 text-blue-700'
                                : apontamento.status === 'rejeitado'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}>
                            {t(`status.${apontamento.status}`)}
                        </span>
                    )}
                </div>
            </div>

            <div className="px-4 space-y-4">

                {/* Rejection Alert */}
                {apontamento?.status === 'rejeitado' && apontamento.observacao_rejeicao && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                            <IconAlertCircle stroke={1} className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <strong className="text-red-900 font-semibold">{t('timesheet.rejectionReason')}:</strong>
                                <p className="mt-1 text-sm text-red-700">{apontamento.observacao_rejeicao}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Message */}
                {message && (
                    <div className={`rounded-2xl p-4 ${
                        message.type === 'success' ? 'bg-green-50 border border-green-200' :
                        message.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
                        'bg-red-50 border border-red-200'
                    }`}>
                        <div className="flex items-center gap-3">
                            {message.type === 'success' ?
                                <IconCircleCheck stroke={1} className="w-5 h-5 text-green-600" /> :
                                <IconAlertCircle stroke={1} className="w-5 h-5 text-amber-600" />
                            }
                            <span className={`text-sm font-medium ${
                                message.type === 'success' ? 'text-green-900' :
                                message.type === 'warning' ? 'text-amber-900' :
                                'text-red-900'
                            }`}>{message.text}</span>
                        </div>
                    </div>
                )}

                {/* Week Selector */}
                <div className="bg-[#F5F5F5] rounded-2xl p-4 flex items-center justify-between">
                    <button
                        onClick={prevWeek}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-colors text-gray-700"
                        aria-label="Semana anterior"
                    >
                        <IconChevronLeft stroke={1} className="w-5 h-5" />
                    </button>
                    <div className="text-center flex-1">
                        <div className="font-semibold text-gray-900">{formatWeekRange(weekStart)}</div>
                        <div className="text-xs text-gray-600">{weekStart.getFullYear()}</div>
                    </div>
                    <button
                        onClick={nextWeek}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-colors text-gray-700"
                        aria-label="Semana siguiente"
                    >
                        <IconChevronRight stroke={1} className="w-5 h-5" />
                    </button>
                </div>

                {/* Obra Selector */}
                {obras.length > 1 && (
                    <div>
                        <CustomSelect
                            label={t('timesheet.selectProject')}
                            value={selectedObra}
                            onChange={(value) => setSelectedObra(value)}
                            options={obras.map(obra => ({
                                value: obra.id,
                                label: `${obra.numero} - ${obra.nome}`,
                                disabled: isReadOnly
                            }))}
                        />
                    </div>
                )}

                {loading ? (
                    <div className="bg-[#F5F5F5] rounded-2xl p-12 text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-gray-600 mt-4">{t('app.loading')}</p>
                    </div>
                ) : (
                    <>

                        {/* Hours Grid */}
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#F5F5F5]">
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-200">
                                                {t('timesheet.day')}
                                            </th>
                                            <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 border-b border-gray-200 w-12">
                                                <div>🎉</div>
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-b border-gray-200">
                                                <div>{t('timesheet.normal')}</div>
                                                <div className="text-[10px] font-normal text-gray-500">8-17h</div>
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-b border-gray-200">
                                                <div>{t('timesheet.extra')}</div>
                                                <div className="text-[10px] font-normal text-gray-500">17-22h</div>
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-b border-gray-200">
                                                <div>{t('timesheet.night')}</div>
                                                <div className="text-[10px] font-normal text-gray-500">22-6h</div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                {days.map((day) => {
                                    const isFestivo = !!hours[day.key]?.festivo;
                                    return (
                                        <tr key={day.key} className={`border-b border-gray-200 transition-colors ${isFestivo ? 'bg-amber-50' : ''}`}>
                                            <td className="px-3 py-2 font-medium">
                                                <div className={isFestivo ? 'text-amber-700' : ''}>{day.label}</div>
                                                <div className="text-xs text-gray-500">
                                                    {formatShortDate(hours[day.key]?.fecha)}
                                                </div>
                                            </td>
                                            {/* Botão Festivo */}
                                            <td className="px-2 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => !isReadOnly && toggleFestivo(day.key)}
                                                    disabled={isReadOnly}
                                                    title={isFestivo ? 'Quitar festivo' : 'Marcar como festivo'}
                                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all border-2
                                                        ${isFestivo
                                                            ? 'bg-amber-400 border-amber-500 text-amber-900 shadow-md scale-105'
                                                            : 'bg-white border-gray-200 text-gray-300 hover:border-amber-300 hover:text-amber-400'}
                                                        ${isReadOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}`}>
                                                    F
                                                </button>
                                            </td>
                                            {/* Horas — desabilitadas se festivo */}
                                            <td className="px-2 py-2 text-center">
                                                {isFestivo ? (
                                                    <span className="block w-14 mx-auto py-1 text-xs text-amber-600 font-semibold bg-amber-100 rounded text-center">8h*</span>
                                                ) : (
                                                    <input
                                                        type="number" min="0" max="24" step="0.5"
                                                        value={hours[day.key]?.normal || ''}
                                                        onChange={(e) => handleHourChange(day.key, 'normal', e.target.value)}
                                                        disabled={isReadOnly}
                                                        placeholder="0"
                                                        className="w-16 px-2 py-2 border-0 bg-[#F5F5F5] rounded-lg text-center text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                {isFestivo ? (
                                                    <span className="block w-14 mx-auto py-1 text-xs text-gray-400 bg-gray-100 rounded text-center">—</span>
                                                ) : (
                                                    <input
                                                        type="number" min="0" max="24" step="0.5"
                                                        value={hours[day.key]?.extra || ''}
                                                        onChange={(e) => handleHourChange(day.key, 'extra', e.target.value)}
                                                        disabled={isReadOnly}
                                                        placeholder="0"
                                                        className="w-16 px-2 py-2 border-0 bg-[#F5F5F5] rounded-lg text-center text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                {isFestivo ? (
                                                    <span className="block w-14 mx-auto py-1 text-xs text-gray-400 bg-gray-100 rounded text-center">—</span>
                                                ) : (
                                                    <input
                                                        type="number" min="0" max="24" step="0.5"
                                                        value={hours[day.key]?.noturna || ''}
                                                        onChange={(e) => handleHourChange(day.key, 'noturna', e.target.value)}
                                                        disabled={isReadOnly}
                                                        placeholder="0"
                                                        className="w-16 px-2 py-2 border-0 bg-[#F5F5F5] rounded-lg text-center text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-50"
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                        {/* Totals Row */}
                                        <tr className="bg-gray-900">
                                            <td className="px-3 py-3 text-xs font-bold text-white">TOTAL</td>
                                            <td className="px-2 py-3 text-center">
                                                {totals.festivos > 0 && (
                                                    <span className="text-xs bg-amber-400 text-amber-900 px-2 py-1 rounded-full font-bold">{totals.festivos}</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-center text-white font-bold">{totals.normal}h</td>
                                            <td className="px-3 py-3 text-center text-white font-bold">{totals.extra}h</td>
                                            <td className="px-3 py-3 text-center text-white font-bold">{totals.noturna}h</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Grand Total */}
                        <div className="bg-gray-900 rounded-2xl p-5 text-white">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">{t('timesheet.totalHours')}</span>
                            <span className="text-2xl font-bold">{totals.total}h</span>
                        </div>
                        {totals.festivos > 0 && (
                            <div className="mt-2 pt-2 border-t border-white/30 flex items-center justify-between text-sm">
                                <span className="opacity-80">🎉 {totals.festivos} día(s) festivo(s)</span>
                                <div className="text-right">
                                    <div className="text-xs opacity-70">Empresa paga: <span className="font-bold">{totals.festivos * 8}h</span></div>
                                    <div className="text-xs opacity-70">Cliente factura: <span className="font-bold">0h</span></div>
                                </div>
                            </div>
                        )}
                    </div>

                        {/* Actions */}
                        {!isReadOnly && (
                            <div className="flex flex-col gap-3">
                                {/* Botão de Enviar - Só clicável sábado/domingo */}
                                {!canSubmit && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-1">
                                        <div className="flex items-start gap-2">
                                            <IconAlertCircle stroke={1} className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold text-amber-900">Solo envío en fin de semana</p>
                                                <p className="text-xs text-amber-700 mt-0.5">Puedes registrar y guardar horas, pero solo enviar para aprobación los sábados y domingos.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={!canSubmit || submitting || saving || totals.total === 0}
                                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all font-semibold ${
                                        canSubmit
                                            ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 active:scale-95'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    } ${(submitting || saving || totals.total === 0) ? 'opacity-50' : ''}`}
                                    title={!canSubmit ? 'Solo disponible sábado y domingo' : ''}
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                            {t('app.loading')}
                                        </>
                                    ) : (
                                        <>
                                            <IconSend stroke={1} className="w-5 h-5" />
                                            {canSubmit ? t('timesheet.submit') : '🔒 ' + t('timesheet.submit')}
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={saving || submitting}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#F5F5F5] text-gray-900 rounded-xl hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full"></div>
                                            {t('app.loading')}
                                        </>
                                    ) : (
                                        <>
                                            <IconDeviceFloppy stroke={1} className="w-5 h-5" />
                                            {t('timesheet.saveDraft')}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Read-only message */}
                        {isReadOnly && (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                                <div className="flex items-center gap-3">
                                    <IconCircleCheck stroke={1} className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium text-green-900">
                                        {apontamento.status === 'enviado'
                                            ? t('timesheet.pendingApproval')
                                            : t('timesheet.alreadyApproved')
                                        }
                                    </span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
