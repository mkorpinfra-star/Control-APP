import { useState, useEffect } from 'react';
import { encarregadosService } from '../services/api';
import { Plus, Search, Edit, Trash2, Users2, Mail, Phone, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

const inputCls = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white";

const Field = ({ label, required, children }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {children}
    </div>
);

export default function Encarregados() {
    const [encarregados, setEncarregados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEncarregado, setEditingEncarregado] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        nome: '', email: '', telefone: '', passaporte: '', senha: ''
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Auto-refresh
    useAutoRefresh(['encarregados'], {
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

    useEffect(() => {
        loadEncarregados();
    }, []);

    const loadEncarregados = async () => {
        try {
            setLoading(true);
            const response = await encarregadosService.getAll();
            setEncarregados(response.encarregados || []);
        } catch (err) {
            console.error('Error loading encarregados:', err);
            setEncarregados([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingEncarregado(null);
        setFormData({ nome: '', email: '', telefone: '', passaporte: '', senha: '' });
        setError('');
        setShowModal(true);
    };

    const handleEdit = (enc) => {
        setEditingEncarregado(enc);
        setFormData({
            nome: enc.nome,
            email: enc.email || '',
            telefone: enc.telefone || '',
            passaporte: enc.passaporte || '',
            senha: '' // nunca preencher senha no edit
        });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            setError('');
            if (!formData.nome.trim()) {
                setError('Nome é obrigatório');
                return;
            }

            setSaving(true);

            if (editingEncarregado) {
                await encarregadosService.update(editingEncarregado.id, formData);
            } else {
                await encarregadosService.create(formData);
            }

            setShowModal(false);
            loadEncarregados();
        } catch (err) {
            setError(err.message || 'Erro ao salvar encarregado');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, nome) => {
        if (!confirm(`¿Eliminar encargado "${nome}"?`)) return;

        try {
            await encarregadosService.delete(id);
            loadEncarregados();
        } catch (err) {
            alert(err.message || 'Erro ao deletar');
        }
    };

    const filteredEncarregados = encarregados.filter(enc =>
        enc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enc.passaporte?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Header */}
            <div className="px-4 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Encargados</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Gestión de encargados</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="w-12 h-12 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg"
                    >
                        <Plus size={24} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar encargado..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] rounded-2xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
            </div>

            {/* Lista */}
            {loading ? (
                <div className="px-4 space-y-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="skeleton h-24 rounded-2xl"></div>
                    ))}
                </div>
            ) : filteredEncarregados.length === 0 ? (
                <div className="px-4">
                    <div className="bg-[#F5F5F5] rounded-2xl p-12 text-center">
                        <Users2 size={48} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600 text-base">
                            {searchTerm ? 'No se encontraron encargados' : 'No hay encargados registrados'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="px-4 space-y-3">
                    {filteredEncarregados.map((enc) => (
                        <div key={enc.id} className="bg-[#F5F5F5] rounded-2xl p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{enc.nome}</h3>
                                    {enc.email && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                            <Mail size={14} className="shrink-0" />
                                            <span className="truncate">{enc.email}</span>
                                        </div>
                                    )}
                                    {enc.telefone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                            <Phone size={14} className="shrink-0" />
                                            <span>{enc.telefone}</span>
                                        </div>
                                    )}
                                    {enc.passaporte && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <CreditCard size={14} className="shrink-0" />
                                            <span>{enc.passaporte}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 shrink-0 ml-4">
                                    <button
                                        onClick={() => handleEdit(enc)}
                                        className="w-10 h-10 flex items-center justify-center bg-white text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(enc.id, enc.nome)}
                                        className="w-10 h-10 flex items-center justify-center bg-white text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {enc.total_obras > 0 && (
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {enc.total_obras} {enc.total_obras === 1 ? 'obra' : 'obras'} activa{enc.total_obras !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sm:rounded-t-2xl rounded-t-3xl">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingEncarregado ? 'Editar Encargado' : 'Nuevo Encargado'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <Field label="Nome" required>
                                <input
                                    type="text"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                                    className={inputCls}
                                    placeholder="Nome completo"
                                />
                            </Field>

                            <Field label="Email">
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className={inputCls}
                                    placeholder="email@exemplo.com"
                                />
                            </Field>

                            <Field label="Telefone">
                                <input
                                    type="text"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                                    className={inputCls}
                                    placeholder="+34 XXX XXX XXX"
                                />
                            </Field>

                            <Field label="Passaporte">
                                <input
                                    type="text"
                                    value={formData.passaporte}
                                    onChange={(e) => setFormData({...formData, passaporte: e.target.value})}
                                    className={inputCls}
                                    placeholder="Número de documento"
                                />
                            </Field>

                            <Field label={editingEncarregado ? "Nueva Contraseña (opcional)" : "Contraseña"}>
                                <input
                                    type="password"
                                    value={formData.senha}
                                    onChange={(e) => setFormData({...formData, senha: e.target.value})}
                                    className={inputCls}
                                    placeholder="••••••••"
                                />
                                {editingEncarregado && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Dejar en blanco para mantener la contraseña actual
                                    </p>
                                )}
                            </Field>
                        </div>

                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                                disabled={saving}
                            >
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
