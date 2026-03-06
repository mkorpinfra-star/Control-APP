import React, { useState, useEffect } from 'react';
import { BarChart3, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/login/backend/api';

export default function FinancialDashboard() {
    const [mesReferencia, setMesReferencia] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    });
    const [obras, setObras] = useState([]);
    const [totais, setTotais] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDashboard();
    }, [mesReferencia]);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // FASE 6: Usar endpoint de lucratividade (com cálculos completos)
            const url = `${API_URL}/dashboard/lucratividade.php?mes=${mesReferencia}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setObras(data.obras || []);
                setTotais(data.totais || null);
            }
        } catch (error) {
            console.error('Error fetching financial dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(value || 0);
    };

    const formatPercent = (value) => {
        return parseFloat(value || 0).toFixed(1) + '%';
    };

    const getMarginColor = (margin) => {
        if (margin >= 30) return 'bg-green-600';
        if (margin >= 15) return 'bg-blue-600';
        if (margin >= 5) return 'bg-orange-600';
        return 'bg-red-600';
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-8 h-8 text-red-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
                </div>
                <p className="text-sm text-gray-600">
                    Receita vs Custo por Obra - Análise de Lucro
                </p>
            </div>

            {/* Month Filter */}
            <Card className="mb-6 p-5">
                <div className="max-w-xs">
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        Mes de Referencia
                    </label>
                    <input
                        type="month"
                        value={mesReferencia}
                        onChange={(e) => setMesReferencia(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    />
                </div>
            </Card>

            {/* Global Summary */}
            {totais && (
                <Card className="mb-6 p-6 bg-gradient-to-br from-red-600 to-orange-600 text-white shadow-lg">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                        <div>
                            <div className="text-sm opacity-90 mb-1">Receita Total</div>
                            <div className="text-2xl font-bold">{formatCurrency(totais.faturamento_liquido)}</div>
                        </div>
                        <div>
                            <div className="text-sm opacity-90 mb-1">Custo Total</div>
                            <div className="text-2xl font-bold">{formatCurrency(totais.custo_folha + totais.cas_empresa + totais.vale_moradia_total + totais.ibf_total)}</div>
                        </div>
                        <div>
                            <div className="text-sm opacity-90 mb-1">Lucro Total</div>
                            <div className="text-3xl font-bold">{formatCurrency(totais.lucro_liquido)}</div>
                        </div>
                        <div>
                            <div className="text-sm opacity-90 mb-1">Margem</div>
                            <div className="text-3xl font-bold">{formatPercent(totais.margem_percentual)}</div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Obras Cards */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">
                    Cargando...
                </div>
            ) : obras.length === 0 ? (
                <Card className="py-12 text-center p-6">
                    <div className="text-5xl mb-4">📊</div>
                    <p className="text-gray-600 text-lg mb-2">No hay datos financieros para este período.</p>
                    <p className="text-gray-500 text-sm">Genere primero la folha de pagamento y el faturamento.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {obras.map(obra => {
                        const receita = parseFloat(obra.faturamento_liquido || 0);
                        const custo = parseFloat(obra.custo_folha || 0) + parseFloat(obra.cas_empresa || 0) + parseFloat(obra.vale_moradia_total || 0) + parseFloat(obra.ibf_total || 0);
                        const lucro = receita - custo;
                        const lucroPositivo = lucro >= 0;
                        const marginColor = getMarginColor(parseFloat(obra.margem_percentual));

                        return (
                            <Card
                                key={obra.obra_id}
                                className={`border-2 p-5 shadow-md ${lucroPositivo ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}
                            >
                                {/* Header */}
                                <div className="mb-4 pb-3 border-b border-gray-300">
                                    <div className="text-lg font-bold text-gray-900 mb-1">
                                        {obra.obra_numero}
                                    </div>
                                    <div className="text-sm text-gray-700 font-medium">{obra.obra_nome}</div>
                                    {obra.cliente_nome && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Cliente: {obra.cliente_nome}
                                        </div>
                                    )}
                                </div>

                                {/* Financial Details */}
                                <div className="bg-white p-4 rounded-lg mb-4 shadow-sm border border-gray-200">
                                    <div className="flex justify-between mb-3 pb-2 border-b border-gray-200">
                                        <span className="text-sm text-gray-600 flex items-center gap-1">
                                            <DollarSign className="w-4 h-4" /> Receita
                                        </span>
                                        <span className="text-base font-bold text-blue-600">
                                            {formatCurrency(receita)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-3 pb-2 border-b border-gray-200">
                                        <span className="text-sm text-gray-600">Custo</span>
                                        <span className="text-base font-bold text-orange-600">
                                            {formatCurrency(custo)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-2">
                                        <span className="text-sm font-semibold text-gray-800">
                                            {lucroPositivo ? '✅' : '❌'} Lucro
                                        </span>
                                        <span className={`text-xl font-bold ${lucroPositivo ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(lucro)}
                                        </span>
                                    </div>
                                </div>

                                {/* Margin Badge */}
                                <div className={`${marginColor} text-white p-4 rounded-lg text-center shadow-sm`}>
                                    <div className="text-xs opacity-90 mb-1">Margem de Lucro</div>
                                    <div className="text-3xl font-bold">
                                        {formatPercent(obra.margem_percentual)}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Legend */}
            <Card className="mt-6 p-6">
                <h3 className="text-base font-semibold mb-4 text-gray-800">
                    📖 Entendendo o Dashboard
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-gray-600 mb-4">
                    <div>
                        <strong className="text-blue-600">Receita:</strong> Valor facturado al cliente (Faturamento + IGI)
                    </div>
                    <div>
                        <strong className="text-orange-600">Custo:</strong> Salários + CAS Empresa + Beneficios (Folha)
                    </div>
                    <div>
                        <strong className="text-green-600">Lucro:</strong> Receita - Custo
                    </div>
                    <div>
                        <strong className="text-purple-600">Margem:</strong> (Lucro / Receita) × 100
                    </div>
                </div>
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-600 rounded text-xs text-gray-700">
                    <strong>Rangos de Margem:</strong>
                    <span className="text-green-600 ml-2">≥30% Excelente</span>
                    <span className="text-blue-600 ml-2">≥15% Buena</span>
                    <span className="text-orange-600 ml-2">≥5% Baja</span>
                    <span className="text-red-600 ml-2">&lt;5% Crítica</span>
                </div>
            </Card>
        </div>
    );
}
