import { useState, useEffect } from 'react';
import Modal from './Modal';
import { ui } from '../lib/theme';

// Diálogo de entrada de texto (substitui window.prompt, que falha no WebView Android)
export default function InputDialog({ aberto, titulo, label, placeholder, confirmarLabel = 'Confirmar', obrigatorio = true, onConfirmar, onClose }) {
  const [valor, setValor] = useState('');

  useEffect(() => { if (aberto) setValor(''); }, [aberto]);

  const confirmar = () => {
    if (obrigatorio && !valor.trim()) return;
    onConfirmar(valor.trim());
  };

  return (
    <Modal aberto={aberto} onClose={onClose} titulo={titulo}>
      <div className="space-y-4">
        {label && <label className={ui.label}>{label}</label>}
        <textarea
          value={valor}
          onChange={e => setValor(e.target.value)}
          placeholder={placeholder}
          rows={3}
          autoFocus
          className={`${ui.input} h-auto py-3 resize-none`}
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-[#30353F] text-[#A8ADB8] rounded-xl text-sm font-medium active:bg-[#22262F] transition-colors">
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={obrigatorio && !valor.trim()}
            className="flex-1 py-3 bg-[#F08020] text-white rounded-xl text-sm font-semibold active:bg-[#D86E14] transition-colors disabled:opacity-40"
          >
            {confirmarLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
