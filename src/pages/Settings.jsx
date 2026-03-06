import { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon, TrendingUp, Moon, Info, Percent } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'https://j2s.ad/login/backend/api';

const defaultValues = {
    // Faturamento (cobrado do cliente — universal por tipo de hora)
    fatura_hora_normal: 25.00,
    fatura_hora_extra: 37.50,
    fatura_hora_noturna: 50.00,
    // Multiplicadores sobre a hora normal
    multiplicador_extra: 1.50,
    multiplicador_noturna: 2.00,
};

export default function Settings() {
    const [values, setValues] = useState(defaultValues);
    const [impostos, setImpostos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingImposto, setSavingImposto] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => { loadValues(); loadImpostos(); }, []);

    const loadValues = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/config/valores.php`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data && !data.error) {
                    const parsed = {};
                    Object.keys(defaultValues).forEach(k => {
                        parsed[k] = parseFloat(data[k]) || defaultValues[k];
                    });
                    setValues(parsed);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar valores:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadImpostos = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/config/impostos.php`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.impostos) {
                    setImpostos(data.impostos);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar impostos:', error);
        }
    };

    const saveImposto = async (imposto) => {
        setSavingImposto(imposto.id);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/config/impostos.php`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: imposto.id, percentual: imposto.percentual, ativo: imposto.ativo ? 1 : 0 })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: `✓ ${imposto.nome} actualizado` });
                setTimeout(() => setMessage(null), 2000);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al guardar imposto' });
        } finally {
            setSavingImposto(null);
        }
    };

    const handleImpostoChange = (id, field, value) => {
        setImpostos(prev => prev.map(imp =>
            imp.id === id ? { ...imp, [field]: field === 'percentual' ? parseFloat(value) || 0 : value } : imp
        ));
    };

    const handleChange = (field, value) => {
        setValues(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    const saveValues = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/config/valores.php`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });
            const data = await res.json();
            if (data.success || data.valores) {
                setMessage({ type: 'success', text: '✓ Valores guardados correctamente' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                throw new Error(data.error || data.message || 'Error al guardar');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    const Field = ({ label, field, prefix = '€', color = 'blue', step = '0.01', min = '0' }) => (
        <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
            <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">{label}</span>
            </div>
            <div className="relative w-36">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">{prefix}</span>
                <input
                    type="number"
                    step={step}
                    min={min}
                    value={values[field]}
                    onChange={e => handleChange(field, e.target.value)}
                    className={`w-full pl-7 pr-3 py-2 border-2 rounded-lg text-right font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-0
                        ${color === 'blue'   ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-200 bg-blue-50' : ''}
                        ${color === 'purple' ? 'border-purple-300 focus:border-purple-500 focus:ring-purple-200 bg-purple-50' : ''}
                    `}
                />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="w-full p-4 sm:p-6 bg-gray-50 min-h-screen pb-24">
            <div className="mb-8 pb-4 border-b-2 border-gray-200 flex items-center gap-3">
                <SettingsIcon className="w-8 h-8" style={{ color: '#CE0201' }} />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                    <p className="text-sm text-gray-600">Valores de faturamento ao cliente e multiplicadores de hora</p>
                </div>
            </div>

            {/* Aviso sobre custo individual */}
            <div className="flex gap-3 p-4 bg-amber-50 border border-amber-300 rounded-lg mb-6 text-sm text-amber-800">
                <Info className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                <div>
                    <strong>Custo por funcionário</strong> — o valor pago a cada funcionário (salário base e custo/hora)
                    é configurado individualmente no cadastro de cada <strong>Empleado</strong>, não aqui.
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded-lg mb-5 text-sm font-medium ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-300'
                    : 'bg-red-50 text-red-700 border border-red-300'
                }`}>{message.text}</div>
            )}

            {/* Faturamento ao cliente */}
            <Card variant="nubank-no-shadow" className="mb-5 p-6">
                <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h2 className="text-base font-semibold text-gray-900">Faturamento — Cobrado ao Cliente</h2>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                    Valor base cobrado do cliente por hora. Pode ser sobrescrito individualmente por funcionário.
                </p>
                <Field label="Hora Normal (08h–17h)" field="fatura_hora_normal" color="blue" />
                <Field label="Hora Extra (17h–22h)" field="fatura_hora_extra" color="blue" />
                <Field label="Hora Noturna (22h–06h)" field="fatura_hora_noturna" color="blue" />
            </Card>

            {/* Multiplicadores */}
            <Card variant="nubank-no-shadow" className="mb-6 p-6">
                <div className="flex items-center gap-2 mb-1">
                    <Moon className="w-5 h-5 text-purple-600" />
                    <h2 className="text-base font-semibold text-gray-900">Multiplicadores de Hora</h2>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                    Aplicado sobre a hora normal para calcular extra e noturna automaticamente.
                    Ex: Normal €{values.fatura_hora_normal.toFixed(2)} × {values.multiplicador_extra} = Extra €{(values.fatura_hora_normal * values.multiplicador_extra).toFixed(2)}
                </p>
                <Field label="Multiplicador Hora Extra" field="multiplicador_extra" color="purple" prefix="×" step="0.01" min="1" />
                <Field label="Multiplicador Hora Noturna" field="multiplicador_noturna" color="purple" prefix="×" step="0.01" min="1" />

                {/* Preview */}
                <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs font-medium text-purple-700 mb-2">Preview (faturamento ao cliente):</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                            <div className="text-lg font-bold text-blue-700">€{values.fatura_hora_normal.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">Normal (1×)</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-blue-600">
                                €{(values.fatura_hora_normal * values.multiplicador_extra).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">Extra ({values.multiplicador_extra}×)</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-purple-700">
                                €{(values.fatura_hora_normal * values.multiplicador_noturna).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">Noturna ({values.multiplicador_noturna}×)</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Impostos & Contribuições */}
            <Card variant="nubank-no-shadow" className="mb-6 p-6">
                <div className="flex items-center gap-2 mb-1">
                    <Percent className="w-5 h-5 text-orange-600" />
                    <h2 className="text-base font-semibold text-gray-900">Impostos & Contribuições</h2>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                    CAS, IGI e outros descontos aplicados à folha de pagamento. Configure o percentual de cada um.
                </p>
                {impostos.length === 0 ? (
                    <div className="text-center py-4 text-sm text-gray-500">
                        <p>No hay impostos configurados en la base de datos.</p>
                        <p className="text-xs mt-1 text-gray-400">Tabla <code>config_impostos</code> vacía o no existe.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {impostos.map(imp => (
                            <div key={imp.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                                <div className="flex-1">
                                    <span className="text-sm font-medium text-gray-700">{imp.nome || imp.name}</span>
                                    {imp.descricao && <p className="text-xs text-gray-400">{imp.descricao}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Ativo toggle */}
                                    <button
                                        type="button"
                                        onClick={() => handleImpostoChange(imp.id, 'ativo', imp.ativo ? 0 : 1)}
                                        className={`relative w-10 h-5 rounded-full transition-colors ${imp.ativo ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${imp.ativo ? 'translate-x-5' : ''}`} />
                                    </button>
                                    {/* Percentual */}
                                    <div className="relative w-28">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={imp.percentual}
                                            onChange={e => handleImpostoChange(imp.id, 'percentual', e.target.value)}
                                            disabled={!imp.ativo}
                                            className="w-full pr-7 pl-3 py-2 border-2 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-orange-50 rounded-lg text-right font-semibold text-gray-900 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">%</span>
                                    </div>
                                    {/* Save button */}
                                    <button
                                        type="button"
                                        onClick={() => saveImposto(imp)}
                                        disabled={savingImposto === imp.id}
                                        className="px-3 py-2 text-xs font-semibold rounded-lg border-2 border-orange-400 text-orange-700 hover:bg-orange-50 transition-colors disabled:opacity-50"
                                    >
                                        {savingImposto === imp.id ? '...' : 'Guardar'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Button variant="danger" onClick={saveValues} loading={saving} size="lg">
                <Save className="w-5 h-5" />
                {saving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
        </div>
    );
}
