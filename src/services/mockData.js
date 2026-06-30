// ============================================================
// MKORP CONTROL — Dados mock para prototipação
// Substitui o Supabase completamente. Sem .env necessário.
// ============================================================

// ---------- USUÁRIOS ----------
// Conta principal de acesso: Felipe Garcia · admin@mkorp.com.br · senha 123456
export const MOCK_USUARIOS = [
  { id: 'u1', nome: 'Felipe Garcia',    email: 'admin@mkorp.com.br',      cargo: 'admin',      matricula: 'ADM001', ativo: true },
  { id: 'u2', nome: 'Roberto Lima',     email: 'supervisor@mkorp.com.br', cargo: 'supervisor', matricula: 'SUP001', ativo: true },
  { id: 'u3', nome: 'João da Silva',    email: 'joao@mkorp.com.br',       cargo: 'eletricista',matricula: 'ELT001', ativo: true },
  { id: 'u4', nome: 'Marcos Oliveira',  email: 'marcos@mkorp.com.br',     cargo: 'eletricista',matricula: 'ELT002', ativo: true },
  { id: 'u5', nome: 'André Santos',     email: 'andre@mkorp.com.br',      cargo: 'ajudante',   matricula: 'AJD001', ativo: true },
  { id: 'u6', nome: 'Paulo Ferreira',   email: 'paulo@mkorp.com.br',      cargo: 'motorista',  matricula: 'MOT001', ativo: true },
  { id: 'u7', nome: 'Diego Rocha',      email: 'diego@mkorp.com.br',      cargo: 'eletricista',matricula: 'ELT003', ativo: true },
];

// ---------- CREDENCIAIS MOCK (email → senha) — todas senha 123456 ----------
export const MOCK_CREDENCIAIS = {
  'admin@mkorp.com.br':      { senha: '123456', userId: 'u1' },
  'supervisor@mkorp.com.br': { senha: '123456', userId: 'u2' },
  'joao@mkorp.com.br':       { senha: '123456', userId: 'u3' },
  'marcos@mkorp.com.br':     { senha: '123456', userId: 'u4' },
  'andre@mkorp.com.br':      { senha: '123456', userId: 'u5' },
};

// ---------- CONTRATOS ----------
export const MOCK_CONTRATOS = [
  { id: 'c1', nome: 'Prefeitura de Campinas',       municipio: 'Campinas',       estado: 'SP', responsavel: 'Eng. Fábio Nunes',   telefone: '(19) 3210-0000', status: 'ativo',     data_inicio: '2024-01-01', data_fim: '2026-12-31' },
  { id: 'c2', nome: 'Prefeitura de Jundiaí',         municipio: 'Jundiaí',         estado: 'SP', responsavel: 'Eng. Patrícia Alves', telefone: '(11) 4512-0000', status: 'ativo',     data_inicio: '2024-03-01', data_fim: '2025-12-31' },
  { id: 'c3', nome: 'Prefeitura de Sorocaba',        municipio: 'Sorocaba',        estado: 'SP', responsavel: 'Eng. Rogério Braga',  telefone: '(15) 3300-0000', status: 'ativo',     data_inicio: '2023-06-01', data_fim: '2025-06-30' },
  { id: 'c4', nome: 'Prefeitura de São José dos Campos', municipio: 'São José dos Campos', estado: 'SP', responsavel: 'Eng. Cláudia Mota', telefone: '(12) 3900-0000', status: 'encerrado', data_inicio: '2022-01-01', data_fim: '2024-01-01' },
];

// ---------- ORDENS DE SERVIÇO ----------
export const MOCK_OS = [
  { id: 'os1',  numero: 1001, contrato_id: 'c1', responsavel_id: 'u3', tipo_defeito: 'lampada_queimada',    descricao: 'Lâmpada apagada há 3 dias, moradores reclamando.', zona: 'Norte', bairro: 'Jardim Proença',    logradouro: 'Rua das Acácias, 450',    numero_poste: '12345-A', latitude: -22.9068, longitude: -47.0629, prioridade: 'alta',    status: 'aberta',       data_abertura: '2026-06-07', data_conclusao: null,         contratos: { nome: 'Prefeitura de Campinas' }, usuarios: { nome: 'João da Silva' } },
  { id: 'os2',  numero: 1002, contrato_id: 'c1', responsavel_id: 'u4', tipo_defeito: 'reator_defeituoso',   descricao: 'Reator com defeito, lâmpada piscando.',            zona: 'Sul',  bairro: 'Nova Campinas',       logradouro: 'Av. John Boyd Dunlop, 890', numero_poste: '23456-B', latitude: -22.9235, longitude: -47.0821, prioridade: 'normal',  status: 'em_andamento', data_abertura: '2026-06-06', data_conclusao: null,         contratos: { nome: 'Prefeitura de Campinas' }, usuarios: { nome: 'Marcos Oliveira' } },
  { id: 'os3',  numero: 1003, contrato_id: 'c2', responsavel_id: 'u3', tipo_defeito: 'cabo_danificado',      descricao: 'Cabo partido após temporal, 4 pontos apagados.',   zona: 'Centro', bairro: 'Centro',            logradouro: 'Rua XV de Novembro, 100',  numero_poste: '34567-C', latitude: -23.1858, longitude: -46.8841, prioridade: 'urgente', status: 'aberta',       data_abertura: '2026-06-08', data_conclusao: null,         contratos: { nome: 'Prefeitura de Jundiaí' },   usuarios: { nome: 'João da Silva' } },
  { id: 'os4',  numero: 1004, contrato_id: 'c1', responsavel_id: 'u7', tipo_defeito: 'rele_fotoeletrico',   descricao: 'Relé fotoelétrico com defeito, lâmpada fica ligada durante o dia.', zona: 'Leste', bairro: 'Taquaral', logradouro: 'Av. Aquidaban, 300', numero_poste: '45678-D', latitude: -22.8898, longitude: -47.0441, prioridade: 'baixa',   status: 'concluida',    data_abertura: '2026-06-04', data_conclusao: '2026-06-06', contratos: { nome: 'Prefeitura de Campinas' }, usuarios: { nome: 'Diego Rocha' } },
  { id: 'os5',  numero: 1005, contrato_id: 'c3', responsavel_id: 'u3', tipo_defeito: 'braco_quebrado',       descricao: 'Braço do poste quebrado por acidente de trânsito.', zona: 'Oeste', bairro: 'Campolim',           logradouro: 'Av. Independência, 1200',  numero_poste: '56789-E', latitude: -23.5000, longitude: -47.4500, prioridade: 'alta',    status: 'aberta',       data_abertura: '2026-06-08', data_conclusao: null,         contratos: { nome: 'Prefeitura de Sorocaba' },  usuarios: { nome: 'João da Silva' } },
  { id: 'os6',  numero: 1006, contrato_id: 'c1', responsavel_id: 'u4', tipo_defeito: 'manutencao_preventiva', descricao: 'Manutenção preventiva trimestral — troca de lâmpadas por LED.', zona: 'Norte', bairro: 'Barão Geraldo', logradouro: 'Rua Prof. Atílio Martini, 50', numero_poste: '67890-F', latitude: -22.8186, longitude: -47.0694, prioridade: 'baixa',   status: 'em_andamento', data_abertura: '2026-06-05', data_conclusao: null,         contratos: { nome: 'Prefeitura de Campinas' }, usuarios: { nome: 'Marcos Oliveira' } },
  { id: 'os7',  numero: 1007, contrato_id: 'c2', responsavel_id: 'u7', tipo_defeito: 'lampada_queimada',    descricao: 'Dois pontos apagados na mesma quadra.',             zona: 'Sul',  bairro: 'Vila Rami',           logradouro: 'Rua Américo Vespúcio, 22', numero_poste: '78901-G', latitude: -23.1900, longitude: -46.8700, prioridade: 'normal',  status: 'concluida',    data_abertura: '2026-06-03', data_conclusao: '2026-06-05', contratos: { nome: 'Prefeitura de Jundiaí' },   usuarios: { nome: 'Diego Rocha' } },
  { id: 'os8',  numero: 1008, contrato_id: 'c1', responsavel_id: 'u3', tipo_defeito: 'vandalismo',           descricao: 'Luminária depredada, globo quebrado.',              zona: 'Centro', bairro: 'Centro',            logradouro: 'Praça Dr. Quirino, s/n',   numero_poste: '89012-H', latitude: -22.9050, longitude: -47.0600, prioridade: 'urgente', status: 'aberta',       data_abertura: '2026-06-09', data_conclusao: null,         contratos: { nome: 'Prefeitura de Campinas' }, usuarios: { nome: 'João da Silva' } },
];

// ---------- ITENS ALMOXARIFADO ----------
export const MOCK_ITENS = [
  { id: 'i1', nome: 'Lâmpada LED 100W',          categoria: 'lampada',          unidade: 'un',   estoque_minimo: 20 },
  { id: 'i2', nome: 'Lâmpada LED 150W',          categoria: 'lampada',          unidade: 'un',   estoque_minimo: 20 },
  { id: 'i3', nome: 'Reator AFP 150W',           categoria: 'reator',           unidade: 'un',   estoque_minimo: 10 },
  { id: 'i4', nome: 'Cabo PP 2x6mm²',            categoria: 'cabo',             unidade: 'm',    estoque_minimo: 100 },
  { id: 'i5', nome: 'Relé fotoelétrico 1000W',   categoria: 'rele_fotoeletrico',unidade: 'un',   estoque_minimo: 15 },
  { id: 'i6', nome: 'Braço galvanizado 1m',      categoria: 'braco',            unidade: 'un',   estoque_minimo: 5 },
  { id: 'i7', nome: 'Luminária LED Pública 60W', categoria: 'luminaria',        unidade: 'un',   estoque_minimo: 10 },
  { id: 'i8', nome: 'Fusível NH 63A',            categoria: 'fusivel',          unidade: 'un',   estoque_minimo: 30 },
  { id: 'i9', nome: 'Conector piercing 16-95mm', categoria: 'conector',         unidade: 'un',   estoque_minimo: 50 },
];

// ---------- ESTOQUE ----------
export const MOCK_ESTOQUE = [
  { id: 'e1', item_id: 'i1', quantidade: 47,  almoxarifado_itens: { ...MOCK_ITENS[0] } },
  { id: 'e2', item_id: 'i2', quantidade: 12,  almoxarifado_itens: { ...MOCK_ITENS[1] } },
  { id: 'e3', item_id: 'i3', quantidade: 8,   almoxarifado_itens: { ...MOCK_ITENS[2] } },  // crítico
  { id: 'e4', item_id: 'i4', quantidade: 340, almoxarifado_itens: { ...MOCK_ITENS[3] } },
  { id: 'e5', item_id: 'i5', quantidade: 6,   almoxarifado_itens: { ...MOCK_ITENS[4] } },  // crítico
  { id: 'e6', item_id: 'i6', quantidade: 3,   almoxarifado_itens: { ...MOCK_ITENS[5] } },  // crítico
  { id: 'e7', item_id: 'i7', quantidade: 14,  almoxarifado_itens: { ...MOCK_ITENS[6] } },
  { id: 'e8', item_id: 'i8', quantidade: 82,  almoxarifado_itens: { ...MOCK_ITENS[7] } },
  { id: 'e9', item_id: 'i9', quantidade: 123, almoxarifado_itens: { ...MOCK_ITENS[8] } },
];

// ---------- MOVIMENTAÇÕES ----------
// Toda movimentação registra quem ENTREGOU e quem RETIROU.
// Entrada: fornecedor entrega → almoxarife recebe (retira p/ estoque).
// Saída:   almoxarife entrega → funcionário retira (leva p/ campo).
export const MOCK_MOVIMENTACOES = [
  { id: 'm1', item_id: 'i1', tipo: 'entrada',          quantidade: 50,  saldo_apos: 47,  criado_em: '2026-06-05T08:00:00Z', almoxarifado_itens: { nome: 'Lâmpada LED 100W', unidade: 'un' },      entregue_por: { nome: 'Fornecedor — Eletro Sul' }, retirado_por: { nome: 'Felipe Garcia' },   ordens_servico: null },
  { id: 'm2', item_id: 'i5', tipo: 'saida_requisicao', quantidade: 4,   saldo_apos: 6,   criado_em: '2026-06-06T10:30:00Z', almoxarifado_itens: { nome: 'Relé fotoelétrico 1000W', unidade: 'un' }, entregue_por: { nome: 'Felipe Garcia' },           retirado_por: { nome: 'João da Silva' },   ordens_servico: { numero: 1004 } },
  { id: 'm3', item_id: 'i4', tipo: 'saida_requisicao', quantidade: 60,  saldo_apos: 340, criado_em: '2026-06-07T09:15:00Z', almoxarifado_itens: { nome: 'Cabo PP 2x6mm²', unidade: 'm' },          entregue_por: { nome: 'Felipe Garcia' },           retirado_por: { nome: 'Marcos Oliveira' }, ordens_servico: { numero: 1003 } },
  { id: 'm4', item_id: 'i3', tipo: 'entrada',          quantidade: 5,   saldo_apos: 8,   criado_em: '2026-06-08T14:00:00Z', almoxarifado_itens: { nome: 'Reator AFP 150W', unidade: 'un' },        entregue_por: { nome: 'Fornecedor — Luz & Cia' },  retirado_por: { nome: 'Felipe Garcia' },   ordens_servico: null },
  { id: 'm5', item_id: 'i1', tipo: 'saida_requisicao', quantidade: 3,   saldo_apos: 44,  criado_em: '2026-06-09T07:45:00Z', almoxarifado_itens: { nome: 'Lâmpada LED 100W', unidade: 'un' },      entregue_por: { nome: 'Roberto Lima' },            retirado_por: { nome: 'Diego Rocha' },     ordens_servico: { numero: 1006 } },
];

// ---------- REQUISIÇÕES ----------
export const MOCK_REQUISICOES = [
  {
    id: 'r1', usuario_id: 'u3', os_id: 'os3', status: 'pendente', criado_em: '2026-06-09T06:30:00Z',
    usuarios: { nome: 'João da Silva' },
    ordens_servico: { numero: 1003, descricao: 'Cabo partido após temporal' },
    requisicao_itens: [
      { id: 'ri1', item_id: 'i4', quantidade: 80, almoxarifado_itens: { nome: 'Cabo PP 2x6mm²', unidade: 'm' } },
      { id: 'ri2', item_id: 'i9', quantidade: 4,  almoxarifado_itens: { nome: 'Conector piercing', unidade: 'un' } },
    ],
  },
  {
    id: 'r2', usuario_id: 'u4', os_id: 'os6', status: 'aprovada', criado_em: '2026-06-08T07:00:00Z',
    usuarios: { nome: 'Marcos Oliveira' },
    ordens_servico: { numero: 1006, descricao: 'Manutenção preventiva' },
    requisicao_itens: [
      { id: 'ri3', item_id: 'i1', quantidade: 12, almoxarifado_itens: { nome: 'Lâmpada LED 100W', unidade: 'un' } },
      { id: 'ri4', item_id: 'i5', quantidade: 4,  almoxarifado_itens: { nome: 'Relé fotoelétrico 1000W', unidade: 'un' } },
    ],
  },
  {
    id: 'r3', usuario_id: 'u7', os_id: 'os2', status: 'pendente', criado_em: '2026-06-09T08:00:00Z',
    usuarios: { nome: 'Diego Rocha' },
    ordens_servico: { numero: 1002, descricao: 'Reator com defeito' },
    requisicao_itens: [
      { id: 'ri5', item_id: 'i3', quantidade: 2, almoxarifado_itens: { nome: 'Reator AFP 150W', unidade: 'un' } },
    ],
  },
  {
    id: 'r4', usuario_id: 'u3', os_id: 'os5', status: 'rejeitada', criado_em: '2026-06-07T15:00:00Z',
    motivo_rejeicao: 'Braço não disponível no estoque. Aguardar entrega.',
    usuarios: { nome: 'João da Silva' },
    ordens_servico: { numero: 1005, descricao: 'Braço do poste quebrado' },
    requisicao_itens: [
      { id: 'ri6', item_id: 'i6', quantidade: 1, almoxarifado_itens: { nome: 'Braço galvanizado 1m', unidade: 'un' } },
    ],
  },
];

// ---------- CONTROLE DE PONTO ----------
const hoje = new Date().toISOString().split('T')[0];
const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const anteontem = new Date(Date.now() - 172800000).toISOString().split('T')[0];

export const MOCK_PONTO = [
  { id: 'p1', usuario_id: 'u3', data: hoje,      os_id: 'os1', hora_entrada: '07:00', hora_saida: null,    hora_almoco_saida: null,  hora_almoco_volta: null,  horas_normais: 0,   horas_extras: 0, status: 'rascunho',  usuarios: { nome: 'João da Silva',   cargo: 'eletricista' }, ordens_servico: { numero: 1001, descricao: 'Lâmpada apagada' } },
  { id: 'p2', usuario_id: 'u4', data: hoje,      os_id: 'os2', hora_entrada: '07:30', hora_saida: null,    hora_almoco_saida: null,  hora_almoco_volta: null,  horas_normais: 0,   horas_extras: 0, status: 'rascunho',  usuarios: { nome: 'Marcos Oliveira', cargo: 'eletricista' }, ordens_servico: { numero: 1002, descricao: 'Reator com defeito' } },
  { id: 'p3', usuario_id: 'u5', data: hoje,      os_id: 'os1', hora_entrada: '07:00', hora_saida: null,    hora_almoco_saida: null,  hora_almoco_volta: null,  horas_normais: 0,   horas_extras: 0, status: 'rascunho',  usuarios: { nome: 'André Santos',    cargo: 'ajudante'    }, ordens_servico: { numero: 1001, descricao: 'Lâmpada apagada' } },
  { id: 'p4', usuario_id: 'u3', data: ontem,     os_id: 'os3', hora_entrada: '07:00', hora_saida: '17:00', hora_almoco_saida: '12:00', hora_almoco_volta: '13:00', horas_normais: 9, horas_extras: 0, status: 'enviado',   usuarios: { nome: 'João da Silva',   cargo: 'eletricista' }, ordens_servico: { numero: 1003, descricao: 'Cabo danificado' } },
  { id: 'p5', usuario_id: 'u4', data: ontem,     os_id: 'os6', hora_entrada: '07:30', hora_saida: '18:30', hora_almoco_saida: '12:00', hora_almoco_volta: '13:00', horas_normais: 9, horas_extras: 1, status: 'aprovado',  usuarios: { nome: 'Marcos Oliveira', cargo: 'eletricista' }, ordens_servico: { numero: 1006, descricao: 'Manutenção preventiva' } },
  { id: 'p6', usuario_id: 'u7', data: anteontem, os_id: 'os4', hora_entrada: '06:00', hora_saida: '15:00', hora_almoco_saida: '11:30', hora_almoco_volta: '12:30', horas_normais: 8, horas_extras: 0, status: 'aprovado',  usuarios: { nome: 'Diego Rocha',     cargo: 'eletricista' }, ordens_servico: { numero: 1004, descricao: 'Relé fotoelétrico' } },
  { id: 'p7', usuario_id: 'u3', data: anteontem, os_id: 'os8', hora_entrada: '07:00', hora_saida: '17:00', hora_almoco_saida: '12:00', hora_almoco_volta: '13:00', horas_normais: 9, horas_extras: 0, status: 'enviado',   usuarios: { nome: 'João da Silva',   cargo: 'eletricista' }, ordens_servico: { numero: 1008, descricao: 'Vandalismo' } },
];

// ---------- REGISTROS DE CAMPO ----------
export const MOCK_REGISTROS = [
  {
    id: 'rc1', os_id: 'os4', usuario_id: 'u7', descricao: 'Substituído relé fotoelétrico modelo 1000W. Testado e funcionando.', numero_poste: '45678-D',
    latitude: -22.8898, longitude: -47.0441, fotos: [], status_apos: 'resolvido', criado_em: '2026-06-06T14:30:00Z',
    usuarios: { nome: 'Diego Rocha' },
    materiais_usados: [{ id: 'mu1', item_id: 'i5', quantidade: 1, almoxarifado_itens: { nome: 'Relé fotoelétrico 1000W', unidade: 'un' } }],
  },
  {
    id: 'rc2', os_id: 'os7', usuario_id: 'u7', descricao: 'Trocadas 2 lâmpadas LED 100W. Pontos voltaram a funcionar normalmente.', numero_poste: '78901-G',
    latitude: -23.1900, longitude: -46.8700, fotos: [], status_apos: 'resolvido', criado_em: '2026-06-05T16:00:00Z',
    usuarios: { nome: 'Diego Rocha' },
    materiais_usados: [{ id: 'mu2', item_id: 'i1', quantidade: 2, almoxarifado_itens: { nome: 'Lâmpada LED 100W', unidade: 'un' } }],
  },
];

// ---------- DASHBOARD RESUMO ----------
export const MOCK_DASHBOARD = {
  os_abertas: MOCK_OS.filter(o => o.status === 'aberta').length,
  os_em_andamento: MOCK_OS.filter(o => o.status === 'em_andamento').length,
  os_concluidas_mes: MOCK_OS.filter(o => o.status === 'concluida').length,
  funcionarios_campo_hoje: MOCK_PONTO.filter(p => p.data === hoje && !p.hora_saida).length,
  requisicoes_pendentes: MOCK_REQUISICOES.filter(r => r.status === 'pendente').length,
  itens_estoque_critico: MOCK_ESTOQUE.filter(e => e.quantidade <= e.almoxarifado_itens.estoque_minimo).length,
  os_por_tipo: [
    { tipo: 'Lâmpada queimada', total: 3 },
    { tipo: 'Manutenção prev.', total: 2 },
    { tipo: 'Cabo danificado',  total: 1 },
    { tipo: 'Reator',           total: 1 },
    { tipo: 'Outros',           total: 1 },
  ],
  os_por_dia: [
    { dia: 'Seg', total: 2 },
    { dia: 'Ter', total: 3 },
    { dia: 'Qua', total: 1 },
    { dia: 'Qui', total: 4 },
    { dia: 'Sex', total: 2 },
    { dia: 'Sáb', total: 1 },
    { dia: 'Dom', total: 0 },
  ],
};
