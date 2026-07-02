import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { authService, configService, usuariosService } from '../services/supabase';
import Avatar from '../components/Avatar';
import { IconCamera } from '@tabler/icons-react';
import { ui } from '../lib/theme';
import { IconUser, IconBuildingFactory2, IconShield, IconLoader2, IconCheck, IconChevronRight, IconLock } from '@tabler/icons-react';
import Modal from '../components/Modal';
import { MODULOS, PAPEIS_CONFIG, ACESSO_PADRAO } from '../lib/acessos';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export default function Configuracoes() {
  const { perfil, isAdmin, logout, atualizarPerfil } = useAuth();
  const queryClient = useQueryClient();
  const fotoRef = useRef(null);
  const [subindoFoto, setSubindoFoto] = useState(false);

  const enviarArquivo = async (file) => {
    setSubindoFoto(true);
    try {
      const url = await usuariosService.uploadAvatar(perfil.id, file);
      atualizarPerfil({ avatar_url: url });
    } catch (err) {
      alert('Erro ao enviar foto: ' + err.message);
    } finally {
      setSubindoFoto(false);
    }
  };

  // App nativo (Android/iOS): abre prompt "Câmera ou Galeria" do sistema
  const trocarFotoNativo = async () => {
    try {
      const foto = await Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        promptLabelHeader: 'Foto de perfil',
        promptLabelPhoto: 'Escolher da galeria',
        promptLabelPicture: 'Tirar foto',
      });
      if (!foto?.webPath) return;
      const resp = await fetch(foto.webPath);
      const blob = await resp.blob();
      const file = new File([blob], `avatar.${foto.format || 'jpg'}`, { type: blob.type || 'image/jpeg' });
      await enviarArquivo(file);
    } catch (err) {
      // usuário cancelou o prompt — não é erro
      if (!String(err?.message || err).toLowerCase().includes('cancel')) {
        alert('Erro ao capturar foto: ' + (err?.message || err));
      }
    }
  };

  // Navegador (web): usa input file tradicional
  const trocarFotoWeb = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await enviarArquivo(file);
    e.target.value = '';
  };

  const abrirSelecaoFoto = () => {
    if (Capacitor.isNativePlatform()) trocarFotoNativo();
    else fotoRef.current?.click();
  };

  const [modalSenha, setModalSenha] = useState(false);
  const [modalEmpresa, setModalEmpresa] = useState(false);
  const [modalAcesso, setModalAcesso] = useState(false);

  // ----- Alterar senha -----
  const [senha, setSenha] = useState('');
  const [senha2, setSenha2] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [okSenha, setOkSenha] = useState('');
  const senhaMut = useMutation({
    mutationFn: (nova) => authService.alterarSenha(nova),
    onSuccess: () => {
      setOkSenha('Senha alterada com sucesso!');
      setSenha(''); setSenha2(''); setErroSenha('');
      setTimeout(() => { setModalSenha(false); setOkSenha(''); }, 1800);
    },
    onError: (e) => setErroSenha(e.message),
  });
  const salvarSenha = () => {
    if (senha.length < 6) return setErroSenha('A senha deve ter ao menos 6 caracteres.');
    if (senha !== senha2) return setErroSenha('As senhas não coincidem.');
    senhaMut.mutate(senha);
  };

  // ----- Config empresa -----
  const { data: config } = useQuery({ queryKey: ['config-empresa'], queryFn: configService.get, enabled: isAdmin });
  const [empresa, setEmpresa] = useState(null);
  const [okEmpresa, setOkEmpresa] = useState('');
  const [erroEmpresa, setErroEmpresa] = useState('');
  const empresaMut = useMutation({
    mutationFn: (dados) => configService.update(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config-empresa'] });
      setOkEmpresa('Dados salvos!');
      setTimeout(() => { setModalEmpresa(false); setOkEmpresa(''); }, 1500);
    },
    onError: (e) => setErroEmpresa(e.message),
  });
  const abrirEmpresa = () => {
    setEmpresa({
      nome: config?.nome || '', cnpj: config?.cnpj || '',
      telefone: config?.telefone || '', email: config?.email || '', endereco: config?.endereco || '',
    });
    setErroEmpresa(''); setOkEmpresa(''); setModalEmpresa(true);
  };

  // ----- Controle de acesso (matriz papel × módulo) -----
  const [matriz, setMatriz] = useState(null);
  const [okAcesso, setOkAcesso] = useState('');
  const acessoMut = useMutation({
    mutationFn: (acessos) => configService.update({ ...config, acessos }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config-empresa'] });
      setOkAcesso('Permissões salvas! (aplicam no próximo login dos usuários)');
      setTimeout(() => { setModalAcesso(false); setOkAcesso(''); }, 2200);
    },
    onError: (e) => alert('Erro: ' + e.message),
  });
  const abrirAcesso = () => {
    // parte do que está salvo, senão do padrão
    const base = {};
    PAPEIS_CONFIG.forEach(p => {
      base[p.key] = { ...ACESSO_PADRAO[p.key], ...(config?.acessos?.[p.key] || {}) };
    });
    setMatriz(base);
    setOkAcesso('');
    setModalAcesso(true);
  };
  const toggle = (papel, modulo) => setMatriz(m => ({ ...m, [papel]: { ...m[papel], [modulo]: !m[papel][modulo] } }));

  const linhas = [
    { icon: IconShield, label: 'Segurança', sub: 'Alterar minha senha', onClick: () => { setSenha(''); setSenha2(''); setErroSenha(''); setOkSenha(''); setModalSenha(true); } },
    ...(isAdmin ? [
      { icon: IconBuildingFactory2, label: 'Dados da empresa', sub: config?.nome || 'Configurar razão social, CNPJ...', onClick: abrirEmpresa },
      { icon: IconLock, label: 'Controle de acesso', sub: 'Definir o que cada papel vê', onClick: abrirAcesso },
    ] : []),
  ];

  return (
    <div className="pb-32 px-4 pt-4 space-y-4 bg-[#0A0B0D] min-h-full">
      {/* Perfil */}
      <div className="bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={abrirSelecaoFoto} disabled={subindoFoto} className="relative group">
            <Avatar user={perfil} size="md" className="!bg-[#F08020]/12" />
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {subindoFoto ? <IconLoader2 size={16} className="text-white animate-spin" /> : <IconCamera size={16} className="text-white" />}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#F08020] rounded-full flex items-center justify-center border-2 border-[#1A1D24]">
              <IconCamera size={10} className="text-white" />
            </span>
          </button>
          <input ref={fotoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={trocarFotoWeb} />
          <div>
            <p className="font-semibold text-[#F5F5F0]">{perfil?.nome}{subindoFoto && <span className="text-xs text-[#6B7280] ml-2">enviando foto...</span>}</p>
            <p className="text-xs text-[#6B7280] capitalize">{perfil?.cargo}{perfil?.matricula ? ` · ${perfil.matricula}` : ''}</p>
          </div>
        </div>
        <div className="space-y-1 text-sm text-[#A8ADB8]">
          <p>{perfil?.email}</p>
          {perfil?.telefone && <p>{perfil.telefone}</p>}
        </div>
      </div>

      {/* Ações */}
      <div className="bg-[#1A1D24] rounded-2xl border border-[#23262E] overflow-hidden">
        {linhas.map((item, i, arr) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 px-4 py-3.5 active:bg-[#272B35] transition-colors text-left ${i < arr.length - 1 ? 'border-b border-[#23262E]' : ''}`}
            >
              <div className="w-8 h-8 bg-[#22262F] rounded-xl flex items-center justify-center shrink-0">
                <Icon size={16} className="text-[#A8ADB8]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F5F5F0]">{item.label}</p>
                <p className="text-xs text-[#6B7280] truncate">{item.sub}</p>
              </div>
              <IconChevronRight size={16} className="text-[#454A54]" />
            </button>
          );
        })}
      </div>

      <button
        onClick={logout}
        className="w-full py-3.5 border border-[#F87171]/30 text-[#F87171] rounded-2xl text-sm font-medium active:bg-[#F87171]/10 transition-colors"
      >
        Sair da conta
      </button>

      <p className="text-center text-[#2E3240] text-xs pt-2">Mkorp Control © {new Date().getFullYear()}</p>

      {/* Modal alterar senha */}
      <Modal aberto={modalSenha} onClose={() => setModalSenha(false)} titulo="Alterar senha">
        <div className="space-y-4">
          {okSenha && <div className="p-3 bg-[#34D399]/10 border border-[#34D399]/20 rounded-xl text-sm text-[#34D399] flex items-center gap-2"><IconCheck size={16} /> {okSenha}</div>}
          {erroSenha && <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl text-sm text-[#F87171]">{erroSenha}</div>}
          <div>
            <label className={ui.label}>Nova senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" className={ui.input} />
          </div>
          <div>
            <label className={ui.label}>Confirmar nova senha</label>
            <input type="password" value={senha2} onChange={e => setSenha2(e.target.value)} placeholder="Repita a senha" className={ui.input} />
          </div>
          <button onClick={salvarSenha} disabled={senhaMut.isPending} className="w-full py-3.5 bg-[#F08020] text-white rounded-xl font-semibold text-sm active:bg-[#D86E14] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {senhaMut.isPending ? <><IconLoader2 size={16} className="animate-spin" /> Salvando...</> : 'Alterar senha'}
          </button>
        </div>
      </Modal>

      {/* Modal controle de acesso */}
      <Modal aberto={modalAcesso} onClose={() => setModalAcesso(false)} titulo="Controle de acesso">
        {matriz && (
          <div className="space-y-4">
            {okAcesso && <div className="p-3 bg-[#34D399]/10 border border-[#34D399]/20 rounded-xl text-sm text-[#34D399] flex items-center gap-2"><IconCheck size={16} /> {okAcesso}</div>}
            <p className="text-xs text-[#6B7280]">Marque o que cada papel pode acessar. O <strong>admin</strong> tem acesso total sempre. Valores (R$) são exclusivos do admin.</p>

            {PAPEIS_CONFIG.map(papel => (
              <div key={papel.key} className="bg-[#121419] border border-[#23262E] rounded-2xl p-3">
                <p className="text-sm font-semibold text-[#F5F5F0] mb-2">{papel.label}</p>
                <div className="grid grid-cols-2 gap-2">
                  {MODULOS.filter(m => m.key !== 'medicao').map(mod => {
                    const on = matriz[papel.key]?.[mod.key];
                    return (
                      <button
                        key={mod.key}
                        onClick={() => toggle(papel.key, mod.key)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${on ? 'bg-[#34D399]/10 border-[#34D399]/30 text-[#34D399]' : 'bg-[#0A0B0D] border-[#30353F] text-[#6B7280]'}`}
                      >
                        {mod.label}
                        <span className={`w-2 h-2 rounded-full ${on ? 'bg-[#34D399]' : 'bg-[#454A54]'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button onClick={() => acessoMut.mutate(matriz)} disabled={acessoMut.isPending} className="w-full py-3.5 bg-[#F08020] text-white rounded-xl font-semibold text-sm active:bg-[#D86E14] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {acessoMut.isPending ? <><IconLoader2 size={16} className="animate-spin" /> Salvando...</> : 'Salvar permissões'}
            </button>
          </div>
        )}
      </Modal>

      {/* Modal dados da empresa */}
      <Modal aberto={modalEmpresa} onClose={() => setModalEmpresa(false)} titulo="Dados da empresa">
        {empresa && (
          <div className="space-y-4">
            {okEmpresa && <div className="p-3 bg-[#34D399]/10 border border-[#34D399]/20 rounded-xl text-sm text-[#34D399] flex items-center gap-2"><IconCheck size={16} /> {okEmpresa}</div>}
            {erroEmpresa && <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl text-sm text-[#F87171]">{erroEmpresa}</div>}
            <div>
              <label className={ui.label}>Razão social</label>
              <input value={empresa.nome} onChange={e => setEmpresa(v => ({ ...v, nome: e.target.value }))} placeholder="Mkorp Serviços de Iluminação" className={ui.input} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={ui.label}>CNPJ</label>
                <input value={empresa.cnpj} onChange={e => setEmpresa(v => ({ ...v, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" className={ui.input} />
              </div>
              <div>
                <label className={ui.label}>Telefone</label>
                <input value={empresa.telefone} onChange={e => setEmpresa(v => ({ ...v, telefone: e.target.value }))} placeholder="(11) 0000-0000" className={ui.input} />
              </div>
            </div>
            <div>
              <label className={ui.label}>E-mail</label>
              <input value={empresa.email} onChange={e => setEmpresa(v => ({ ...v, email: e.target.value }))} placeholder="contato@mkorp.com.br" className={ui.input} />
            </div>
            <div>
              <label className={ui.label}>Endereço</label>
              <input value={empresa.endereco} onChange={e => setEmpresa(v => ({ ...v, endereco: e.target.value }))} placeholder="Endereço completo" className={ui.input} />
            </div>
            <button onClick={() => empresaMut.mutate(empresa)} disabled={empresaMut.isPending} className="w-full py-3.5 bg-[#F08020] text-white rounded-xl font-semibold text-sm active:bg-[#D86E14] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {empresaMut.isPending ? <><IconLoader2 size={16} className="animate-spin" /> Salvando...</> : 'Salvar dados'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
