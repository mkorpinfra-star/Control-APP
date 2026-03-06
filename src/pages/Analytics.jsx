import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import {
    Clock, DollarSign, Users, Building2,
    TrendingUp, Download, Mail, Plus
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [filters, setFilters] = useState(null);
    const [obras, setObras] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [exporting, setExporting] = useState(false);
    const [sending, setSending] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailTo, setEmailTo] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (filters) {
            loadAnalytics();
        }
    }, [filters]);

    const loadInitialData = async () => {
        try {
            const token = localStorage.getItem('token');

            const [obrasRes, funcRes] = await Promise.all([
                fetch(`${API_URL}/obras/list.php`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/usuarios/list.php`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const obrasData = await obrasRes.json();
            const funcData = await funcRes.json();

            setObras(Array.isArray(obrasData) ? obrasData : []);
            setFuncionarios(Array.isArray(funcData) ? funcData.filter(u => u.tipo === 'funcionario') : []);

            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30);

            setFilters({
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0],
                obra: 'all',
                employee: 'all',
                compare: false
            });

        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        if (!filters) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                start_date: filters.startDate,
                end_date: filters.endDate
            });

            if (filters.obra !== 'all') params.append('obra_id', filters.obra);
            if (filters.employee !== 'all') params.append('employee_id', filters.employee);
            if (filters.compare && filters.compareStartDate) {
                params.append('compare_start_date', filters.compareStartDate);
                params.append('compare_end_date', filters.compareEndDate);
            }

            const res = await fetch(`${API_URL}/dashboard/analytics-advanced.php?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await res.json();
            if (result.success) {
                setData(result);
            }
        } catch (error) {
            console.error('Erro ao carregar analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleExportExcel = async () => {
        if (!filters) return;

        setExporting(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                start_date: filters.startDate,
                end_date: filters.endDate
            });

            if (filters.obra !== 'all') params.append('obra_id', filters.obra);
            if (filters.employee !== 'all') params.append('employee_id', filters.employee);

            const res = await fetch(`${API_URL}/dashboard/analytics-export.php?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await res.json();
            if (result.success) {
                const downloadUrl = API_URL + result.download_url;
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = result.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                setToast({ message: 'Archivo Excel generado con éxito!', type: 'success' });
            } else {
                throw new Error(result.message || 'Error al generar Excel');
            }
        } catch (error) {
            console.error('Erro ao exportar Excel:', error);
            setToast({ message: 'Error al exportar: ' + error.message, type: 'error' });
        } finally {
            setExporting(false);
        }
    };

    const handleSendEmail = () => {
        setShowEmailModal(true);
    };

    const handleConfirmSendEmail = async () => {
        if (!emailTo || !filters) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailTo)) {
            setToast({ message: 'Email inválido', type: 'error' });
            return;
        }

        setSending(true);
        try {
            const token = localStorage.getItem('token');
            const body = {
                email: emailTo,
                start_date: filters.startDate,
                end_date: filters.endDate,
                obra_id: filters.obra,
                employee_id: filters.employee,
                include_attachment: true
            };

            const res = await fetch(`${API_URL}/dashboard/analytics-email.php`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const result = await res.json();
            if (result.success) {
                setToast({ message: 'Informe enviado con éxito!', type: 'success' });
                setShowEmailModal(false);
                setEmailTo('');
            } else {
                throw new Error(result.message || 'Error al enviar email');
            }
        } catch (error) {
            console.error('Erro ao enviar email:', error);
            setToast({ message: 'Error al enviar: ' + error.message, type: 'error' });
        } finally {
            setSending(false);
        }
    };

    if (loading && !data) {
        return <Loading />;
    }

    const evolutionChart = data?.evolution ? {
        labels: data.evolution.map(e => e.label),
        datasets: [
            {
                label: 'Horas Normales',
                data: data.evolution.map(e => e.normal),
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Horas Extra',
                data: data.evolution.map(e => e.extra),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Horas Nocturna',
                data: data.evolution.map(e => e.noturna),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    } : null;

    const topEmployeesChart = data?.top_employees?.slice(0, 10) ? {
        labels: data.top_employees.slice(0, 10).map(e => e.nome.split(' ')[0]),
        datasets: [{
            label: 'Horas Totales',
            data: data.top_employees.slice(0, 10).map(e => e.horas_total),
            backgroundColor: '#CE0201',
            borderRadius: 6
        }]
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: 'bottom' },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            y: { beginAtZero: true, grid: { color: '#e5e7eb' } },
            x: { grid: { display: false } }
        }
    };

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Header */}
            <div className="px-4 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Análisis en tiempo real</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleExportExcel}
                        disabled={exporting || !filters}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F5] text-gray-700 hover:bg-gray-200 transition-colors font-medium rounded-full text-sm disabled:opacity-40"
                    >
                        <Download size={14} />
                        {exporting ? 'Generando...' : 'Excel'}
                    </button>
                    <button
                        onClick={handleSendEmail}
                        disabled={!filters}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F5] text-gray-700 hover:bg-gray-200 transition-colors font-medium rounded-full text-sm disabled:opacity-40"
                    >
                        <Mail size={14} />
                        Email
                    </button>
                </div>
            </div>

            {loading ? (
                <Loading />
            ) : data ? (
                <>
                    {/* KPIs */}
                    <div className="px-4 mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-[#F5F5F5] rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-black" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 mb-1">Horas Totales</p>
                                <p className="text-2xl font-bold text-gray-900">{data.totals.horas_total}h</p>
                            </div>
                            <div className="bg-[#F5F5F5] rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <DollarSign className="w-4 h-4 text-black" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 mb-1">Costo Total</p>
                                <p className="text-2xl font-bold text-gray-900">€{data.costs.total.toFixed(2)}</p>
                            </div>
                            <div className="bg-[#F5F5F5] rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Users className="w-4 h-4 text-black" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 mb-1">Empleados</p>
                                <p className="text-2xl font-bold text-gray-900">{data.totals.funcionarios}</p>
                            </div>
                            <div className="bg-[#F5F5F5] rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-black" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 mb-1">Obras</p>
                                <p className="text-2xl font-bold text-gray-900">{data.totals.obras}</p>
                            </div>
                        </div>
                    </div>

                    {/* Evolution Chart */}
                    {evolutionChart && (
                        <div className="px-4 mb-4">
                            <div className="bg-white rounded-2xl p-5 border border-gray-200">
                                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-black" />
                                    </div>
                                    Evolución Temporal
                                </h3>
                                <div className="h-[300px]">
                                    <Line data={evolutionChart} options={chartOptions} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Top Employees Chart */}
                    {topEmployeesChart && (
                        <div className="px-4 mb-4">
                            <div className="bg-white rounded-2xl p-5 border border-gray-200">
                                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Users className="w-4 h-4 text-black" />
                                    </div>
                                    Top 10 Empleados
                                </h3>
                                <div className="h-[300px]">
                                    <Bar data={topEmployeesChart} options={chartOptions} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detailed Table */}
                    {data.top_employees && data.top_employees.length > 0 && (
                        <div className="px-4 mb-4">
                            <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
                                <div className="p-5 border-b border-gray-200">
                                    <h3 className="text-base font-semibold text-gray-900">
                                        Detalle de Empleados
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-[#F5F5F5] border-b border-gray-200">
                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">Empleado</th>
                                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700">Normal</th>
                                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700">Extra</th>
                                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700">Nocturna</th>
                                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700">Total</th>
                                                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700">Costo</th>
                                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700">Eficiencia</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.top_employees.map((emp) => (
                                                <tr key={emp.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-3 py-3 font-medium text-gray-900">{emp.nome}</td>
                                                    <td className="px-3 py-3 text-center text-gray-700">{emp.horas_normal}h</td>
                                                    <td className="px-3 py-3 text-center text-gray-700">{emp.horas_extra}h</td>
                                                    <td className="px-3 py-3 text-center text-gray-700">{emp.horas_noturna}h</td>
                                                    <td className="px-3 py-3 text-center font-semibold text-gray-900">{emp.horas_total}h</td>
                                                    <td className="px-3 py-3 text-right font-semibold text-gray-900">€{emp.custo_total.toFixed(2)}</td>
                                                    <td className="px-3 py-3 text-center">
                                                        <Badge variant={emp.eficiencia >= 80 ? 'success' : emp.eficiencia >= 60 ? 'warning' : 'danger'}>
                                                            {emp.eficiencia.toFixed(0)}%
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <Alert variant="info">
                    Selecciona un período para visualizar los analytics
                </Alert>
            )}

            {/* Email Modal */}
            {showEmailModal && (
                <Modal
                    isOpen={showEmailModal}
                    onClose={() => {
                        setShowEmailModal(false);
                        setEmailTo('');
                    }}
                    title="Enviar Informe por Email"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email de Destino
                            </label>
                            <Input
                                type="email"
                                value={emailTo}
                                onChange={(e) => setEmailTo(e.target.value)}
                                placeholder="ejemplo@empresa.com"
                                disabled={sending}
                            />
                        </div>

                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                            <strong>Período:</strong> {filters?.startDate} hasta {filters?.endDate}
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowEmailModal(false);
                                    setEmailTo('');
                                }}
                                disabled={sending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleConfirmSendEmail}
                                disabled={!emailTo || sending}
                            >
                                {sending ? (
                                    'Enviando...'
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4" />
                                        Enviar
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
