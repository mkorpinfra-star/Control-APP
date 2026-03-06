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
    BarChart3, Clock, DollarSign, Users, Building2,
    TrendingUp, Download, Mail
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
        <div className="w-full">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-600 mt-1">Análisis en tiempo real con IA predictiva</p>
            </div>
            <div className="px-4 mb-4">
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleExportExcel}
                        disabled={exporting || !filters}
                    >
                        <Download className="w-4 h-4" />
                        {exporting ? 'Generando...' : 'Exportar Excel'}
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSendEmail}
                        disabled={!filters}
                    >
                        <Mail className="w-4 h-4" />
                        Enviar Email
                    </Button>
                </div>
            </div>

            {loading ? (
                <Loading />
            ) : data ? (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4 bg-[#F5F5F5]">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-black" />
                                <p className="text-sm font-medium text-gray-600">Horas Totales</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{data.totals.horas_total}h</p>
                        </Card>
                        <Card className="p-4 bg-[#F5F5F5]">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-5 h-5 text-black" />
                                <p className="text-sm font-medium text-gray-600">Costo Total</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">€{data.costs.total.toFixed(2)}</p>
                        </Card>
                        <Card className="p-4 bg-[#F5F5F5]">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-5 h-5 text-black" />
                                <p className="text-sm font-medium text-gray-600">Empleados</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{data.totals.funcionarios}</p>
                        </Card>
                        <Card className="p-4 bg-[#F5F5F5]">
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 className="w-5 h-5 text-black" />
                                <p className="text-sm font-medium text-gray-600">Obras</p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{data.totals.obras}</p>
                        </Card>
                    </div>

                    {/* Evolution Chart */}
                    {evolutionChart && (
                        <Card className="mb-6">
                            <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Evolución Temporal
                            </h3>
                            <div className="h-[300px]">
                                <Line data={evolutionChart} options={chartOptions} />
                            </div>
                        </Card>
                    )}

                    {/* Top Employees Chart */}
                    {topEmployeesChart && (
                        <Card className="mb-6">
                            <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Top 10 Empleados
                            </h3>
                            <div className="h-[300px]">
                                <Bar data={topEmployeesChart} options={chartOptions} />
                            </div>
                        </Card>
                    )}

                    {/* Detailed Table */}
                    {data.top_employees && data.top_employees.length > 0 && (
                        <Card>
                            <h3 className="text-lg font-semibold text-black mb-4">
                                Detalle de Empleados
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-3 py-2 text-left font-semibold">Empleado</th>
                                            <th className="px-3 py-2 text-center font-semibold">Normal</th>
                                            <th className="px-3 py-2 text-center font-semibold">Extra</th>
                                            <th className="px-3 py-2 text-center font-semibold">Nocturna</th>
                                            <th className="px-3 py-2 text-center font-semibold">Total</th>
                                            <th className="px-3 py-2 text-right font-semibold">Costo</th>
                                            <th className="px-3 py-2 text-center font-semibold">Eficiencia</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.top_employees.map((emp) => (
                                            <tr key={emp.id}>
                                                <td className="px-3 py-2 font-medium">{emp.nome}</td>
                                                <td className="px-3 py-2 text-center text-success">{emp.horas_normal}h</td>
                                                <td className="px-3 py-2 text-center text-warning">{emp.horas_extra}h</td>
                                                <td className="px-3 py-2 text-center text-info">{emp.horas_noturna}h</td>
                                                <td className="px-3 py-2 text-center font-semibold">{emp.horas_total}h</td>
                                                <td className="px-3 py-2 text-right font-semibold">€{emp.custo_total.toFixed(2)}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <Badge variant={emp.eficiencia >= 80 ? 'success' : emp.eficiencia >= 60 ? 'warning' : 'danger'}>
                                                        {emp.eficiencia.toFixed(0)}%
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
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
