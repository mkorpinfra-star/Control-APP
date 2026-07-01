import { useQuery } from '@tanstack/react-query';
import { ordensServicoService } from '../services/supabase';
import { IconFileText, IconDownload } from '@tabler/icons-react';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function baixarCSV(linhas, nomeArquivo) {
  const csv = linhas.map(l => l.map(c => {
    const v = c == null ? '' : String(c);
    return /[",;\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  }).join(';')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Relatorios() {
  const { data: os = [] } = useQuery({
    queryKey: ['os-relatorio'],
    queryFn: () => ordensServicoService.getAll(),
  });

  const agora = new Date();
  const mesAtual = agora.getMonth();
  const anoAtual = agora.getFullYear();

  const concluidas = os.filter(o => o.status === 'concluida');
  const abertas    = os.filter(o => o.status === 'aberta');

  const exportarMedicao = () => {
    const doMes = concluidas.filter(o => {
      const d = o.data_conclusao ? new Date(o.data_conclusao) : null;
      return d && d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    });
    const cabecalho = ['OS', 'Contrato', 'Tipo', 'Prioridade', 'Logradouro', 'Bairro', 'Poste', 'Responsável', 'Abertura', 'Conclusão', 'Status'];
    const linhas = doMes.map(o => [
      o.numero, o.contratos?.nome, o.tipo_defeito, o.prioridade,
      o.logradouro, o.bairro, o.numero_poste, o.usuarios?.nome,
      o.data_abertura, o.data_conclusao, o.status,
    ]);
    baixarCSV([cabecalho, ...linhas], `medicao_${MESES[mesAtual]}_${anoAtual}.csv`);
  };

  const exportarTudo = () => {
    const cabecalho = ['OS', 'Contrato', 'Tipo', 'Prioridade', 'Logradouro', 'Bairro', 'Poste', 'Responsável', 'Abertura', 'Conclusão', 'Status'];
    const linhas = os.map(o => [
      o.numero, o.contratos?.nome, o.tipo_defeito, o.prioridade,
      o.logradouro, o.bairro, o.numero_poste, o.usuarios?.nome,
      o.data_abertura, o.data_conclusao, o.status,
    ]);
    baixarCSV([cabecalho, ...linhas], `todas_ordens_${anoAtual}.csv`);
  };

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
              Exporta as OS concluídas no mês (planilha CSV) para envio à prefeitura.
            </p>
          </div>
        </div>
        <button onClick={exportarMedicao} className="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-[#F08020] text-[#F5F5F0] rounded-xl text-sm font-semibold active:bg-[#D86E14] transition-colors">
          <IconDownload size={16} />
          Gerar medição — {MESES[mesAtual]}/{anoAtual}
        </button>
        <button onClick={exportarTudo} className="mt-2 w-full flex items-center justify-center gap-2 py-3 border border-[#30353F] text-[#A8ADB8] rounded-xl text-sm font-medium active:bg-[#22262F] transition-colors">
          <IconDownload size={16} />
          Exportar todas as ordens
        </button>
      </div>
    </div>
  );
}
