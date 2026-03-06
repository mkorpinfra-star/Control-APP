import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { obrasService } from '../services/api';
import FinancialReport from '../components/reports/FinancialReport';
import AnalyticsDashboard from '../components/reports/AnalyticsDashboard';
import InsightsPanel from '../components/reports/InsightsPanel';
import EmployeeLog from '../components/reports/EmployeeLog';
import { ChartIcon, BrainIcon, FileIcon, CloseIcon } from '../components/Icons';
import { User, ClipboardList, BookOpen } from 'lucide-react';

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

    // Industrial Styles
    const styles = {
        container: { maxWidth: '1600px', margin: '0 auto', padding: '24px' },
        header: { marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #CE0201', paddingBottom: '16px' },
        title: { fontSize: '32px', fontWeight: 'bold', fontFamily: 'Oswald', textTransform: 'uppercase', color: '#111', display: 'flex', alignItems: 'center', gap: '12px' },
        controls: { background: 'white', padding: '24px', border: '2px solid #e9ecef', marginBottom: '32px', display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-end' },
        tabs: { display: 'flex', gap: '8px', marginBottom: '0', borderBottom: '2px solid #111' },
        tab: (isActive) => ({
            padding: '12px 24px',
            cursor: 'pointer',
            border: isActive ? '2px solid #111' : '2px solid transparent',
            borderBottom: isActive ? 'none' : '2px solid transparent',
            color: isActive ? '#111' : '#888',
            fontWeight: 'bold',
            background: isActive ? 'white' : '#f8f9fa',
            fontFamily: 'Oswald',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'all 0.1s',
            marginBottom: '-2px',
            position: 'relative',
            zIndex: isActive ? 10 : 1,
            display: 'flex', alignItems: 'center', gap: '8px'
        }),
        modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: 'white', padding: '24px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', border: '4px solid #CE0201' }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontFamily: 'Oswald' }}>CARGANDO DATOS...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.title}><ClipboardList size={32} /> Informes & Analítica</div>
                <button
                    onClick={() => setShowSavedReports(true)}
                    style={{ padding: '10px 20px', background: '#111', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontFamily: 'Oswald', textTransform: 'uppercase' }}
                >
                    <FileIcon /> Guardados ({savedReports.length})
                </button>
            </div>

            {/* Abas Superiores (Industrial Tabs) */}
            <div style={styles.tabs}>
                <div style={styles.tab(activeTab === 'financial')} onClick={() => setActiveTab('financial')}>
                    <ChartIcon /> Financiero
                </div>
                <div style={styles.tab(activeTab === 'analytics')} onClick={() => setActiveTab('analytics')}>
                    <BookOpen size={18} /> Performance
                </div>
                <div style={styles.tab(activeTab === 'insights')} onClick={() => setActiveTab('insights')}>
                    <BrainIcon /> IA Insights
                </div>
                <div style={styles.tab(activeTab === 'log')} onClick={() => setActiveTab('log')}>
                    <User size={18} /> Historial Empleado
                </div>
            </div>

            <div style={{ padding: '24px', background: 'white', border: '2px solid #111', borderTop: 'none', minHeight: '500px' }}>

                {activeTab === 'log' ? (
                    <EmployeeLog />
                ) : (
                    /* Conteúdo que depende de selecionar Obra */
                    <>
                        <div style={styles.controls}>
                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', fontFamily: 'Oswald', marginBottom: '6px', color: '#111' }}>OBRA</label>
                                <select
                                    value={selectedObra}
                                    onChange={e => setSelectedObra(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '0', border: '2px solid #ddd', fontFamily: 'Roboto' }}
                                >
                                    <option value="">SELECCIONAR OBRA...</option>
                                    {obras.map(o => <option key={o.id} value={o.id}>{o.numero} - {o.nome}</option>)}
                                </select>
                            </div>
                            <div style={{ width: '200px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', fontFamily: 'Oswald', marginBottom: '6px', color: '#111' }}>MES</label>
                                <input
                                    type="month"
                                    value={selectedMes}
                                    onChange={e => setSelectedMes(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '0', border: '2px solid #ddd', fontFamily: 'Roboto' }}
                                />
                            </div>
                            <div>
                                <button
                                    onClick={loadRelatorio}
                                    disabled={loadingRelatorio || !selectedObra}
                                    style={{ padding: '14px 28px', background: '#CE0201', color: 'white', border: 'none', cursor: (loadingRelatorio || !selectedObra) ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontFamily: 'Oswald', textTransform: 'uppercase', opacity: (loadingRelatorio || !selectedObra) ? 0.6 : 1 }}
                                >
                                    {loadingRelatorio ? 'GENERANDO...' : 'GENERAR INFORME'}
                                </button>
                            </div>
                        </div>

                        {message && <div style={{ padding: '16px', background: '#fef2f2', color: '#dc2626', border: '2px solid #dc2626', marginBottom: '24px', fontWeight: 'bold' }}>
                            {message.text}
                        </div>}

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
                            <div style={{ textAlign: 'center', padding: '80px', color: '#ccc' }}>
                                <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }}>🏗️</div>
                                <div style={{ fontFamily: 'Oswald', fontSize: '24px', color: '#888' }}>SELECCIONA OBRA Y MES</div>
                                <p>Para visualizar los datos financieros y analíticos.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal Global de Salvos */}
            {showSavedReports && (
                <div style={styles.modal} onClick={() => setShowSavedReports(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontFamily: 'Oswald', textTransform: 'uppercase' }}>Informes Guardados</h3>
                            <button onClick={() => setShowSavedReports(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>&times;</button>
                        </div>
                        {savedReports.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#6b7280' }}>VACÍO</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {savedReports.map(r => (
                                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f9fafb', border: '1px solid #e9ecef' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontFamily: 'Oswald' }}>{r.obra.numero} - {r.obra.nome}</div>
                                            <div style={{ fontSize: '13px', color: '#666' }}>{r.mes} | €{r.valores?.valor_total?.toFixed(2) || '0.00'}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => loadSavedReport(r)} style={{ padding: '6px 12px', background: '#111', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'Oswald' }}>CARGAR</button>
                                            <button onClick={() => deleteSavedReport(r.id)} style={{ padding: '6px 12px', background: '#dc2626', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'Oswald' }}>BORRAR</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

