import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ordensServicoService, registrosCampoService } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { IconMapPin, IconCamera, IconCheck, IconLoader } from '@tabler/icons-react';

export default function RegistroCampo() {
  const { perfil } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef();

  const [osId, setOsId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [numeroPoste, setNumeroPoste] = useState('');
  const [statusApos, setStatusApos] = useState('resolvido');
  const [fotos, setFotos] = useState([]);
  const [coordenadas, setCoordenadas] = useState(null);
  const [localizando, setLocalizando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const { data: minhasOS = [] } = useQuery({
    queryKey: ['minhas-os', perfil?.id],
    queryFn: () => ordensServicoService.getAll({ responsavel_id: perfil?.id }),
    enabled: !!perfil?.id,
    select: (lista) => lista.filter(os => os.status === 'aberta' || os.status === 'em_andamento'),
  });

  const obterLocalizacao = () => {
    if (!('geolocation' in navigator)) {
      return alert('Seu dispositivo/navegador não suporta geolocalização.');
    }
    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoordenadas({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          precisao: Math.round(pos.coords.accuracy),
        });
        setLocalizando(false);
      },
      err => {
        const msgs = {
          1: 'Permissão de localização negada. Habilite o acesso à localização no navegador.',
          2: 'Localização indisponível no momento. Tente novamente.',
          3: 'Tempo esgotado ao obter a localização. Tente novamente.',
        };
        alert(msgs[err.code] || 'Não foi possível obter a localização.');
        setLocalizando(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleFoto = (e) => setFotos(prev => [...prev, ...Array.from(e.target.files)].slice(0, 5));

  const enviarRegistro = async () => {
    if (!osId || !descricao) return alert('Preencha a OS e a descrição.');
    setEnviando(true);
    try {
      const registro = await registrosCampoService.create({
        os_id: osId, usuario_id: perfil.id, descricao, numero_poste: numeroPoste,
        latitude: coordenadas?.lat, longitude: coordenadas?.lng, status_apos: statusApos, fotos: [],
      });
      if (fotos.length > 0) {
        const urls = await Promise.all(fotos.map(f => registrosCampoService.uploadFoto(f, registro.id)));
        await registrosCampoService.create({ ...registro, fotos: urls });
      }
      queryClient.invalidateQueries({ queryKey: ['ordens-servico'] });
      setSucesso(true);
      setDescricao(''); setNumeroPoste(''); setFotos([]); setCoordenadas(null); setOsId('');
      setTimeout(() => setSucesso(false), 3000);
    } catch (e) {
      alert('Erro ao enviar registro: ' + e.message);
    } finally {
      setEnviando(false);
    }
  };

  const card = 'bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E]';
  const label = 'block text-xs font-medium text-[#A8ADB8] mb-2';
  const field = 'w-full py-2.5 px-3 bg-[#121419] border border-[#30353F] rounded-xl text-sm text-[#F5F5F0] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F08020] focus:ring-2 focus:ring-[#F08020]/30';

  return (
    <div className="p-4 pb-32 space-y-4 bg-[#0A0B0D] min-h-full">
      {sucesso && (
        <div className="bg-[#34D399]/10 border border-[#34D399]/20 rounded-2xl p-4 flex items-center gap-2">
          <IconCheck size={16} className="text-[#34D399]" />
          <p className="text-sm text-[#34D399] font-medium">Registro enviado com sucesso!</p>
        </div>
      )}

      <div className={card}>
        <label className={label}>Ordem de serviço</label>
        <select value={osId} onChange={e => setOsId(e.target.value)} className={field}>
          <option value="">Selecione a OS</option>
          {minhasOS.map(os => (
            <option key={os.id} value={os.id}>OS #{os.numero} — {os.bairro || os.logradouro || 'Sem endereço'}</option>
          ))}
        </select>
      </div>

      <div className={card}>
        <label className={label}>Número do poste</label>
        <input type="text" value={numeroPoste} onChange={e => setNumeroPoste(e.target.value)} placeholder="Ex: 12345-A" className={field} />
      </div>

      <div className={card}>
        <label className={label}>O que foi feito?</label>
        <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={3} placeholder="Descreva o serviço executado..." className={`${field} resize-none`} />
      </div>

      <div className={card}>
        <label className={label}>Situação após atendimento</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: 'resolvido', label: 'Resolvido' },
            { v: 'parcial', label: 'Parcial' },
            { v: 'aguardando_material', label: 'Aguardando material' },
            { v: 'reaberto', label: 'Reaberto' },
          ].map(op => (
            <button
              key={op.v}
              onClick={() => setStatusApos(op.v)}
              className={`py-2 rounded-xl text-xs font-medium transition-colors ${
                statusApos === op.v ? 'bg-[#F08020] text-[#F5F5F0]' : 'bg-[#121419] text-[#A8ADB8] border border-[#30353F]'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      <div className={card}>
        <label className={label}>Localização GPS</label>
        <button
          onClick={obterLocalizacao}
          disabled={localizando}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#30353F] rounded-xl text-sm text-[#A8ADB8] active:bg-[#22262F] transition-colors"
        >
          {localizando ? <IconLoader size={16} className="animate-spin" /> : <IconMapPin size={16} className="text-[#F08020]" />}
          {coordenadas
            ? `${coordenadas.lat.toFixed(5)}, ${coordenadas.lng.toFixed(5)}`
            : localizando ? 'Obtendo localização...' : 'Capturar localização'}
        </button>

        {coordenadas && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-[#34D399] flex items-center gap-1">
              <IconCheck size={12} /> Capturada · precisão ±{coordenadas.precisao} m
            </span>
            <a
              href={`https://www.google.com/maps?q=${coordenadas.lat},${coordenadas.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#5B8DEF] hover:underline flex items-center gap-1"
            >
              <IconMapPin size={12} /> Ver no mapa
            </a>
          </div>
        )}
      </div>

      <div className={card}>
        <label className={label}>Fotos ({fotos.length}/5)</label>
        <input type="file" ref={fileRef} accept="image/*" multiple capture="environment" onChange={handleFoto} className="hidden" />
        <button
          onClick={() => fileRef.current.click()}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-[#30353F] rounded-xl text-sm text-[#6B7280] active:bg-[#22262F] transition-colors"
        >
          <IconCamera size={16} /> Tirar foto ou selecionar
        </button>
        {fotos.length > 0 && (
          <div className="flex gap-2 mt-2 overflow-x-auto hide-scrollbar">
            {fotos.map((f, i) => (
              <div key={i} className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-[#121419] border border-[#23262E]">
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={enviarRegistro}
        disabled={enviando || !osId || !descricao}
        className="w-full py-4 bg-[#F08020] text-[#F5F5F0] rounded-2xl font-semibold text-sm active:bg-[#D86E14] transition-colors disabled:bg-[#1A1D24] disabled:text-[#454A54] flex items-center justify-center gap-2"
      >
        {enviando ? <IconLoader size={16} className="animate-spin" /> : <IconCheck size={16} />}
        {enviando ? 'Enviando...' : 'Enviar registro de campo'}
      </button>
    </div>
  );
}
