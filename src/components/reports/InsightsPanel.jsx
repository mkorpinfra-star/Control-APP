import React, { useMemo } from 'react';

const InsightsPanel = ({ relatorio }) => {
    if (!relatorio) return null;

    // Lógica de Inteligência (Processada localmente)
    const insights = useMemo(() => {
        const alerts = [];
        const funcionarios = relatorio.funcionarios;
        if (!funcionarios.length) return [];

        // 1. Detectar Fadiga (Excesso de Horas Extras)
        funcionarios.forEach(f => {
            const ratio = f.horas_normal > 0 ? (f.horas_extra + f.horas_noturna) / f.horas_normal : 0;
            if (ratio > 0.5) { // 50% mais horas que o normal
                alerts.push({
                    type: ratio > 1.0 ? 'critical' : 'warning',
                    title: ratio > 1.0 ? 'Riesgo de Fatiga Extrema' : 'Sobrecarga de Trabajo',
                    message: `${f.nome} tiene un ${(ratio * 100).toFixed(0)}% de horas extras sobre lo normal.`,
                    employee: f.nome
                });
            }
        });

        // 2. Detectar Padrões Robóticos (Valores Idênticos)
        const hourMap = {};
        funcionarios.forEach(f => {
            const key = `${f.horas_normal}-${f.horas_extra}-${f.horas_noturna}`;
            hourMap[key] = (hourMap[key] || 0) + 1;
        });

        Object.entries(hourMap).forEach(([key, count]) => {
            if (count >= 3) { // 3 ou mais funcionários idênticos
                alerts.push({
                    type: 'info',
                    title: 'Posible Patrón Repetitivo',
                    message: `${count} empleados tienen exactamente las mismas horas (${key.replace(/-/g, ' / ')}). Verificar si es duplicación.`,
                    count: count
                });
            }
        });

        // 3. Baixa Produtividade / Presença
        const mediaHoras = funcionarios.reduce((acc, f) => acc + parseFloat(f.horas_total), 0) / funcionarios.length;
        funcionarios.forEach(f => {
            if (parseFloat(f.horas_total) < mediaHoras * 0.5) { // Menos da metade da média
                alerts.push({
                    type: 'low',
                    title: 'Baja Asistencia',
                    message: `${f.nome} trabajó solo ${f.horas_total}h (Promedio: ${mediaHoras.toFixed(0)}h).`,
                    employee: f.nome
                });
            }
        });

        return alerts.sort((a, b) => (a.type === 'critical' ? -1 : 1));
    }, [relatorio]);

    const getIcon = (type) => {
        switch (type) {
            case 'critical': return '🚨';
            case 'warning': return '⚠️';
            case 'info': return '🤖';
            case 'low': return '📉';
            default: return 'ℹ️';
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'critical': return { bg: '#fef2f2', border: '#ef4444', text: '#dc2626' };
            case 'warning': return { bg: '#fff7ed', border: '#f97316', text: '#ea580c' }; // Orange
            case 'info': return { bg: '#eff6ff', border: '#3b82f6', text: '#2563eb' }; // Blue
            case 'low': return { bg: '#f3f4f6', border: '#9ca3af', text: '#4b5563' }; // Grey
            default: return { bg: 'white', border: '#e5e7eb', text: '#374151' };
        }
    };

    return (
        <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '24px' }}>🧠</div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>Insights de Inteligencia Artificial</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
                        Análisis automático de anomalías y patrones en {relatorio.funcionarios.length} registros.
                    </p>
                </div>
            </div>

            {insights.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbb' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>✨</div>
                    <h4 style={{ margin: 0, color: '#166534' }}>Todo parece normal</h4>
                    <p style={{ color: '#15803d' }}>No se detectaron anomalías ni riesgos en este período.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {insights.map((alert, index) => {
                        const style = getColor(alert.type);
                        return (
                            <div key={index} style={{
                                background: style.bg,
                                borderLeft: `6px solid ${style.border}`,
                                padding: '16px',
                                borderRadius: '8px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '16px'
                            }}>
                                <div style={{ fontSize: '24px' }}>{getIcon(alert.type)}</div>
                                <div>
                                    <div style={{ fontWeight: '700', color: style.text, marginBottom: '4px' }}>{alert.title}</div>
                                    <div style={{ fontSize: '14px', color: '#374151' }}>{alert.message}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default InsightsPanel;
