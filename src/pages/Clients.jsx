import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { clientesService } from '../services/api';
import { Plus, Search, Edit, Trash2, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Loading } from '../components/ui/Loading';

export default function Clients() {
    const { t } = useTranslation();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', email_financeiro: '', endereco: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await clientesService.getAll();
            setClients(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro ao carregar:', error);
            setClients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError('');
        try {
            if (editingClient) await clientesService.update(editingClient.id, formData);
            else await clientesService.create(formData);
            setShowModal(false); loadData();
        } catch (error) { setError(error.message || 'Error al guardar'); }
        finally { setSaving(false); }
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setFormData({
            nome: client.nome || '',
            email: client.email || '',
            telefone: client.telefone || '',
            email_financeiro: client.email_financeiro || '',
            endereco: client.endereco || ''
        });
        setShowModal(true); setError('');
    };

    const handleDelete = async (client) => {
        if (!confirm(`¿Eliminar cliente ${client.nome}?`)) return;
        try { await clientesService.delete(client.id); loadData(); }
        catch (error) { alert('Error: ' + error.message); }
    };

    const openNewModal = () => {
        setEditingClient(null);
        setFormData({ nome: '', email: '', telefone: '', email_financeiro: '', endereco: '' });
        setShowModal(true); setError('');
    };

    const filteredClients = clients.filter(c =>
        (c.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Search - FIXO */}
            <div className="shrink-0 bg-white border-b border-gray-100 px-4 pt-4 pb-3">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                </div>
            </div>

            {/* Content - SCROLLÁVEL */}
            <div className="flex-1 overflow-y-auto pb-20" style={{ WebkitOverflowScrolling: 'touch' }}>
            {loading ? (
                <div className="px-4 pt-4 space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl"></div>
                    ))}
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-16 px-4">
                    <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                        {searchTerm ? 'Sin resultados' : 'No hay clientes'}
                    </h3>
                    <p className="text-gray-500 text-sm">{searchTerm ? 'Intenta con otra búsqueda' : 'Añade tu primer cliente'}</p>
                </div>
            ) : (
                <div className="px-4 pt-4 space-y-3">
                    {filteredClients.map((client) => (
                        <div key={client.id} className="bg-[#F5F5F5] rounded-2xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 shrink-0">
                                    <Building2 size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-base">{client.nome}</h3>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => handleEdit(client)}
                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-gray-600 hover:bg-gray-100 transition-colors">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(client)}
                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-red-500 hover:bg-red-50 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                {client.email && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail size={14} className="shrink-0" />
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                )}
                                {client.telefone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone size={14} className="shrink-0" />
                                        <span>{client.telefone}</span>
                                    </div>
                                )}
                                {client.endereco && (
                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                        <MapPin size={14} className="shrink-0 mt-0.5" />
                                        <span className="line-clamp-1">{client.endereco}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} className="border-0">
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200">
                    <h2 className="text-xl font-bold uppercase text-gray-900">
                        {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h2>
                    <button
                        onClick={() => setShowModal(false)}
                        className="text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-2xl leading-none transition-colors"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input
                                label="Nombre"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
                                placeholder="Nombre del cliente"
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@empresa.com"
                                />
                                <Input
                                    label="Teléfono"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                    placeholder="+376 XXX XXX"
                                />
                            </div>

                            <div>
                                <Input
                                    label="Email Financiero (para recibir facturas)"
                                    type="email"
                                    value={formData.email_financeiro}
                                    onChange={(e) => setFormData({ ...formData, email_financeiro: e.target.value })}
                                    placeholder="finanzas@empresa.com"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Este email recibirá los registros de horas aprobados
                                </p>
                            </div>

                            <Input
                                label="Dirección"
                                value={formData.endereco}
                                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                                placeholder="Dirección completa"
                            />
                        </div>
                    </ModalBody>

                    <ModalFooter className="bg-gray-50">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="danger" loading={saving}>
                            {saving ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
            </div>
        </div>
    );
}
