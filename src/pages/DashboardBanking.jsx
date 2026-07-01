import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CHART } from '../lib/theme';

const brl = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
import {
  IconClipboardList, IconClipboardCheck, IconPackage,
  IconUsers, IconAlertTriangle, IconTool, IconArrowRight,
  IconMapPin,
} from '@tabler/icons-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';

export default function DashboardBanking() {
  const navigate = useNavigate();
  const { podeVerValores } = useAuth();

  const { data: resumo, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getResumo,
    refetchInterval: 30000,
  });

  if (isLoading) return <DashboardSkeleton />;

  const cards = [
    { label: 'OS abertas',     valor: resumo.os_abertas,             icon: IconClipboardList,  cor: 'text-[#5B8DEF]', path: '/ordens-servico', urgente: resumo.os_abertas > 5 },
    { label: 'Em andamento',   valor: resumo.os_em_andamento,        icon: IconTool,           cor: 'text-[#FBBF24]', path: '/ordens-servico' },
    { label: 'Concluídas',     valor: resumo.os_concluidas_mes,      icon: IconClipboardCheck, cor: 'text-[#34D399]', path: '/ordens-servico' },
    { label: 'Em campo hoje',  valor: resumo.funcionarios_campo_hoje,icon: IconUsers,          cor: 'text-[#A8ADB8]', path: '/monitoramento' },
    { label: 'Req. pendentes', valor: resumo.requisicoes_pendentes,  icon: IconPackage,        cor: 'text-[#FB8C3E]', path: '/requisicoes', urgente: resumo.requisicoes_pendentes > 0 },
    { label: 'Estoque crítico',valor: resumo.itens_estoque_critico,  icon: IconAlertTriangle,  cor: 'text-[#FB8C3E]', path: '/almoxarifado', urgente: resumo.itens_estoque_critico > 0 },
  ];

  return (
    <div className="pb-32 bg-[#0A0B0D] min-h-full">
      <div className="px-4 pt-5 pb-2">
        <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">Visão geral</p>
        <p className="text-sm text-[#A8ADB8] mt-0.5 capitalize">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Card financeiro (admin) */}
      {podeVerValores && (
        <div className="mx-4 mt-2 mb-1 bg-gradient-to-br from-[#F08020]/15 to-[#1A1D24] rounded-2xl p-4 border border-[#F08020]/25">
          <p className="text-xs text-[#A8ADB8]">Faturamento do mês (medição)</p>
          <p className="text-2xl font-bold text-[#F5F5F0] tabular-nums">{brl(resumo.faturamento_mes)}</p>
          <div className="flex gap-4 mt-2 pt-2 border-t border-[#F08020]/20 text-xs text-[#A8ADB8]">
            <button onClick={() => navigate('/medicao')} className="text-[#F08020]">Ver medição →</button>
            <span>Estoque: {brl(resumo.valor_estoque)}</span>
          </div>
        </div>
      )}

      {/* Alerta OS atrasadas */}
      {resumo.os_atrasadas > 0 && (
        <button onClick={() => navigate('/ordens-servico')} className="mx-4 mt-2 w-[calc(100%-2rem)] flex items-center gap-3 bg-[#F87171]/10 border border-[#F87171]/25 rounded-2xl p-3 text-left active:bg-[#F87171]/15 transition-colors">
          <div className="w-8 h-8 bg-[#F87171]/15 rounded-xl flex items-center justify-center shrink-0">
            <IconAlertTriangle size={16} className="text-[#F87171]" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-[#F87171]">{resumo.os_atrasadas} OS com prazo vencido (SLA)</p>
            <p className="text-xs text-[#F87171]/60">Toque para priorizar</p>
          </div>
        </button>
      )}

      {/* Cards KPI */}
      <div className="px-4 grid grid-cols-3 gap-3 mt-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              onClick={() => navigate(c.path)}
              className="bg-[#1A1D24] rounded-2xl p-3 border border-[#23262E] text-left active:bg-[#272B35] transition-colors relative"
            >
              {c.urgente && <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-[#FB8C3E] rounded-full" />}
              <Icon size={18} className={`${c.cor} mb-2`} stroke={1.6} />
              <p className={`text-2xl font-bold tabular-nums ${c.urgente ? 'text-[#FB8C3E]' : 'text-[#F5F5F0]'}`}>
                {c.valor}
              </p>
              <p className="text-[11px] text-[#6B7280] leading-tight mt-0.5">{c.label}</p>
            </button>
          );
        })}
      </div>

      {/* Gráfico OS por dia */}
      <div className="mx-4 mt-4 bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[#F5F5F0]">OS abertas por dia</p>
          <span className="text-xs text-[#6B7280]">últimos 7 dias</span>
        </div>
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={resumo.os_por_dia} barSize={18}>
            <XAxis dataKey="dia" tick={{ fontSize: 10, fill: CHART.axis }} axisLine={false} tickLine={false} />
            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
              {resumo.os_por_dia.map((_, i) => (
                <Cell key={i} fill={i === resumo.os_por_dia.length - 1 ? CHART.barAccent : CHART.barPrimary} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* OS por tipo */}
      <div className="mx-4 mt-4 bg-[#1A1D24] rounded-2xl p-4 border border-[#23262E]">
        <p className="text-sm font-semibold text-[#F5F5F0] mb-3">Tipo de ocorrência</p>
        <div className="space-y-2.5">
          {resumo.os_por_tipo.map((item) => {
            const total = resumo.os_por_tipo.reduce((s, i) => s + i.total, 0);
            const pct = Math.round((item.total / total) * 100);
            return (
              <div key={item.tipo}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#A8ADB8]">{item.tipo}</span>
                  <span className="text-xs font-medium text-[#F5F5F0]">{item.total}</span>
                </div>
                <div className="h-1.5 bg-[#0A0B0D] rounded-full">
                  <div className="h-1.5 bg-[#F08020] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Acesso rápido */}
      <div className="mx-4 mt-4 bg-[#1A1D24] rounded-2xl border border-[#23262E] overflow-hidden">
        <p className="text-sm font-semibold text-[#F5F5F0] px-4 pt-4 pb-2">Acesso rápido</p>
        {[
          { label: 'Ver todas as ordens de serviço',  path: '/ordens-servico',  icon: IconClipboardList },
          { label: 'Requisições pendentes de aprovação', path: '/requisicoes',  icon: IconPackage },
          { label: 'Monitorar equipes em campo',      path: '/monitoramento',   icon: IconMapPin },
          { label: 'Controle de ponto',               path: '/controle-ponto',  icon: IconUsers },
        ].map((item, i, arr) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-4 py-3 active:bg-[#272B35] transition-colors ${i < arr.length - 1 ? 'border-b border-[#23262E]' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className="text-[#6B7280]" stroke={1.6} />
                <span className="text-sm text-[#A8ADB8]">{item.label}</span>
              </div>
              <IconArrowRight size={14} className="text-[#454A54]" />
            </button>
          );
        })}
      </div>

      {/* Alertas críticos */}
      {(resumo.itens_estoque_critico > 0 || resumo.requisicoes_pendentes > 0) && (
        <div className="mx-4 mt-4 space-y-2">
          {resumo.itens_estoque_critico > 0 && (
            <button
              onClick={() => navigate('/almoxarifado')}
              className="w-full flex items-center gap-3 bg-[#F08020]/10 border border-[#F08020]/25 rounded-2xl p-3 text-left active:bg-[#F08020]/15 transition-colors"
            >
              <div className="w-8 h-8 bg-[#F08020]/15 rounded-xl flex items-center justify-center shrink-0">
                <IconAlertTriangle size={16} className="text-[#FB8C3E]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-[#FB8C3E]">
                  {resumo.itens_estoque_critico} item{resumo.itens_estoque_critico > 1 ? 's' : ''} com estoque crítico
                </p>
                <p className="text-xs text-[#FB8C3E]/60">Toque para ver o almoxarifado</p>
              </div>
              <IconArrowRight size={14} className="text-[#FB8C3E]/50" />
            </button>
          )}
          {resumo.requisicoes_pendentes > 0 && (
            <button
              onClick={() => navigate('/requisicoes')}
              className="w-full flex items-center gap-3 bg-[#FBBF24]/8 border border-[#FBBF24]/20 rounded-2xl p-3 text-left active:bg-[#FBBF24]/12 transition-colors"
            >
              <div className="w-8 h-8 bg-[#FBBF24]/12 rounded-xl flex items-center justify-center shrink-0">
                <IconPackage size={16} className="text-[#FBBF24]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-[#FBBF24]">
                  {resumo.requisicoes_pendentes} requisiç{resumo.requisicoes_pendentes > 1 ? 'ões' : 'ão'} aguardando aprovação
                </p>
                <p className="text-xs text-[#FBBF24]/60">Toque para revisar</p>
              </div>
              <IconArrowRight size={14} className="text-[#FBBF24]/50" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="pb-32 px-4 pt-5 space-y-4 bg-[#0A0B0D] min-h-full">
      <div className="h-4 bg-[#1A1D24] rounded w-1/3 animate-pulse" />
      <div className="grid grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[#1A1D24] border border-[#23262E] rounded-2xl p-3 h-24 animate-pulse" />
        ))}
      </div>
      <div className="bg-[#1A1D24] border border-[#23262E] rounded-2xl h-32 animate-pulse" />
    </div>
  );
}
