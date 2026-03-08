import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { IconDownload, IconCalendar, IconUser, IconClock, IconAlertCircle, IconPrinter } from '@tabler/icons-react';
import CustomSelect from '../CustomSelect';
import CustomDatePicker from '../CustomDatePicker';

export default function EmployeeLog() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            const res = await api.getEmployees();
            if (Array.isArray(res)) setEmployees(res);
        } catch (error) {
            console.error(error);
        }
    };

    const generateLog = async () => {
        if (!selectedEmployee) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/relatorios/funcionario_log.php?funcionario_id=${selectedEmployee}&mes=${month}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) setData(json);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const print = () => window.print();

    return (
        <div className="bg-[#F5F5F5] rounded-2xl p-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end mb-4">
                <CustomSelect
                    label="EMPLEADO"
                    value={selectedEmployee}
                    onChange={setSelectedEmployee}
                    options={[
                        { value: '', label: 'Seleccionar...' },
                        ...employees.map(e => ({ value: e.id, label: e.nome }))
                    ]}
                />
                <CustomDatePicker
                    label="MES"
                    selected={selectedDate}
                    onChange={(date) => {
                        setSelectedDate(date);
                        const year = date.getFullYear();
                        const monthStr = String(date.getMonth() + 1).padStart(2, '0');
                        setMonth(`${year}-${monthStr}`);
                    }}
                    dateFormat="MMMM yyyy"
                    showMonthYearPicker
                    showFullMonthYearPicker
                />
                <div className="flex gap-2">
                    <button
                        onClick={generateLog}
                        disabled={loading || !selectedEmployee}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Generando...' : 'VER LOG COMPLETO'}
                    </button>
                    {data && (
                        <button
                            onClick={print}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-xl hover:bg-[#F5F5F5] transition-colors font-semibold text-sm"
                        >
                            <IconPrinter size={18} strokeWidth={2} />
                        </button>
                    )}
                </div>
            </div>

            {data && (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div className="bg-white rounded-2xl p-4 border-l-4 border-[#CE0201]">
                            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">EMPLEADO</div>
                            <div className="text-lg font-bold text-gray-900">{data.funcionario.nome}</div>
                            <div className="text-xs text-gray-600">{data.funcionario.passaporte}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border-l-4 border-green-600">
                            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">TOTAL HORAS</div>
                            <div className="text-2xl font-black text-gray-900">{data.summary.total_hours}h</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border-l-4 border-blue-600">
                            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">DÍAS TRABAJADOS</div>
                            <div className="text-2xl font-black text-gray-900">{data.summary.days_worked}</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
                        {data.log.map((day) => (
                            <div key={day.date} className="border-b border-gray-200 last:border-0">
                                <div className={`flex justify-between items-center p-4 font-bold text-sm ${
                                    day.status === 'weekend' ? 'bg-red-50 text-red-700' :
                                    day.status === 'absent' ? 'bg-white text-gray-700' :
                                    'bg-[#F5F5F5] text-gray-900'
                                }`}>
                                    <span className="capitalize">{new Date(day.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                    {day.status === 'present' && <span className="text-green-600 font-black">{day.total_hours}h</span>}
                                    {day.status === 'absent' && day.status !== 'weekend' && <span className="text-gray-400">Sin registros</span>}
                                </div>
                                {day.entries.length > 0 && (
                                    <div className="p-4 space-y-2">
                                        {day.entries.map((entry, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-2 border-b border-dashed border-gray-200 last:border-0">
                                                <div className="flex-1 font-medium text-gray-900">{entry.obra}</div>
                                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <IconClock size={14} strokeWidth={2} />
                                                    <span>{entry.entrada} - {entry.saida}</span>
                                                </div>
                                                <div className="w-20 text-right font-bold text-gray-900">{entry.total}h</div>
                                                <div className={`w-24 text-right text-xs font-bold uppercase ${
                                                    entry.status === 'approved' ? 'text-green-600' : 'text-yellow-600'
                                                }`}>
                                                    {entry.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
