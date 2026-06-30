import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { almoxarifadoService } from '../services/supabase';
import { extrairItensNF } from '../services/openrouter';
import FotoCaptura from '../components/FotoCaptura';
import { IconArrowLeft, IconCamera, IconCheck, IconLoader2, IconAlertTriangle, IconTrash, IconPlus } from '@tabler/icons-react';

export default function EntradaNF() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [etapa, setEtapa] = useState('foto'); // foto | processando | revisao | confirmando | concluido
  const [fotoUrl, setFotoUrl] = useState(null);
  const [fotoBase64, setFotoBase64] = useState(null);
  const [itensDaNF, setItensDaNF] = useState([]);
  const [erro, setErro] = useState('');

  const { data: itensEstoque = [] } = useQuery({
    queryKey: ['almoxarifado-itens'],
    queryFn: almoxarifadoService.getItens,
  });

  const handleFoto = async ({ base64, url }) => {
    setFotoUrl(url);
    setFotoBase64(base64);
    setEtapa('processando');
    setErro('');
    try {
      const itens = await extrairItensNF(base64);
      if (itens.length === 0) {
        setErro('Não consegui identificar itens na imagem. Adicione manualmente.');
        setItensDaNF([{ nome: '', quantidade: 1, unidade: 'un', item_id: '' }]);
      } else {
        // Tenta fazer match automático com itens do estoque
        const matched = itens.map(item => {
          const match = itensEstoque.find(ie =>
            ie.nome.toLowerCase().includes(item.nome.toLowerCase().split(' ')[0]) ||
            item.nome.toLowerCase().includes(ie.nome.toLowerCase().split(' ')[0])
          );
          return { ...item, item_id: match?.id || '', item_nome_match: match?.nome || '' };
        });
        setItensDaNF(matched);
      }
      setEtapa('revisao');
    } catch {
      setErro('Erro ao processar imagem. Verifique sua conexão.');
      setEtapa('foto');
    }
  };

  const atualizarItem = (idx, campo, valor) => {
    setItensDaNF(prev => prev.map((it, i) => i === idx ? { ...it, [campo]: valor } : it));
  };

  const removerItem = (idx) => {
    setItensDaNF(prev => prev.filter((_, i) => i !== idx));
  };

  const adicionarItem = () => {
    setItensDaNF(prev => [...prev, { nome: '', quantidade: 1, unidade: 'un', item_id: '' }]);
  };

  const confirmar = async () => {
    const validos = itensDaNF.filter(it => it.item_id && it.quantidade > 0);
    if (validos.length === 0) {
      setErro('Selecione ao menos um item cadastrado no estoque.');
      return;
    }
    setEtapa('confirmando');
    try {
      for (const item of validos) {
        await almoxarifadoService.entrada(item.item_id, Number(item.quantidade), `Entrada via NF (foto)`);
      }
      qc.invalidateQueries({ queryKey: ['almoxarifado-estoque'] });
      setEtapa('concluido');
    } catch {
      setErro('Erro ao registrar entrada. Tente novamente.');
      setEtapa('revisao');
    }
  };

  return (
    <div className="min-h-full bg-[#0A0B0D] pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-[#23262E]">
        <button onClick={() => navigate(-1)} className="text-[#6B7280] hover:text-[#F5F5F0] transition-colors">
          <IconArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold text-[#F5F5F0]">Entrada por Nota Fiscal</h1>
      </div>

      <div className="px-4 pt-5 space-y-5">

        {/* ETAPA: FOTO */}
        {etapa === 'foto' && (
          <div className="flex flex-col items-center gap-6 pt-8">
            <div className="w-24 h-24 rounded-3xl bg-[#F08020]/10 border-2 border-dashed border-[#F08020]/30 flex items-center justify-center">
              <IconCamera size={36} className="text-[#F08020]/60" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[#F5F5F0] font-semibold">Fotografe a Nota Fiscal</p>
              <p className="text-sm text-[#6B7280]">A IA vai identificar os itens automaticamente</p>
            </div>
            {erro && (
              <div className="w-full p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl text-sm text-[#F87171] flex gap-2">
                <IconAlertTriangle size={16} className="shrink-0 mt-0.5" />
                {erro}
              </div>
            )}
            <FotoCaptura onFoto={handleFoto} label="Tirar foto da NF" captura="environment" />
          </div>
        )}

        {/* ETAPA: PROCESSANDO */}
        {etapa === 'processando' && (
          <div className="flex flex-col items-center gap-4 pt-12">
            {fotoUrl && <img src={fotoUrl} alt="NF" className="w-32 h-44 object-cover rounded-2xl border border-[#23262E]" />}
            <IconLoader2 size={28} className="text-[#F08020] animate-spin" />
            <p className="text-[#A8ADB8] text-sm">Analisando nota fiscal...</p>
          </div>
        )}

        {/* ETAPA: REVISÃO */}
        {(etapa === 'revisao' || etapa === 'confirmando') && (
          <>
            {fotoUrl && (
              <div className="flex gap-3 items-start">
                <img src={fotoUrl} alt="NF" className="w-16 h-20 object-cover rounded-xl border border-[#23262E] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#F5F5F0]">{itensDaNF.length} item(s) identificado(s)</p>
                  <p className="text-xs text-[#6B7280] mt-1">Revise e vincule cada item ao estoque</p>
                </div>
              </div>
            )}

            {erro && (
              <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl text-sm text-[#F87171]">{erro}</div>
            )}

            <div className="space-y-3">
              {itensDaNF.map((item, idx) => (
                <div key={idx} className="bg-[#121419] border border-[#23262E] rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-[#A8ADB8] font-medium">{item.nome || `Item ${idx + 1}`}</p>
                    <button onClick={() => removerItem(idx)} className="text-[#454A54] hover:text-[#F87171] transition-colors shrink-0">
                      <IconTrash size={14} />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs text-[#6B7280] mb-1 block">Vincular ao estoque *</label>
                    <select
                      value={item.item_id}
                      onChange={e => atualizarItem(idx, 'item_id', e.target.value)}
                      className="w-full px-3 py-2 bg-[#0A0B0D] border border-[#30353F] rounded-xl text-sm text-[#F5F5F0] focus:outline-none focus:border-[#F08020]"
                    >
                      <option value="">Selecionar item...</option>
                      {itensEstoque.map(ie => (
                        <option key={ie.id} value={ie.id}>{ie.nome} ({ie.unidade})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-[#6B7280] mb-1 block">Quantidade</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={e => atualizarItem(idx, 'quantidade', e.target.value)}
                        className="w-full px-3 py-2 bg-[#0A0B0D] border border-[#30353F] rounded-xl text-sm text-[#F5F5F0] focus:outline-none focus:border-[#F08020]"
                      />
                    </div>
                    <div className="w-20">
                      <label className="text-xs text-[#6B7280] mb-1 block">Unidade</label>
                      <input
                        type="text"
                        value={item.unidade}
                        onChange={e => atualizarItem(idx, 'unidade', e.target.value)}
                        className="w-full px-3 py-2 bg-[#0A0B0D] border border-[#30353F] rounded-xl text-sm text-[#F5F5F0] focus:outline-none focus:border-[#F08020]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={adicionarItem}
              className="w-full py-2.5 border border-dashed border-[#30353F] rounded-2xl text-sm text-[#6B7280] hover:border-[#F08020] hover:text-[#F08020] flex items-center justify-center gap-2 transition-colors"
            >
              <IconPlus size={14} /> Adicionar item manualmente
            </button>

            <button
              onClick={confirmar}
              disabled={etapa === 'confirmando'}
              className="w-full py-3.5 bg-[#F08020] text-white rounded-2xl font-semibold text-sm hover:bg-[#D86E14] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {etapa === 'confirmando' ? <><IconLoader2 size={16} className="animate-spin" /> Registrando...</> : <><IconCheck size={16} /> Confirmar entrada</>}
            </button>

            <button onClick={() => { setEtapa('foto'); setFotoUrl(null); setItensDaNF([]); setErro(''); }} className="w-full py-2.5 text-sm text-[#6B7280] hover:text-[#A8ADB8] transition-colors">
              Fotografar outra nota
            </button>
          </>
        )}

        {/* ETAPA: CONCLUÍDO */}
        {etapa === 'concluido' && (
          <div className="flex flex-col items-center gap-5 pt-12 text-center">
            <div className="w-20 h-20 rounded-full bg-[#4ADE80]/10 border-2 border-[#4ADE80]/30 flex items-center justify-center">
              <IconCheck size={36} className="text-[#4ADE80]" />
            </div>
            <div>
              <p className="text-[#F5F5F0] font-semibold text-lg">Entrada registrada!</p>
              <p className="text-sm text-[#6B7280] mt-1">O estoque foi atualizado com sucesso</p>
            </div>
            <button onClick={() => navigate('/almoxarifado')} className="px-6 py-3 bg-[#F08020] text-white rounded-2xl font-semibold text-sm hover:bg-[#D86E14] transition-colors">
              Ver estoque
            </button>
            <button onClick={() => { setEtapa('foto'); setFotoUrl(null); setItensDaNF([]); setErro(''); }} className="text-sm text-[#6B7280] hover:text-[#A8ADB8] transition-colors">
              Nova entrada por NF
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
