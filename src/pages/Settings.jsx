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
        <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">{label}</span>
            </div>
            <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">{prefix}</span>
                <input
                    type="number"
                    step={step}
                    min={min}
                    value={values[field]}
                    onChange={e => handleChange(field, e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border-0 bg-[#F5F5F5] rounded-xl text-right font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-white pb-24 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Header */}
            <div className="px-4 pt-6 pb-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <SettingsIcon className="w-5 h-5 text-black" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Valores y parámetros del sistema</p>
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-4">
                {/* Aviso sobre custo individual */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <div className="flex gap-3">
                        <Info className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                        <div className="text-sm text-amber-800">
                            <strong>Custo por funcionário</strong> — o valor pago a cada funcionário (salário base e custo/hora)
                            é configurado individualmente no cadastro de cada <strong>Empleado</strong>, não aqui.
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-2xl text-sm font-medium ${
                        message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>{message.text}</div>
                )}

                {/* Faturamento ao cliente */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-black" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-900">Faturamento — Cobrado ao Cliente</h2>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                        Valor base cobrado do cliente por hora. Pode ser sobrescrito individualmente por funcionário.
                    </p>
                    <div className="space-y-3">
                        <Field label="Hora Normal (08h–17h)" field="fatura_hora_normal" color="gray" />
                        <Field label="Hora Extra (17h–22h)" field="fatura_hora_extra" color="gray" />
                        <Field label="Hora Noturna (22h–06h)" field="fatura_hora_noturna" color="gray" />
                    </div>
                </div>

                {/* Multiplicadores */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Moon className="w-4 h-4 text-black" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-900">Multiplicadores de Hora</h2>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                        Aplicado sobre a hora normal para calcular extra e noturna automaticamente.
                        Ex: Normal €{values.fatura_hora_normal.toFixed(2)} × {values.multiplicador_extra} = Extra €{(values.fatura_hora_normal * values.multiplicador_extra).toFixed(2)}
                    </p>
                    <div className="space-y-3 mb-4">
                        <Field label="Multiplicador Hora Extra" field="multiplicador_extra" color="gray" prefix="×" step="0.01" min="1" />
                        <Field label="Multiplicador Hora Noturna" field="multiplicador_noturna" color="gray" prefix="×" step="0.01" min="1" />
                    </div>

                    {/* Preview */}
                    <div className="bg-[#F5F5F5] rounded-xl p-4">
                        <p className="text-xs font-medium text-gray-700 mb-3">Preview (faturamento ao cliente):</p>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                                <div className="text-lg font-bold text-gray-900">€{values.fatura_hora_normal.toFixed(2)}</div>
                                <div className="text-xs text-gray-600">Normal (1×)</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">
                                    €{(values.fatura_hora_normal * values.multiplicador_extra).toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-600">Extra ({values.multiplicador_extra}×)</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">
                                    €{(values.fatura_hora_normal * values.multiplicador_noturna).toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-600">Noturna ({values.multiplicador_noturna}×)</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Impostos & Contribuições */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Percent className="w-4 h-4 text-black" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-900">Impostos & Contribuições</h2>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                        CAS, IGI e outros descontos aplicados à folha de pagamento. Configure o percentual de cada um.
                    </p>
                    {impostos.length === 0 ? (
                        <div className="bg-[#F5F5F5] rounded-xl p-6 text-center text-sm text-gray-600">
                            <p>No hay impostos configurados en la base de datos.</p>
                            <p className="text-xs mt-1 text-gray-500">Tabla <code>config_impostos</code> vacía o no existe.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {impostos.map(imp => (
                                <div key={imp.id} className="bg-[#F5F5F5] rounded-xl p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-gray-900">{imp.nome || imp.name}</span>
                                            {imp.descricao && <p className="text-xs text-gray-600 mt-0.5">{imp.descricao}</p>}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {/* Ativo toggle */}
                                            <button
                                                type="button"
                                                onClick={() => handleImpostoChange(imp.id, 'ativo', imp.ativo ? 0 : 1)}
                                                className={`relative w-10 h-5 rounded-full transition-colors ${imp.ativo ? 'bg-green-500' : 'bg-gray-300'}`}
                                            >
                                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${imp.ativo ? 'translate-x-5' : ''}`} />
                                            </button>
                                            {/* Percentual */}
                                            <div className="relative w-20">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    value={imp.percentual}
                                                    onChange={e => handleImpostoChange(imp.id, 'percentual', e.target.value)}
                                                    disabled={!imp.ativo}
                                                    className="w-full pr-5 pl-2 py-2 border-0 bg-white rounded-lg text-right font-semibold text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                                                />
                                                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-xs">%</span>
                                            </div>
                                            {/* Save button */}
                                            <button
                                                type="button"
                                                onClick={() => saveImposto(imp)}
                                                disabled={savingImposto === imp.id}
                                                className="px-4 py-2 text-xs font-semibold rounded-full bg-white text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 min-w-[70px]"
                                            >
                                                {savingImposto === imp.id ? '...' : 'Salvar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={saveValues}
                    disabled={saving}
                    className="w-full md:w-auto px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
            </div>
        </div>
    );
}
