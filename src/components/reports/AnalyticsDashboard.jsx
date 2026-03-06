import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';

// Cores do tema
const COLORS = ['#16a34a', '#ca8a04', '#3730a3', '#dc2626'];

const AnalyticsDashboard = ({ relatorio, valores }) => {
    if (!relatorio) return null;

    // 1. Dados para Gráfico de Pizza (Distribuição de Horas)
    const pieData = [
        { name: 'Normales', value: relatorio.totais.normal },
        { name: 'Extras', value: relatorio.totais.extra },
        { name: 'Nocturnas', value: relatorio.totais.noturna },
    ].filter(d => d.value > 0);

    // 2. Dados para Performance (Top 5 Custos)
    const topCostData = [...relatorio.funcionarios]
        .sort((a, b) => b.valor_total - a.valor_total)
        .slice(0, 5)
        .map(f => ({
            name: f.nome.split(' ')[0],
            valor: parseFloat(f.valor_total.toFixed(2))
        }));

    // 3. Eficiência (Cálculo fictício mas lógico: % de horas extras sobre total)
    const extraRatio = relatorio.totais.total > 0
        ? ((relatorio.totais.extra + relatorio.totais.noturna) / relatorio.totais.total * 100).toFixed(1)
        : 0;

    return (
        <div style={{ padding: '20px 0' }}>
            {/* KPIs Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Eficiencia Operativa</div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: parseFloat(extraRatio) > 20 ? '#dc2626' : '#16a34a', marginTop: '8px' }}>
                        {100 - parseFloat(extraRatio)}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Horas normales vs extras</div>
                </div>
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Costo Total</div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#1f2937', marginTop: '8px' }}>
                        €{relatorio.valores.valor_total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Nómina del mes</div>
                </div>
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Empleados Activos</div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#3b82f6', marginTop: '8px' }}>
                        {relatorio.funcionarios.length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Registrados en el período</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>

                {/* Distribuição */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Distribución de Carga Horaria</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value}h`, 'Horas']} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Costs */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Top 5 - Mayor Costo</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topCostData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '12px' }} />
                                <Tooltip formatter={(value) => [`€${value}`, 'Costo']} />
                                <Bar dataKey="valor" fill="#dc2626" radius={[0, 4, 4, 0]} barSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
