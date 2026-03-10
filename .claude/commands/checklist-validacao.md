Execute o checklist de validação ULTRA-FINO agora.

PASSO 1: Leia CLAUDE.md e .claude/skills/checklist-validacao.md completo — TODOS os itens, especialmente a seção "COPY — PESQUISA GOOGLE OBRIGATÓRIA".

PASSO 2: Se o usuário especificou uma página ($ARGUMENTS), abra esse arquivo. Se não, pergunte qual página validar.

PASSO 2.5 — MAPEAMENTO (NÃO PULAR): Percorram o HTML do INÍCIO ao FIM. Para cada <section>, registre: linha, ID, H2, container. Monte o MAPA COMPLETO da página. Isso garante que NENHUMA seção seja ignorada na validação.

PASSO 3: Para CADA item do checklist, abra o arquivo, localize o trecho, confirme se está correto. Nunca marcar como ok sem verificar no código. Use o MAPA para garantir que cada seção foi verificada.

PASSO 4 — NAVEGAÇÃO (NÃO PULAR): Para cada item do menu, listar: nome no menu → H2 da seção correspondente → posição na página. Se a ordem não bater ou o nome for genérico (Benefícios, Processo, Incluído, Por quê) → VIOLAÇÃO. "Início" DEVE apontar para #hero, NUNCA ../.

PASSO 5 — COPY GOOGLE (NÃO PULAR): Leia o H1. Pesquise no Google. Entre nos 5 primeiros org. Leia os H2/H3 de cada. Compare com a página. Se faltam tópicos → ADICIONE. Se copy é genérica → REESCREVA. Conte as seções (mín 6). Conte as palavras (mín 800). Se não fez isso → checklist INVÁLIDO.

PASSO 6: Se encontrar violação, corrija imediatamente e reinicie o checklist do zero.

PASSO 7: Verifique containers → TODOS devem usar `w-[92%] lg:w-[85%] max-w-[1800px] mx-auto`. Se encontrar max-w-7xl ou w-[78%] → VIOLAÇÃO.

PASSO 8: Só entregue quando TODOS os itens passarem sem exceção.

REGRA: NUNCA marcar copy como ✅ sem ter FEITO pesquisa Google. NUNCA aceitar nomes genéricos no menu. NUNCA aceitar containers com max-w-7xl ou w-[78%].
