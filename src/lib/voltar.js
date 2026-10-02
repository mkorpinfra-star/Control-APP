// Botão "voltar" do Android: fecha a camada aberta mais recente (modal, painel)
// antes de navegar para trás. Cada camada se registra enquanto está aberta.
import { useEffect, useRef } from 'react';

const pilha = [];

export function fecharCamadaDoTopo() {
  const topo = pilha[pilha.length - 1];
  if (!topo) return false;
  topo.current?.();
  return true;
}

export function useFecharComVoltar(aberto, onClose) {
  const ref = useRef(onClose);
  useEffect(() => { ref.current = onClose; });
  useEffect(() => {
    if (!aberto) return;
    pilha.push(ref);
    return () => { const i = pilha.lastIndexOf(ref); if (i >= 0) pilha.splice(i, 1); };
  }, [aberto]);
}
