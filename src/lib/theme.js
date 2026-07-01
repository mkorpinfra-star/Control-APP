// ============================================================
// MKORP CONTROL — Tokens de UI compartilhados (dark)
// Filosofia: neutro por padrão · LARANJA = primária (navegar/confirmar/ação) · AZUL = secundária (acento/info)
// ============================================================

// ---------- CORES BRUTAS (para recharts / inline) ----------
export const COLORS = {
  base: '#0A0B0D',
  surface1: '#121419',
  surface2: '#1A1D24',
  surface3: '#22262F',
  borderSubtle: '#23262E',
  borderStrong: '#30353F',
  content: '#F5F5F0',
  muted: '#A8ADB8',
  faint: '#6B7280',
  brand: '#F08020',       // primária — laranja
  brandSoft: '#FB8C3E',
  accent: '#3B6FD4',      // secundária — azul
  accentSoft: '#5B8DEF',
  ok: '#34D399',
  bad: '#F87171',
  warn: '#FBBF24',
};

export const CHART = {
  grid: '#23262E',
  axis: '#6B7280',
  barPrimary: '#F08020',  // primária — laranja
  barAccent: '#3B6FD4',   // secundária — azul (destaca o especial)
  barMuted: '#3A2A18',
  tooltip: { background: '#22262F', border: '1px solid #30353F', borderRadius: 12, color: '#F5F5F0' },
};

// ---------- RECEITAS DE COMPONENTE (strings Tailwind) ----------
export const ui = {
  card: 'bg-[#1A1D24] border border-[#23262E] rounded-2xl',
  cardTap: 'bg-[#1A1D24] border border-[#23262E] rounded-2xl active:bg-[#272B35] transition-colors',
  // primária = laranja
  btnPrimary: 'inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-[#F08020] text-[#0A0B0D] font-semibold text-sm active:bg-[#D86E14] disabled:bg-[#1A1D24] disabled:text-[#454A54] transition-colors',
  btnGhost: 'inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-transparent border border-[#30353F] text-[#F5F5F0] font-medium text-sm active:bg-[#22262F] transition-colors',
  // secundária = azul
  btnAccent: 'inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-[#3B6FD4]/10 border border-[#3B6FD4]/30 text-[#5B8DEF] font-medium text-sm active:bg-[#3B6FD4]/20 transition-colors',
  input: 'w-full h-12 rounded-xl bg-[#121419] border border-[#30353F] px-4 text-sm text-[#F5F5F0] placeholder:text-[#6B7280] focus:border-[#F08020] focus:ring-2 focus:ring-[#F08020]/30 focus:outline-none transition-colors',
  label: 'block text-xs font-medium text-[#A8ADB8] mb-1.5',
  badge: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
  chip: (ativo) => `px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
    ativo ? 'bg-[#F08020] text-[#0A0B0D]' : 'bg-[#1A1D24] text-[#A8ADB8] border border-[#23262E]'
  }`,
};

// ---------- BADGES DE STATUS ----------
const mk = (text, tint) => ({ text, badge: `${ui.badge} ${tint}` });

export const STATUS_OS = {
  aberta:       { label: 'Aberta',       ...mk('text-[#5B8DEF]', 'bg-[#5B8DEF]/12 text-[#5B8DEF]') },
  em_andamento: { label: 'Em andamento', ...mk('text-[#FBBF24]', 'bg-[#FBBF24]/12 text-[#FBBF24]') },
  concluida:    { label: 'Concluída',    ...mk('text-[#34D399]', 'bg-[#34D399]/12 text-[#34D399]') },
  cancelada:    { label: 'Cancelada',    ...mk('text-[#8A909C]', 'bg-[#8A909C]/12 text-[#8A909C]') },
};

export const STATUS_PONTO = {
  rascunho:  { label: 'Rascunho',  badge: `${ui.badge} bg-[#8A909C]/12 text-[#8A909C]`, text: 'text-[#8A909C]' },
  enviado:   { label: 'Enviado',   badge: `${ui.badge} bg-[#5B8DEF]/12 text-[#5B8DEF]`, text: 'text-[#5B8DEF]' },
  aprovado:  { label: 'Aprovado',  badge: `${ui.badge} bg-[#34D399]/12 text-[#34D399]`, text: 'text-[#34D399]' },
  rejeitado: { label: 'Rejeitado', badge: `${ui.badge} bg-[#F87171]/12 text-[#F87171]`, text: 'text-[#F87171]' },
  fechado:   { label: 'Fechado',   badge: `${ui.badge} bg-[#A78BFA]/15 text-[#A78BFA]`, text: 'text-[#A78BFA]' },
};

export const STATUS_REQ = {
  pendente:  { label: 'Pendente',  badge: `${ui.badge} bg-[#FBBF24]/12 text-[#FBBF24]` },
  aprovada:  { label: 'Aprovada',  badge: `${ui.badge} bg-[#34D399]/12 text-[#34D399]` },
  rejeitada: { label: 'Rejeitada', badge: `${ui.badge} bg-[#F87171]/12 text-[#F87171]` },
  entregue:  { label: 'Entregue',  badge: `${ui.badge} bg-[#5B8DEF]/12 text-[#5B8DEF]` },
};

export const PRIORIDADE = {
  baixa:   { label: 'Baixa',   badge: `${ui.badge} bg-[#8A909C]/12 text-[#8A909C]`, dot: '#8A909C' },
  normal:  { label: 'Normal',  badge: `${ui.badge} bg-[#5B8DEF]/12 text-[#5B8DEF]`, dot: '#5B8DEF' },
  alta:    { label: 'Alta',    badge: `${ui.badge} bg-[#FBBF24]/12 text-[#FBBF24]`, dot: '#FBBF24' },
  urgente: { label: 'Urgente', badge: `${ui.badge} bg-[#FB8C3E]/14 text-[#FB8C3E]`, dot: '#FB8C3E' },
};

export const STATUS_CONTRATO = {
  ativo:     `${ui.badge} bg-[#34D399]/12 text-[#34D399]`,
  encerrado: `${ui.badge} bg-[#8A909C]/12 text-[#8A909C]`,
  suspenso:  `${ui.badge} bg-[#F87171]/12 text-[#F87171]`,
};

export const CARGO = {
  admin:       { label: 'Admin',       badge: `${ui.badge} bg-[#5B8DEF]/12 text-[#5B8DEF]` },
  supervisor:  { label: 'Supervisor',  badge: `${ui.badge} bg-[#3B6FD4]/15 text-[#5B8DEF]` },
  almoxarife:  { label: 'Almoxarife',  badge: `${ui.badge} bg-[#A78BFA]/15 text-[#A78BFA]` },
  eletricista: { label: 'Eletricista', badge: `${ui.badge} bg-[#34D399]/12 text-[#34D399]` },
  ajudante:    { label: 'Ajudante',    badge: `${ui.badge} bg-[#FBBF24]/12 text-[#FBBF24]` },
  motorista:   { label: 'Motorista',   badge: `${ui.badge} bg-[#FB8C3E]/14 text-[#FB8C3E]` },
};
