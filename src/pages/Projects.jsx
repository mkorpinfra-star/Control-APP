import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { api, clientesService } from '../services/api';
import { Plus, Search, Edit, Trash2, Users, MapPin, Mail, Briefcase, Building2, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Modal, ModalBody, ModalFooter } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';

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
    const [formData, setFormData] = useState({
        numero: '', nome: '', endereco: '', email_financeiro: '', email_encarregado: '',
        cliente_id: '', encarregado_id: '', data_inicio: '', data_fim: ''
    });
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [diasDesativados, setDiasDesativados] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [projectsRes, employeesRes, clientsRes] = await Promise.allSettled([
                api.getProjects(),
                api.getEmployees(),
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
                setEncarregados(all.filter(e => e.tipo === 'encarregado'));
            } else {
                console.warn('Failed to load employees for dropdowns');
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
            data_fim: project.data_fim || ''
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
        if (!confirm(`¿Eliminar obra ${project.numero}?`)) return;
        try {
            const result = await api.deleteProject(project.id, force);
            if (result?.error === 'has_records') {
                if (confirm(`⚠️ Esta obra tiene ${result.count} registros de horas en el sistema.\n\n¿Desea removerla de todas formas?`)) {
                    await api.deleteProject(project.id, true);
                    loadData();
                }
            } else {
                loadData();
            }
        }
        catch (error) { alert('Error: ' + error.message); }
    };

    const openNewModal = () => {
        setEditingProject(null);
        setFormData({ numero: '', nome: '', endereco: '', email_financeiro: '', email_encarregado: '', cliente_id: '', encarregado_id: '', data_inicio: '', data_fim: '' });
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
        try { await api.assignEmployees(selectedProject.id, selectedEmployees); setShowAssignModal(false); loadData(); }
        catch (error) { alert('Error: ' + error.message); }
        finally { setSaving(false); }
    };

    const handleClientChange = (clienteId) => {
        setFormData({ ...formData, cliente_id: clienteId });
        const client = clients.find(c => c.id === parseInt(clienteId));
        if (client && client.email_financeiro && !formData.email_financeiro) {
            setFormData(prev => ({ ...prev, cliente_id: clienteId, email_financeiro: client.email_financeiro }));
        }
    };

    const filteredProjects = projects.filter(p =>
        (p.numero?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full p-4 sm:p-6 bg-white min-h-screen pb-24">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-gray-200">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase tracking-wide">
                        Obras & Proyectos
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 uppercase">GESTIÓN OPERATIVA</p>
                </div>
                <Button variant="danger" onClick={openNewModal} className="!bg-red-600 !text-white">
                    <Plus size={20} /> Nueva Obra
                </Button>
            </div>

            {/* Filter */}
            <div className="relative mb-6 max-w-2xl">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    placeholder="Buscar obra..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                />
            </div>

            {/* Grid de Cards - Mobile Friendly */}
            {loading ? (
                <div className="p-10 text-center">
                    <Loading size="lg" text="CARGANDO DATOS..." />
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="py-16 px-4 text-center">
                    <Briefcase size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
                    <h3 className="text-xl font-bold text-black uppercase mb-2">NO SE ENCONTRARON OBRAS</h3>
                    <p className="text-gray-500">Verifica tu búsqueda o registra una nueva.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => (
                        <Card key={project.id} variant="nubank" className="hover:shadow-md transition-shadow">
                            <CardBody>
                                {/* Header com ID e Nome */}
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-12 h-12 bg-j2s-red rounded-full flex items-center justify-center text-white shrink-0">
                                        <Briefcase size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Badge variant="danger" className="mb-1 text-xs">{project.numero}</Badge>
                                        <h3 className="text-lg font-bold text-black line-clamp-2">{project.nome}</h3>
                                    </div>
                                </div>

                                {/* Informações */}
                                <div className="space-y-2 mb-4">
                                    {/* Cliente */}
                                    {project.cliente_nome && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Building2 size={14} className="shrink-0" />
                                            <span className="truncate">{project.cliente_nome}</span>
                                        </div>
                                    )}

                                    {/* Encarregado */}
                                    {project.encarregado_nome && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className="w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                                {project.encarregado_nome.charAt(0)}
                                            </div>
                                            <span className="truncate">{project.encarregado_nome}</span>
                                        </div>
                                    )}

                                    {/* Funcionários */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Users size={14} className="shrink-0" />
                                        <span>{project.funcionarios_count || 0} Asignados</span>
                                    </div>

                                    {/* Endereço */}
                                    {project.endereco && (
                                        <div className="flex items-start gap-2 text-sm text-gray-600">
                                            <MapPin size={14} className="mt-0.5 shrink-0" />
                                            <span className="line-clamp-2">{project.endereco}</span>
                                        </div>
                                    )}

                                    {/* Email Financeiro */}
                                    {project.email_financeiro && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail size={14} className="shrink-0" />
                                            <span className="truncate">{project.email_financeiro}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Botões de Ação */}
                                <div className="flex gap-2 pt-3">
                                    <button
                                        onClick={() => openAssignModal(project)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-gray-300 text-gray-700 hover:border-j2s-red hover:text-j2s-red rounded-lg transition-all font-semibold text-sm"
                                    >
                                        <Users size={16} />
                                        Personal
                                    </button>
                                    <button
                                        onClick={() => handleEdit(project)}
                                        className="flex items-center justify-center py-2 px-3 border border-gray-300 text-gray-700 hover:border-j2s-red hover:text-j2s-red rounded-lg transition-all"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(project)}
                                        className="flex items-center justify-center py-2 px-3 border border-red-300 text-j2s-red hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

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
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Cliente</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                        value={formData.cliente_id} onChange={(e) => handleClientChange(e.target.value)}>
                                        <option value="">Seleccionar...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Encargado</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                        value={formData.encarregado_id} onChange={(e) => setFormData({ ...formData, encarregado_id: e.target.value })}>
                                        <option value="">Seleccionar...</option>
                                        {encarregados.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                                    </select>
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
        </div>
    );
}
