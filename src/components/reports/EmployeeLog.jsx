import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Download, Calendar, User, Clock, AlertCircle, Printer } from 'lucide-react';

export default function EmployeeLog() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
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

    // Styles (Industrial)
    const styles = {
        container: { padding: '24px', background: 'white', border: '2px solid #e9ecef', marginTop: '16px' },
        controls: { display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #eee' },
        label: { fontFamily: 'Oswald', textTransform: 'uppercase', fontSize: '12px', display: 'block', marginBottom: '4px' },
        select: { padding: '10px', minWidth: '200px', border: '2px solid #e9ecef', fontFamily: 'Roboto' },
        btn: { background: '#111', color: 'white', border: 'none', padding: '10px 24px', fontFamily: 'Oswald', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
        summaryGrid: { display: 'flex', gap: '24px', marginBottom: '24px', background: '#f8f9fa', padding: '16px' },
        summaryItem: { flex: 1, borderLeft: '4px solid #CE0201', paddingLeft: '12px' },
        logTable: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
        th: { background: '#1a1a1a', color: 'white', padding: '12px', textAlign: 'left', fontFamily: 'Oswald', textTransform: 'uppercase' },
        td: { padding: '12px', borderBottom: '1px solid #e9ecef' },
        dayHeader: { background: '#e9ecef', fontWeight: 'bold', padding: '8px 12px', fontSize: '12px', textTransform: 'uppercase' },
        entry: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #eee' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.controls}>
                <div>
                    <label style={styles.label}>Empleado</label>
                    <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} style={styles.select}>
                        <option value="">SELECCIONAR...</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </select>
                </div>
                <div>
                    <label style={styles.label}>Mes</label>
                    <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={styles.select} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <button onClick={generateLog} disabled={loading} style={styles.btn}>
                        {loading ? 'Generando...' : 'VER LOG COMPLETO'}
                    </button>
                    {data && (
                        <button onClick={print} style={{ ...styles.btn, background: 'white', color: '#111', border: '2px solid #111' }}>
                            <Printer size={18} /> IMPRIMIR
                        </button>
                    )}
                </div>
            </div>

            {data && (
                <div>
                    <div style={styles.summaryGrid}>
                        <div style={styles.summaryItem}>
                            <div style={{ fontSize: '12px', color: '#666' }}>EMPLEADO</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{data.funcionario.nome}</div>
                            <div style={{ fontSize: '12px' }}>{data.funcionario.passaporte}</div>
                        </div>
                        <div style={{ ...styles.summaryItem, borderColor: '#16a34a' }}>
                            <div style={{ fontSize: '12px', color: '#666' }}>TOTAL HORAS</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.summary.total_hours}h</div>
                        </div>
                        <div style={{ ...styles.summaryItem, borderColor: '#2563eb' }}>
                            <div style={{ fontSize: '12px', color: '#666' }}>DÍAS TRABAJADOS</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.summary.days_worked}</div>
                        </div>
                    </div>

                    <div style={{ border: '1px solid #e9ecef' }}>
                        {data.log.map((day) => (
                            <div key={day.date}>
                                <div style={{
                                    ...styles.dayHeader,
                                    background: day.status === 'weekend' ? '#fdf2f2' : day.status === 'absent' ? '#fff' : '#e9ecef',
                                    color: day.status === 'weekend' ? '#dc2626' : '#111',
                                    display: 'flex', justifyContent: 'space-between'
                                }}>
                                    <span>{new Date(day.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                    {day.status === 'present' && <span style={{ color: '#16a34a' }}>{day.total_hours}h</span>}
                                    {day.status === 'absent' && day.status !== 'weekend' && <span style={{ color: '#ccc' }}>Sin registros</span>}
                                </div>
                                {day.entries.length > 0 && (
                                    <div style={{ padding: '8px 12px' }}>
                                        {day.entries.map((entry, idx) => (
                                            <div key={idx} style={styles.entry}>
                                                <div style={{ flex: 1, fontWeight: '500' }}>{entry.obra}</div>
                                                <div style={{ width: '150px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <Clock size={14} color="#666" />
                                                    <span>{entry.entrada} - {entry.saida}</span>
                                                </div>
                                                <div style={{ width: '80px', textAlign: 'right', fontWeight: 'bold' }}>{entry.total}h</div>
                                                <div style={{ width: '100px', textAlign: 'right', fontSize: '11px', textTransform: 'uppercase', color: entry.status === 'approved' ? '#16a34a' : '#f59e0b' }}>
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
