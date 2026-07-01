import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { pontoService, ordensServicoService, notificacoesService } from '../services/supabase';
import { STATUS_PONTO } from '../lib/theme';
import { IconClock, IconCheck, IconSend, IconAlertCircle } from '@tabler/icons-react';

const DIAS    = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const DIAS_PT = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DIAS_SH = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getSegunda(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}
function addDias(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().split('T')[0];
}
function calcHoras(entrada, saida, almSaida, almVolta) {
  if (!entrada || !saida) return { normais: 0, extras: 0 };
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  let total = toMin(saida) - toMin(entrada);
  if (almSaida && almVolta) total -= (toMin(almVolta) - toMin(almSaida));
  total = Math.max(0, total);
  const normais = Math.min(total, 480) / 60;
  const extras  = Math.max(0, total - 480) / 60;
  return { normais: parseFloat(normais.toFixed(2)), extras: parseFloat(extras.toFixed(2)) };
}

export default function BaterPonto() {
  const { perfil } = useAuth();
  const queryClient = useQueryClient();

  const [semanaInicio, setSemanaInicio] = useState(getSegunda(new Date()));
  const [diaIdx, setDiaIdx] = useState(() => {
    const dow = new Date().getDay();
    return dow === 0 ? 0 : Math.min(dow - 1, 5);
  });
  const [osId, setOsId] = useState('');
  const [campos, setCampos] = useState({ hora_entrada: '', hora_saida: '', hora_almoco_saida: '', hora_almoco_volta: '' });
  const [showConfirm, setShowConfirm] = useState(false);

  const dataAtual = addDias(semanaInicio, diaIdx);

  const { data: minhasOS = [] } = useQuery({
    queryKey: ['minhas-os', perfil?.id],
    queryFn: () => ordensServicoService.getAll({ responsavel_id: perfil?.id }),
    enabled: !!perfil?.id,
  });
  const { data: pontoHoje } = useQuery({
    queryKey: ['meu-ponto', perfil?.id, dataAtual],
    queryFn: () => pontoService.getMeuPonto(perfil?.id, dataAtual),
    enabled: !!perfil?.id,
  });
  const { data: semana = [] } = useQuery({
    queryKey: ['minha-semana', perfil?.id, semanaInicio],
    queryFn: () => pontoService.getSemana(perfil?.id, semanaInicio, addDias(semanaInicio, 5)),
    enabled: !!perfil?.id,
  });

  useEffect(() => {
    if (pontoHoje) {
      setCampos({
        hora_entrada: pontoHoje.hora_entrada || '', hora_saida: pontoHoje.hora_saida || '',
        hora_almoco_saida: pontoHoje.hora_almoco_saida || '', hora_almoco_volta: pontoHoje.hora_almoco_volta || '',
      });
      setOsId(pontoHoje.os_id || '');
    } else {
      setCampos({ hora_entrada: '', hora_saida: '', hora_almoco_saida: '', hora_almoco_volta: '' });
      setOsId('');
    }
  }, [pontoHoje]);

  const salvarMutation = useMutation({
    mutationFn: (dados) => pontoService.registrar(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meu-ponto'] });
      queryClient.invalidateQueries({ queryKey: ['minha-semana'] });
    },
  });
  const enviarMutation = useMutation({
    mutationFn: async (dados) => {
      const r = await pontoService.registrar({ ...dados, status: 'enviado' });
      // Amarração: notifica quem aprova ponto (supervisor + admin)
      await notificacoesService.notificarCargos(['admin', 'supervisor'], {
        titulo: 'Ponto enviado para aprovação',
        mensagem: `${perfil?.nome} enviou o ponto de ${new Date(dados.data + 'T12:00:00').toLocaleDateString('pt-BR')}.`,
        tipo: 'info', link: '/controle-ponto', exceto: perfil?.id,
      });
      return r;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meu-ponto'] });
      queryClient.invalidateQueries({ queryKey: ['minha-semana'] });
      setShowConfirm(false);
    },
  });

  const { normais, extras } = calcHoras(campos.hora_entrada, campos.hora_saida, campos.hora_almoco_saida, campos.hora_almoco_volta);

  const dadosParaSalvar = {
    usuario_id: perfil?.id, data: dataAtual, os_id: osId || null,
    ...campos, horas_normais: normais, horas_extras: extras,
    status: pontoHoje?.status || 'rascunho',
  };
  const bloqueado = pontoHoje?.status === 'enviado' || pontoHoje?.status === 'aprovado';
  const getPontoDia = (idx) => semana.find(p => p.data === addDias(semanaInicio, idx));
  const hojeStr = new Date().toISOString().split('T')[0];

  return (
    <div className="pb-32 bg-[#0A0B0D] min-h-full">
      {/* Navegação de semana */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setSemanaInicio(s => addDias(s, -7))} className="text-xs text-[#A8ADB8] px-3 py-1.5 bg-[#1A1D24] border border-[#30353F] rounded-lg active:bg-[#22262F]">
            ← Semana ant.
          </button>
          <p className="text-xs text-[#6B7280]">
            {new Date(semanaInicio + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            {' – '}
            {new Date(addDias(semanaInicio, 5) + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </p>
          <button onClick={() => setSemanaInicio(s => addDias(s, 7))} className="text-xs text-[#A8ADB8] px-3 py-1.5 bg-[#1A1D24] border border-[#30353F] rounded-lg active:bg-[#22262F]">
            Próx. →
          </button>
        </div>

        <div className="grid grid-cols-6 gap-1">
          {DIAS.map((_, i) => {
            const p = getPontoDia(i);
            const isHoje = addDias(semanaInicio, i) === hojeStr;
            const isSelected = i === diaIdx;
            return (
              <button
                key={i}
                onClick={() => setDiaIdx(i)}
                className={`flex flex-col items-center py-2 rounded-xl transition-colors border ${
                  isSelected ? 'bg-[#F08020] text-[#F5F5F0] border-[#F08020]' : 'bg-[#1A1D24] text-[#A8ADB8] border-[#23262E]'
                }`}
              >
                <span className="text-[10px] font-medium">{DIAS_SH[i]}</span>
                <span className={`text-[10px] mt-0.5 ${isHoje && !isSelected ? 'text-[#5B8DEF] font-bold' : 'opacity-60'}`}>
                  {new Date(addDias(semanaInicio, i) + 'T12:00:00').getDate()}
                </span>
                {p && (
                  <div className={`w-1 h-1 rounded-full mt-0.5 ${
                    p.status === 'aprovado' ? 'bg-[#34D399]' :
                    p.status === 'enviado'  ? 'bg-[#5B8DEF]' :
                    isSelected ? 'bg-white/60' : 'bg-[#454A54]'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* Cabeçalho dia */}
        <div className="bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E]">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#F5F5F0]">{DIAS_PT[diaIdx]}</p>
              <p className="text-xs text-[#6B7280]">
                {new Date(dataAtual + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            {pontoHoje?.status && <span className={STATUS_PONTO[pontoHoje.status]?.badge}>{STATUS_PONTO[pontoHoje.status]?.label}</span>}
          </div>

          <div className="mt-3">
            <label className="block text-xs font-medium text-[#A8ADB8] mb-1">Ordem de serviço</label>
            <select
              value={osId}
              onChange={e => setOsId(e.target.value)}
              disabled={bloqueado}
              className="w-full py-2 px-3 bg-[#121419] border border-[#30353F] rounded-xl text-sm text-[#F5F5F0] disabled:opacity-50 focus:outline-none focus:border-[#F08020] focus:ring-2 focus:ring-[#F08020]/30"
            >
              <option value="">Selecione a OS do dia</option>
              {minhasOS.map(os => (
                <option key={os.id} value={os.id}>OS #{os.numero} — {os.bairro || os.logradouro || 'Sem endereço'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Horários */}
        <div className="bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E] space-y-3">
          <p className="text-xs font-semibold text-[#A8ADB8] uppercase tracking-wider">Horários</p>
          <div className="grid grid-cols-2 gap-3">
            <HorarioInput label="Entrada" value={campos.hora_entrada} onChange={v => setCampos(c => ({ ...c, hora_entrada: v }))} disabled={bloqueado} />
            <HorarioInput label="Saída" value={campos.hora_saida} onChange={v => setCampos(c => ({ ...c, hora_saida: v }))} disabled={bloqueado} />
            <HorarioInput label="Almoço saída" value={campos.hora_almoco_saida} onChange={v => setCampos(c => ({ ...c, hora_almoco_saida: v }))} disabled={bloqueado} />
            <HorarioInput label="Almoço volta" value={campos.hora_almoco_volta} onChange={v => setCampos(c => ({ ...c, hora_almoco_volta: v }))} disabled={bloqueado} />
          </div>

          {(normais > 0 || extras > 0) && (
            <div className="flex gap-3 pt-1">
              <div className="flex-1 bg-[#F08020]/10 border border-[#F08020]/20 rounded-xl p-2.5 text-center">
                <p className="text-lg font-bold text-[#5B8DEF] tabular-nums">{normais.toFixed(1)}h</p>
                <p className="text-[10px] text-[#5B8DEF]/70">Normais</p>
              </div>
              {extras > 0 && (
                <div className="flex-1 bg-[#F08020]/10 border border-[#F08020]/20 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-[#FB8C3E] tabular-nums">{extras.toFixed(1)}h</p>
                  <p className="text-[10px] text-[#FB8C3E]/70">Extras</p>
                </div>
              )}
            </div>
          )}
        </div>

        {pontoHoje?.status === 'rejeitado' && pontoHoje.motivo_rejeicao && (
          <div className="bg-[#F87171]/10 border border-[#F87171]/20 rounded-2xl p-3 flex gap-2">
            <IconAlertCircle size={16} className="text-[#F87171] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-[#F87171]">Registro rejeitado</p>
              <p className="text-xs text-[#F87171]/70 mt-0.5">{pontoHoje.motivo_rejeicao}</p>
            </div>
          </div>
        )}

        {!bloqueado && (
          <div className="flex gap-3">
            <button
              onClick={() => salvarMutation.mutate(dadosParaSalvar)}
              disabled={salvarMutation.isPending}
              className="flex-1 py-3 bg-transparent border border-[#30353F] text-[#F5F5F0] rounded-2xl text-sm font-medium flex items-center justify-center gap-2 active:bg-[#22262F] transition-colors disabled:opacity-50"
            >
              <IconCheck size={16} />
              {salvarMutation.isPending ? 'Salvando...' : 'Salvar rascunho'}
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!campos.hora_entrada || enviarMutation.isPending}
              className="flex-1 py-3 bg-[#F08020] text-[#F5F5F0] rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 active:bg-[#D86E14] transition-colors disabled:bg-[#1A1D24] disabled:text-[#454A54]"
            >
              <IconSend size={16} />
              Enviar
            </button>
          </div>
        )}

        {bloqueado && (
          <div className="bg-[#34D399]/10 border border-[#34D399]/20 rounded-2xl p-3 flex items-center gap-2">
            <IconCheck size={16} className="text-[#34D399]" />
            <p className="text-sm text-[#34D399] font-medium">
              {pontoHoje?.status === 'aprovado' ? 'Ponto aprovado!' : 'Ponto enviado para aprovação.'}
            </p>
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-4">
          <div className="bg-[#22262F] border border-[#30353F] rounded-3xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-[#F5F5F0] mb-2">Enviar para aprovação?</h3>
            <p className="text-sm text-[#A8ADB8] mb-5">
              Depois de enviado, você não poderá alterar o registro de hoje.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 border border-[#30353F] rounded-2xl text-sm text-[#A8ADB8] active:bg-[#272B35]">
                Cancelar
              </button>
              <button
                onClick={() => enviarMutation.mutate(dadosParaSalvar)}
                disabled={enviarMutation.isPending}
                className="flex-1 py-3 bg-[#F08020] text-[#F5F5F0] rounded-2xl text-sm font-semibold active:bg-[#D86E14]"
              >
                {enviarMutation.isPending ? 'Enviando...' : 'Sim, enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HorarioInput({ label, value, onChange, disabled }) {
  return (
    <div>
      <label className="block text-xs text-[#6B7280] mb-1">{label}</label>
      <div className="relative">
        <IconClock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#454A54]" />
        <input
          type="time"
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className="w-full pl-8 pr-2 py-2 bg-[#121419] border border-[#30353F] rounded-xl text-sm text-[#F5F5F0] [color-scheme:dark] disabled:opacity-50 focus:outline-none focus:border-[#F08020] focus:ring-2 focus:ring-[#F08020]/30"
        />
      </div>
    </div>
  );
}
