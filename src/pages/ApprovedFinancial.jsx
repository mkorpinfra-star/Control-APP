import React, { useState, useEffect } from 'react';
import { IconCircleCheck, IconCurrencyDollar } from '@tabler/icons-react';
import { Card } from '../components/ui/Card';
import CustomSelect from '../components/CustomSelect';
import CustomDatePicker from '../components/CustomDatePicker';

const API_URL = import.meta.env.VITE_API_URL || 'https://puntotouch.nextim.io/backend/api';

export default function ApprovedFinancial() {
    const [mesReferencia, setMesReferencia] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    });
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [obraId, setObraId] = useState('all');
    const [obras, setObras] = useState([]);
    const [apontamentos, setApontamentos] = useState([]);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchObras();
        fetchConfig();
    }, []);

    useEffect(() => {
        fetchApontamentos();
    }, [mesReferencia, obraId]);

    const fetchObras = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/obras/list.php`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setObras(data.obras || []);
            }
        } catch (error) {
            console.error('Error fetching obras:', error);
        }
    };

    const fetchConfig = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/config/valores.php`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setConfig(data.config);
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        }
    };

    const fetchApontamentos = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const mesInicio = mesReferencia + '-01';
            const mesFim = new Date(mesReferencia + '-01');
            mesFim.setMonth(mesFim.getMonth() + 1);
            mesFim.setDate(0);
            const mesFimStr = mesFim.toISOString().split('T')[0];

            let url = `${API_URL}/apontamentos/approved-financial.php?inicio=${mesInicio}&fim=${mesFimStr}`;
            if (obraId !== 'all') url += `&obra_id=${obraId}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setApontamentos(data.apontamentos || []);
            } else {
                console.error('approved-financial error:', data.message);
                setApontamentos([]);
            }
        } catch (error) {
            console.error('Error fetching approved apontamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const calcularValores = (apt) => {
        if (!config) return { normal: 0, extra: 0, noturna: 0, total: 0 };

        const valorNormal = parseFloat(config.valor_hora_normal) || 21;
        const valorExtra = parseFloat(config.valor_hora_extra) || 28;
        const valorNoturna = parseFloat(config.valor_hora_noturna) || 30;

        const normal = (parseFloat(apt.horas_normais) || 0) * valorNormal;
        const extra = (parseFloat(apt.horas_extra) || 0) * valorExtra;
        const noturna = (parseFloat(apt.horas_noturna) || 0) * valorNoturna;

        return {
            normal,
            extra,
            noturna,
            total: normal + extra + noturna
        };
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(value || 0);
    };

    const formatHours = (value) => {
        return parseFloat(value || 0).toFixed(1) + 'h';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const totais = apontamentos.reduce((acc, apt) => {
        const valores = calcularValores(apt);
        return {
            horas_normais: acc.horas_normais + (parseFloat(apt.horas_normais) || 0),
            horas_extra: acc.horas_extra + (parseFloat(apt.horas_extra) || 0),
            horas_noturna: acc.horas_noturna + (parseFloat(apt.horas_noturna) || 0),
            valor_total: acc.valor_total + valores.total
        };
    }, { horas_normais: 0, horas_extra: 0, horas_noturna: 0, valor_total: 0 });

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-8 h-8 text-red-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Apontamentos Aprovados - Visão Financeira</h1>
                </div>
                <p className="text-sm text-gray-600">
                    Valores calculados dos apontamentos aprovados para faturamento
                </p>
            </div>

            {/* Filters */}
            <Card className="mb-6 p-5">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <CustomDatePicker
                            label="Mes de Referencia"
                            selected={selectedDate}
                            onChange={(date) => {
                                setSelectedDate(date);
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                setMesReferencia(`${year}-${month}`);
                            }}
                            dateFormat="MMMM yyyy"
                            showMonthYearPicker
                            showFullMonthYearPicker
                        />
                    </div>
                    <div className="flex-1">
                        <CustomSelect
                            label="Obra"
                            count={obras.length}
                            value={obraId}
                            onChange={setObraId}
                            options={[
                                { value: 'all', label: 'Todas las obras' },
                                ...obras.map(obra => ({
                                    value: obra.id,
                                    label: `${obra.numero} — ${obra.nome}`
                                }))
                            ]}
                        />
                    </div>
                </div>
            </Card>

            {/* Summary */}
            {apontamentos.length > 0 && (
                <Card className="mb-6 p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                        <div>
                            <div className="text-sm opacity-90 mb-1">Horas Normales</div>
                            <div className="text-2xl font-bold">
                                {formatHours(totais.horas_normais)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm opacity-90 mb-1">Horas Extra</div>
                            <div className="text-2xl font-bold">
                                {formatHours(totais.horas_extra)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm opacity-90 mb-1">Horas Nocturnas</div>
                            <div className="text-2xl font-bold">
                                {formatHours(totais.horas_noturna)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm opacity-90 mb-1">Total a Faturar</div>
                            <div className="text-3xl font-bold">
                                {formatCurrency(totais.valor_total)}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Table */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">
                    Cargando...
                </div>
            ) : apontamentos.length === 0 ? (
                <Card className="py-12 text-center p-6">
                    <div className="text-5xl mb-4">📋</div>
                    <p className="text-gray-600 text-lg mb-2">No hay apontamentos aprovados para este período.</p>
                </Card>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Funcionário</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Obra</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Semana</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 bg-green-50">H. Normales</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 bg-blue-50">H. Extra (1.4x)</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 bg-purple-50">H. Noct (1.6x)</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 bg-green-50">Valor Normal</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 bg-blue-50">Valor Extra</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 bg-purple-50">Valor Noct</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 bg-yellow-50">TOTAL FATURAR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apontamentos.map(apt => {
                                const valores = calcularValores(apt);
                                return (
                                    <tr key={apt.id} className="border-b border-gray-200">
                                        <td className="px-3 py-2">
                                            <div className="font-semibold">{apt.funcionario_nome}</div>
                                            <div className="text-xs text-gray-500">{apt.funcionario_passaporte}</div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="font-semibold">{apt.obra_numero}</div>
                                            <div className="text-xs text-gray-500">{apt.obra_nome}</div>
                                        </td>
                                        <td className="px-3 py-2 text-xs">
                                            {formatDate(apt.semana_inicio)} - {formatDate(apt.semana_fim)}
                                        </td>
                                        <td className="px-3 py-2 text-right bg-green-50">
                                            {formatHours(apt.horas_normais)}
                                        </td>
                                        <td className="px-3 py-2 text-right bg-blue-50">
                                            {formatHours(apt.horas_extra)}
                                        </td>
                                        <td className="px-3 py-2 text-right bg-purple-50">
                                            {formatHours(apt.horas_noturna)}
                                        </td>
                                        <td className="px-3 py-2 text-right bg-green-50 font-semibold text-green-700">
                                            {formatCurrency(valores.normal)}
                                        </td>
                                        <td className="px-3 py-2 text-right bg-blue-50 font-semibold text-blue-700">
                                            {formatCurrency(valores.extra)}
                                        </td>
                                        <td className="px-3 py-2 text-right bg-purple-50 font-semibold text-purple-700">
                                            {formatCurrency(valores.noturna)}
                                        </td>
                                        <td className="px-3 py-2 text-right bg-yellow-50 font-bold text-orange-700">
                                            {formatCurrency(valores.total)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Info */}
            <Card className="mt-6 p-5 bg-blue-50 border-l-4 border-blue-500">
                <div className="text-sm text-gray-700">
                    <strong className="text-blue-700">ℹ️ Sobre os valores:</strong> Os valores mostrados são baseados na configuração de valores de hora
                    (Normal: {config ? formatCurrency(config.valor_hora_normal) : '€21'},
                    Extra: {config ? formatCurrency(config.valor_hora_extra) : '€28'},
                    Noturna: {config ? formatCurrency(config.valor_hora_noturna) : '€30'}).
                    Estes são os valores que serão usados para <strong>faturamento ao cliente</strong>.
                </div>
            </Card>
        </div>
    );
}
