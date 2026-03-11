import React, { useState, useEffect, useMemo } from 'react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    IconTrendingUp, IconTrendingDown, IconCurrencyDollar, IconUsers, IconBriefcase, IconClock,
    IconActivity, IconAlertCircle, IconRefresh, IconChevronUp, IconChevronDown
} from '@tabler/icons-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://puntotouch.nextim.io/backend/api';

// ── helpers ────────────────────────────────────────────────────────────────
const fmtEur = v => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v || 0);
const fmtH = v => `${parseFloat(v || 0).toFixed(0)}h`;

// Mapa de calor: semanas x dias (apontamentos por dia)
function HeatMap({ data }) {
    // data: array de { date: 'YYYY-MM-DD', value: number }
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
                Sin datos de horas para el mapa de calor
            </div>
        );
    }
    const max = Math.max(...data.map(d => d.value), 1);
    const getColor = (v) => {
        if (v === 0) return '#f3f4f6';
        const pct = v / max;
        if (pct < 0.25) return '#dcfce7';
        if (pct < 0.5)  return '#86efac';
        if (pct < 0.75) return '#22c55e';
        return '#15803d';
    };

    // Agrupar por semana
    const weeks = [];
    let week = [];
    // Descobrir o dia da semana do primeiro elemento
    const first = new Date(data[0].date + 'T00:00:00');
    const startPad = first.getDay(); // 0=Dom
    for (let i = 0; i < startPad; i++) week.push(null);
    data.forEach(d => {
        week.push(d);
        if (week.length === 7) { weeks.push(week); week = []; }
    });
    if (week.length > 0) {
        while (week.length < 7) week.push(null);
        weeks.push(week);
    }

    const days = ['D','L','M','X','J','V','S'];

    return (
        <div>
            <div className="flex gap-1 mb-1">
                {days.map(d => <div key={d} className="w-6 text-center text-xs text-gray-400 font-medium">{d}</div>)}
            </div>
            <div className="flex flex-col gap-1">
                {weeks.map((wk, wi) => (
                    <div key={wi} className="flex gap-1">
                        {wk.map((cell, di) => (
                            <div
                                key={di}
                                title={cell ? `${cell.date}: ${cell.value}h` : ''}
                                className="w-6 h-6 rounded-sm transition-transform hover:scale-110"
                                style={{ backgroundColor: cell ? getColor(cell.value) : '#f9fafb' }}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <span>Menos</span>
                {['#f3f4f6','#dcfce7','#86efac','#22c55e','#15803d'].map(c => (
                    <div key={c} className="w-4 h-4 rounded-sm" style={{ backgroundColor: c }} />
                ))}
                <span>Más</span>
            </div>
        </div>
    );
}

// KPI card com delta
function KpiCard({ icon: Icon, title, value, delta, deltaLabel, color, bg }) {
    const isPos = delta >= 0;
    return (
        <div className={`rounded-2xl p-5 ${bg} flex flex-col gap-3 shadow-sm`}>
            <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {delta !== undefined && (
                    <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full
                        ${isPos ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {isPos ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {Math.abs(delta)}%
                    </span>
                )}
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500 mt-0.5">{title}</div>
                {deltaLabel && <div className="text-xs text-gray-400 mt-0.5">{deltaLabel}</div>}
            </div>
        </div>
    );
}

// Custom tooltip bonito
const CustomTooltip = ({ active, payload, label, currency }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
            <p className="font-semibold text-gray-700 mb-2">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-gray-600">{p.name}:</span>
                    <span className="font-bold text-gray-900">
                        {currency ? fmtEur(p.value) : `${p.value}h`}
                    </span>
                </div>
            ))}
        </div>
    );
};

// ── componente principal ────────────────────────────────────────────────────
export default function Dashboard() {
    const [loading, setLoading]   = useState(true);
    const [data, setData]         = useState(null);
    const [error, setError]       = useState(null);
    const [lastRefresh, setLastRefresh] = useState(null);

    useEffect(() => { fetchDashboard(); }, []);

    const fetchDashboard = async () => {
        setLoading(true); setError(null);
        try {
            const token = localStorage.getItem('token');
            const res   = await fetch(`${API_URL}/dashboard/summary.php`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.kpis) {
                setData(result);
                setLastRefresh(new Date());
            } else {
                setError(result.message || 'Error al cargar dashboard');
            }
        } catch (e) {
            setError('Sin conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    // Gerar dados do mapa de calor (últimos 90 dias)
    const heatmapData = useMemo(() => {
        if (!data?.heatmap) return [];
        return data.heatmap;
    }, [data]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full" />
            <p className="text-gray-500 text-sm animate-pulse">Cargando dashboard...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertCircle className="w-16 h-16 text-red-400" />
            <p className="text-gray-600 text-lg font-semibold">{error}</p>
            <button onClick={fetchDashboard}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
                style={{ backgroundColor: '#CE0201' }}>
                <RefreshCw className="w-4 h-4" /> Reintentar
            </button>
        </div>
    );

    const { kpis, top_obras, distribuicao_horas, evolucao_mensal } = data;

    // Pizza de horas
    const pieData = [
        { name: 'Normales', value: parseFloat(distribuicao_horas?.normais || 0), color: '#22c55e' },
        { name: 'Extra',    value: parseFloat(distribuicao_horas?.extra   || 0), color: '#3b82f6' },
        { name: 'Noct.',    value: parseFloat(distribuicao_horas?.noturna || 0), color: '#a855f7' },
    ].filter(d => d.value > 0);

    const totalHorasPie = pieData.reduce((a, b) => a + b.value, 0);

    const margem = parseFloat(kpis.margem_mes_atual || 0);
    const margemOk = margem >= 25;

    return (
        <div className="w-full space-y-6">

            {/* ── Header ── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500">
                        {new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })} •
                        {lastRefresh && ` Actualizado ${lastRefresh.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                </div>
                <button onClick={fetchDashboard}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    <RefreshCw className="w-4 h-4" /> Actualizar
                </button>
            </div>

            {/* ── KPIs ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={Briefcase} title="Obras Activas"    value={kpis.total_obras_ativas}       bg="bg-white border border-blue-100"   color="bg-blue-500"   />
                <KpiCard icon={Users}     title="Empleados Activos" value={kpis.total_funcionarios_ativos} bg="bg-white border border-green-100"  color="bg-green-500"  />
                <KpiCard icon={Clock}     title="Horas Este Mes"    value={fmtH(kpis.horas_mes_atual)}     bg="bg-white border border-purple-100" color="bg-purple-500" />
                <KpiCard icon={Activity}  title="Clientes"          value={kpis.total_clientes}            bg="bg-white border border-orange-100" color="bg-orange-500" />
            </div>

            {/* ── Financeiro 3 cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl p-5 text-white shadow-md" style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
                    <div className="flex items-center gap-2 mb-1 opacity-90 text-sm font-medium">
                        <TrendingUp className="w-4 h-4" /> Faturamento
                    </div>
                    <div className="text-3xl font-bold">{fmtEur(kpis.faturamento_mes_atual)}</div>
                    <div className="text-xs opacity-70 mt-1">Mês corrente</div>
                </div>
                <div className="rounded-2xl p-5 text-white shadow-md" style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                    <div className="flex items-center gap-2 mb-1 opacity-90 text-sm font-medium">
                        <Users className="w-4 h-4" /> Folha Pagamento
                    </div>
                    <div className="text-3xl font-bold">{fmtEur(kpis.folha_mes_atual)}</div>
                    <div className="text-xs opacity-70 mt-1">Custo com pessoal</div>
                </div>
                <div className={`rounded-2xl p-5 text-white shadow-md ${margemOk ? '' : 'ring-2 ring-yellow-400'}`}
                    style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
                    <div className="flex items-center gap-2 mb-1 opacity-90 text-sm font-medium">
                        <DollarSign className="w-4 h-4" /> Lucro Líquido
                    </div>
                    <div className="text-3xl font-bold">{fmtEur(kpis.lucro_mes_atual)}</div>
                    <div className="text-xs opacity-70 mt-1">Margem: {margem.toFixed(1)}%
                        {!margemOk && ' ⚠️ abaixo de 25%'}
                    </div>
                </div>
            </div>

            {/* ── Charts row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Evolução — ocupa 2/3 */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Evolução Mensal — Últimos 6 Meses</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={evolucao_mensal} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gFat" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gFolha" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gHoras" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="mes_label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="eur" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
                            <YAxis yAxisId="hrs" orientation="right" tick={{ fontSize: 11, fill: '#a855f7' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}h`} />
                            <Tooltip content={<CustomTooltip currency={false} />} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Area yAxisId="eur" type="monotone" dataKey="faturamento" stroke="#16a34a" strokeWidth={2} fill="url(#gFat)" name="Faturamento €" />
                            <Area yAxisId="eur" type="monotone" dataKey="folha"       stroke="#dc2626" strokeWidth={2} fill="url(#gFolha)" name="Folha €" />
                            <Area yAxisId="hrs" type="monotone" dataKey="horas"       stroke="#a855f7" strokeWidth={2} fill="url(#gHoras)" name="Horas" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Pizza de horas */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Tipos de Hora</h3>
                    {pieData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                                        dataKey="value" paddingAngle={3}>
                                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip formatter={v => fmtH(v)} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {pieData.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                                            <span className="text-gray-600">{d.name}</span>
                                        </div>
                                        <span className="font-semibold text-gray-800">
                                            {fmtH(d.value)}
                                            <span className="text-gray-400 ml-1">({((d.value / totalHorasPie) * 100).toFixed(0)}%)</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm gap-2">
                            <Clock className="w-10 h-10 opacity-40" />
                            <p>Sin horas aprobadas este mes</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Mapa de Calor ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Mapa de Calor — Horas por Día (últimos 90 días)</h3>
                </div>
                <HeatMap data={heatmapData} />
            </div>

            {/* ── Top Obras + Barra ── */}
            {top_obras && top_obras.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Obras por Horas</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={top_obras} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                                tickFormatter={v => `${v}h`} />
                            <YAxis type="category" dataKey="numero" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={70} />
                            <Tooltip formatter={v => `${v}h`} />
                            <Bar dataKey="horas_total" name="Horas" radius={[0, 8, 8, 0]}>
                                {top_obras.map((_, i) => (
                                    <Cell key={i} fill={`hsl(${210 - i * 20}, 70%, ${50 + i * 4}%)`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* ── Insight bar ── */}
            <div className="rounded-2xl p-4 border-l-4 border-blue-500 bg-blue-50 flex flex-wrap gap-4 text-sm text-blue-800">
                <span className="font-semibold">💡 Insights:</span>
                <span>{fmtH(kpis.horas_mes_atual)} trabajadas · {kpis.total_funcionarios_ativos} empleados · {kpis.total_obras_ativas} obras activas</span>
                {margem > 0 && (
                    <span className={`font-semibold ${margemOk ? 'text-green-700' : 'text-orange-600'}`}>
                        {margemOk ? '✅' : '⚠️'} Margem: {margem.toFixed(1)}% {margemOk ? '(saludable)' : '(abaixo de 25%)'}
                    </span>
                )}
            </div>
        </div>
    );
}
