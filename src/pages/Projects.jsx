import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { api, clientesService, encarregadosService } from '../services/api';
import { PAISES_EUROPA, PAISES_FLAGS } from '../data/paises';
import { Plus, Search, Edit, Trash2, Users, MapPin, Mail, Briefcase, Building2, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Modal, ModalBody, ModalFooter } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import CustomSelect from '../components/CustomSelect';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

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
                    <Calendar className="w-4 h-4 text-gray-500" />
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
        // Faturamento (valores cobrados do cliente)
        fatura_hora_normal: 25.00,
        fatura_hora_extra: 37.50,
        fatura_hora_noturna: 50.00,
        multiplicador_extra: 1.50,
        multiplicador_noturna: 2.00,
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

    // Auto-refresh: refetch quando volta ao app ou reconecta
    useAutoRefresh(['projects', 'employees', 'clients'], {
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

    useEffect(() => { loadData(); }, []);

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
                dias_desativados: diasDesativados
            };
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
            // Faturamento
            fatura_hora_normal: parseFloat(project.fatura_hora_normal) || 25.00,
            fatura_hora_extra: parseFloat(project.fatura_hora_extra) || 37.50,
            fatura_hora_noturna: parseFloat(project.fatura_hora_noturna) || 50.00,
            multiplicador_extra: parseFloat(project.multiplicador_extra) || 1.50,
            multiplicador_noturna: parseFloat(project.multiplicador_noturna) || 2.00,
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
            fatura_hora_normal: 25.00, fatura_hora_extra: 37.50, fatura_hora_noturna: 50.00,
            multiplicador_extra: 1.50, multiplicador_noturna: 2.00,
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
        <div className="min-h-screen bg-white pb-32">
            {/* Search & Filtros */}
            <div className="px-4 pt-6 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative md:col-span-2">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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

            {/* Projects List */}
            <div className="px-4">
                {loading ? (
                    <div className="bg-[#F5F5F5] rounded-2xl p-12 text-center">
                        <p className="text-gray-600">Cargando proyectos...</p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="bg-[#F5F5F5] rounded-2xl p-12 text-center">
                        <Briefcase size={48} className="mx-auto mb-4 text-gray-400 opacity-30" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron obras</h3>
                        <p className="text-gray-600">Verifica tu búsqueda o crea una nueva obra.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="bg-[#F5F5F5] rounded-2xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 shrink-0">
                                    <Briefcase size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                            {project.numero}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 text-base truncate">{project.nome}</h3>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => openAssignModal(project)}
                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-gray-600 hover:bg-gray-100 transition-colors"
                                        title="Asignar personal"
                                    >
                                        <Users size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(project)}
                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-gray-600 hover:bg-gray-100 transition-colors"
                                        title="Editar"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(project)}
                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-red-500 hover:bg-red-50 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-1.5">
                                {project.cliente_nome && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Building2 size={14} className="shrink-0" />
                                        <span className="truncate">{project.cliente_nome}</span>
                                    </div>
                                )}
                                {project.encarregado_nome && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                            {project.encarregado_nome.charAt(0)}
                                        </div>
                                        <span className="truncate">{project.encarregado_nome}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users size={14} className="shrink-0" />
                                    <span>{project.funcionarios_count || 0} asignados</span>
                                </div>
                                {project.endereco && (
                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                        <MapPin size={14} className="mt-0.5 shrink-0" />
                                        <span className="line-clamp-1">{project.endereco}</span>
                                    </div>
                                )}
                                {project.email_financeiro && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail size={14} className="shrink-0" />
                                        <span className="truncate">{project.email_financeiro}</span>
                                    </div>
                                )}
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
                        <Briefcase className="w-5 h-5 text-[#CE0201]" />
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
                                        <Users className="w-3.5 h-3.5 text-gray-500" />
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
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Normal</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                value={formData.fatura_hora_normal}
                                                onChange={(e) => setFormData({ ...formData, fatura_hora_normal: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Extra</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                value={formData.fatura_hora_extra}
                                                onChange={(e) => setFormData({ ...formData, fatura_hora_extra: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Nocturna</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                value={formData.fatura_hora_noturna}
                                                onChange={(e) => setFormData({ ...formData, fatura_hora_noturna: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Mult. Extra</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                value={formData.multiplicador_extra}
                                                onChange={(e) => setFormData({ ...formData, multiplicador_extra: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Impostos */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Impuestos (%)</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">IGI</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                value={formData.imposto_igi}
                                                onChange={(e) => setFormData({ ...formData, imposto_igi: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">CAS Func.</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                value={formData.imposto_cas_funcionario}
                                                onChange={(e) => setFormData({ ...formData, imposto_cas_funcionario: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">CAS Emp.</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                value={formData.imposto_cas_empresa}
                                                onChange={(e) => setFormData({ ...formData, imposto_cas_empresa: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">IRPC</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                value={formData.imposto_irpc}
                                                onChange={(e) => setFormData({ ...formData, imposto_irpc: parseFloat(e.target.value) || 0 })}
                                            />
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
                                <Trash2 size={24} className={deleteConfirm.hasRecords ? 'text-orange-600' : 'text-red-600'} />
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
        </div>
    );
}
