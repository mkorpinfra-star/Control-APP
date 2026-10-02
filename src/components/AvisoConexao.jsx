import { useEffect, useState } from 'react';
import { IconWifiOff } from '@tabler/icons-react';

// Faixa fixa quando o aparelho está sem internet. O app não tem modo offline:
// nada é guardado para envio posterior, então o usuário precisa saber disso.
export default function AvisoConexao() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (online) return null;
  return (
    <div role="alert" className="flex items-center gap-2 px-4 py-2 bg-[#F87171]/15 border-b border-[#F87171]/30 text-[#F87171] text-xs font-medium">
      <IconWifiOff size={14} className="shrink-0" />
      Sem conexão. Nada será salvo até a internet voltar.
    </div>
  );
}
