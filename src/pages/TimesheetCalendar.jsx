import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { obrasService, apontamentosService } from '../services/api';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { Loading } from '../components/ui/Loading';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import {
    ClockIcon, ChevronLeftIcon, ChevronRightIcon, SaveIcon, SendIcon, CheckCircleIcon
} from '../components/Icons';

const createEmptyHours = (weekStart) => {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const result = {};

    days.forEach((day, index) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + index);
        result[day] = {
            normal: '',
            extra: '',
            noturna: '',
            fecha: date.toISOString().split('T')[0]
        };
    });

    return result;
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
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
}

export default function TimesheetCalendar() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [obras, setObras] = useState([]);
    const [selectedObra, setSelectedObra] = useState('');
    const [selectedObraData, setSelectedObraData] = useState(null);
    const [weekStart, setWeekStart] = useState(getMonday(new Date()));
    const [hours, setHours] = useState(() => createEmptyHours(getMonday(new Date())));
    const [apontamento, setApontamento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);
    const [autoSaving, setAutoSaving] = useState(false);

    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayLabels = {
        mon: 'Lunes',
        tue: 'Martes',
        wed: 'Miércoles',
        thu: 'Jueves',
        fri: 'Viernes',
        sat: 'Sábado'
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedObra) {
            loadWeekData();
        } else {
            setHours(createEmptyHours(weekStart));
            setApontamento(null);
        }
    }, [weekStart, selectedObra]);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await obrasService.getMyObras();
            const obrasData = result.obras || result;
            setObras(Array.isArray(obrasData) ? obrasData : []);
        } catch (error) {
            console.error('Erro ao carregar obras:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadWeekData = async () => {
        try {
            const response = await apontamentosService.getMyWeek(formatDate(weekStart));
            if (response.apontamento && response.apontamento.obra_id == selectedObra) {
                setApontamento(response.apontamento);
                const horasDiarias = JSON.parse(response.apontamento.horas_diarias || '{}');
                const migratedHours = {};
                days.forEach((day, index) => {
                    const date = new Date(weekStart);
                    date.setDate(date.getDate() + index);
                    migratedHours[day] = horasDiarias[day] || {
                        normal: '',
                        extra: '',
                        noturna: '',
                        fecha: date.toISOString().split('T')[0]
                    };
                });
                setHours(migratedHours);
            } else {
                setHours(createEmptyHours(weekStart));
                setApontamento(null);
            }
        } catch (error) {
            setHours(createEmptyHours(weekStart));
            setApontamento(null);
        }
    };

    // Auto-save com debounce
    useEffect(() => {
        if (!selectedObra || !apontamento) return;

        const timer = setTimeout(() => {
            autoSaveHours();
        }, 2000);

        return () => clearTimeout(timer);
    }, [hours, selectedObra]);

    const autoSaveHours = async () => {
        if (!selectedObra || !apontamento) return;

        const totals = calculateTotals();
        if (totals.total === 0) return;

        setAutoSaving(true);
        try {
            const dataToSend = {
                obra_id: selectedObra,
                semana_inicio: formatDate(weekStart),
                horas_diarias: hours
            };

            await apontamentosService.update(apontamento.id, dataToSend);
            setLastSaved(new Date());
        } catch (error) {
            console.error('Erro no auto-save:', error);
        } finally {
            setAutoSaving(false);
        }
    };

    const handleHourChange = (day, type, value) => {
        const numValue = value === '' ? '' : parseFloat(value) || 0;
        setHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [type]: numValue
            }
        }));
    };

    const calculateTotals = () => {
        let normal = 0, extra = 0, noturna = 0;
        days.forEach(day => {
            normal += parseFloat(hours[day].normal) || 0;
            extra += parseFloat(hours[day].extra) || 0;
            noturna += parseFloat(hours[day].noturna) || 0;
        });
        return {
            normal,
            extra,
            noturna,
            total: normal + extra + noturna
        };
    };

    const handleSave = async () => {
        if (!selectedObra) {
            setMessage({ type: 'warning', text: 'Selecciona una obra' });
            return;
        }

        const totals = calculateTotals();
        if (totals.total === 0) {
            setMessage({ type: 'warning', text: 'Añade al menos 1 hora' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const dataToSend = {
                obra_id: selectedObra,
                semana_inicio: formatDate(weekStart),
                horas_diarias: hours
            };

            let response;
            if (apontamento) {
                response = await apontamentosService.update(apontamento.id, dataToSend);
            } else {
                response = await apontamentosService.create(dataToSend);
            }

            if (response.apontamento) {
                setApontamento(response.apontamento);
            }

            setMessage({ type: 'success', text: 'Horas guardadas correctamente' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Error al guardar' });
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (!apontamento) {
            setMessage({ type: 'warning', text: 'Guarda las horas primero' });
            return;
        }

        if (apontamento.status !== 'rascunho') {
            setMessage({ type: 'warning', text: 'Este registro ya fue enviado' });
            return;
        }

        setSubmitting(true);
        setMessage(null);

        try {
            await apontamentosService.submit(apontamento.id);
            setMessage({ type: 'success', text: 'Horas enviadas para aprobación' });

            const response = await apontamentosService.getMyWeek(formatDate(weekStart));
            if (response.apontamento) {
                setApontamento(response.apontamento);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Error al enviar' });
        } finally {
            setSubmitting(false);
        }
    };

    const previousWeek = () => {
        const newDate = new Date(weekStart);
        newDate.setDate(newDate.getDate() - 7);

        if (selectedObraData && selectedObraData.data_inicio) {
            const obraInicio = new Date(selectedObraData.data_inicio + 'T00:00:00');
            if (newDate < obraInicio) {
                setMessage({ type: 'warning', text: 'No puedes retroceder antes de la fecha de inicio de la obra' });
                return;
            }
        }

        setWeekStart(newDate);
    };

    const nextWeek = () => {
        const newDate = new Date(weekStart);
        newDate.setDate(newDate.getDate() + 7);

        if (selectedObraData && selectedObraData.data_fim) {
            const obraFim = new Date(selectedObraData.data_fim + 'T00:00:00');
            const weekEnd = new Date(newDate);
            weekEnd.setDate(weekEnd.getDate() + 6);

            if (newDate > obraFim) {
                setMessage({ type: 'warning', text: 'No puedes avanzar después de la fecha de fin de la obra' });
                return;
            }
        }

        setWeekStart(newDate);
    };

    const thisWeek = () => {
        setWeekStart(getMonday(new Date()));
    };

    const totals = calculateTotals();
    const canEdit = !apontamento || apontamento.status === 'rascunho' || apontamento.status === 'rejeitado';

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loading size="lg" text="Cargando..." />
            </div>
        );
    }

    const formatDayDate = (fecha) => {
        if (!fecha) return '';
        const d = new Date(fecha + 'T00:00:00');
        return `${d.getDate()}/${d.getMonth() + 1}`;
    };

    return (
        <div className="min-h-screen bg-black text-white py-6 px-4 sm:px-6 lg:px-8">
            <div className="w-full mx-auto">
                {/* HEADER */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-j2s-red rounded-full flex items-center justify-center flex-shrink-0">
                            <ClockIcon size={24} className="sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                                Mi Registro de Horas
                            </h1>
                            <p className="text-sm sm:text-base text-gray-400 mt-1">
                                Marca tus horas trabajadas de la semana
                            </p>
                        </div>
                    </div>
                </div>

                {/* AUTO-SAVE INDICATOR */}
                {(autoSaving || lastSaved) && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-6 ${
                        autoSaving
                            ? 'bg-blue-50 border border-blue-200 text-blue-700'
                            : 'bg-green-50 border border-green-200 text-green-700'
                    }`}>
                        <CheckCircleIcon size={16} />
                        <span className="text-sm font-medium">
                            {autoSaving
                                ? 'Guardando...'
                                : `Salvo automaticamente ${lastSaved ? new Date(lastSaved).toLocaleTimeString('es-ES') : ''}`
                            }
                        </span>
                    </div>
                )}

                {/* MESSAGES */}
                {message && (
                    <div className="mb-6">
                        <Alert variant={message.type}>
                            {message.text}
                        </Alert>
                    </div>
                )}

                {/* SELEÇÃO DE OBRA */}
                <Card className="mb-6">
                    <CardBody>
                        <Select
                            label="Seleccionar Obra"
                            value={selectedObra}
                            onChange={(e) => {
                                const obraId = e.target.value;
                                setSelectedObra(obraId);
                                const obra = obras.find(o => o.id == obraId);
                                setSelectedObraData(obra || null);
                            }}
                            disabled={!canEdit}
                        >
                            <option value="">-- Selecciona una obra --</option>
                            {obras.filter(o => o.ativa).map(obra => (
                                <option key={obra.id} value={obra.id}>
                                    {obra.numero} - {obra.nome}
                                </option>
                            ))}
                        </Select>

                        {selectedObraData && (selectedObraData.data_inicio || selectedObraData.data_fim) && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Período de la obra:</strong>{' '}
                                    {selectedObraData.data_inicio
                                        ? new Date(selectedObraData.data_inicio + 'T00:00:00').toLocaleDateString('es-ES')
                                        : '—'
                                    } a {
                                        selectedObraData.data_fim
                                            ? new Date(selectedObraData.data_fim + 'T00:00:00').toLocaleDateString('es-ES')
                                            : '—'
                                    }
                                </p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {selectedObra && (
                    <>
                        {/* NAVEGAÇÃO DE SEMANA */}
                        <Card className="mb-6">
                            <CardBody>
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={previousWeek}
                                        >
                                            <ChevronLeftIcon size={16} />
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={thisWeek}
                                        >
                                            Hoy
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={nextWeek}
                                        >
                                            <ChevronRightIcon size={16} />
                                        </Button>
                                    </div>
                                    <span className="text-lg sm:text-xl font-bold text-black">
                                        {formatWeekRange(weekStart)}
                                    </span>
                                </div>
                            </CardBody>
                        </Card>

                        {/* CALENDÁRIO DE HORAS - MOBILE FIRST */}
                        <div className="space-y-4 mb-6">
                            {days.map(day => {
                                const dayData = hours[day];
                                const dayTotal = (parseFloat(dayData.normal) || 0) +
                                                 (parseFloat(dayData.extra) || 0) +
                                                 (parseFloat(dayData.noturna) || 0);

                                return (
                                    <Card key={day}>
                                        <CardBody>
                                            {/* DIA HEADER */}
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg sm:text-xl font-bold text-black">
                                                    {dayLabels[day]}
                                                </h3>
                                                <Badge variant="gray" className="text-sm">
                                                    {formatDayDate(dayData.fecha)}
                                                </Badge>
                                            </div>

                                            {/* INPUTS DE HORAS */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {/* HORA NORMAL */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Hora normal
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="24"
                                                        step="0.5"
                                                        value={dayData.normal}
                                                        onChange={(e) => handleHourChange(day, 'normal', e.target.value)}
                                                        disabled={!canEdit}
                                                        placeholder="0"
                                                        className="w-full px-3 py-2 text-base border-2 border-gray-300 rounded-lg
                                                                   focus:outline-none focus:ring-2 focus:ring-j2s-red focus:border-transparent
                                                                   disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
                                                                   text-black"
                                                    />
                                                </div>

                                                {/* HORA EXTRA */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Hora extra
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="24"
                                                        step="0.5"
                                                        value={dayData.extra}
                                                        onChange={(e) => handleHourChange(day, 'extra', e.target.value)}
                                                        disabled={!canEdit}
                                                        placeholder="0"
                                                        className="w-full px-3 py-2 text-base border-2 border-gray-300 rounded-lg
                                                                   focus:outline-none focus:ring-2 focus:ring-j2s-red focus:border-transparent
                                                                   disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
                                                                   text-black"
                                                    />
                                                </div>

                                                {/* HORA NOTURNA */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Hora noturna
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="24"
                                                        step="0.5"
                                                        value={dayData.noturna}
                                                        onChange={(e) => handleHourChange(day, 'noturna', e.target.value)}
                                                        disabled={!canEdit}
                                                        placeholder="0"
                                                        className="w-full px-3 py-2 text-base border-2 border-gray-300 rounded-lg
                                                                   focus:outline-none focus:ring-2 focus:ring-j2s-red focus:border-transparent
                                                                   disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
                                                                   text-black"
                                                    />
                                                </div>
                                            </div>

                                            {/* TOTAL DO DIA */}
                                            {dayTotal > 0 && (
                                                <div className="mt-4 pt-4 border-t-2 border-gray-200">
                                                    <p className="text-sm text-gray-700">
                                                        Total: <strong className="text-lg text-black">{dayTotal}h</strong>
                                                    </p>
                                                </div>
                                            )}
                                        </CardBody>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* RESUMO SEMANAL */}
                        <div className="bg-gradient-to-br from-j2s-red to-red-800 rounded-lg p-6 mb-6 border-2 border-j2s-red shadow-lg">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-center sm:text-left">
                                    <div className="text-sm font-semibold text-white/90 mb-1">
                                        TOTAL SEMANA
                                    </div>
                                    <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                                        {totals.total}h
                                    </div>
                                    <div className="text-sm text-white/90">
                                        Normal: {totals.normal}h · Extra: {totals.extra}h · Noturna: {totals.noturna}h
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BOTÕES DE AÇÃO */}
                        {canEdit && (
                            <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving || totals.total === 0}
                                    loading={saving}
                                    size="lg"
                                    className="w-full sm:w-auto"
                                >
                                    <SaveIcon size={18} />
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting || !apontamento || apontamento.status !== 'rascunho'}
                                    loading={submitting}
                                    variant="secondary"
                                    size="lg"
                                    className="w-full sm:w-auto"
                                >
                                    <SendIcon size={18} />
                                    {submitting ? 'Enviando...' : 'Enviar para Aprobación'}
                                </Button>
                            </div>
                        )}

                        {/* STATUS DO APONTAMENTO */}
                        {!canEdit && apontamento && (
                            <Alert variant="info" className="flex items-center gap-3">
                                <CheckCircleIcon size={20} />
                                <span>
                                    Este registro está{' '}
                                    {apontamento.status === 'enviado' ? 'pendiente de aprobación' :
                                     apontamento.status === 'aprovado' ? 'aprobado' :
                                     'rechazado'} y no se puede editar.
                                </span>
                            </Alert>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
