import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contratosService, servicosService, medicaoService } from '../services/supabase';
import { ui } from '../lib/theme';
import { IconFileInvoice, IconDownload, IconLock, IconLockOpen, IconLoader2, IconSettings, IconPlus, IconX, IconCheck } from '@tabler/icons-react';
import Modal from '../components/Modal';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const brl = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function baixarCSV(linhas, nome) {
  const csv = linhas.map(l => l.map(c => {
    const v = c == null ? '' : String(c);
    return /[",;\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  }).join(';')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = nome;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Medicao() {
  const queryClient = useQueryClient();
  const hoje = new Date();
  const [contratoId, setContratoId] = useState('');
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [modalCatalogo, setModalCatalogo] = useState(false);

  const { data: contratos = [] } = useQuery({ queryKey: ['contratos'], queryFn: contratosService.getAll });

  const { data: medicao, isLoading } = useQuery({
    queryKey: ['medicao', contratoId, ano, mes],
    queryFn: () => medicaoService.consolidar(contratoId || null, ano, mes),
  });
  const { data: statusMedicao } = useQuery({
    queryKey: ['medicao-status', contratoId, ano, mes],
    queryFn: () => medicaoService.getStatus(contratoId || null, ano, mes),
    enabled: !!contratoId,
  });

  const fecharMut = useMutation({
    mutationFn: () => medicaoService.fechar(contratoId, ano, mes, medicao.total),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicao-status'] });
      alert('Medição fechada!');
    },
    onError: (e) => alert('Erro: ' + e.message),
  });

  const contratoNome = contratos.find(c => c.id === contratoId)?.nome || 'Todos os contratos';

  const exportar = () => {
    const cab = ['Serviço', 'Quantidade', 'Unidade', 'Valor total'];
    const linhas = (medicao?.itens || []).map(i => [i.nome, i.quantidade, i.unidade, i.valor.toFixed(2)]);
    linhas.push(['', '', 'TOTAL', (medicao?.total || 0).toFixed(2)]);
    baixarCSV([cab, ...linhas], `medicao_${contratoNome}_${MESES[mes]}_${ano}.csv`.replace(/\s+/g, '_'));
  };

  return (
    <div className="pb-32 bg-[#0A0B0D] min-h-full px-4 pt-4 space-y-4">
      {/* Filtros */}
      <div className="space-y-2">
        <select value={contratoId} onChange={e => setContratoId(e.target.value)} className={ui.input}>
          <option value="">Todos os contratos</option>
          {contratos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <div className="flex gap-2">
          <select value={mes} onChange={e => setMes(Number(e.target.value))} className={`${ui.input} flex-1`}>
            {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={ano} onChange={e => setAno(Number(e.target.value))} className={`${ui.input} w-28`}>
            {[hoje.getFullYear(), hoje.getFullYear() - 1].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Total faturável */}
      <div className="bg-gradient-to-br from-[#F08020]/15 to-[#1A1D24] rounded-2xl p-5 border border-[#F08020]/25">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#A8ADB8] mb-1">Total faturável — {MESES[mes]}/{ano}</p>
            <p className="text-3xl font-bold text-[#F5F5F0] tabular-nums">{brl(medicao?.total)}</p>
          </div>
          <IconFileInvoice size={32} className="text-[#F08020]" />
        </div>
        <div className="flex gap-4 mt-3 pt-3 border-t border-[#F08020]/20 text-xs text-[#A8ADB8]">
          <span>{medicao?.qtdOrdens ?? 0} OS concluídas</span>
          <span>{medicao?.itens?.length ?? 0} tipos de serviço</span>
          {statusMedicao?.status === 'fechada' && <span className="text-[#A78BFA] flex items-center gap-1"><IconLock size={12} /> Fechada</span>}
        </div>
      </div>

      {/* Detalhamento */}
      <div className="bg-[#1A1D24] rounded-2xl border border-[#23262E] overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p className="text-sm font-semibold text-[#F5F5F0]">Detalhamento por serviço</p>
          <button onClick={() => setModalCatalogo(true)} className="text-xs text-[#5B8DEF] flex items-center gap-1">
            <IconSettings size={13} /> Catálogo
          </button>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 bg-[#22262F] rounded-lg animate-pulse" />)}</div>
        ) : (medicao?.itens?.length ?? 0) === 0 ? (
          <div className="text-center py-10 px-4 text-[#6B7280]">
            <p className="text-sm">Nenhum serviço medido neste período</p>
            <p className="text-xs mt-1 text-[#454A54]">Registre os serviços executados nas OS concluídas (na tela de Ordens de Serviço).</p>
          </div>
        ) : (
          medicao.itens.map((it, i, arr) => (
            <div key={it.nome} className={`px-4 py-3 flex items-center justify-between ${i < arr.length - 1 ? 'border-b border-[#23262E]' : ''}`}>
              <div>
                <p className="text-sm text-[#F5F5F0]">{it.nome}</p>
                <p className="text-xs text-[#6B7280]">{it.quantidade} {it.unidade}</p>
              </div>
              <p className="text-sm font-medium text-[#F5F5F0] tabular-nums">{brl(it.valor)}</p>
            </div>
          ))
        )}
      </div>

      <button onClick={exportar} disabled={!medicao?.itens?.length} className="w-full flex items-center justify-center gap-2 py-3 border border-[#30353F] text-[#A8ADB8] rounded-2xl text-sm font-medium active:bg-[#22262F] transition-colors disabled:opacity-40">
        <IconDownload size={16} /> Exportar medição (CSV)
      </button>

      {contratoId && (
        statusMedicao?.status === 'fechada' ? (
          <div className="w-full flex items-center justify-center gap-2 py-3 bg-[#A78BFA]/10 border border-[#A78BFA]/25 text-[#A78BFA] rounded-2xl text-sm font-medium">
            <IconLock size={16} /> Medição fechada em {new Date(statusMedicao.fechado_em).toLocaleDateString('pt-BR')}
          </div>
        ) : (
          <button onClick={() => window.confirm(`Fechar a medição de ${MESES[mes]}/${ano} — ${contratoNome}? Total: ${brl(medicao?.total)}`) && fecharMut.mutate()}
            disabled={fecharMut.isPending || !medicao?.total}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#F08020] text-white rounded-2xl text-sm font-semibold active:bg-[#D86E14] transition-colors disabled:opacity-50">
            {fecharMut.isPending ? <IconLoader2 size={16} className="animate-spin" /> : <IconLockOpen size={16} />}
            Fechar medição — {brl(medicao?.total)}
          </button>
        )
      )}
      {!contratoId && <p className="text-[11px] text-[#454A54] text-center">Selecione um contrato para fechar a medição.</p>}

      {/* Catálogo de serviços */}
      <CatalogoServicos aberto={modalCatalogo} onClose={() => setModalCatalogo(false)} />
    </div>
  );
}

// ---------- Catálogo de serviços (gerencia tipos + preço padrão + preço por contrato) ----------
function CatalogoServicos({ aberto, onClose }) {
  const queryClient = useQueryClient();
  const [novo, setNovo] = useState({ nome: '', unidade: 'un', valor_padrao: '' });
  const [contratoSel, setContratoSel] = useState('');

  const { data: tipos = [] } = useQuery({ queryKey: ['tipos-servico'], queryFn: () => servicosService.getTipos(), enabled: aberto });
  const { data: contratos = [] } = useQuery({ queryKey: ['contratos'], queryFn: contratosService.getAll, enabled: aberto });
  const { data: precosContrato = [] } = useQuery({
    queryKey: ['precos-contrato', contratoSel],
    queryFn: () => servicosService.getPrecosContrato(contratoSel),
    enabled: aberto && !!contratoSel,
  });
  const precoDe = (tipoId) => precosContrato.find(p => p.tipo_servico_id === tipoId)?.valor;

  const setPrecoMut = useMutation({
    mutationFn: ({ tipoId, valor }) => servicosService.setPrecoContrato(tipoId, contratoSel, valor),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['precos-contrato', contratoSel] }),
    onError: (e) => alert('Erro: ' + e.message),
  });

  const criar = useMutation({
    mutationFn: (dados) => servicosService.criarTipo(dados),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tipos-servico'] }); setNovo({ nome: '', unidade: 'un', valor_padrao: '' }); },
    onError: (e) => alert('Erro: ' + e.message),
  });
  const desativar = useMutation({
    mutationFn: (id) => servicosService.atualizarTipo(id, { ativo: false }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tipos-servico'] }),
  });

  return (
    <Modal aberto={aberto} onClose={onClose} titulo="Catálogo de serviços">
      <div className="space-y-4">
        <p className="text-xs text-[#6B7280]">Cadastre os serviços e o preço padrão. O valor é usado na medição.</p>

        {/* Lista */}
        <div className="space-y-2">
          {tipos.map(t => (
            <div key={t.id} className="flex items-center justify-between bg-[#121419] border border-[#23262E] rounded-xl px-3 py-2.5">
              <div>
                <p className="text-sm text-[#F5F5F0]">{t.nome}</p>
                <p className="text-xs text-[#6B7280]">{(t.valor_padrao || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / {t.unidade}</p>
              </div>
              <button onClick={() => desativar.mutate(t.id)} className="text-[#454A54] hover:text-[#F87171]"><IconX size={16} /></button>
            </div>
          ))}
          {tipos.length === 0 && <p className="text-sm text-[#454A54] text-center py-4">Nenhum serviço cadastrado</p>}
        </div>

        {/* Novo */}
        <div className="pt-3 border-t border-[#23262E] space-y-2">
          <input value={novo.nome} onChange={e => setNovo(v => ({ ...v, nome: e.target.value }))} placeholder="Nome do serviço" className={ui.input} />
          <div className="flex gap-2">
            <input value={novo.unidade} onChange={e => setNovo(v => ({ ...v, unidade: e.target.value }))} placeholder="un" className={`${ui.input} w-20`} />
            <input type="number" step="0.01" value={novo.valor_padrao} onChange={e => setNovo(v => ({ ...v, valor_padrao: e.target.value }))} placeholder="Preço padrão (R$)" className={`${ui.input} flex-1`} />
            <button
              onClick={() => novo.nome.trim() && criar.mutate({ nome: novo.nome, unidade: novo.unidade || 'un', valor_padrao: Number(novo.valor_padrao) || 0 })}
              disabled={criar.isPending || !novo.nome.trim()}
              className="px-4 bg-[#F08020] text-white rounded-xl text-sm font-medium disabled:opacity-40 flex items-center gap-1"
            >
              <IconPlus size={14} /> Add
            </button>
          </div>
        </div>

        {/* Preço por contrato (opcional) */}
        <div className="pt-3 border-t border-[#23262E] space-y-2">
          <label className={ui.label}>Preço por contrato (opcional)</label>
          <p className="text-[11px] text-[#454A54]">Selecione um contrato para definir preços específicos. Em branco = usa o preço padrão.</p>
          <select value={contratoSel} onChange={e => setContratoSel(e.target.value)} className={ui.input}>
            <option value="">Selecione um contrato...</option>
            {contratos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          {contratoSel && tipos.map(t => (
            <div key={t.id} className="flex items-center gap-2">
              <span className="text-xs text-[#A8ADB8] flex-1 truncate">{t.nome}</span>
              <input
                type="number" step="0.01"
                defaultValue={precoDe(t.id) ?? ''}
                key={`${t.id}-${precoDe(t.id) ?? ''}`}
                placeholder={`padrão ${(t.valor_padrao||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}`}
                onBlur={e => { const v = e.target.value; if (String(v) !== String(precoDe(t.id) ?? '')) setPrecoMut.mutate({ tipoId: t.id, valor: v === '' ? null : v }); }}
                className={`${ui.input} w-32 h-9`}
              />
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
