import React, { useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DownloadIcon, EmailIcon, ShareIcon, PrintIcon, CopyIcon, SaveIcon, ChartIcon, FileIcon, CloseIcon } from '../Icons';

const API_URL = import.meta.env.VITE_API_URL || '';

const FinancialReport = ({
    relatorio,
    valores,
    savedReports,
    setShowSavedReports, // Para abrir modal global (se necessário) ou podemos ter botão aqui
    onSaveLocally, // Callback para salvar no localStorage (gerenciado pelo pai?) ou gerenciado aqui?
    // Vou gerenciar save/load aqui se possível, ou passar callbacks.
    // Melhor passar callbacks para manter estado unificado no Reports.jsx
    saveReportLocally,
    loadSavedReport,
    deleteSavedReport
}) => {
    // UI State Local
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailTo, setEmailTo] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [message, setMessage] = useState(null); // Local message
    const [sendingToClient, setSendingToClient] = useState(false);

    const reportRef = useRef(null);

    // ========================================
    // LOGICA LOCAL (Exports)
    // ========================================
    const exportToCSV = () => {
        if (!relatorio) return;
        const headers = ['Empleado', 'Pasaporte', 'Horas Normal', 'Horas Extra', 'Horas Nocturna', 'Total Horas', 'Valor Normal €', 'Valor Extra €', 'Valor Nocturna €', 'Valor Total €'];
        const rows = relatorio.funcionarios.map(f => [
            f.nome, f.passaporte || '', f.horas_normal, f.horas_extra, f.horas_noturna, f.horas_total,
            (f.horas_normal * valores.valor_hora_normal).toFixed(2),
            (f.horas_extra * valores.valor_hora_extra).toFixed(2),
            (f.horas_noturna * valores.valor_hora_noturna).toFixed(2),
            f.valor_total.toFixed(2)
        ]);
        rows.push([
            'TOTAL', '', relatorio.totais.normal, relatorio.totais.extra, relatorio.totais.noturna, relatorio.totais.total,
            relatorio.valores.valor_normal.toFixed(2), relatorio.valores.valor_extra.toFixed(2), relatorio.valores.valor_noturna.toFixed(2), relatorio.valores.valor_total.toFixed(2)
        ]);
        const csvContent = [
            `Informe Mensual - ${relatorio.obra.numero} - ${relatorio.obra.nome}`,
            `Período: ${relatorio.mes}`, `Generado: ${new Date().toLocaleString()}`, '',
            headers.join(';'), ...rows.map(row => row.join(';'))
        ].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `informe_${relatorio.obra.numero}_${relatorio.mes}.csv`;
        link.click();
        setMessage({ type: 'success', text: '✓ CSV exportado correctamente' });
    };

    const exportToExcel = () => {
        if (!relatorio) return;
        // Same logic as before
        const headers = ['Empleado', 'Pasaporte', 'Horas Normal', 'Horas Extra', 'Horas Nocturna', 'Total Horas', 'Valor Normal €', 'Valor Extra €', 'Valor Nocturna €', 'Valor Total €'];
        const rows = relatorio.funcionarios.map(f => [
            f.nome, f.passaporte || '', f.horas_normal, f.horas_extra, f.horas_noturna, f.horas_total,
            (f.horas_normal * valores.valor_hora_normal).toFixed(2),
            (f.horas_extra * valores.valor_hora_extra).toFixed(2),
            (f.horas_noturna * valores.valor_hora_noturna).toFixed(2),
            f.valor_total.toFixed(2)
        ]);
        rows.push([
            'TOTAL', '', relatorio.totais.normal, relatorio.totais.extra, relatorio.totais.noturna, relatorio.totais.total,
            relatorio.valores.valor_normal.toFixed(2), relatorio.valores.valor_extra.toFixed(2), relatorio.valores.valor_noturna.toFixed(2), relatorio.valores.valor_total.toFixed(2)
        ]);
        const excelContent = [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');
        const blob = new Blob(['\ufeff' + excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `informe_${relatorio.obra.numero}_${relatorio.mes}.xls`;
        link.click();
        setMessage({ type: 'success', text: '✓ Excel exportado correctamente' });
    };

    const sendReportByEmail = async () => {
        if (!emailTo) return;
        setSendingEmail(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/relatorios/enviar-email.php`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ obra_id: relatorio.obra.id, mes: relatorio.mes, email_to: emailTo, subject: emailSubject, message: emailMessage })
            });
            const data = await res.json();
            if (data.success) { setMessage({ type: 'success', text: '✓ Email enviado' }); setShowEmailModal(false); } else { throw new Error(data.error); }
        } catch (error) { setMessage({ type: 'error', text: error.message }); } finally { setSendingEmail(false); }
    };

    const sendReportToClient = async () => {
        if (!relatorio.obra.cliente_email) { setMessage({ type: 'warning', text: '⚠️ Sin email de cliente configurado' }); return; }
        setSendingToClient(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/relatorios/enviar-email.php`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ obra_id: relatorio.obra.id, mes: relatorio.mes, email_to: relatorio.obra.cliente_email, subject: `Informe - ${relatorio.obra.nome}`, message: 'Informe mensual adjunto.', is_client: true })
            });
            const data = await res.json();
            if (data.success) setMessage({ type: 'success', text: '✓ Enviado al cliente' }); else throw new Error(data.error);
        } catch (error) { setMessage({ type: 'error', text: error.message }); } finally { setSendingToClient(false); }
    };

    const prepareChartData = () => {
        return [...relatorio.funcionarios].sort((a, b) => b.horas_total - a.horas_total).slice(0, 15).map(f => ({
            name: f.nome.split(' ')[0] + ' ' + (f.nome.split(' ')[1]?.[0] || '') + '.',
            horas: parseFloat(f.horas_total)
        }));
    };

    // Styles (Condensed)
    const styles = {
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
        th: { padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left', background: '#f5f5f5' },
        td: { padding: '10px', borderBottom: '1px solid #ddd' },
        modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: 'white', padding: '20px', borderRadius: '8px', width: '100%', maxWidth: '500px' }
    };

    return (
        <div ref={reportRef}>
            {message && <div style={{ padding: '10px', background: message.type === 'error' ? '#fef2f2' : (message.type === 'warning' ? '#fff7ed' : '#f0fdf4'), color: message.type === 'error' ? '#dc2626' : (message.type === 'warning' ? '#ea580c' : '#166534'), marginBottom: '20px', borderRadius: '4px' }}>{message.text}</div>}

            {/* Actions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#dcfce7', padding: '16px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #bbf7d0', transition: 'all 0.2s' }} onClick={sendReportToClient}>
                    <div style={{ fontWeight: 'bold', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}><EmailIcon /> Enviar al Cliente</div>
                    <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px' }}>{relatorio.obra.cliente_email || '(Sin email configurado)'}</div>
                </div>
                <div style={{ background: 'white', padding: '16px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e5e7eb' }} onClick={exportToExcel}>
                    <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><DownloadIcon /> Exportar Excel</div>
                </div>
                <div style={{ background: 'white', padding: '16px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e5e7eb' }} onClick={exportToCSV}>
                    <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><FileIcon /> Exportar CSV</div>
                </div>
                <div style={{ background: 'white', padding: '16px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e5e7eb' }} onClick={() => setShowEmailModal(true)}>
                    <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><EmailIcon /> Compartir Email</div>
                </div>
                <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #fcd34d' }} onClick={saveReportLocally}>
                    <div style={{ fontWeight: 'bold', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}><SaveIcon /> Guardar Local</div>
                    <div style={{ fontSize: '12px', color: '#b45309', marginTop: '4px' }}>Backup en navegador</div>
                </div>
            </div>

            {/* Info */}
            <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{relatorio.obra.numero} - {relatorio.obra.nome}</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '14px', color: '#374151' }}>
                    <span>📅 Período: <strong>{relatorio.mes}</strong></span>
                    <span>👥 Empleados: <strong>{relatorio.funcionarios.length}</strong></span>
                    {relatorio.obra.endereco && <span>📍 {relatorio.obra.endereco}</span>}
                </div>
            </div>

            {/* Chart Top 15 (Mantido para visão rápida) */}
            <div style={{ height: '300px', marginBottom: '30px', background: 'white', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: '600', color: '#374151' }}><ChartIcon /> Ranking de Horas (Top 15)</div>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareChartData()} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '12px' }} />
                        <Tooltip />
                        <Bar dataKey="horas" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <table style={styles.table}>
                    <thead style={{ background: '#f9fafb' }}>
                        <tr><th style={styles.th}>Empleado</th><th style={styles.th}>Normal</th><th style={styles.th}>Extra</th><th style={styles.th}>Nocturna</th><th style={styles.th}>Total</th><th style={styles.th}>Valor €</th></tr>
                    </thead>
                    <tbody>
                        {relatorio.funcionarios.map(f => (
                            <tr key={f.id}>
                                <td style={styles.td}>
                                    <div style={{ fontWeight: '500' }}>{f.nome}</div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{f.passaporte}</div>
                                </td>
                                <td style={styles.td}>{f.horas_normal}h</td>
                                <td style={{ ...styles.td, color: f.horas_extra > 0 ? '#ea580c' : 'inherit' }}>{f.horas_extra}h</td>
                                <td style={{ ...styles.td, color: f.horas_noturna > 0 ? '#4f46e5' : 'inherit' }}>{f.horas_noturna}h</td>
                                <td style={{ ...styles.td, fontWeight: 'bold' }}>{f.horas_total}h</td>
                                <td style={{ ...styles.td, color: '#16a34a', fontWeight: 'bold' }}>€{f.valor_total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ background: '#16a34a', color: 'white', fontWeight: 'bold' }}>
                            <td style={styles.td}>TOTAL</td>
                            <td style={styles.td}>{relatorio.totais.normal}h</td>
                            <td style={styles.td}>{relatorio.totais.extra}h</td>
                            <td style={styles.td}>{relatorio.totais.noturna}h</td>
                            <td style={styles.td}>{relatorio.totais.total}h</td>
                            <td style={styles.td}>€{relatorio.valores.valor_total.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Modals Locals */}
            {showEmailModal && (
                <div style={styles.modal} onClick={() => setShowEmailModal(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0 }}>Enviar Email</h3>
                            <button onClick={() => setShowEmailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><CloseIcon /></button>
                        </div>
                        <input type="email" placeholder="Email destinatario" value={emailTo} onChange={e => setEmailTo(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                        <input type="text" placeholder="Asunto" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                        <textarea placeholder="Mensaje" value={emailMessage} onChange={e => setEmailMessage(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }} />
                        <button onClick={sendReportByEmail} disabled={sendingEmail} style={{ padding: '10px', background: '#16a34a', color: 'white', border: 'none', width: '100%', borderRadius: '4px', cursor: 'pointer' }}>
                            {sendingEmail ? 'Enviando...' : 'Enviar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancialReport;
