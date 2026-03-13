import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { api, clientesService, encarregadosService } from '../services/api';
import { PAISES_EUROPA, PAISES_FLAGS } from '../data/paises';
import { IconPlus, IconSearch, IconEdit, IconTrash, IconUsers, IconMapPin, IconMail, IconBriefcase, IconBuildingFactory2, IconCalendar, IconEraser, IconCheck } from '@tabler/icons-react';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Modal, ModalBody, ModalFooter } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import CustomSelect from '../components/CustomSelect';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import ProjectsTour from '../components/tours/ProjectsTour';

// ── Mini calendário de dias úteis (1 mês por vez, navegável) ───────────────
function ObraCalendar({ dataInicio, dataFim, diasDesativados, onChange }) {
    const DS = ['D','L','M','X','J','V','S'];
    const [mesIdx, setMesIdx] = useState(0);

    const meses = useMemo(() => {
        if (!dataInicio || !dataFim) return [];
        const inicio = new Date(dataInicio + 'T00:00:00');
        const fim    = new Date(dataFim    + 'T00:00:00');
        if (inicio > fim) return [];
        const list = [];
        let cur = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
        const end = new Date(fim.getFullYear(), fim.getMonth(), 1);
        while (cur <= end) {
            const y = cur.getFullYear(), m = cur.getMonth();
            const cells = [];
            const first = new Date(y, m, 1).getDay();
            for (let i = 0; i < first; i++) cells.push(null);
            const total = new Date(y, m + 1, 0).getDate();
            for (let d = 1; d <= total; d++) {
                const dt = new Date(y, m, d);
                cells.push((dt >= inicio && dt <= fim) ? dt.toISOString().split('T')[0] : null);
            }
            list.push({
                label: new Date(y, m, 1).toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
                cells
            });
            cur.setMonth(cur.getMonth() + 1);
        }
        return list;
    }, [dataInicio, dataFim]);

    // reset index when dates change
    useMemo(() => { setMesIdx(0); }, [dataInicio, dataFim]);

    if (!meses.length) return null;

    const cur = meses[Math.min(mesIdx, meses.length - 1)];
    const toggle = (dia) => {
        if (!dia) return;
        onChange(diasDesativados.includes(dia) ? diasDesativados.filter(d => d !== dia) : [...diasDesativados, dia]);
    };
    // Count disabled days in current month
    const disabledThisMonth = cur.cells.filter(d => d && diasDesativados.includes(d)).length;
    const totalThisMonth    = cur.cells.filter(Boolean).length;

    return (
        <div className="mt-3 rounded-xl overflow-hidden shadow-sm bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                <div className="flex items-center gap-2">
                    <IconCalendar stroke={1} className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Días de trabajo</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block"></span>Activo</span>
                    <span className="mx-1 text-gray-300">|</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-gray-300 inline-block"></span>Feriado</span>
                </div>
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between px-3 py-2 bg-white">
                <button type="button" onClick={() => setMesIdx(i => Math.max(0, i - 1))}
                    disabled={mesIdx === 0}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 text-gray-600 text-sm font-bold">‹</button>
                <span className="text-sm font-semibold text-gray-800 capitalize">{cur.label}</span>
                <button type="button" onClick={() => setMesIdx(i => Math.min(meses.length - 1, i + 1))}
                    disabled={mesIdx === meses.length - 1}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 text-gray-600 text-sm font-bold">›</button>
            </div>

            {/* Grid */}
            <div className="px-3 pb-3">
                <div className="grid grid-cols-7 gap-1 mb-1">
                    {DS.map(d => <div key={d} className="text-center text-xs font-bold text-gray-400">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {cur.cells.map((dia, i) => dia ? (
                        <button key={i} type="button" onClick={() => toggle(dia)}
                            className={`w-full aspect-square text-xs rounded-lg font-medium transition-all leading-none
                                ${diasDesativados.includes(dia)
                                    ? 'bg-gray-100 text-gray-400 line-through'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200 active:scale-95'}`}>
                            {new Date(dia + 'T00:00:00').getDate()}
                        </button>
                    ) : <div key={i} />)}
                </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                <span>{meses.length} {meses.length === 1 ? 'mes' : 'meses'} • {meses.indexOf(cur)+1}/{meses.length}</span>
                {diasDesativados.length > 0
                    ? <span className="text-orange-600 font-medium">{diasDesativados.length} día(s) desactivado(s) en total</span>
                    : <span className="text-green-600 font-medium">Todos los días activos</span>}
            </div>
        </div>
    );
}
// ───────────────────────────────────────────────────────────────────────────

export default function Projects() {
    const { t } = useTranslation();
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [encarregados, setEncarregados] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPais, setFilterPais] = useState('all');
    const [formData, setFormData] = useState({
        numero: '', nome: '', endereco: '', email_financeiro: '', email_encarregado: '',
        cliente_id: '', encarregado_id: '', data_inicio: '', data_fim: '',
        // País
        pais: 'España',
        // Habilitação de tipos de horas
        permite_hora_extra: true,
        permite_hora_noturna: true,
        // Faturamento (valores cobrados do cliente)
        fatura_hora_normal: 0,
        fatura_hora_extra: 0,
        fatura_hora_noturna: 0,
        multiplicador_extra: 0,
        multiplicador_noturna: 0,
        // Impostos/Tributações
        imposto_igi: 0.00,
        imposto_cas_funcionario: 4.70,
        imposto_cas_empresa: 23.60,
        imposto_irpc: 0.00
    });
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [diasDesativados, setDiasDesativados] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null); // {project, hasRecords, count}
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetProject, setResetProject] = useState(null);
    const [resetFuncionarioId, setResetFuncionarioId] = useState('all');
    const [resetEmployeesList, setResetEmployeesList] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Auto-refresh: refetch quando volta ao app ou reconecta
    useAutoRefresh(['projects', 'employees', 'clients'], {
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

    useEffect(() => {
        loadData();

        // Listener para botão + do header
        const handleOpenModal = () => openNewModal();
        window.addEventListener('openAddModal', handleOpenModal);
        return () => window.removeEventListener('openAddModal', handleOpenModal);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [projectsRes, employeesRes, encarregadosRes, clientsRes] = await Promise.allSettled([
                api.getProjects(),
                api.getEmployees(),
                encarregadosService.getAll(),
                clientesService.getAll()
            ]);

            if (projectsRes.status === 'fulfilled' && Array.isArray(projectsRes.value)) {
                setProjects(projectsRes.value);
            } else {
                console.error('Failed to load projects:', projectsRes.reason);
                setProjects([]);
            }

            if (employeesRes.status === 'fulfilled' && Array.isArray(employeesRes.value)) {
                const all = employeesRes.value;
                setEmployees(all.filter(e => e.tipo === 'funcionario'));
            } else {
                console.warn('Failed to load employees for dropdowns');
            }

            if (encarregadosRes.status === 'fulfilled') {
                const encData = encarregadosRes.value;
                // Backend retorna {success, encarregados: [...]}
                const encArray = encData.encarregados || encData;
                if (Array.isArray(encArray)) {
                    setEncarregados(encArray);
                } else {
                    console.warn('Encarregados response is not an array:', encData);
                    setEncarregados([]);
                }
            } else {
                console.warn('Failed to load encarregados for dropdowns:', encarregadosRes.reason);
                setEncarregados([]);
            }

            if (clientsRes.status === 'fulfilled' && Array.isArray(clientsRes.value)) {
                setClients(clientsRes.value);
            }

        } catch (error) {
            console.error('Critical error loading data:', error);
            setError('Falha ao carregar dados do sistema.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError('');
        try {
            const dataToSend = {
                ...formData,
                cliente_id: formData.cliente_id || null,
                encarregado_id: formData.encarregado_id || null,
                data_inicio: formData.data_inicio || null,
                data_fim: formData.data_fim || null,
                email_financeiro: formData.email_financeiro || null,
                email_encarregado: formData.email_encarregado || null,
                dias_desativados: diasDesativados,
                // Switches boolean - garantir que sejam enviados
                permite_hora_extra: Boolean(formData.permite_hora_extra),
                permite_hora_noturna: Boolean(formData.permite_hora_noturna),
                // Converter string vazia para 0
                fatura_hora_normal: formData.fatura_hora_normal === '' ? 0 : formData.fatura_hora_normal,
                fatura_hora_extra: formData.fatura_hora_extra === '' ? 0 : formData.fatura_hora_extra,
                fatura_hora_noturna: formData.fatura_hora_noturna === '' ? 0 : formData.fatura_hora_noturna,
                multiplicador_extra: formData.multiplicador_extra === '' ? 0 : formData.multiplicador_extra,
                multiplicador_noturna: formData.multiplicador_noturna === '' ? 0 : formData.multiplicador_noturna,
                imposto_igi: formData.imposto_igi === '' ? 0 : formData.imposto_igi,
                imposto_cas_funcionario: formData.imposto_cas_funcionario === '' ? 0 : formData.imposto_cas_funcionario,
                imposto_cas_empresa: formData.imposto_cas_empresa === '' ? 0 : formData.imposto_cas_empresa,
                imposto_irpc: formData.imposto_irpc === '' ? 0 : formData.imposto_irpc
            };

            // DEBUG: Verificar o que está sendo enviado
            console.log('🔍 Dados sendo enviados:', {
                permite_hora_extra: dataToSend.permite_hora_extra,
                permite_hora_noturna: dataToSend.permite_hora_noturna,
                tipo: typeof dataToSend.permite_hora_extra
            });

            let obraId;
            if (editingProject) {
                await api.updateProject(editingProject.id, dataToSend);
                obraId = editingProject.id;
            } else {
                const result = await api.createProject(dataToSend);
                obraId = result.id;
            }

            // Associar funcionários se houver selecionados
            if (selectedEmployees.length > 0 && obraId) {
                await api.assignEmployees(obraId, selectedEmployees);
            }

            setShowModal(false); loadData();
        } catch (error) { setError(error.message || 'Error al guardar'); }
        finally { setSaving(false); }
    };

    const handleEdit = async (project) => {
        // DEBUG: Ver o que vem do banco
        console.log('🔍 Dados recebidos do banco:', {
            permite_hora_extra: project.permite_hora_extra,
            permite_hora_noturna: project.permite_hora_noturna,
            tipo_extra: typeof project.permite_hora_extra,
            tipo_noturna: typeof project.permite_hora_noturna
        });

        setEditingProject(project);
        setFormData({
            numero: project.numero || '',
            nome: project.nome || '',
            endereco: project.endereco || '',
            email_financeiro: project.email_financeiro || '',
            email_encarregado: project.email_encarregado || '',
            cliente_id: project.cliente_id || '',
            encarregado_id: project.encarregado_id || '',
            data_inicio: project.data_inicio || '',
            data_fim: project.data_fim || '',
            // País
            pais: project.pais || 'España',
            // Habilitação de tipos de horas - converter 0/1 ou "0"/"1" para boolean
            permite_hora_extra: project.permite_hora_extra == 1,
            permite_hora_noturna: project.permite_hora_noturna == 1,
            // Faturamento
            fatura_hora_normal: parseFloat(project.fatura_hora_normal) || 0,
            fatura_hora_extra: parseFloat(project.fatura_hora_extra) || 0,
            fatura_hora_noturna: parseFloat(project.fatura_hora_noturna) || 0,
            multiplicador_extra: parseFloat(project.multiplicador_extra) || 0,
            multiplicador_noturna: parseFloat(project.multiplicador_noturna) || 0,
            // Impostos
            imposto_igi: parseFloat(project.imposto_igi) || 0.00,
            imposto_cas_funcionario: parseFloat(project.imposto_cas_funcionario) || 4.70,
            imposto_cas_empresa: parseFloat(project.imposto_cas_empresa) || 23.60,
            imposto_irpc: parseFloat(project.imposto_irpc) || 0.00
        });
        // Carregar dias desativados salvos
        try {
            const dd = project.dias_desativados;
            if (dd) {
                setDiasDesativados(typeof dd === 'string' ? JSON.parse(dd) : dd);
            } else {
                setDiasDesativados([]);
            }
        } catch { setDiasDesativados([]); }
        // Carregar funcionários já associados
        try {
            const assigned = await api.getProjectEmployees(project.id);
            setSelectedEmployees((assigned || []).map(e => e.id));
        } catch {
            setSelectedEmployees([]);
        }
        setShowModal(true); setError('');
    };

    const handleDelete = async (project, force = false) => {
        // Primeira tentativa - verificar se tem registros
        if (!force) {
            try {
                const result = await api.deleteProject(project.id, false);
                if (result?.error === 'has_records') {
                    // Tem registros - mostrar warning no modal
                    setDeleteConfirm({ project, hasRecords: true, count: result.count });
                } else {
                    // Sem registros - pode deletar direto, mas pedir confirmação
                    setDeleteConfirm({ project, hasRecords: false, count: 0 });
                }
            } catch (error) {
                setError(error.message || 'Error al eliminar obra');
            }
        } else {
            // Force delete confirmado
            try {
                await api.deleteProject(project.id, true);
                setDeleteConfirm(null);
                setError('');
                loadData();
            } catch (error) {
                setError(error.message || 'Error al eliminar obra');
            }
        }
    };

    const confirmDelete = async (force = false) => {
        if (!deleteConfirm) return;
        await handleDelete(deleteConfirm.project, force);
    };

    const openNewModal = () => {
        setEditingProject(null);
        setFormData({
            numero: '', nome: '', endereco: '', email_financeiro: '', email_encarregado: '',
            cliente_id: '', encarregado_id: '', data_inicio: '', data_fim: '',
            pais: 'España',
            fatura_hora_normal: 0, fatura_hora_extra: 0, fatura_hora_noturna: 0,
            multiplicador_extra: 0, multiplicador_noturna: 0,
            imposto_igi: 0.00, imposto_cas_funcionario: 4.70, imposto_cas_empresa: 23.60, imposto_irpc: 0.00
        });
        setSelectedEmployees([]);
        setDiasDesativados([]);
        setShowModal(true); setError('');
    };

    const openAssignModal = async (project) => {
        setSelectedProject(project);
        try { const assigned = await api.getProjectEmployees(project.id); setSelectedEmployees((assigned || []).map(e => e.id)); }
        catch { setSelectedEmployees([]); }
        setShowAssignModal(true);
    };

    const toggleEmployee = (id) => setSelectedEmployees(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const saveAssignments = async () => {
        setSaving(true);
        try {
            await api.assignEmployees(selectedProject.id, selectedEmployees);
            setShowAssignModal(false);
            loadData();
        }
        catch (error) {
            setError(error.message || 'Error al asignar empleados');
        }
        finally { setSaving(false); }
    };

    const handleClientChange = (clienteId) => {
        setFormData({ ...formData, cliente_id: clienteId });
        const client = clients.find(c => c.id === parseInt(clienteId));
        if (client && client.email_financeiro && !formData.email_financeiro) {
            setFormData(prev => ({ ...prev, cliente_id: clienteId, email_financeiro: client.email_financeiro }));
        }
    };

    const openResetModal = async (project) => {
        setResetProject(project);
        setResetFuncionarioId('all');
        setError('');
        try {
            const assigned = await api.getProjectEmployees(project.id);
            setResetEmployeesList(assigned || []);
        } catch {
            setResetEmployeesList([]);
        }
        setShowResetModal(true);
    };

    const handleResetHoras = async () => {
        if (!resetProject) return;
        setSaving(true);
        setError('');
        try {
            const payload = {
                obra_id: resetProject.id,
                funcionario_id: resetFuncionarioId === 'all' ? null : parseInt(resetFuncionarioId)
            };
            const res = await fetch('https://puntotouch.nextim.io/backend/api/obras/reset-horas.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Error al resetear horas');
            }
            setShowResetModal(false);
            setResetProject(null);
            setResetFuncionarioId('all');
            setSuccessMessage(data.message || 'Horas reseteadas correctamente');
            setShowSuccessModal(true);
        } catch (error) {
            setError(error.message || 'Error al resetear horas');
        } finally {
            setSaving(false);
        }
    };

    const filteredProjects = projects.filter(p => {
        const matchSearch = (p.numero?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (p.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchPais = filterPais === 'all' || p.pais === filterPais;
        return matchSearch && matchPais;
    });

    // Obter lista de países únicos das obras (para o filtro)
    const paisesDisponiveis = useMemo(() => {
        const paises = [...new Set(projects.map(p => p.pais).filter(Boolean))];
        return paises.sort();
    }, [projects]);

    return (
        <>
            <ProjectsTour />
            <div className="h-full flex flex-col bg-white">
            {/* Search & Filtros - FIXO */}
            <div className="shrink-0 bg-white border-b border-gray-100 px-4 pt-4 pb-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div data-tour="search-input" className="relative md:col-span-2">
                        <IconSearch stroke={1} size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por número o nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                    </div>
                    <div>
                        <select
                            value={filterPais}
                            onChange={(e) => setFilterPais(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                        >
                            <option value="all">🌍 Todos los países ({projects.length})</option>
                            {paisesDisponiveis.map(pais => {
                                const count = projects.filter(p => p.pais === pais).length;
                                return (
                                    <option key={pais} value={pais}>
                                        {PAISES_FLAGS[pais] || '🏳️'} {pais} ({count})
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>
            </div>

            {/* Projects List - SCROLLÁVEL */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
                {loading ? (
                    <div className="bg-[#F5F5F5] rounded-2xl p-12 text-center">
                        <p className="text-gray-600">Cargando proyectos...</p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="bg-[#F5F5F5] rounded-2xl p-12 text-center">
                        <IconBriefcase stroke={1} size={48} className="mx-auto mb-4 text-gray-400 opacity-30" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron obras</h3>
                        <p className="text-gray-600">Verifica tu búsqueda o crea una nueva obra.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="bg-[#F5F5F5] rounded-2xl p-4 flex flex-col">
                            {/* Header */}
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-900 shrink-0">
                                    <IconBriefcase stroke={1} size={22} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="inline-block px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold mb-2">
                                        {project.numero}
                                    </span>
                                    <h3 className="font-bold text-gray-900 text-base leading-tight">
                                        {project.nome}
                                    </h3>
                                </div>
                            </div>

                            {/* Localização */}
                            <div className="flex-1 mb-4">
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <IconMapPin stroke={1} size={16} className="mt-0.5 shrink-0 text-gray-500" />
                                    <div className="flex-1">
                                        {project.endereco && (
                                            <div className="font-medium text-gray-700 mb-0.5">
                                                {project.endereco.split(',')[0]}
                                            </div>
                                        )}
                                        <div className="text-sm text-gray-500">
                                            {PAISES_FLAGS[project.pais] || '🏳️'} {project.pais || 'País no definido'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Funcionários */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-300">
                                <IconUsers stroke={1} size={16} className="shrink-0 text-gray-500" />
                                <span className="font-medium">{project.funcionarios_count || 0} asignados</span>
                            </div>

                            {/* Ações */}
                            <div className="grid grid-cols-4 gap-2">
                                <button
                                    onClick={() => openAssignModal(project)}
                                    className="h-9 flex items-center justify-center rounded-lg bg-white text-gray-600 hover:bg-gray-100 transition-colors"
                                    title="Asignar personal"
                                >
                                    <IconUsers stroke={1} size={16} />
                                </button>
                                <button
                                    onClick={() => openResetModal(project)}
                                    className="h-9 flex items-center justify-center rounded-lg bg-white text-gray-600 hover:bg-gray-100 transition-colors"
                                    title="Resetear horas"
                                >
                                    <IconEraser stroke={1} size={16} />
                                </button>
                                <button
                                    onClick={() => handleEdit(project)}
                                    className="h-9 flex items-center justify-center rounded-lg bg-white text-gray-600 hover:bg-gray-100 transition-colors"
                                    title="Editar"
                                >
                                    <IconEdit stroke={1} size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(project)}
                                    className="h-9 flex items-center justify-center rounded-lg bg-white text-red-500 hover:bg-red-50 transition-colors"
                                    title="Eliminar"
                                >
                                    <IconTrash stroke={1} size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    </div>
                )}
            </div>

            {/* Modal Crear/Editar */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} className="border-0 !max-w-3xl">
                {/* Header fixo */}
                <div className="bg-white px-5 py-3 flex items-center justify-between flex-shrink-0 rounded-t-xl border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <IconBriefcase stroke={1} className="w-5 h-5 text-[#CE0201]" />
                        <h2 className="text-base font-bold uppercase tracking-wide text-gray-900">
                            {editingProject ? 'Editar Obra' : 'Nueva Obra'}
                        </h2>
                    </div>
                    <button onClick={() => setShowModal(false)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-xl leading-none text-gray-600">
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
                    {/* Body rolável */}
                    <div className="overflow-y-auto flex-1 px-5 py-4">
                        {error && (
                            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* Layout 2 colunas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-0">

                            {/* Coluna esquerda */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Número de Obra <span className="text-red-500">*</span></label>
                                    <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
                                        value={formData.numero}
                                        onChange={(e) => setFormData({ ...formData, numero: e.target.value.toUpperCase() })}
                                        required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nombre <span className="text-red-500">*</span></label>
                                    <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Dirección</label>
                                    <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                        value={formData.endereco}
                                        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} />
                                </div>
                                <div>
                                    <CustomSelect
                                        label="Cliente"
                                        value={formData.cliente_id}
                                        onChange={(value) => handleClientChange(value)}
                                        options={[
                                            { value: '', label: 'Seleccionar...' },
                                            ...clients.map(c => ({ value: c.id, label: c.nome }))
                                        ]}
                                    />
                                </div>
                                <div>
                                    <CustomSelect
                                        label="Encargado"
                                        value={formData.encarregado_id}
                                        onChange={(value) => setFormData({ ...formData, encarregado_id: value })}
                                        options={[
                                            { value: '', label: 'Seleccionar...' },
                                            ...encarregados.map(e => ({ value: e.id, label: e.nome }))
                                        ]}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fecha Inicio</label>
                                        <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                            value={formData.data_inicio}
                                            onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fecha Fin</label>
                                        <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                            value={formData.data_fim}
                                            onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Financiero</label>
                                        <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                            value={formData.email_financeiro}
                                            onChange={(e) => setFormData({ ...formData, email_financeiro: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Encargado</label>
                                        <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                            value={formData.email_encarregado}
                                            onChange={(e) => setFormData({ ...formData, email_encarregado: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Coluna direita */}
                            <div className="space-y-3">
                                {/* Calendário */}
                                <ObraCalendar
                                    dataInicio={formData.data_inicio}
                                    dataFim={formData.data_fim}
                                    diasDesativados={diasDesativados}
                                    onChange={setDiasDesativados}
                                />

                                {/* Funcionários */}
                                <div className="rounded-xl overflow-hidden shadow-sm bg-white">
                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
                                        <IconUsers stroke={1} className="w-3.5 h-3.5 text-gray-500" />
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Funcionarios</span>
                                        {selectedEmployees.length > 0 && (
                                            <span className="ml-auto text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">{selectedEmployees.length}</span>
                                        )}
                                    </div>
                                    <div className="max-h-36 overflow-y-auto p-2 bg-white">
                                        {employees.length === 0 ? (
                                            <p className="text-gray-400 text-xs text-center py-3">Sin funcionarios</p>
                                        ) : (
                                            <div className="space-y-0.5">
                                                {employees.map(emp => (
                                                    <label key={emp.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                                        <input type="checkbox"
                                                            checked={selectedEmployees.includes(emp.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedEmployees([...selectedEmployees, emp.id]);
                                                                else setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                                                            }}
                                                            className="w-3.5 h-3.5 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-medium text-gray-900 truncate">{emp.nome}</div>
                                                            <div className="text-xs text-gray-400">{emp.passaporte}</div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* === NOVA SEÇÃO: Configurações de Faturamento e Impostos === */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                Configuraciones de Facturación e Impuestos
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* País */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Ubicación</h4>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">País</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                            value={formData.pais}
                                            onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                                        >
                                            {PAISES_EUROPA.map(pais => (
                                                <option key={pais} value={pais}>
                                                    {PAISES_FLAGS[pais] || ''} {pais}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Valores de Faturamento */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Facturación al Cliente (€/h)</h4>

                                    {/* Toggles de Habilitação - Apple Style */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3">
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-xs font-medium text-gray-700">Permitir Horas Extras</span>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, permite_hora_extra: !formData.permite_hora_extra })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    formData.permite_hora_extra ? 'bg-green-500' : 'bg-gray-300'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        formData.permite_hora_extra ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-xs font-medium text-gray-700">Permitir Horas Noturnas</span>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, permite_hora_noturna: !formData.permite_hora_noturna })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    formData.permite_hora_noturna ? 'bg-green-500' : 'bg-gray-300'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        formData.permite_hora_noturna ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Normal</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                value={formData.fatura_hora_normal === '' ? '' : formData.fatura_hora_normal}
                                                onChange={(e) => setFormData({ ...formData, fatura_hora_normal: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Extra</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                value={formData.fatura_hora_extra === '' ? '' : formData.fatura_hora_extra}
                                                onChange={(e) => setFormData({ ...formData, fatura_hora_extra: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Nocturna</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                value={formData.fatura_hora_noturna === '' ? '' : formData.fatura_hora_noturna}
                                                onChange={(e) => setFormData({ ...formData, fatura_hora_noturna: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Mult. Extra</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                value={formData.multiplicador_extra === '' ? '' : formData.multiplicador_extra}
                                                onChange={(e) => setFormData({ ...formData, multiplicador_extra: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Impostos */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Impuestos (%)</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">IGI / IVA</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="w-full px-2 py-1.5 pr-7 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    value={formData.imposto_igi === '' ? '' : formData.imposto_igi}
                                                    onChange={(e) => setFormData({ ...formData, imposto_igi: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">%</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1 whitespace-nowrap">CASS/SEG.SOC. retenção</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="w-full px-2 py-1.5 pr-7 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    value={formData.imposto_cas_funcionario === '' ? '' : formData.imposto_cas_funcionario}
                                                    onChange={(e) => setFormData({ ...formData, imposto_cas_funcionario: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">%</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1 whitespace-nowrap">CASS/SEG.SOC. Empresa</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="w-full px-2 py-1.5 pr-7 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    value={formData.imposto_cas_empresa === '' ? '' : formData.imposto_cas_empresa}
                                                    onChange={(e) => setFormData({ ...formData, imposto_cas_empresa: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">%</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">IRPC</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="w-full px-2 py-1.5 pr-7 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    value={formData.imposto_irpc === '' ? '' : formData.imposto_irpc}
                                                    onChange={(e) => setFormData({ ...formData, imposto_irpc: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-3 italic">
                                ℹ️ Estas configuraciones son específicas para esta obra y se utilizarán en los cálculos de nómina y facturación.
                            </p>
                        </div>
                    </div>

                    {/* Footer fixo */}
                    <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-xl">
                        <button type="button" onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                            CANCELAR
                        </button>
                        <Button type="submit" variant="danger" loading={saving}
                            style={{ backgroundColor: '#CE0201', color: 'white' }}>
                            GUARDAR
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Asignar Personal */}
            <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} className="border-0">
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200">
                    <h2 className="text-xl font-bold uppercase text-gray-900">
                        Asignar Personal - {selectedProject?.numero}
                    </h2>
                    <button
                        onClick={() => setShowAssignModal(false)}
                        className="text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-2xl leading-none transition-colors"
                    >
                        &times;
                    </button>
                </div>

                <ModalBody>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {employees.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No hay empleados disponibles</p>
                        ) : (
                            employees.map(emp => (
                                <label
                                    key={emp.id}
                                    className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-j2s-red transition-colors cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedEmployees.includes(emp.id)}
                                        onChange={() => toggleEmployee(emp.id)}
                                        className="w-5 h-5 text-j2s-red border-gray-300 rounded focus:ring-j2s-red"
                                    />
                                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                                        {emp.nome?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-black truncate">{emp.nome}</div>
                                        <div className="text-sm text-gray-500">PASS: {emp.passaporte}</div>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>
                </ModalBody>

                <ModalFooter className="bg-gray-50">
                    <Button type="button" variant="secondary" onClick={() => setShowAssignModal(false)}>
                        CANCELAR
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={saveAssignments}
                        loading={saving}
                        style={{ backgroundColor: '#CE0201', color: 'white', border: '2px solid #CE0201' }}
                    >
                        GUARDAR ASIGNACIÓN
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${deleteConfirm.hasRecords ? 'bg-orange-100' : 'bg-red-100'}`}>
                                <IconTrash stroke={1} size={24} className={deleteConfirm.hasRecords ? 'text-orange-600' : 'text-red-600'} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Eliminar Obra</h3>
                                <p className="text-sm text-gray-500">
                                    {deleteConfirm.hasRecords ? 'Esta obra tiene registros' : 'Esta acción no se puede deshacer'}
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {deleteConfirm.hasRecords ? (
                            <div className="mb-6">
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-orange-900 font-medium mb-2">
                                        ⚠️ Advertencia: Esta obra tiene <strong>{deleteConfirm.count}</strong> registro(s) de horas en el sistema.
                                    </p>
                                    <p className="text-sm text-orange-800">
                                        Al eliminarla, todos los apontamentos asociados también serán eliminados permanentemente.
                                    </p>
                                </div>
                                <p className="text-gray-700">
                                    ¿Estás seguro de que deseas eliminar la obra <strong>{deleteConfirm.project.numero} - {deleteConfirm.project.nome}</strong>?
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-700 mb-6">
                                ¿Estás seguro de que deseas eliminar la obra <strong>{deleteConfirm.project.numero} - {deleteConfirm.project.nome}</strong>?
                            </p>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setDeleteConfirm(null); setError(''); }}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => confirmDelete(deleteConfirm.hasRecords)}
                                className={`flex-1 px-4 py-3 text-white font-medium rounded-xl transition-colors ${
                                    deleteConfirm.hasRecords
                                        ? 'bg-orange-600 hover:bg-orange-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {deleteConfirm.hasRecords ? 'Eliminar de todas formas' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Resetear Horas */}
            {showResetModal && resetProject && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <IconEraser stroke={1} size={24} className="text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Resetear Horas</h3>
                                <p className="text-sm text-gray-500">{resetProject.numero} - {resetProject.nome}</p>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="mb-6">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-red-900 font-medium mb-2">
                                    Advertencia: Esta acción eliminará todas las horas registradas.
                                </p>
                                <p className="text-sm text-red-800">
                                    Todos los apontamentos (rascunho, enviado, aprobado) serán eliminados permanentemente.
                                </p>
                            </div>

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Seleccione qué resetear:
                            </label>
                            <select
                                value={resetFuncionarioId}
                                onChange={(e) => setResetFuncionarioId(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="all">Todos los funcionarios de esta obra</option>
                                {resetEmployeesList.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.nome} ({emp.passaporte})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowResetModal(false); setResetProject(null); setError(''); }}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleResetHoras}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Reseteando...' : 'Resetear Horas'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Sucesso */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <IconCheck stroke={1} size={24} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Operación Exitosa</h3>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-6">{successMessage}</p>

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
            </div>
        </>
    );
}
