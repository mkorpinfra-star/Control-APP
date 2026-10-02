import { createClient } from '@supabase/supabase-js';
import { hojeISO, dataISO } from '../lib/datas';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// Client secundário para criar usuários SEM derrubar a sessão do admin
const supabaseSignup = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ==================== AUDITORIA ====================
export const auditService = {
  // Registra ação crítica. Nunca bloqueia o fluxo principal.
  log: async ({ acao, entidade = null, entidade_id = null, dados_antigos = null, dados_novos = null, motivo = null, contexto = 'app' }) => {
    try {
      let ator = null;
      try { ator = JSON.parse(localStorage.getItem('mkorp_sessao') || 'null'); } catch { /* noop */ }
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess?.session?.user?.id ?? null;
      if (!uid) return;
      await supabase.from('audit_log').insert({
        usuario_id: uid, usuario_nome: ator?.nome ?? null,
        acao, entidade, entidade_id: entidade_id != null ? String(entidade_id) : null,
        dados_antigos, dados_novos, motivo, contexto,
      });
    } catch { /* auditoria não pode quebrar o app */ }
  },
  listar: async ({ acao, entidade, data_inicio, data_fim, pagina = 0, porPagina = 30 } = {}) => {
    let q = supabase.from('audit_log').select('*', { count: 'exact' }).order('criado_em', { ascending: false });
    if (acao) q = q.eq('acao', acao);
    if (entidade) q = q.eq('entidade', entidade);
    if (data_inicio) q = q.gte('criado_em', data_inicio);
    if (data_fim) q = q.lte('criado_em', data_fim + 'T23:59:59');
    const de = pagina * porPagina;
    q = q.range(de, de + porPagina - 1);
    const { data, error, count } = await q;
    if (error) return { itens: [], total: 0 };
    return { itens: data, total: count ?? 0 };
  },
};

// ==================== AUTH ====================
export const authService = {
  login: async (email, senha) => {
    let data, error;
    try {
      ({ data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha }));
    } catch {
      throw new Error('Sem conexão com o servidor. Verifique a internet e tente novamente.');
    }
    if (error) {
      if (error.status === 0 || /fetch|network/i.test(error.message || '')) {
        throw new Error('Sem conexão com o servidor. Verifique a internet e tente novamente.');
      }
      throw new Error('E-mail ou senha incorretos.');
    }
    const { data: perfil, error: perfilError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (perfilError || !perfil) {
      await supabase.auth.signOut();
      throw new Error('Usuário não encontrado no sistema.');
    }
    if (perfil.ativo === false) {
      await supabase.auth.signOut();
      throw new Error('Usuário desativado. Procure o administrador.');
    }
    return { user: data.user, perfil };
  },
  logout: async () => {
    await supabase.auth.signOut();
  },
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { data: { session: null } };
    const { data: perfil, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', session.user.id)
      .single();
    if (error && !perfil) return { data: { session: null }, error };
    return { data: { session: perfil ? { user: session.user, perfil } : null } };
  },
  alterarSenha: async (novaSenha) => {
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) throw new Error(error.message);
  },
};

// ==================== CONFIG DA EMPRESA ====================
export const configService = {
  get: async () => {
    const { data, error } = await supabase.from('config_empresa').select('*').eq('id', 1).single();
    if (error) return null;
    return data;
  },
  update: async (dados) => {
    const { data, error } = await supabase
      .from('config_empresa')
      .upsert({ id: 1, ...dados, atualizado_em: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ==================== USUÁRIOS ====================
export const usuariosService = {
  // Listagens/dropdowns NUNCA trazem CPF (fica em usuarios_documentos)
  getAll: async (cargo = null, incluirInativos = false) => {
    let q = supabase.from('usuarios').select('id, nome, email, cargo, matricula, telefone, ativo, avatar_url, data_admissao, acessos');
    if (!incluirInativos) q = q.eq('ativo', true);
    if (cargo) q = q.eq('cargo', cargo);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  // Detalhe (admin/edição): traz CPF da tabela protegida
  getById: async (id) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, cargo, matricula, telefone, ativo, avatar_url, data_admissao, acessos')
      .eq('id', id).single();
    if (error) return null;
    const { data: doc } = await supabase.from('usuarios_documentos').select('cpf').eq('usuario_id', id).maybeSingle();
    return { ...data, cpf: doc?.cpf ?? '' };
  },
  create: async (dados) => {
    const { data, error } = await supabase.from('usuarios').insert({ ...dados, ativo: true }).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, dados) => {
    // separa CPF (vai para tabela protegida)
    const { cpf, ...resto } = dados;
    if (cpf !== undefined) {
      await supabase.from('usuarios_documentos').upsert({ usuario_id: id, cpf: cpf || null, atualizado_em: new Date().toISOString() }, { onConflict: 'usuario_id' });
    }
    const { data, error } = await supabase.from('usuarios').update(resto).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    const { error } = await supabase.from('usuarios').update({ ativo: false }).eq('id', id);
    if (error) throw error;
    auditService.log({ acao: 'funcionario_desativado', entidade: 'usuarios', entidade_id: id });
  },
  reativar: async (id) => {
    const { error } = await supabase.from('usuarios').update({ ativo: true }).eq('id', id);
    if (error) throw error;
    auditService.log({ acao: 'funcionario_reativado', entidade: 'usuarios', entidade_id: id });
  },
  // Admin redefine a senha na hora (via Edge Function)
  resetSenhaAdmin: async (user_id, nova_senha) => {
    const { data, error } = await supabase.functions.invoke('bright-worker', {
      body: { user_id, nova_senha },
    });
    if (error) throw new Error(error.message || 'Erro ao redefinir senha');
    if (data?.error) throw new Error(data.error);
    auditService.log({ acao: 'senha_resetada', entidade: 'usuarios', entidade_id: user_id });
    return true;
  },
  // Envia e-mail de redefinição de senha
  enviarEmailReset: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://app.mkorp.com.br',
    });
    if (error) throw new Error(error.message);
    return true;
  },
  uploadAvatar: async (id, arquivo) => {
    const ext = (arquivo.name.split('.').pop() || 'jpg').toLowerCase();
    const nome = `avatars/${id}_${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('fotos-campo')
      .upload(nome, arquivo, { cacheControl: '3600', upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('fotos-campo').getPublicUrl(data.path);
    const url = urlData.publicUrl;
    await supabase.from('usuarios').update({ avatar_url: url }).eq('id', id);
    return url;
  },
  // Cria usuário COM login (auth + perfil), sem derrubar sessão do admin
  criarComLogin: async ({ email, senha, nome, cargo, matricula, telefone, cpf, data_admissao }) => {
    const { data: signup, error: signupError } = await supabaseSignup.auth.signUp({
      email, password: senha,
    });
    if (signupError) throw new Error('Erro ao criar login: ' + signupError.message);
    const novoId = signup.user?.id;
    if (!novoId) throw new Error('Não foi possível criar a conta de acesso.');
    const { data, error } = await supabase.from('usuarios').insert({
      id: novoId, email, nome, cargo, matricula: matricula || null, telefone: telefone || null,
      data_admissao: data_admissao || null, ativo: true,
    }).select().single();
    if (error) throw new Error('Login criado, mas erro ao salvar perfil: ' + error.message);
    // CPF vai para a tabela protegida
    if (cpf) await supabase.from('usuarios_documentos').insert({ usuario_id: novoId, cpf });
    auditService.log({ acao: 'funcionario_criado', entidade: 'usuarios', entidade_id: novoId, dados_novos: { nome, cargo, email } });
    return data;
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
    auditService.log({ acao: 'contrato_criado', entidade: 'contratos', entidade_id: data.id, dados_novos: { nome: data.nome } });
    return data;
  },
  update: async (id, dados) => {
    const { data, error } = await supabase.from('contratos').update(dados).eq('id', id).select().single();
    if (error) throw error;
    auditService.log({ acao: dados.status === 'encerrado' ? 'contrato_encerrado' : 'contrato_editado', entidade: 'contratos', entidade_id: id, dados_novos: dados });
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
    // Número atômico via sequence (fallback para max+1 se a função ainda não existir)
    let numero;
    const { data: prox, error: rpcErr } = await supabase.rpc('proximo_numero_os');
    if (!rpcErr && prox != null) {
      numero = prox;
    } else {
      const { data: maxData } = await supabase
        .from('ordens_servico').select('numero').order('numero', { ascending: false }).limit(1).single();
      numero = (maxData?.numero ?? 1000) + 1;
    }
    const { data, error } = await supabase
      .from('ordens_servico')
      .insert({ ...dados, numero, data_abertura: hojeISO() })
      .select('*, contratos(nome), usuarios(nome)')
      .single();
    if (error) throw error;
    auditService.log({ acao: 'os_criada', entidade: 'ordens_servico', entidade_id: data.id, dados_novos: { numero: data.numero, tipo_defeito: data.tipo_defeito, contrato_id: data.contrato_id } });
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
    const acao = dados.status === 'cancelada' ? 'os_cancelada'
      : dados.status === 'concluida' ? 'os_concluida'
      : dados.status ? 'os_status_alterado' : 'os_editada';
    auditService.log({ acao, entidade: 'ordens_servico', entidade_id: id, dados_novos: dados, motivo: dados.motivo_cancelamento || null });
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
      const { error: osErr } = await supabase
        .from('ordens_servico')
        .update({ status: 'concluida', data_conclusao: hojeISO() })
        .eq('id', dados.os_id);
      if (osErr) throw new Error('Registro salvo, mas não foi possível concluir a OS: ' + osErr.message);
    }
    return data;
  },
  uploadFoto: async (arquivo) => {
    const nome = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${arquivo.name}`;
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
      .from('controle_ponto')
      .select('*')
      .eq('usuario_id', usuario_id)
      .eq('data', data)
      .maybeSingle();
    return result || null;
  },
  getSemana: async (usuario_id, data_inicio, data_fim) => {
    const { data, error } = await supabase
      .from('controle_ponto')
      .select('*')
      .eq('usuario_id', usuario_id)
      .gte('data', data_inicio)
      .lte('data', data_fim)
      .order('data');
    if (error) throw error;
    return data;
  },
  getTodos: async (filtros = {}) => {
    let q = supabase.from('controle_ponto').select('*, usuarios!usuario_id(nome)').order('data', { ascending: false });
    if (filtros.usuario_id) q = q.eq('usuario_id', filtros.usuario_id);
    if (filtros.data_inicio) q = q.gte('data', filtros.data_inicio);
    if (filtros.data_fim)    q = q.lte('data', filtros.data_fim);
    if (filtros.status)      q = q.eq('status', filtros.status);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  // upsert atômico por (usuario_id, data): dois toques rápidos não geram erro de duplicidade.
  // O servidor recusa alteração de ponto enviado/aprovado/fechado (RLS + trigger).
  registrar: async (dados) => {
    // campos de horário vazios ('') viram NULL — '' é inválido para colunas `time`
    // (antes: enviar o ponto sem almoço falhava com "invalid input syntax for type time")
    const limpo = { ...dados };
    for (const k of ['hora_entrada', 'hora_saida', 'hora_almoco_saida', 'hora_almoco_volta']) {
      if (k in limpo && !limpo[k]) limpo[k] = null;
    }
    const { data, error } = await supabase
      .from('controle_ponto')
      .upsert(limpo, { onConflict: 'usuario_id,data' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  aprovar: async (id) => {
    const { data, error } = await supabase
      .from('controle_ponto')
      .update({ status: 'aprovado', aprovado_em: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  rejeitar: async (id, motivo) => {
    const { data, error } = await supabase
      .from('controle_ponto')
      .update({ status: 'rejeitado', motivo_rejeicao: motivo })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  // Fechamento mensal: consolida os pontos aprovados do período como "fechado"
  fecharMes: async (data_inicio, data_fim) => {
    const { data, error } = await supabase
      .from('controle_ponto')
      .update({ status: 'fechado', fechado_em: new Date().toISOString() })
      .gte('data', data_inicio)
      .lte('data', data_fim)
      .eq('status', 'aprovado')
      .select();
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
      .from('almoxarifado_estoque')
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
    // a linha de saldo (quantidade 0) é criada por trigger no banco
    const { data: item, error } = await supabase.from('almoxarifado_itens').insert({ ...dados, ativo: true }).select().single();
    if (error) throw error;
    return item;
  },
  atualizarItem: async (id, dados) => {
    const { data, error } = await supabase.from('almoxarifado_itens').update(dados).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  // Entrada/saída são transacionais no servidor (trava de saldo, validação e auditoria)
  entrada: async (item_id, quantidade, observacao = '') => {
    const { data, error } = await supabase.rpc('estoque_entrada', { p_item_id: item_id, p_quantidade: Number(quantidade), p_observacao: observacao });
    if (error) throw new Error(error.message);
    return data;
  },
  saida: async (item_id, quantidade, observacao = '') => {
    const { data, error } = await supabase.rpc('estoque_saida', { p_item_id: item_id, p_quantidade: Number(quantidade), p_observacao: observacao });
    if (error) throw new Error(error.message);
    return data;
  },
};

// ==================== REQUISIÇÕES ====================
export const requisicoesService = {
  getAll: async (filtros = {}) => {
    let q = supabase
      .from('requisicoes')
      .select('*, usuarios!usuario_id(nome), ordens_servico(numero, descricao), requisicao_itens(*, almoxarifado_itens(nome, unidade))')
      .order('criado_em', { ascending: false });
    if (filtros.status) q = q.eq('status', filtros.status);
    if (filtros.usuario_id) q = q.eq('usuario_id', filtros.usuario_id);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  // Criação atômica (requisição + itens) e aprovação idempotente no servidor
  create: async (dados, itens) => {
    const { data: id, error } = await supabase.rpc('criar_requisicao', { p_os_id: dados.os_id || null, p_itens: itens });
    if (error) throw new Error(error.message);
    const { data: completa } = await supabase
      .from('requisicoes')
      .select('*, usuarios!usuario_id(nome), ordens_servico(numero, descricao), requisicao_itens(*, almoxarifado_itens(nome, unidade))')
      .eq('id', id)
      .single();
    return completa;
  },
  aprovar: async (id) => {
    const { error } = await supabase.rpc('aprovar_requisicao', { p_requisicao_id: id });
    if (error) throw new Error(error.message);
  },
  rejeitar: async (id, motivo) => {
    const { error } = await supabase.rpc('rejeitar_requisicao', { p_requisicao_id: id, p_motivo: motivo });
    if (error) throw new Error(error.message);
  },
  cancelar: async (id) => {
    const { error } = await supabase.rpc('cancelar_requisicao', { p_requisicao_id: id });
    if (error) throw new Error(error.message);
  },
  // Almoxarife responde um item digitado por texto livre (não cadastrado no catálogo)
  responderItemLivre: async (itemReqId, { disponivel, resposta_almoxarife, previsao_data }) => {
    const { error } = await supabase
      .from('requisicao_itens')
      .update({ disponivel, resposta_almoxarife, previsao_data: previsao_data || null })
      .eq('id', itemReqId);
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

// ==================== SERVIÇOS (catálogo p/ medição) ====================
export const servicosService = {
  getTipos: async (incluirInativos = false) => {
    let q = supabase.from('tipos_servico').select('*').order('nome');
    if (!incluirInativos) q = q.eq('ativo', true);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },
  criarTipo: async (dados) => {
    const { data, error } = await supabase.from('tipos_servico').insert({ ...dados, ativo: true }).select().single();
    if (error) throw error;
    return data;
  },
  atualizarTipo: async (id, dados) => {
    const { data, error } = await supabase.from('tipos_servico').update(dados).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  // Preços específicos de um contrato
  getPrecosContrato: async (contrato_id) => {
    const { data, error } = await supabase.from('precos_servico').select('*').eq('contrato_id', contrato_id);
    if (error) return [];
    return data;
  },
  setPrecoContrato: async (tipo_servico_id, contrato_id, valor) => {
    if (valor == null || valor === '') {
      // remove override → volta pro valor padrão
      await supabase.from('precos_servico').delete().eq('tipo_servico_id', tipo_servico_id).eq('contrato_id', contrato_id);
      return;
    }
    const { error } = await supabase.from('precos_servico')
      .upsert({ tipo_servico_id, contrato_id, valor: Number(valor) }, { onConflict: 'tipo_servico_id,contrato_id' });
    if (error) throw error;
  },
  // Resolve preço: preço específico do contrato, senão valor_padrão
  getPreco: async (tipo_servico_id, contrato_id) => {
    if (contrato_id) {
      const { data: esp } = await supabase
        .from('precos_servico').select('valor')
        .eq('tipo_servico_id', tipo_servico_id).eq('contrato_id', contrato_id).maybeSingle();
      if (esp) return Number(esp.valor);
    }
    const { data: tipo } = await supabase.from('tipos_servico').select('valor_padrao').eq('id', tipo_servico_id).single();
    return Number(tipo?.valor_padrao ?? 0);
  },
};

// ==================== SERVIÇOS EXECUTADOS NA OS ====================
export const osServicosService = {
  getByOS: async (os_id) => {
    const { data, error } = await supabase
      .from('os_servicos')
      .select('*, tipos_servico(nome, unidade)')
      .eq('os_id', os_id)
      .order('criado_em');
    if (error) throw error;
    return data;
  },
  adicionar: async ({ os_id, tipo_servico_id, quantidade, contrato_id }) => {
    const valor_unitario = await servicosService.getPreco(tipo_servico_id, contrato_id);
    const valor_total = valor_unitario * Number(quantidade);
    const { data, error } = await supabase
      .from('os_servicos')
      .insert({ os_id, tipo_servico_id, quantidade: Number(quantidade), valor_unitario, valor_total })
      .select('*, tipos_servico(nome, unidade)')
      .single();
    if (error) throw error;
    return data;
  },
  remover: async (id) => {
    const { error } = await supabase.from('os_servicos').delete().eq('id', id);
    if (error) throw error;
  },
};

// ==================== MEDIÇÃO MENSAL ====================
export const medicaoService = {
  // Consolida serviços executados em OS concluídas do contrato no mês
  consolidar: async (contrato_id, ano, mes) => {
    const ini = `${ano}-${String(mes + 1).padStart(2, '0')}-01`;
    const ultimo = new Date(ano, mes + 1, 0).getDate();
    const fim = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(ultimo).padStart(2, '0')}`;

    let q = supabase
      .from('ordens_servico')
      .select('id, numero, data_conclusao, contrato_id, os_servicos(quantidade, valor_total, tipos_servico(nome, unidade))')
      .eq('status', 'concluida')
      .gte('data_conclusao', ini)
      .lte('data_conclusao', fim);
    if (contrato_id) q = q.eq('contrato_id', contrato_id);
    const { data: ordens, error } = await q;
    if (error) throw error;

    const porTipo = {};
    let total = 0;
    let qtdOS = 0;
    (ordens ?? []).forEach(os => {
      if (os.os_servicos?.length) qtdOS++;
      os.os_servicos?.forEach(s => {
        const nome = s.tipos_servico?.nome || '—';
        if (!porTipo[nome]) porTipo[nome] = { nome, quantidade: 0, valor: 0, unidade: s.tipos_servico?.unidade || 'un' };
        porTipo[nome].quantidade += Number(s.quantidade || 0);
        porTipo[nome].valor += Number(s.valor_total || 0);
        total += Number(s.valor_total || 0);
      });
    });

    return {
      itens: Object.values(porTipo).sort((a, b) => b.valor - a.valor),
      total, qtdOS, qtdOrdens: ordens?.length ?? 0, periodo: { ini, fim },
    };
  },
  fechar: async (contrato_id, ano, mes, valor_total) => {
    const { data, error } = await supabase
      .from('medicoes')
      .upsert({ contrato_id, ano, mes, valor_total, status: 'fechada', fechado_em: new Date().toISOString() },
              { onConflict: 'contrato_id,ano,mes' })
      .select().single();
    if (error) throw error;
    return data;
  },
  getStatus: async (contrato_id, ano, mes) => {
    const { data } = await supabase.from('medicoes').select('*')
      .eq('contrato_id', contrato_id).eq('ano', ano).eq('mes', mes).maybeSingle();
    return data || null;
  },
};

// ==================== DASHBOARD ====================
export const dashboardService = {
  getResumo: async () => {
    const hoje = hojeISO();
    const [os, ponto, requisicoes, estoque] = await Promise.all([
      supabase.from('ordens_servico').select('status, tipo_defeito, data_abertura, prazo'),
      supabase.from('controle_ponto').select('hora_saida').eq('data', hoje),
      supabase.from('requisicoes').select('status').eq('status', 'pendente'),
      supabase.from('almoxarifado_estoque').select('quantidade, almoxarifado_itens(estoque_minimo, valor_unitario)'),
    ]);
    const osData = os.data ?? [];
    const pontoData = ponto.data ?? [];
    const reqData = requisicoes.data ?? [];
    const estData = estoque.data ?? [];

    // OS por dia (últimos 7 dias)
    const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const os_por_dia = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = dataISO(d);
      os_por_dia.push({
        dia: DIAS_SEMANA[d.getDay()],
        total: osData.filter(o => o.data_abertura === iso).length,
      });
    }

    // OS por tipo de defeito (top 6)
    const TIPO_LABEL = {
      lampada_queimada: 'Lâmpada queimada', reator_defeituoso: 'Reator', cabo_danificado: 'Cabo',
      rele_fotoeletrico: 'Relé', braco_quebrado: 'Braço', poste_danificado: 'Poste',
      vandalismo: 'Vandalismo', manutencao_preventiva: 'Preventiva', outro: 'Outro',
    };
    const contagem = {};
    osData.forEach(o => {
      const t = TIPO_LABEL[o.tipo_defeito] || o.tipo_defeito || 'Outro';
      contagem[t] = (contagem[t] || 0) + 1;
    });
    const os_por_tipo = Object.entries(contagem)
      .map(([tipo, total]) => ({ tipo, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    // OS atrasadas: com prazo vencido e ainda não concluídas/canceladas
    const os_atrasadas = osData.filter(o =>
      o.prazo && o.prazo < hoje && o.status !== 'concluida' && o.status !== 'cancelada'
    ).length;

    // Valor do estoque
    const valor_estoque = estData.reduce((s, e) => s + (Number(e.quantidade || 0) * Number(e.almoxarifado_itens?.valor_unitario || 0)), 0);

    // Faturamento do mês (serviços executados em OS concluídas no mês)
    const primeiroDia = `${hoje.slice(0, 8)}01`;
    const { data: osServ } = await supabase
      .from('ordens_servico')
      .select('data_conclusao, os_servicos(valor_total)')
      .eq('status', 'concluida')
      .gte('data_conclusao', primeiroDia)
      .lte('data_conclusao', hoje);
    const faturamento_mes = (osServ ?? []).reduce((s, o) =>
      s + (o.os_servicos ?? []).reduce((a, x) => a + Number(x.valor_total || 0), 0), 0);

    return {
      os_abertas:              osData.filter(o => o.status === 'aberta').length,
      os_em_andamento:         osData.filter(o => o.status === 'em_andamento').length,
      os_concluidas_mes:       osData.filter(o => o.status === 'concluida').length,
      funcionarios_campo_hoje: pontoData.filter(p => !p.hora_saida).length,
      requisicoes_pendentes:   reqData.length,
      itens_estoque_critico:   estData.filter(e => e.quantidade <= (e.almoxarifado_itens?.estoque_minimo ?? 0)).length,
      os_atrasadas,
      valor_estoque,
      faturamento_mes,
      os_por_tipo,
      os_por_dia,
    };
  },
};

// ==================== NOTIFICAÇÕES ====================
export const notificacoesService = {
  getByUsuario: async (usuario_id, apenasNaoLidas = false) => {
    let q = supabase.from('notificacoes').select('*').eq('usuario_id', usuario_id).order('criado_em', { ascending: false }).limit(50);
    if (apenasNaoLidas) q = q.eq('lida', false);
    const { data, error } = await q;
    if (error) return [];
    return data;
  },
  contarNaoLidas: async (usuario_id) => {
    const { count, error } = await supabase
      .from('notificacoes')
      .select('id', { count: 'exact', head: true })
      .eq('usuario_id', usuario_id)
      .eq('lida', false);
    if (error) return 0;
    return count ?? 0;
  },
  criar: async ({ usuario_id, titulo, mensagem, tipo = 'info', link = null }) => {
    if (!usuario_id) return;
    await supabase.from('notificacoes').insert({ usuario_id, titulo, mensagem, tipo, link, lida: false });
  },
  marcarLida: async (id) => {
    await supabase.from('notificacoes').update({ lida: true }).eq('id', id);
  },
  marcarTodasLidas: async (usuario_id) => {
    await supabase.from('notificacoes').update({ lida: true }).eq('usuario_id', usuario_id).eq('lida', false);
  },
  // Notifica todos os usuários ativos de determinados cargos (opcionalmente exclui um id)
  notificarCargos: async (cargos, { titulo, mensagem, tipo = 'info', link = null, exceto = null }) => {
    const { data: alvos } = await supabase
      .from('usuarios')
      .select('id')
      .in('cargo', cargos)
      .eq('ativo', true);
    if (!alvos || alvos.length === 0) return;
    const linhas = alvos
      .filter(u => u.id !== exceto)
      .map(u => ({ usuario_id: u.id, titulo, mensagem, tipo, link, lida: false }));
    if (linhas.length) await supabase.from('notificacoes').insert(linhas);
  },
};
