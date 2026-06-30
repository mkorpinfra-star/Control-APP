import { useAuth } from '../contexts/AuthContext';
import { IconUser, IconBuildingFactory2, IconBell, IconShield } from '@tabler/icons-react';

export default function Configuracoes() {
  const { perfil, logout } = useAuth();

  return (
    <div className="pb-32 px-4 pt-4 space-y-4 bg-[#0A0B0D] min-h-full">
      <div className="bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#F08020]/12 rounded-full flex items-center justify-center">
            <IconUser size={22} className="text-[#5B8DEF]" />
          </div>
          <div>
            <p className="font-semibold text-[#F5F5F0]">{perfil?.nome}</p>
            <p className="text-xs text-[#6B7280] capitalize">{perfil?.cargo} · {perfil?.matricula}</p>
          </div>
        </div>
        <div className="space-y-1 text-sm text-[#A8ADB8]">
          <p>{perfil?.email}</p>
          {perfil?.telefone && <p>{perfil.telefone}</p>}
        </div>
      </div>

      <div className="bg-[#1A1D24] rounded-2xl border border-[#23262E] overflow-hidden">
        {[
          { icon: IconBuildingFactory2, label: 'Dados da empresa', sub: 'Mkorp Serviços de Iluminação' },
          { icon: IconBell,             label: 'Notificações',      sub: 'Push e alertas de OS' },
          { icon: IconShield,           label: 'Segurança',         sub: 'Alterar senha' },
        ].map((item, i, arr) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3.5 active:bg-[#272B35] transition-colors text-left ${i < arr.length - 1 ? 'border-b border-[#23262E]' : ''}`}
            >
              <div className="w-8 h-8 bg-[#22262F] rounded-xl flex items-center justify-center shrink-0">
                <Icon size={16} className="text-[#A8ADB8]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#F5F5F0]">{item.label}</p>
                <p className="text-xs text-[#6B7280]">{item.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-[#F08020]/8 border border-[#F08020]/20 rounded-2xl p-4">
        <p className="text-xs font-semibold text-[#FB8C3E] mb-1">Modo protótipo</p>
        <p className="text-xs text-[#FB8C3E]/70">
          Você está usando dados simulados em memória. Nenhuma alteração é persistida ao recarregar.
          Ao conectar o Supabase, os dados serão reais e persistentes.
        </p>
      </div>

      <div className="bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E]">
        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Usuários de teste</p>
        <div className="space-y-1 text-xs text-[#A8ADB8] font-mono">
          <p>admin@mkorp.com.br · <span className="text-[#6B7280]">Felipe Garcia · Admin</span></p>
          <p>supervisor@mkorp.com.br · <span className="text-[#6B7280]">Supervisor</span></p>
          <p>joao@mkorp.com.br · <span className="text-[#6B7280]">Eletricista</span></p>
          <p className="text-[#6B7280] mt-1">Senha de todos: 123456</p>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full py-3.5 border border-[#F87171]/30 text-[#F87171] rounded-2xl text-sm font-medium active:bg-[#F87171]/10 transition-colors"
      >
        Sair da conta
      </button>
    </div>
  );
}
