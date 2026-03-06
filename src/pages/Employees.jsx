import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Fingerprint, Search, Plus, Trash2, Edit, X, User } from 'lucide-react';
import { Button } from '../components/ui/Button';

const inputCls = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white";

const Field = ({ label, required, children }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {children}
    </div>
);

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [funcoes, setFuncoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [formData, setFormData] = useState({
        nome: '', passaporte: '', email: '', telefone: '',
        funcao_id: '', salario_base: '', salario_hora: '', valor_hora_venda: '',
        vale_moradia: '', ibf: '', bonificacao: '',
        tipo: 'funcionario', senha: '', biometria: false
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/login/backend/api';

    useEffect(() => {
        loadEmployees();
        loadFuncoes();
    }, []);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const data = await api.getEmployees();
            setEmployees(Array.isArray(data) ? data : []);
        } catch { setEmployees([]); }
        finally { setLoading(false); }
    };

    const loadFuncoes = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/funcoes/list.php`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setFuncoes(data.funcoes || []);
        } catch {}
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                ...formData,
                funcao_id: formData.funcao_id ? parseInt(formData.funcao_id) : null,
                salario_base: formData.salario_base || null,
                salario_base_mensal: formData.salario_base || null, // compatibilidade
                salario_hora: formData.salario_hora || null,
                valor_hora_venda: formData.valor_hora_venda || null,
                bonificacao: formData.bonificacao !== '' ? formData.bonificacao : null,
            };
            if (editingEmployee) {
                await api.updateEmployee(editingEmployee.id, payload);
            } else {
                if (!formData.senha) { setError('La contraseña es obligatoria'); setSaving(false); return; }
                await api.createEmployee(payload);
            }
            setShowModal(false);
            loadEmployees();
        } catch (err) {
            setError(err.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (emp) => {
        setEditingEmployee(emp);
        setFormData({
            nome: emp.nome || '', passaporte: emp.passaporte || '',
            email: emp.email || '', telefone: emp.telefone || '',
            funcao_id: emp.funcao_id || '',
            salario_base: emp.salario_base || emp.salario_base_mensal || '',
            salario_hora: emp.salario_hora || '',
            valor_hora_venda: emp.valor_hora_venda || '',
            vale_moradia: emp.vale_moradia || '', ibf: emp.ibf || '', bonificacao: emp.bonificacao || '',
            tipo: emp.tipo || 'funcionario',
            senha: '', biometria: emp.biometria || false
        });
        setShowModal(true); setError('');
    };

    const handleDelete = async (emp) => {
        if (!confirm(`¿Eliminar a ${emp.nome}?`)) return;
        try { await api.deleteEmployee(emp.id); loadEmployees(); }
        catch (err) { alert('Error: ' + err.message); }
    };

    const openNew = () => {
        setEditingEmployee(null);
        setFormData({ nome: '', passaporte: '', email: '', telefone: '', funcao_id: '', salario_base: '', salario_hora: '', valor_hora_venda: '', vale_moradia: '', ibf: '', bonificacao: '', tipo: 'funcionario', senha: '', biometria: false });
        setShowModal(true); setError('');
    };

    const filtered = employees.filter(emp => {
        const s = searchTerm.toLowerCase();
        const matchName = (emp.nome?.toLowerCase() || '').includes(s) || (emp.passaporte?.toLowerCase() || '').includes(s);
        const matchType = filterType === 'all' || emp.tipo === filterType;
        return matchName && matchType;
    });

    const typeLabel = (t) => ({ admin: 'Admin', encarregado: 'Encargado' }[t] || 'Empleado');
    const typeColor = (t) => ({
        admin: 'bg-gray-100 text-gray-600',
        encarregado: 'bg-gray-100 text-gray-600',
        funcionario: 'bg-gray-100 text-gray-600'
    }[t] || 'bg-gray-100 text-gray-600');

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Usuarios & Personal</h1>
                    <p className="text-sm text-gray-500">Gestión de accesos y empleados</p>
                </div>
                <Button variant="danger" onClick={openNew}>
                    <Plus size={18} /> Nuevo Usuario
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o pasaporte..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="all">Todos</option>
                    <option value="funcionario">Empleados</option>
                    <option value="encarregado">Encargados</option>
                    <option value="admin">Admins</option>
                </select>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-xl" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                    <User size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">{searchTerm ? 'Sin resultados' : 'No hay usuarios. Añade el primero.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(emp => (
                        <div key={emp.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 font-bold text-sm shrink-0">
                                    {emp.nome?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{emp.nome}</p>
                                    <p className="text-xs text-gray-500">{emp.passaporte}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeColor(emp.tipo)}`}>
                                        {typeLabel(emp.tipo)}
                                    </span>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => handleEdit(emp)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors">
                                        <Edit size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(emp)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:border-red-300 hover:text-red-600 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            {(emp.salario_base > 0 || emp.salario_base_mensal > 0 || emp.salario_hora > 0 || emp.valor_hora_venda > 0) && (
                                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-500">
                                    {(emp.salario_base > 0 || emp.salario_base_mensal > 0) && (
                                        <span>Base CASS: <strong className="text-gray-700">{parseFloat(emp.salario_base || emp.salario_base_mensal).toLocaleString('de-DE', {minimumFractionDigits:2})} €</strong></span>
                                    )}
                                    {emp.salario_hora > 0 && (
                                        <span>Custo/h: <strong className="text-gray-700">{parseFloat(emp.salario_hora).toFixed(2)} €</strong></span>
                                    )}
                                    {emp.valor_hora_venda > 0 && (
                                        <span>Venda/h: <strong className="text-gray-700">{parseFloat(emp.valor_hora_venda).toFixed(2)} €</strong></span>
                                    )}
                                    {emp.vale_moradia > 0 && (
                                        <span>Moradia: <strong className="text-gray-700">{parseFloat(emp.vale_moradia).toLocaleString('de-DE', {minimumFractionDigits:2})} €</strong></span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/50 overflow-y-auto"
                    onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md"
                        onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingEmployee ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h2>
                            <button onClick={() => setShowModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="px-6 py-5 space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <Field label="Nombre Completo" required>
                                    <input className={inputCls} value={formData.nome}
                                        onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
                                </Field>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Pasaporte" required>
                                        <input className={inputCls} value={formData.passaporte}
                                            onChange={e => setFormData({ ...formData, passaporte: e.target.value.toUpperCase() })} required />
                                    </Field>
                                    <Field label="Tipo" required>
                                        <select className={inputCls} value={formData.tipo}
                                            onChange={e => setFormData({ ...formData, tipo: e.target.value })} required>
                                            <option value="funcionario">Empleado</option>
                                            <option value="encarregado">Encargado</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </Field>
                                </div>

                                <Field label="Función / Cargo">
                                    <select className={inputCls} value={formData.funcao_id}
                                        onChange={e => setFormData({ ...formData, funcao_id: e.target.value })}>
                                        <option value="">Sin función</option>
                                        {funcoes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                                    </select>
                                </Field>

                                {/* Bloco financeiro — separado por contexto */}
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3">
                                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Folha de Pagamento (interno)</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Salário Base (base CASS) €">
                                            <input type="number" step="0.01" min="0" className={inputCls}
                                                placeholder="2000.00" value={formData.salario_base}
                                                onChange={e => setFormData({ ...formData, salario_base: e.target.value })} />
                                        </Field>
                                        <Field label="Valor Hora custo (€/h)">
                                            <input type="number" step="0.01" min="0" className={inputCls}
                                                placeholder="14.00" value={formData.salario_hora}
                                                onChange={e => setFormData({ ...formData, salario_hora: e.target.value })} />
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Vale Moradia (€/mês)">
                                            <input type="number" step="0.01" min="0" className={inputCls}
                                                placeholder="0.00" value={formData.vale_moradia}
                                                onChange={e => setFormData({ ...formData, vale_moradia: e.target.value })} />
                                        </Field>
                                        <Field label="Prima (bônus)">
                                            <input type="number" step="0.01" min="0" className={inputCls}
                                                placeholder="0.00" value={formData.ibf}
                                                onChange={e => setFormData({ ...formData, ibf: e.target.value })} />
                                        </Field>
                                    </div>
                                    <Field label="Bonificação (€/mês)">
                                        <input type="number" step="0.01" min="0" className={inputCls}
                                            placeholder="0.00" value={formData.bonificacao}
                                            onChange={e => setFormData({ ...formData, bonificacao: e.target.value })} />
                                    </Field>
                                </div>

                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Faturamento (cobrado ao cliente)</p>
                                    <Field label="Valor Hora Venda (€/h)">
                                        <input type="number" step="0.01" min="0" className={inputCls}
                                            placeholder="24.00" value={formData.valor_hora_venda}
                                            onChange={e => setFormData({ ...formData, valor_hora_venda: e.target.value })} />
                                    </Field>
                                </div>

                                <Field label="Email">
                                    <input type="email" className={inputCls} value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </Field>

                                <Field label={editingEmployee ? 'Nueva Contraseña (vacío = mantener)' : 'Contraseña'} required={!editingEmployee}>
                                    <input type="password" className={inputCls} value={formData.senha}
                                        onChange={e => setFormData({ ...formData, senha: e.target.value })}
                                        required={!editingEmployee}
                                        placeholder={editingEmployee ? '••••••••' : ''} />
                                </Field>

                                {/* Biometria toggle */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <Fingerprint size={20} className="text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Acceso Biométrico</p>
                                            <p className="text-xs text-gray-400">Huella / Face ID en móvil</p>
                                        </div>
                                    </div>
                                    <button type="button"
                                        onClick={() => setFormData({ ...formData, biometria: !formData.biometria })}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${formData.biometria ? 'bg-gray-600' : 'bg-gray-300'}`}>
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.biometria ? 'translate-x-5' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancelar
                                </button>
                                <Button type="submit" variant="danger" loading={saving}>
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
