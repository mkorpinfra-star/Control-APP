import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { obrasService } from '../services/api';
import FinancialReport from '../components/reports/FinancialReport';
import AnalyticsDashboard from '../components/reports/AnalyticsDashboard';
import InsightsPanel from '../components/reports/InsightsPanel';
import EmployeeLog from '../components/reports/EmployeeLog';
import { ChartIcon, BrainIcon, FileIcon, CloseIcon } from '../components/Icons';
import { IconUser, IconClipboardList, IconBook, IconPlus, IconFileText, IconChartBar, IconBrain } from '@tabler/icons-react';
import CustomSelect from '../components/CustomSelect';
import CustomDatePicker from '../components/CustomDatePicker';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Reports() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('financial'); // financial, analytics, insights, log

    // Configuração de valores
    const [valores, setValores] = useState({
        valor_hora_normal: 21,
        valor_hora_extra: 28,
        valor_hora_noturna: 30
    });

    // Relatórios
    const [obras, setObras] = useState([]);
    const [selectedObra, setSelectedObra] = useState('');
    const [selectedMes, setSelectedMes] = useState(new Date().toISOString().slice(0, 7));
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [relatorio, setRelatorio] = useState(null);
    const [loadingRelatorio, setLoadingRelatorio] = useState(false);

    // Relatórios salvos (Global State)
    const [savedReports, setSavedReports] = useState([]);
    const [showSavedReports, setShowSavedReports] = useState(false);

    useEffect(() => {
        loadData();
        loadSavedReports();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const valoresRes = await fetch(`${API_URL}/config/valores.php`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (valoresRes.ok) {
                const valoresData = await valoresRes.json();
                if (valoresData.valor_hora_normal) setValores(valoresData);
            }
            const obrasData = await obrasService.getAll();
            setObras(Array.isArray(obrasData) ? obrasData : []);
        } catch (error) {
            console.error('Erro ao carregar:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRelatorio = async () => {
        if (!selectedObra) {
            setMessage({ type: 'warning', text: 'SELECCIONA UNA OBRA' });
            return;
        }
        setLoadingRelatorio(true);
        setRelatorio(null);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/relatorios/mensal.php?obra_id=${selectedObra}&mes=${selectedMes}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setRelatorio(data);
            } else {
                throw new Error(data.error || 'Error al generar informe');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoadingRelatorio(false);
        }
    };

    // ========================================
    // LOGICA DE SALVAMENTO LOCAL (Global)
    // ========================================
    const loadSavedReports = () => {
        const saved = localStorage.getItem('savedReports');
        if (saved) setSavedReports(JSON.parse(saved));
    };

    const saveReportLocally = () => {
        if (!relatorio) return;
        const report = { id: Date.now(), obra: relatorio.obra, mes: relatorio.mes, funcionarios: relatorio.funcionarios, totais: relatorio.totais, valores: relatorio.valores, config: valores, savedAt: new Date().toISOString() };
        const updated = [...savedReports, report];
        setSavedReports(updated);
        localStorage.setItem('savedReports', JSON.stringify(updated));
        alert('INFORME GUARDADO LOCALMENTE');
    };

    const loadSavedReport = (report) => {
        setRelatorio({ success: true, obra: report.obra, mes: report.mes, funcionarios: report.funcionarios, totais: report.totais, valores: report.valores });
        setShowSavedReports(false);
    };

    const deleteSavedReport = (id) => {
        const updated = savedReports.filter(r => r.id !== id);
        setSavedReports(updated);
        localStorage.setItem('savedReports', JSON.stringify(updated));
    };

    if (loading) return (
        <div className="min-h-screen bg-white pb-32 flex items-center justify-center">
            <div className="text-gray-600">Cargando datos...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* Header */}
            <div className="px-4 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Informes</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Reportes y analítica avanzada</p>
                    </div>
                    <button
                        onClick={() => setShowSavedReports(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-medium text-sm"
                    >
                        <IconFileText size={16} />
                        Guardados ({savedReports.length})
                    </button>
                </div>

                {/* Tabs - Grid Responsivo igual QuickActions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                        onClick={() => setActiveTab('financial')}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl font-medium text-sm transition-all ${
                            activeTab === 'financial'
                                ? 'bg-gray-900 text-white'
                                : 'bg-[#F5F5F5] text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            activeTab === 'financial' ? 'bg-white/20' : 'bg-gray-100'
                        }`}>
                            <IconFileText size={20} strokeWidth={2} className={activeTab === 'financial' ? 'text-white' : 'text-black'} />
                        </div>
                        <span className="font-semibold text-xs">Financiero</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl font-medium text-sm transition-all ${
                            activeTab === 'analytics'
                                ? 'bg-gray-900 text-white'
                                : 'bg-[#F5F5F5] text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            activeTab === 'analytics' ? 'bg-white/20' : 'bg-gray-100'
                        }`}>
                            <IconChartBar size={20} strokeWidth={2} className={activeTab === 'analytics' ? 'text-white' : 'text-black'} />
                        </div>
                        <span className="font-semibold text-xs">Performance</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('insights')}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl font-medium text-sm transition-all ${
                            activeTab === 'insights'
                                ? 'bg-gray-900 text-white'
                                : 'bg-[#F5F5F5] text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            activeTab === 'insights' ? 'bg-white/20' : 'bg-gray-100'
                        }`}>
                            <IconBrain size={20} strokeWidth={2} className={activeTab === 'insights' ? 'text-white' : 'text-black'} />
                        </div>
                        <span className="font-semibold text-xs">IA Insights</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('log')}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl font-medium text-sm transition-all ${
                            activeTab === 'log'
                                ? 'bg-gray-900 text-white'
                                : 'bg-[#F5F5F5] text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            activeTab === 'log' ? 'bg-white/20' : 'bg-gray-100'
                        }`}>
                            <IconUser size={20} strokeWidth={2} className={activeTab === 'log' ? 'text-white' : 'text-black'} />
                        </div>
                        <span className="font-semibold text-xs">Historial</span>
                    </button>
                </div>
            </div>

            <div className="px-4">

                {activeTab === 'log' ? (
                    <EmployeeLog />
                ) : (
                    /* Conteúdo que depende de selecionar Obra */
                    <>
                        <div className="bg-[#F5F5F5] rounded-2xl p-4 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                <div className="md:col-span-2">
                                    <CustomSelect
                                        label="Obra"
                                        value={selectedObra}
                                        onChange={(value) => setSelectedObra(value)}
                                        options={[
                                            { value: '', label: 'Seleccionar obra...' },
                                            ...obras.map(o => ({ value: o.id, label: `${o.numero} - ${o.nome}` }))
                                        ]}
                                    />
                                </div>
                                <div>
                                    <CustomDatePicker
                                        label="Mes"
                                        selected={selectedDate}
                                        onChange={(date) => {
                                            setSelectedDate(date);
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            setSelectedMes(`${year}-${month}`);
                                        }}
                                        dateFormat="MMMM yyyy"
                                        showMonthYearPicker
                                        showFullMonthYearPicker
                                    />
                                </div>
                            </div>
                            <div className="mt-3">
                                <button
                                    onClick={loadRelatorio}
                                    disabled={loadingRelatorio || !selectedObra}
                                    className="w-full md:w-auto px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingRelatorio ? 'Generando...' : 'Generar Informe'}
                                </button>
                            </div>
                        </div>

                        {message && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-4 font-medium">
                                {message.text}
                            </div>
                        )}

                        {relatorio && (
                            <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                                {activeTab === 'financial' && (
                                    <FinancialReport
                                        relatorio={relatorio}
                                        valores={valores}
                                        savedReports={savedReports}
                                        saveReportLocally={saveReportLocally}
                                        loadSavedReport={loadSavedReport}
                                        deleteSavedReport={deleteSavedReport}
                                    />
                                )}
                                {activeTab === 'analytics' && (
                                    <AnalyticsDashboard relatorio={relatorio} valores={valores} />
                                )}
                                {activeTab === 'insights' && (
                                    <InsightsPanel relatorio={relatorio} />
                                )}
                            </div>
                        )}

                        {!relatorio && !loadingRelatorio && (
                            <div className="bg-[#F5F5F5] rounded-2xl p-12 text-center">
                                <div className="text-6xl mb-4 opacity-20">🏗️</div>
                                <div className="text-xl font-semibold text-gray-700 mb-2">Selecciona obra y mes</div>
                                <p className="text-gray-600">Para visualizar los datos financieros y analíticos.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal Global de Salvos */}
            {showSavedReports && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowSavedReports(false)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h3 className="text-lg font-semibold text-gray-900">Informes Guardados</h3>
                            <button
                                onClick={() => setShowSavedReports(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6">
                            {savedReports.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <IconFileText size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>No hay informes guardados</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {savedReports.map(r => (
                                        <div key={r.id} className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-xl">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-gray-900 truncate">{r.obra.numero} - {r.obra.nome}</div>
                                                <div className="text-sm text-gray-600 mt-0.5">{r.mes} | €{r.valores?.valor_total?.toFixed(2) || '0.00'}</div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => loadSavedReport(r)}
                                                    className="px-3 py-1.5 bg-gray-900 text-white rounded-full text-xs font-medium hover:bg-gray-800 transition-colors"
                                                >
                                                    Cargar
                                                </button>
                                                <button
                                                    onClick={() => deleteSavedReport(r.id)}
                                                    className="px-3 py-1.5 bg-red-600 text-white rounded-full text-xs font-medium hover:bg-red-700 transition-colors"
                                                >
                                                    Borrar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

