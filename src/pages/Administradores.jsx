import { useState, useEffect } from 'react';
import { usuariosService } from '../services/api';
import { IconPlus, IconSearch, IconEdit, IconTrash, IconUserShield, IconMail, IconPhone, IconCreditCard } from '@tabler/icons-react';
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

export default function Administradores() {
    const [administradores, setAdministradores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        nome: '', email: '', telefone: '', passaporte: '', senha: '', tipo: 'admin'
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null); // {id, nome}

    // Auto-refresh
    useAutoRefresh(['administradores'], {
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

    useEffect(() => {
        loadAdministradores();
    }, []);

    // Listen for header + button click
    useEffect(() => {
        const handleAddEvent = (e) => {
            if (e.detail.page === 'administradores') {
                handleAdd();
            }
        };
        window.addEventListener('openAddModal', handleAddEvent);
        return () => window.removeEventListener('openAddModal', handleAddEvent);
    }, []);

    const loadAdministradores = async () => {
        try {
            setLoading(true);
            const response = await usuariosService.getAll('admin');
            // Backend retorna array direto, não objeto com .usuarios
            setAdministradores(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error('Error loading administradores:', err);
            setAdministradores([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingAdmin(null);
        setFormData({ nome: '', email: '', telefone: '', passaporte: '', senha: '', tipo: 'admin' });
        setError('');
        setShowModal(true);
    };

    const handleEdit = (admin) => {
        setEditingAdmin(admin);
        setFormData({
            nome: admin.nome,
            email: admin.email || '',
            telefone: admin.telefone || '',
            passaporte: admin.passaporte || '',
            senha: '', // nunca preencher senha no edit
            tipo: 'admin'
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
            if (!formData.email.trim()) {
                setError('Email é obrigatório');
                return;
            }
            if (!editingAdmin && !formData.senha.trim()) {
                setError('Senha é obrigatória para novo administrador');
                return;
            }

            setSaving(true);

            // Garantir que tipo seja sempre 'admin'
            const dataToSend = { ...formData, tipo: 'admin' };

            if (editingAdmin) {
                await usuariosService.update(editingAdmin.id, dataToSend);
            } else {
                await usuariosService.create(dataToSend);
            }

            setShowModal(false);
            loadAdministradores();
        } catch (err) {
            setError(err.message || 'Erro ao salvar administrador');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id, nome) => {
        setDeleteConfirm({ id, nome });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await usuariosService.delete(deleteConfirm.id);
            setDeleteConfirm(null);
            loadAdministradores();
        } catch (err) {
            setError(err.message || 'Erro ao deletar');
            setDeleteConfirm(null);
        }
    };

    const filteredAdministradores = administradores.filter(admin =>
        admin.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.passaporte?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Search - FIXO */}
            <div className="shrink-0 bg-white border-b border-gray-100 px-4 pt-4 pb-3">
                <div className="relative">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} stroke={1} />
                    <input
                        type="text"
                        placeholder="Buscar administrador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                </div>
            </div>

            {/* Lista - SCROLLÁVEL */}
            <div className="flex-1 overflow-y-auto pb-20" style={{ WebkitOverflowScrolling: 'touch' }}>
            {loading ? (
                <div className="px-4 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="skeleton h-32 rounded-2xl"></div>
                    ))}
                </div>
            ) : filteredAdministradores.length === 0 ? (
                <div className="px-4">
                    <div className="bg-[#F5F5F5] rounded-2xl p-12 text-center">
                        <IconUserShield size={48} className="mx-auto text-gray-400 mb-3" stroke={1} />
                        <p className="text-gray-600 text-base">
                            {searchTerm ? 'No se encontraron administradores' : 'No hay administradores registrados'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="px-4 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredAdministradores.map((admin) => (
                        <div key={admin.id} className="bg-[#F5F5F5] rounded-2xl p-4 flex flex-col">
                            {/* Header */}
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-600 text-white font-bold text-lg shrink-0">
                                    {admin.nome?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-gray-900 leading-tight">{admin.nome}</h3>
                                    <span className="inline-block text-xs font-semibold text-red-600 mt-1">ADMIN</span>
                                </div>
                            </div>

                            {/* Informações */}
                            <div className="flex-1 space-y-2 mb-4">
                                {admin.email && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <IconMail size={14} className="shrink-0 text-gray-500" stroke={1} />
                                        <span className="truncate">{admin.email}</span>
                                    </div>
                                )}
                                {admin.telefone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <IconPhone size={14} className="shrink-0 text-gray-500" stroke={1} />
                                        <span>{admin.telefone}</span>
                                    </div>
                                )}
                                {admin.passaporte && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <IconCreditCard size={14} className="shrink-0 text-gray-500" stroke={1} />
                                        <span>{admin.passaporte}</span>
                                    </div>
                                )}
                            </div>

                            {/* Ações */}
                            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-300">
                                <button
                                    onClick={() => handleEdit(admin)}
                                    className="h-9 flex items-center justify-center bg-white text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <IconEdit size={16} stroke={1} />
                                </button>
                                <button
                                    onClick={() => handleDelete(admin.id, admin.nome)}
                                    className="h-9 flex items-center justify-center bg-white text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <IconTrash size={16} stroke={1} />
                                </button>
                            </div>
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
                                {editingAdmin ? 'Editar Administrador' : 'Nuevo Administrador'}
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

                            <Field label="Email" required>
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

                            <Field label={editingAdmin ? "Nueva Contraseña (opcional)" : "Contraseña"} required={!editingAdmin}>
                                <input
                                    type="password"
                                    value={formData.senha}
                                    onChange={(e) => setFormData({...formData, senha: e.target.value})}
                                    className={inputCls}
                                    placeholder="••••••••"
                                />
                                {editingAdmin && (
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

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <IconTrash size={24} className="text-red-600" stroke={1} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Eliminar Administrador</h3>
                                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <p className="text-gray-700 mb-6">
                            ¿Estás seguro de que deseas eliminar al administrador <strong>{deleteConfirm.nome}</strong>?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setDeleteConfirm(null); setError(''); }}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
