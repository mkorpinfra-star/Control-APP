import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IconTrendingUp, IconTrendingDown, IconAlertTriangle, IconAward, IconUsers, IconClock, IconCalendar, IconRefresh, IconDownload } from '@tabler/icons-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/login/backend/api';

const COLORS = {
    critical: '#dc2626',
    warning: '#f59e0b',
    success: '#16a34a',
    info: '#3b82f6',
    normal: '#6b7280'
};

export default function AnalyticsAdvanced() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [periodo, setPeriodo] = useState('30');
    const [customDates, setCustomDates] = useState({ inicio: '', fim: '' });
    const [showCustom, setShowCustom] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, [periodo]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `${API_URL}/analytics/insights.php?periodo=${periodo}`;

            if (periodo === 'custom' && customDates.inicio && customDates.fim) {
                url += `&data_inicio=${customDates.inicio}&data_fim=${customDates.fim}`;
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setData(result);
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePeriodoChange = (newPeriodo) => {
        setPeriodo(newPeriodo);
        if (newPeriodo !== 'custom') {
            setShowCustom(false);
        } else {
            setShowCustom(true);
        }
    };

    const handleCustomSearch = () => {
        if (customDates.inicio && customDates.fim) {
            fetchAnalytics();
        }
    };

    const getRiskColor = (nivel) => {
        const colors = {
            'CRÍTICO': COLORS.critical,
            'ALTO': COLORS.warning,
            'MODERADO': COLORS.info,
            'NORMAL': COLORS.success
        };
        return colors[nivel] || COLORS.normal;
    };

    const getInsightIcon = (tipo) => {
        switch (tipo) {
            case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
            case 'success': return <Award className="w-5 h-5 text-green-600" />;
            default: return <TrendingUp className="w-5 h-5 text-blue-600" />;
        }
    };

    const formatVariacao = (valor) => {
        const color = valor >= 0 ? 'text-green-600' : 'text-red-600';
        const icon = valor >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
        return (
            <div className={`flex items-center gap-1 ${color} font-semibold`}>
                {icon}
                <span>{Math.abs(valor)}%</span>
            </div>
        );
    };

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Analizando datos...</p>
                </div>
            </div>
        );
    }

    // Preparar dados para gráficos
    const horasDistData = [
        { name: 'Normales', value: parseFloat(data.resumo.horas_normais), color: COLORS.success },
        { name: 'Extra', value: parseFloat(data.resumo.horas_extra), color: COLORS.warning },
        { name: 'Nocturnas', value: parseFloat(data.resumo.horas_noturna), color: COLORS.critical }
    ];

    return (
        <div className="w-full p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6 pb-4 border-b-2 border-gray-300">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Avanzado</h1>
                        <p className="text-gray-600">Insights inteligentes y comparaciones temporales</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant={periodo === '7' ? 'danger' : 'secondary'}
                            onClick={() => handlePeriodoChange('7')}
                            size="sm"
                        >
                            7 días
                        </Button>
                        <Button
                            variant={periodo === '14' ? 'danger' : 'secondary'}
                            onClick={() => handlePeriodoChange('14')}
                            size="sm"
                        >
                            14 días
                        </Button>
                        <Button
                            variant={periodo === '21' ? 'danger' : 'secondary'}
                            onClick={() => handlePeriodoChange('21')}
                            size="sm"
                        >
                            21 días
                        </Button>
                        <Button
                            variant={periodo === '30' ? 'danger' : 'secondary'}
                            onClick={() => handlePeriodoChange('30')}
                            size="sm"
                        >
                            30 días
                        </Button>
                        <Button
                            variant={periodo === 'custom' ? 'danger' : 'secondary'}
                            onClick={() => handlePeriodoChange('custom')}
                            size="sm"
                        >
                            <Calendar className="w-4 h-4" />
                            Personalizado
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={fetchAnalytics}
                            size="sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Custom Date Range */}
                {showCustom && (
                    <div className="mt-4 p-4 bg-white border-2 border-gray-300 rounded-lg">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-semibold mb-2 text-gray-700">Fecha Inicio</label>
                                <input
                                    type="date"
                                    value={customDates.inicio}
                                    onChange={(e) => setCustomDates({ ...customDates, inicio: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-semibold mb-2 text-gray-700">Fecha Fin</label>
                                <input
                                    type="date"
                                    value={customDates.fim}
                                    onChange={(e) => setCustomDates({ ...customDates, fim: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
                                />
                            </div>
                            <Button variant="danger" onClick={handleCustomSearch}>
                                Buscar
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Period Info */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-lg">
                <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <div>
                        <div className="font-semibold text-gray-900">
                            Período Analizado: {data.periodo.inicio} → {data.periodo.fim} ({data.periodo.dias} días)
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                            Comparado con: {data.comparacao_temporal.periodo_anterior.inicio} → {data.comparacao_temporal.periodo_anterior.fim}
                        </div>
                    </div>
                </div>
            </div>

            {/* Insights Cards */}
            {data.insights && data.insights.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Insights Automáticos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.insights.map((insight, idx) => (
                            <Card key={idx} className={`p-4 border-l-4 ${
                                insight.tipo === 'critical' ? 'border-red-600 bg-red-50' :
                                insight.tipo === 'warning' ? 'border-yellow-600 bg-yellow-50' :
                                insight.tipo === 'success' ? 'border-green-600 bg-green-50' :
                                'border-blue-600 bg-blue-50'
                            }`}>
                                <div className="flex items-start gap-3">
                                    {getInsightIcon(insight.tipo)}
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900 mb-1">{insight.titulo}</div>
                                        <div className="text-sm text-gray-700">{insight.mensagem}</div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Comparación Temporal */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Comparación Temporal</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100">
                        <div className="text-sm font-medium text-blue-700 mb-2">Total Horas</div>
                        <div className="text-2xl font-bold text-blue-900 mb-2">
                            {parseFloat(data.comparacao_temporal.periodo_atual.dados.total_horas).toFixed(1)}h
                        </div>
                        {formatVariacao(data.comparacao_temporal.variacoes.total_horas)}
                    </Card>

                    <Card className="p-5 bg-gradient-to-br from-yellow-50 to-yellow-100">
                        <div className="text-sm font-medium text-yellow-700 mb-2">Horas Extra</div>
                        <div className="text-2xl font-bold text-yellow-900 mb-2">
                            {parseFloat(data.comparacao_temporal.periodo_atual.dados.horas_extra).toFixed(1)}h
                        </div>
                        {formatVariacao(data.comparacao_temporal.variacoes.horas_extra)}
                    </Card>

                    <Card className="p-5 bg-gradient-to-br from-red-50 to-red-100">
                        <div className="text-sm font-medium text-red-700 mb-2">Horas Nocturnas</div>
                        <div className="text-2xl font-bold text-red-900 mb-2">
                            {parseFloat(data.comparacao_temporal.periodo_atual.dados.horas_noturna).toFixed(1)}h
                        </div>
                        {formatVariacao(data.comparacao_temporal.variacoes.horas_noturna)}
                    </Card>

                    <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100">
                        <div className="text-sm font-medium text-green-700 mb-2">Funcionarios Activos</div>
                        <div className="text-2xl font-bold text-green-900 mb-2">
                            {data.comparacao_temporal.periodo_atual.dados.funcionarios_ativos}
                        </div>
                        {formatVariacao(data.comparacao_temporal.variacoes.funcionarios_ativos)}
                    </Card>
                </div>
            </div>

            {/* Top 5 Produtivos */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-green-600" />
                    Top 5 Más Productivos
                </h2>
                <Card className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-300">
                                    <th className="text-left p-3 font-bold text-gray-700">#</th>
                                    <th className="text-left p-3 font-bold text-gray-700">Funcionario</th>
                                    <th className="text-right p-3 font-bold text-gray-700">Total Horas</th>
                                    <th className="text-right p-3 font-bold text-gray-700">Normales</th>
                                    <th className="text-right p-3 font-bold text-gray-700">Extra</th>
                                    <th className="text-right p-3 font-bold text-gray-700">Nocturnas</th>
                                    <th className="text-right p-3 font-bold text-gray-700">Obras</th>
                                    <th className="text-right p-3 font-bold text-gray-700">% Normal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.top_5_produtivos.map((func, idx) => (
                                    <tr key={func.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                                idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-gray-300'
                                            }`}>
                                                {idx + 1}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-semibold text-gray-900">{func.nome}</div>
                                            <div className="text-xs text-gray-500">{func.passaporte}</div>
                                        </td>
                                        <td className="p-3 text-right font-bold text-blue-600">{parseFloat(func.total_horas).toFixed(1)}h</td>
                                        <td className="p-3 text-right text-green-600">{parseFloat(func.horas_normais).toFixed(1)}h</td>
                                        <td className="p-3 text-right text-yellow-600">{parseFloat(func.horas_extra).toFixed(1)}h</td>
                                        <td className="p-3 text-right text-red-600">{parseFloat(func.horas_noturna).toFixed(1)}h</td>
                                        <td className="p-3 text-right text-gray-700">{func.obras_trabalhadas}</td>
                                        <td className="p-3 text-right">
                                            <span className={`font-semibold ${parseFloat(func.percentual_normal) >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {func.percentual_normal}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Bottom 5 - Alerta Fadiga */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    Alerta de Fadiga - Mayor Riesgo
                </h2>
                <Card className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-300">
                                    <th className="text-left p-3 font-bold text-gray-700">Funcionario</th>
                                    <th className="text-right p-3 font-bold text-gray-700">Total Horas</th>
                                    <th className="text-right p-3 font-bold text-gray-700">Extra + Nocturnas</th>
                                    <th className="text-right p-3 font-bold text-gray-700">% No Normal</th>
                                    <th className="text-center p-3 font-bold text-gray-700">Nivel Riesgo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.bottom_5_fadiga.map((func) => {
                                    const horasRiesgo = parseFloat(func.horas_extra) + parseFloat(func.horas_noturna);
                                    return (
                                        <tr key={func.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="p-3">
                                                <div className="font-semibold text-gray-900">{func.nome}</div>
                                                <div className="text-xs text-gray-500">{func.passaporte}</div>
                                            </td>
                                            <td className="p-3 text-right text-gray-700">{parseFloat(func.total_horas).toFixed(1)}h</td>
                                            <td className="p-3 text-right font-bold text-red-600">{horasRiesgo.toFixed(1)}h</td>
                                            <td className="p-3 text-right font-bold" style={{ color: getRiskColor(func.nivel_risco) }}>
                                                {func.percentual_extra_noturna}%
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: getRiskColor(func.nivel_risco) }}>
                                                    {func.nivel_risco}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Distribución de Horas */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución de Horas por Tipo</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={horasDistData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value, percent }) => `${name}: ${value.toFixed(0)}h (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {horasDistData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                {/* Top Obras */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Horas por Obra</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.distribuicao_obras.slice(0, 5)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="numero" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="horas_normais" stackId="a" fill={COLORS.success} name="Normales" />
                            <Bar dataKey="horas_extra" stackId="a" fill={COLORS.warning} name="Extra" />
                            <Bar dataKey="horas_noturna" stackId="a" fill={COLORS.critical} name="Nocturnas" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
}
