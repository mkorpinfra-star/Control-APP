import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { almoxarifadoService } from '../services/supabase';
import { ui } from '../lib/theme';
import { IconPlus, IconSearch, IconAlertTriangle, IconPackage, IconArrowUp, IconArrowDown } from '@tabler/icons-react';

const CATEGORIA_LABEL = {
  lampada: 'Lâmpada', reator: 'Reator', cabo: 'Cabo', rele_fotoeletrico: 'Relé fotoelétrico',
  braco: 'Braço', luminaria: 'Luminária', fusivel: 'Fusível', conector: 'Conector', outros: 'Outros',
};

export default function Almoxarifado() {
  const [busca, setBusca] = useState('');
  const [aba, setAba] = useState('estoque');

  const { data: estoque = [], isLoading } = useQuery({
    queryKey: ['almoxarifado-estoque'],
    queryFn: almoxarifadoService.getEstoque,
  });

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['movimentacoes-estoque'],
    queryFn: () => almoxarifadoService.getMovimentacoes(),
    enabled: aba === 'movimentacoes',
  });

  const estoqueFiltrado = estoque.filter(e =>
    e.almoxarifado_itens?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    e.almoxarifado_itens?.categoria?.toLowerCase().includes(busca.toLowerCase())
  );

  const itensCriticos = estoqueFiltrado.filter(e => e.quantidade <= (e.almoxarifado_itens?.estoque_minimo || 0));

  if (isLoading) {
    return (
      <div className="p-4 space-y-3 bg-[#0A0B0D] min-h-full">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-[#1A1D24] border border-[#23262E] rounded-2xl p-4 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="pb-32 bg-[#0A0B0D] min-h-full">
      {itensCriticos.length > 0 && (
        <div className="mx-4 mt-4 bg-[#F08020]/10 border border-[#F08020]/25 rounded-2xl p-3 flex items-center gap-2">
          <IconAlertTriangle size={16} className="text-[#FB8C3E] shrink-0" />
          <p className="text-xs text-[#FB8C3E]">
            <strong>{itensCriticos.length}</strong> item{itensCriticos.length > 1 ? 's' : ''} com estoque abaixo do mínimo
          </p>
        </div>
      )}

      <div className="px-4 pt-4 pb-2 flex gap-2">
        {['estoque', 'movimentacoes'].map(a => (
          <button key={a} onClick={() => setAba(a)} className={ui.chip(aba === a)}>
            {a === 'estoque' ? 'Estoque atual' : 'Movimentações'}
          </button>
        ))}
      </div>

      {aba === 'estoque' && (
        <>
          <div className="px-4 pb-2">
            <div className="relative">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Buscar material..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#121419] border border-[#30353F] rounded-xl text-sm text-[#F5F5F0] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F08020] focus:ring-2 focus:ring-[#F08020]/30"
              />
            </div>
          </div>

          <div className="px-4 space-y-2">
            {estoqueFiltrado.length === 0 ? (
              <div className="text-center py-16 text-[#6B7280]">
                <IconPackage size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum item cadastrado</p>
              </div>
            ) : (
              estoqueFiltrado.map(e => {
                const item = e.almoxarifado_itens;
                const critico = e.quantidade <= (item?.estoque_minimo || 0);
                return (
                  <div key={e.id} className={`bg-[#1A1D24] rounded-2xl p-4 border ${critico ? 'border-[#F08020]/30' : 'border-[#23262E]'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#F5F5F0] text-sm">{item?.nome}</p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{CATEGORIA_LABEL[item?.categoria] || item?.categoria}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold tabular-nums ${critico ? 'text-[#FB8C3E]' : 'text-[#F5F5F0]'}`}>{e.quantidade}</p>
                        <p className="text-xs text-[#6B7280]">{item?.unidade}</p>
                      </div>
                    </div>
                    {critico && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-[#FB8C3E]">
                        <IconAlertTriangle size={12} />
                        <span>Mínimo: {item?.estoque_minimo} {item?.unidade}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {aba === 'movimentacoes' && (
        <div className="px-4 space-y-2">
          {movimentacoes.map(m => (
            <div key={m.id} className="bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-[#F5F5F0]">{m.almoxarifado_itens?.nome}</p>
                <span className={`text-sm font-bold tabular-nums ${m.tipo === 'entrada' ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
                  {m.tipo === 'entrada' ? '+' : '-'}{m.quantidade} {m.almoxarifado_itens?.unidade}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#6B7280]">
                  {m.tipo === 'entrada' ? 'Entrada' : m.tipo === 'saida_requisicao' ? 'Saída (requisição)' : 'Saída manual'}
                  {m.ordens_servico && ` — OS #${m.ordens_servico.numero}`}
                </p>
                <p className="text-xs text-[#6B7280]">Saldo: {m.saldo_apos} {m.almoxarifado_itens?.unidade}</p>
              </div>
              <div className="mt-2 pt-2 border-t border-[#23262E] space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <IconArrowUp size={12} className="text-[#34D399] shrink-0" />
                  <span className="text-xs text-[#6B7280]">Entregou:</span>
                  <span className="text-xs text-[#A8ADB8] font-medium">{m.entregue_por?.nome || '—'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconArrowDown size={12} className="text-[#FB8C3E] shrink-0" />
                  <span className="text-xs text-[#6B7280]">Retirou:</span>
                  <span className="text-xs text-[#A8ADB8] font-medium">{m.retirado_por?.nome || '—'}</span>
                </div>
                <p className="text-xs text-[#454A54] pt-0.5">
                  {new Date(m.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
