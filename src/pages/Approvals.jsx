import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { requisicoesService, pontoService } from '../services/supabase';
import { IconPackage, IconClock, IconArrowRight, IconCircleCheck } from '@tabler/icons-react';

export default function Aprovacoes() {
  const navigate = useNavigate();

  const { data: requisicoes = [] } = useQuery({
    queryKey: ['requisicoes', 'pendente'],
    queryFn: () => requisicoesService.getAll({ status: 'pendente' }),
  });
  const { data: pontos = [] } = useQuery({
    queryKey: ['todos-ponto-pendente'],
    queryFn: () => pontoService.getTodos({ status: 'enviado' }),
  });

  const total = requisicoes.length + pontos.length;

  return (
    <div className="pb-32 px-4 pt-4 space-y-4 bg-[#0A0B0D] min-h-full">
      {total === 0 && (
        <div className="text-center py-16 text-[#6B7280]">
          <IconCircleCheck size={48} className="mx-auto mb-3 opacity-30 text-[#34D399]" />
          <p className="text-sm font-medium text-[#A8ADB8]">Nada pendente de aprovação</p>
          <p className="text-xs mt-1">Tudo em dia!</p>
        </div>
      )}

      {requisicoes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
            Requisições de materiais ({requisicoes.length})
          </p>
          <button
            onClick={() => navigate('/requisicoes')}
            className="w-full flex items-center justify-between bg-[#1A1D24] rounded-2xl p-4 border border-[#FBBF24]/20 active:bg-[#272B35] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FBBF24]/12 rounded-xl flex items-center justify-center">
                <IconPackage size={20} className="text-[#FBBF24]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-[#F5F5F0] text-sm">
                  {requisicoes.length} requisiç{requisicoes.length > 1 ? 'ões' : 'ão'} pendente{requisicoes.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-[#6B7280]">Aguardando aprovação de materiais</p>
              </div>
            </div>
            <IconArrowRight size={16} className="text-[#6B7280]" />
          </button>
        </div>
      )}

      {pontos.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
            Registros de ponto ({pontos.length})
          </p>
          <button
            onClick={() => navigate('/controle-ponto')}
            className="w-full flex items-center justify-between bg-[#1A1D24] rounded-2xl p-4 border border-[#5B8DEF]/20 active:bg-[#272B35] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5B8DEF]/12 rounded-xl flex items-center justify-center">
                <IconClock size={20} className="text-[#5B8DEF]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-[#F5F5F0] text-sm">
                  {pontos.length} registro{pontos.length > 1 ? 's' : ''} de ponto
                </p>
                <p className="text-xs text-[#6B7280]">Aguardando revisão e aprovação</p>
              </div>
            </div>
            <IconArrowRight size={16} className="text-[#6B7280]" />
          </button>
        </div>
      )}
    </div>
  );
}
