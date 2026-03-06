import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { obrasService, apontamentosService } from '../services/api';
import { ChevronLeft, ChevronRight, Save, Send, CheckCircle, AlertCircle } from 'lucide-react';
import PhotoUpload from '../components/PhotoUpload';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

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
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [userPhoto, setUserPhoto] = useState(user?.foto_url || null);

    useEffect(() => {
        if (user && !userPhoto) {
            setShowPhotoModal(true);
        }
    }, [user, userPhoto]);

    const handlePhotoUpdated = (newPhotoUrl) => {
        setUserPhoto(newPhotoUrl);
        setShowPhotoModal(false);
    };

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
        <div className="w-full">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">{t('timesheet.title')}</h1>
                <p className="text-sm text-gray-400">{t('timesheet.subtitle')}</p>
            </div>

            {/* Status Badge */}
            {apontamento && (
                <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        apontamento.status === 'aprovado'
                            ? 'bg-success-light text-success'
                            : apontamento.status === 'enviado'
                            ? 'bg-info-light text-info'
                            : apontamento.status === 'rejeitado'
                            ? 'bg-danger-light text-danger'
                            : 'bg-gray-100 text-gray-700'
                    }`}>
                        {t(`status.${apontamento.status}`)}
                    </span>
                </div>
            )}

            {/* Rejection Alert */}
            {apontamento?.status === 'rejeitado' && apontamento.observacao_rejeicao && (
                <Alert variant="danger" className="mb-4">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <strong>{t('timesheet.rejectionReason')}:</strong>
                            <p className="mt-1">{apontamento.observacao_rejeicao}</p>
                        </div>
                    </div>
                </Alert>
            )}

            {/* Message */}
            {message && (
                <Alert variant={message.type === 'success' ? 'success' : message.type === 'warning' ? 'warning' : 'danger'} className="mb-4">
                    <div className="flex items-center gap-2">
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span>{message.text}</span>
                    </div>
                </Alert>
            )}

            {/* Week Selector */}
            <div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-between border-2 border-gray-200">
                <button
                    onClick={prevWeek}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Semana anterior"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <div className="font-semibold text-gray-900">{formatWeekRange(weekStart)}</div>
                    <div className="text-xs text-gray-500">{weekStart.getFullYear()}</div>
                </div>
                <button
                    onClick={nextWeek}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Semana siguiente"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Obra Selector */}
            {obras.length > 1 && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">{t('timesheet.selectProject')}</label>
                    <select
                        value={selectedObra}
                        onChange={(e) => setSelectedObra(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-white"
                        disabled={isReadOnly}
                    >
                        {obras.map((obra) => (
                            <option key={obra.id} value={obra.id}>
                                {obra.numero} - {obra.nome}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {loading ? (
                <div className="text-center py-16">
                    <div className="animate-spin w-12 h-12 border-4 border-j2s-red border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-400 mt-4">{t('app.loading')}</p>
                </div>
            ) : (
                <>
                    {/* Legend */}
                    <div className="flex gap-3 mb-4 flex-wrap text-xs">
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded"></span>
                            <span className="text-gray-300">{t('timesheet.normalHours')} (8-17h)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-orange-500 rounded"></span>
                            <span className="text-gray-300">{t('timesheet.extraHours')} (17-22h)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-indigo-500 rounded"></span>
                            <span className="text-gray-300">{t('timesheet.nightHours')} (22-6h)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-5 h-4 bg-amber-400 rounded flex items-center justify-center text-[9px] font-bold text-amber-900">F</span>
                            <span className="text-gray-300">Festivo (empresa paga 8h, cliente €0)</span>
                        </div>
                    </div>

                    {/* Hours Grid */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm bg-white rounded-lg shadow overflow-hidden">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-3 py-2 text-left text-xs font-semibold border-b-2 border-gray-200 w-20">
                                        {t('timesheet.day')}
                                    </th>
                                    <th className="px-2 py-2 text-center text-xs font-semibold border-b-2 border-gray-200 bg-amber-50 text-amber-700 w-12">
                                        <div>F</div>
                                        <div className="text-[9px] font-normal">Festivo</div>
                                    </th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold border-b-2 border-gray-200 bg-green-100 text-green-700">
                                        <div>{t('timesheet.normal')}</div>
                                        <div className="text-[9px] font-normal">8-17h</div>
                                    </th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold border-b-2 border-gray-200 bg-yellow-100 text-yellow-700">
                                        <div>{t('timesheet.extra')}</div>
                                        <div className="text-[9px] font-normal">17-22h</div>
                                    </th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold border-b-2 border-gray-200 bg-indigo-100 text-indigo-700">
                                        <div>{t('timesheet.night')}</div>
                                        <div className="text-[9px] font-normal">22-6h</div>
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
                                                        className="w-14 px-2 py-1 border border-gray-300 rounded text-center text-sm disabled:bg-gray-100"
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
                                                        className="w-14 px-2 py-1 border border-gray-300 rounded text-center text-sm disabled:bg-gray-100"
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
                                                        className="w-14 px-2 py-1 border border-gray-300 rounded text-center text-sm disabled:bg-gray-100"
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {/* Totals Row */}
                                <tr className="bg-gray-50 font-semibold">
                                    <td className="px-3 py-2 text-xs">TOTAL</td>
                                    <td className="px-2 py-2 text-center">
                                        {totals.festivos > 0 && (
                                            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">{totals.festivos}F</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-center text-green-700">{totals.normal}h</td>
                                    <td className="px-3 py-2 text-center text-yellow-700">{totals.extra}h</td>
                                    <td className="px-3 py-2 text-center text-indigo-700">{totals.noturna}h</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Grand Total */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-j2s-red to-red-700 rounded-lg text-white">
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
                        <div className="flex flex-col gap-3 mt-6">
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting || saving || totals.total === 0}
                                size="lg"
                                className="w-full"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        {t('app.loading')}
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        {t('timesheet.submit')}
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={handleSave}
                                disabled={saving || submitting}
                                variant="secondary"
                                className="w-full"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
                                        {t('app.loading')}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        {t('timesheet.saveDraft')}
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Read-only message */}
                    {isReadOnly && (
                        <Alert variant="success" className="mt-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>
                                    {apontamento.status === 'enviado'
                                        ? t('timesheet.pendingApproval')
                                        : t('timesheet.alreadyApproved')
                                    }
                                </span>
                            </div>
                        </Alert>
                    )}
                </>
            )}

            {/* Photo Modal */}
            {showPhotoModal && (
                <PhotoUpload
                    user={user}
                    onPhotoUpdated={handlePhotoUpdated}
                    required={true}
                />
            )}
        </div>
    );
}
