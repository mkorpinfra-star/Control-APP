import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ==================== AUTH ====================
export const authService = {
  login: async (email, senha) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw new Error('E-mail ou senha incorretos.');
    const { data: perfil, error: perfilError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (perfilError || !perfil) throw new Error('Usuário não encontrado no sistema.');
    return { user: data.user, perfil };
  },
  logout: async () => {
    await supabase.auth.signOut();
  },
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { data: { session: null } };
    const { data: perfil } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', session.user.id)
      .single();
    return { data: { session: perfil ? { user: session.user, perfil } : null } };
  },
};

// ==================== USUÁRIOS ====================
export const usuariosService = {
  getAll: async (cargo = null) => {
    let q = supabase.from('usuarios').select('*').eq('ativo', true);
    if (cargo) q = q.eq('cargo', cargo);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  getById: async (id) => {
    const { data, error } = await supabase.from('usuarios').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  },
  create: async (dados) => {
    const { data, error } = await supabase.from('usuarios').insert({ ...dados, ativo: true }).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, dados) => {
    const { data, error } = await supabase.from('usuarios').update(dados).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    const { error } = await supabase.from('usuarios').update({ ativo: false }).eq('id', id);
    if (error) throw error;
  },
};

// ==================== CONTRATOS ====================
export const contratosService = {
  getAll: async () => {
    const { data, error } = await supabase.from('contratos').select('*').order('nome');
    if (error) throw error;
    return data;
  },
  getById: async (id) => {
    const { data, error } = await supabase.from('contratos').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  },
  create: async (dados) => {
    const { data, error } = await supabase.from('contratos').insert(dados).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, dados) => {
    const { data, error } = await supabase.from('contratos').update(dados).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    const { error } = await supabase.from('contratos').delete().eq('id', id);
    if (error) throw error;
  },
};

// ==================== ORDENS DE SERVIÇO ====================
export const ordensServicoService = {
  getAll: async (filtros = {}) => {
    let q = supabase
      .from('ordens_servico')
      .select('*, contratos(nome), usuarios(nome)')
      .order('numero', { ascending: false });
    if (filtros.status) q = q.eq('status', filtros.status);
    if (filtros.contrato_id) q = q.eq('contrato_id', filtros.contrato_id);
    if (filtros.responsavel_id) q = q.eq('responsavel_id', filtros.responsavel_id);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  getById: async (id) => {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*, contratos(nome), usuarios(nome), registros_campo(*, usuarios(nome))')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },
  create: async (dados) => {
    const { data: maxData } = await supabase
      .from('ordens_servico')
      .select('numero')
      .order('numero', { ascending: false })
      .limit(1)
      .single();
    const numero = (maxData?.numero ?? 1000) + 1;
    const { data, error } = await supabase
      .from('ordens_servico')
      .insert({ ...dados, numero, data_abertura: new Date().toISOString().split('T')[0] })
      .select('*, contratos(nome), usuarios(nome)')
      .single();
    if (error) throw error;
    return data;
  },
  update: async (id, dados) => {
    const { data, error } = await supabase
      .from('ordens_servico')
      .update({ ...dados, atualizado_em: new Date().toISOString() })
      .eq('id', id)
      .select('*, contratos(nome), usuarios(nome)')
      .single();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    const { error } = await supabase.from('ordens_servico').delete().eq('id', id);
    if (error) throw error;
  },
};

// ==================== REGISTROS DE CAMPO ====================
export const registrosCampoService = {
  getByOS: async (os_id) => {
    const { data, error } = await supabase
      .from('registros_campo')
      .select('*, usuarios(nome)')
      .eq('os_id', os_id)
      .order('criado_em', { ascending: false });
    if (error) throw error;
    return data;
  },
  create: async (dados) => {
    const { data, error } = await supabase
      .from('registros_campo')
      .insert(dados)
      .select('*, usuarios(nome)')
      .single();
    if (error) throw error;
    // Se status_apos é resolvido, atualiza a OS
    if (dados.status_apos === 'resolvido') {
      await supabase
        .from('ordens_servico')
        .update({ status: 'concluida', data_conclusao: new Date().toISOString().split('T')[0] })
        .eq('id', dados.os_id);
    }
    return data;
  },
  uploadFoto: async (arquivo) => {
    const nome = `${Date.now()}_${arquivo.name}`;
    const { data, error } = await supabase.storage
      .from('fotos-campo')
      .upload(nome, arquivo, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('fotos-campo').getPublicUrl(data.path);
    return urlData.publicUrl;
  },
};

// ==================== CONTROLE DE PONTO ====================
export const pontoService = {
  getMeuPonto: async (usuario_id, data) => {
    const { data: result } = await supabase
      .from('ponto')
      .select('*')
      .eq('usuario_id', usuario_id)
      .eq('data', data)
      .single();
    return result || null;
  },
  getSemana: async (usuario_id, data_inicio, data_fim) => {
    const { data, error } = await supabase
      .from('ponto')
      .select('*')
      .eq('usuario_id', usuario_id)
      .gte('data', data_inicio)
      .lte('data', data_fim)
      .order('data');
    if (error) throw error;
    return data;
  },
  getTodos: async (filtros = {}) => {
    let q = supabase.from('ponto').select('*, usuarios(nome)').order('data', { ascending: false });
    if (filtros.usuario_id) q = q.eq('usuario_id', filtros.usuario_id);
    if (filtros.data_inicio) q = q.gte('data', filtros.data_inicio);
    if (filtros.data_fim)    q = q.lte('data', filtros.data_fim);
    if (filtros.status)      q = q.eq('status', filtros.status);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  registrar: async (dados) => {
    const { data: existente } = await supabase
      .from('ponto')
      .select('id')
      .eq('usuario_id', dados.usuario_id)
      .eq('data', dados.data)
      .single();
    if (existente) {
      const { data, error } = await supabase.from('ponto').update(dados).eq('id', existente.id).select().single();
      if (error) throw error;
      return data;
    }
    const { data, error } = await supabase.from('ponto').insert(dados).select().single();
    if (error) throw error;
    return data;
  },
  aprovar: async (id) => {
    const { data, error } = await supabase
      .from('ponto')
      .update({ status: 'aprovado', aprovado_em: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  rejeitar: async (id, motivo) => {
    const { data, error } = await supabase
      .from('ponto')
      .update({ status: 'rejeitado', motivo_rejeicao: motivo })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ==================== ALMOXARIFADO ====================
export const almoxarifadoService = {
  getItens: async () => {
    const { data, error } = await supabase.from('almoxarifado_itens').select('*').eq('ativo', true).order('nome');
    if (error) throw error;
    return data;
  },
  getEstoque: async () => {
    const { data, error } = await supabase
      .from('estoque')
      .select('*, almoxarifado_itens(*)');
    if (error) throw error;
    return data;
  },
  getMovimentacoes: async (item_id = null) => {
    let q = supabase
      .from('movimentacoes_estoque')
      .select('*, almoxarifado_itens(nome, unidade), entregue_por:usuarios!entregue_por_id(nome), retirado_por:usuarios!retirado_por_id(nome), ordens_servico(numero)')
      .order('criado_em', { ascending: false });
    if (item_id) q = q.eq('item_id', item_id);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  criarItem: async (dados) => {
    const { data: item, error } = await supabase.from('almoxarifado_itens').insert({ ...dados, ativo: true }).select().single();
    if (error) throw error;
    await supabase.from('estoque').insert({ item_id: item.id, quantidade: 0 });
    return item;
  },
  atualizarItem: async (id, dados) => {
    const { data, error } = await supabase.from('almoxarifado_itens').update(dados).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  entrada: async (item_id, quantidade, observacao = '') => {
    const { data: estoqueAtual } = await supabase.from('estoque').select('quantidade').eq('item_id', item_id).single();
    const saldoNovo = (estoqueAtual?.quantidade ?? 0) + quantidade;
    await supabase.from('estoque').update({ quantidade: saldoNovo }).eq('item_id', item_id);
    await supabase.from('movimentacoes_estoque').insert({
      item_id, tipo: 'entrada', quantidade, saldo_apos: saldoNovo, observacao,
    });
  },
};

// ==================== REQUISIÇÕES ====================
export const requisicoesService = {
  getAll: async (filtros = {}) => {
    let q = supabase
      .from('requisicoes')
      .select('*, usuarios(nome), ordens_servico(numero, descricao), requisicao_itens(*, almoxarifado_itens(nome, unidade))')
      .order('criado_em', { ascending: false });
    if (filtros.status) q = q.eq('status', filtros.status);
    if (filtros.usuario_id) q = q.eq('usuario_id', filtros.usuario_id);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  create: async (dados, itens) => {
    const { data: req, error } = await supabase
      .from('requisicoes')
      .insert({ ...dados, status: 'pendente' })
      .select()
      .single();
    if (error) throw error;
    await supabase.from('requisicao_itens').insert(itens.map(i => ({ ...i, requisicao_id: req.id })));
    const { data: completa } = await supabase
      .from('requisicoes')
      .select('*, usuarios(nome), ordens_servico(numero, descricao), requisicao_itens(*, almoxarifado_itens(nome, unidade))')
      .eq('id', req.id)
      .single();
    return completa;
  },
  aprovar: async (id) => {
    const { data: req } = await supabase
      .from('requisicoes')
      .select('*, requisicao_itens(*)')
      .eq('id', id)
      .single();
    for (const item of req.requisicao_itens) {
      const { data: est } = await supabase.from('estoque').select('quantidade').eq('item_id', item.item_id).single();
      if (!est || est.quantidade < item.quantidade) {
        throw new Error(`Estoque insuficiente para item ${item.item_id}`);
      }
      const saldoNovo = est.quantidade - item.quantidade;
      await supabase.from('estoque').update({ quantidade: saldoNovo }).eq('item_id', item.item_id);
      await supabase.from('movimentacoes_estoque').insert({
        item_id: item.item_id, tipo: 'saida_requisicao',
        quantidade: item.quantidade, saldo_apos: saldoNovo,
        observacao: `Requisição ${id}`,
      });
    }
    await supabase
      .from('requisicoes')
      .update({ status: 'aprovada', aprovado_em: new Date().toISOString() })
      .eq('id', id);
  },
  rejeitar: async (id, motivo) => {
    const { error } = await supabase
      .from('requisicoes')
      .update({ status: 'rejeitada', motivo_rejeicao: motivo })
      .eq('id', id);
    if (error) throw error;
  },
};

// ==================== COMENTÁRIOS OS ====================
export const comentariosService = {
  getByOS: async (os_id) => {
    const { data, error } = await supabase
      .from('os_comentarios')
      .select('*, usuarios(nome, cargo)')
      .eq('os_id', os_id)
      .order('criado_em', { ascending: true });
    if (error) throw error;
    return data;
  },
  create: async (os_id, usuario_id, texto, foto_url = null) => {
    const { data, error } = await supabase
      .from('os_comentarios')
      .insert({ os_id, usuario_id, texto, foto_url })
      .select('*, usuarios(nome, cargo)')
      .single();
    if (error) throw error;
    return data;
  },
  uploadFoto: async (arquivo) => {
    const nome = `comentarios/${Date.now()}_${arquivo.name}`;
    const { data, error } = await supabase.storage
      .from('fotos-campo')
      .upload(nome, arquivo, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('fotos-campo').getPublicUrl(data.path);
    return urlData.publicUrl;
  },
};

// ==================== DASHBOARD ====================
export const dashboardService = {
  getResumo: async () => {
    const hoje = new Date().toISOString().split('T')[0];
    const [os, ponto, requisicoes, estoque] = await Promise.all([
      supabase.from('ordens_servico').select('status'),
      supabase.from('ponto').select('hora_saida').eq('data', hoje),
      supabase.from('requisicoes').select('status').eq('status', 'pendente'),
      supabase.from('estoque').select('quantidade, almoxarifado_itens(estoque_minimo)'),
    ]);
    const osData = os.data ?? [];
    const pontoData = ponto.data ?? [];
    const reqData = requisicoes.data ?? [];
    const estData = estoque.data ?? [];
    return {
      os_abertas:              osData.filter(o => o.status === 'aberta').length,
      os_em_andamento:         osData.filter(o => o.status === 'em_andamento').length,
      os_concluidas_mes:       osData.filter(o => o.status === 'concluida').length,
      funcionarios_campo_hoje: pontoData.filter(p => !p.hora_saida).length,
      requisicoes_pendentes:   reqData.length,
      itens_estoque_critico:   estData.filter(e => e.quantidade <= (e.almoxarifado_itens?.estoque_minimo ?? 0)).length,
      os_por_tipo:  [],
      os_por_dia:   [],
    };
  },
};
