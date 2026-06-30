import { useQuery } from '@tanstack/react-query';
import { ordensServicoService } from '../services/supabase';
import { IconFileText, IconDownload } from '@tabler/icons-react';

export default function Relatorios() {
  const { data: os = [] } = useQuery({
    queryKey: ['os-relatorio'],
    queryFn: () => ordensServicoService.getAll(),
  });

  const concluidas = os.filter(o => o.status === 'concluida');
  const abertas    = os.filter(o => o.status === 'aberta');

  const porContrato = os.reduce((acc, o) => {
    const nome = o.contratos?.nome || 'Sem contrato';
    if (!acc[nome]) acc[nome] = { total: 0, concluidas: 0 };
    acc[nome].total++;
    if (o.status === 'concluida') acc[nome].concluidas++;
    return acc;
  }, {});

  return (
    <div className="pb-32 px-4 pt-4 space-y-4 bg-[#0A0B0D] min-h-full">
      <div className="bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E]">
        <p className="text-sm font-semibold text-[#F5F5F0] mb-3">Resumo de OS</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#F5F5F0] tabular-nums">{os.length}</p>
            <p className="text-xs text-[#6B7280]">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#34D399] tabular-nums">{concluidas.length}</p>
            <p className="text-xs text-[#6B7280]">Concluídas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#5B8DEF] tabular-nums">{abertas.length}</p>
            <p className="text-xs text-[#6B7280]">Abertas</p>
          </div>
        </div>
        {os.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
              <span>Taxa de conclusão</span>
              <span className="font-medium text-[#F5F5F0]">{Math.round((concluidas.length / os.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-[#0A0B0D] rounded-full">
              <div className="h-2 bg-[#34D399] rounded-full transition-all" style={{ width: `${(concluidas.length / os.length) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E]">
        <p className="text-sm font-semibold text-[#F5F5F0] mb-3">OS por contrato</p>
        <div className="space-y-3">
          {Object.entries(porContrato).map(([nome, dados]) => (
            <div key={nome}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-[#A8ADB8] truncate flex-1 mr-2">{nome}</p>
                <p className="text-xs text-[#6B7280] shrink-0">{dados.concluidas}/{dados.total}</p>
              </div>
              <div className="h-1.5 bg-[#0A0B0D] rounded-full">
                <div className="h-1.5 bg-[#F08020] rounded-full" style={{ width: `${(dados.concluidas / dados.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1A1D24] border border-[#5B8DEF]/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <IconFileText size={20} className="text-[#5B8DEF] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[#F5F5F0]">Relatório de medição mensal</p>
            <p className="text-xs text-[#6B7280] mt-1">
              Exporta o relatório de OS concluídas no mês para envio à prefeitura.
            </p>
          </div>
        </div>
        <button className="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-[#F08020] text-[#F5F5F0] rounded-xl text-sm font-semibold active:bg-[#D86E14] transition-colors">
          <IconDownload size={16} />
          Gerar relatório — Junho/2026
        </button>
      </div>
    </div>
  );
}
