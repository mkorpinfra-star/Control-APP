// ============================================================
// Controle de acesso configurável pelo admin
// O admin tem SEMPRE acesso total. Para os demais papéis, o
// admin liga/desliga módulos. Se não houver config salva,
// usa o padrão abaixo (nada quebra).
// ============================================================

// Módulos que o admin pode liberar/bloquear por papel
export const MODULOS = [
  { key: 'ordens',        label: 'Ordens de serviço', path: '/ordens-servico' },
  { key: 'contratos',     label: 'Contratos',         path: '/contratos' },
  { key: 'almoxarifado',  label: 'Almoxarifado',      path: '/almoxarifado' },
  { key: 'requisicoes',   label: 'Requisições',       path: '/requisicoes' },
  { key: 'ponto_gestao',  label: 'Controle de ponto', path: '/controle-ponto' },
  { key: 'monitoramento', label: 'Monitoramento',     path: '/monitoramento' },
  { key: 'relatorios',    label: 'Relatórios',        path: '/relatorios' },
  { key: 'medicao',       label: 'Medição (valores)', path: '/medicao' },
  { key: 'aprovacoes',    label: 'Aprovações',        path: '/aprovacoes' },
];

// Papéis configuráveis (admin não entra — tem tudo)
export const PAPEIS_CONFIG = [
  { key: 'supervisor',  label: 'Supervisor' },
  { key: 'almoxarife',  label: 'Almoxarife' },
  { key: 'eletricista', label: 'Eletricista' },
  { key: 'ajudante',    label: 'Ajudante' },
  { key: 'motorista',   label: 'Motorista' },
];

// Matriz padrão (o que cada papel acessa por padrão)
export const ACESSO_PADRAO = {
  supervisor:  { ordens: true, contratos: true, almoxarifado: true, requisicoes: true, ponto_gestao: true, monitoramento: true, relatorios: true, medicao: false, aprovacoes: true },
  almoxarife:  { ordens: false, contratos: false, almoxarifado: true, requisicoes: true, ponto_gestao: false, monitoramento: false, relatorios: false, medicao: false, aprovacoes: false },
  eletricista: { ordens: false, contratos: false, almoxarifado: false, requisicoes: true, ponto_gestao: false, monitoramento: false, relatorios: false, medicao: false, aprovacoes: false },
  ajudante:    { ordens: false, contratos: false, almoxarifado: false, requisicoes: true, ponto_gestao: false, monitoramento: false, relatorios: false, medicao: false, aprovacoes: false },
  motorista:   { ordens: false, contratos: false, almoxarifado: false, requisicoes: true, ponto_gestao: false, monitoramento: false, relatorios: false, medicao: false, aprovacoes: false },
};

// Resolve se um papel pode acessar um módulo (admin sempre pode)
export function podeAcessarModulo(cargo, modulo, acessosConfig) {
  if (cargo === 'admin') return true;
  const config = acessosConfig?.[cargo];
  if (config && typeof config[modulo] === 'boolean') return config[modulo];
  return ACESSO_PADRAO[cargo]?.[modulo] ?? false;
}
