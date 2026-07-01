import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicosService, osServicosService } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ui } from '../lib/theme';
import { IconPlus, IconTrash, IconTool } from '@tabler/icons-react';

const brl = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ServicosOS({ osId, contratoId }) {
  const queryClient = useQueryClient();
  const { podeVerValores } = useAuth();
  const [tipoId, setTipoId] = useState('');
  const [qtd, setQtd] = useState(1);

  const { data: tipos = [] } = useQuery({ queryKey: ['tipos-servico'], queryFn: () => servicosService.getTipos() });
  const { data: servicos = [] } = useQuery({ queryKey: ['os-servicos', osId], queryFn: () => osServicosService.getByOS(osId) });

  const addMut = useMutation({
    mutationFn: () => osServicosService.adicionar({ os_id: osId, tipo_servico_id: tipoId, quantidade: qtd, contrato_id: contratoId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['os-servicos', osId] }); setTipoId(''); setQtd(1); },
    onError: (e) => alert('Erro: ' + e.message),
  });
  const delMut = useMutation({
    mutationFn: (id) => osServicosService.remover(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['os-servicos', osId] }),
  });

  const total = servicos.reduce((s, x) => s + Number(x.valor_total || 0), 0);

  return (
    <div className="bg-[#121419] border border-[#23262E] rounded-2xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#A8ADB8] uppercase tracking-wider flex items-center gap-1.5">
          <IconTool size={13} /> Serviços executados
        </p>
        {total > 0 && podeVerValores && <span className="text-sm font-bold text-[#F08020] tabular-nums">{brl(total)}</span>}
      </div>

      {servicos.length > 0 && (
        <div className="space-y-1.5">
          {servicos.map(s => (
            <div key={s.id} className="flex items-center justify-between text-sm">
              <div className="flex-1">
                <span className="text-[#F5F5F0]">{s.tipos_servico?.nome}</span>
                <span className="text-xs text-[#6B7280]"> · {s.quantidade} {s.tipos_servico?.unidade}</span>
              </div>
              {podeVerValores && <span className="text-[#A8ADB8] tabular-nums mr-2">{brl(s.valor_total)}</span>}
              <button onClick={() => delMut.mutate(s.id)} className="text-[#454A54] hover:text-[#F87171]"><IconTrash size={13} /></button>
            </div>
          ))}
        </div>
      )}

      {tipos.length === 0 ? (
        <p className="text-xs text-[#454A54]">Cadastre serviços no catálogo (tela de Medição) para poder registrar aqui.</p>
      ) : (
        <div className="flex gap-2">
          <select value={tipoId} onChange={e => setTipoId(e.target.value)} className={`${ui.input} flex-1 h-10`}>
            <option value="">Adicionar serviço...</option>
            {tipos.map(t => <option key={t.id} value={t.id}>{t.nome}{podeVerValores ? ` (${brl(t.valor_padrao)})` : ''}</option>)}
          </select>
          <input type="number" min="1" value={qtd} onChange={e => setQtd(e.target.value)} className={`${ui.input} w-16 h-10`} />
          <button onClick={() => tipoId && addMut.mutate()} disabled={!tipoId || addMut.isPending} className="px-3 bg-[#F08020] text-white rounded-xl disabled:opacity-40 flex items-center"><IconPlus size={16} /></button>
        </div>
      )}
    </div>
  );
}
