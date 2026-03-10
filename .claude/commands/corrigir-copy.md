Corrige APENAS copy e textos. Leia .claude/rules/copywriting.md + .claude/rules/navigation.md. NÃO leia outros rules.

⚠️ REGRA #1: VOCÊ EDITA. NUNCA liste correções para "aplicação manual".

---

## ESCOPO — SÓ COPY (nada mais)

### 1. SENTENCE CASE (TODOS os H2, H3, H4, H5, H6)
- "Perguntas frequentes" ✔ | "Perguntas Frequentes" ❌ (Title Case) | "perguntas frequentes" ❌ (all lowercase)
- "Qualidade certificada" ✔ | "qualidade certificada" ❌ (falta maiúscula na 1ª letra)
- REGRA: a **primeira letra da primeira palavra** DEVE ser MAIÚSCULA. Tudo minúsculo = ERRADO.
- ATENÇÃO: H3 dentro de cards também devem ser sentence case
- Exceção: nomes próprios (NBR, HVAC, NR-12, INMETRO)

### 2. H2 MÍNIMO 5 PALAVRAS
- Se H2 tem menos de 5 palavras → reescrever mantendo o sentido
- "Benefícios" → "Vantagens que fazem diferença no seu projeto"

### 3. SPAN COLORIDO
- Só em H2 com 5+ palavras
- SEMPRE no final do título
- Pontuação DENTRO do span
- 2+ palavras normais antes
- Se H2 tem <4 palavras → REMOVER span

### 4. DADOS INVENTADOS
- GREP por números que parecem inventados (350+, 14 anos, 98%, etc.)
- Se o dado não foi fornecido pelo cliente → REMOVER a seção/número
- Nunca criar estatísticas fictícias

### 4B. TERMOS PROIBIDOS (copy genérica de template)

> Se o texto poderia estar em QUALQUER site de QUALQUER setor → é genérico → REESCREVER.

- "Soluções completas" → REESCREVER com benefício concreto do serviço
- "Mais de X anos de experiência" → REMOVER ou substituir por dado verificável do cliente
- "Qualidade certificada" → especificar QUAL certificação (ISO, INMETRO, NR)
- "Equipe especializada" → especificar em QUÊ (HVAC? Elétrica? NR-12?)
- "Suporte 24/7" → detalhar COMO (telefone? WhatsApp? equipe de plantão?)
- "Profissionais qualificados" → especificar qualificação (CREA, NR-10, etc.)
- "Compromisso com a qualidade" → REMOVER (clichê vazio)
- "Experiência" (título solto de card) → REESCREVER com contexto do serviço
- "Confiança" / "Excelência" / "Inovação" (títulos genéricos) → REESCREVER

### 5. PREÇOS
- GREP por R$, preço, custo, investimento + valores numéricos
- Se encontrar preço → REMOVER e substituir por "Solicite orçamento personalizado"

### 6. NAVEGAÇÃO (nomes do menu)
- Nomes dos itens do menu = versões curtas dos H2 reais (máx 3 palavras)
- Ordem do menu = ordem EXATA das seções na página
- NUNCA "Benefícios", "Processo", "Incluído" — usar termos técnicos do H2
- NUNCA href="../" → sempre href="#secao"

### 7. SUBTÍTULOS DAS SEÇÕES
- Verificar: text-base text-gray-600 font-light + letter-spacing: 0.05em
- Se faltam subtítulos → ADICIONAR
- Fundo escuro: text-gray-100

### 8. MÍNIMO DE SEÇÕES (CRIAR SE FALTAM)

> A página DEVE ter mínimo 6 seções de conteúdo (excluindo hero e footer).
> Se tem menos → CRIAR seções novas COM copy real, não placeholder.

1. CONTAR seções de conteúdo da página (não contar hero nem footer)
2. Se menos de 6 → CRIAR seções novas baseadas em:
   - Briefing do /pesquisar-copy (se foi rodado neste contexto)
   - Regras de copywriting.md (seções recomendadas: diferenciais, processo, FAQ, etc.)
3. Cada seção nova DEVE ter:
   - H2 com 5+ palavras em sentence case (1ª letra maiúscula)
   - Subtítulo descritivo
   - Mínimo 2 parágrafos de conteúdo real
   - Container `w-[92%] lg:w-[85%] max-w-[1800px] mx-auto`
   - ID para navegação
4. Atualizar o menu com as novas seções

---

## NÃO FAZER (fora do escopo)

❌ NÃO corrigir @layer base ou typescale (use /corrigir-estrutura)
❌ NÃO redesenhar layouts de seção (use /corrigir-layout)
❌ NÃO mexer em SEO/meta tags (use /corrigir-seo)
❌ NÃO pesquisar no Google (use /pesquisar-copy ANTES deste comando)
✔ PODE criar seções novas SE a página tem menos de 6 seções
✔ PODE criar seções novas SE o briefing do /pesquisar-copy indica tópicos críticos faltantes

---

## 🏆 PADRÃO DE QUALIDADE — NÃO ENTREGAR NADA PELA METADE

> Este NÃO é um checklist superficial. É uma revisão PROFUNDA.
> Cada seção deve ter copy PREMIUM — como se fosse paga por uma agência.

### Para CADA seção da página, responder HONESTAMENTE:

1. "O H2 é específico, técnico e vendedor?" — Se genérico → REESCREVER
2. "Os parágrafos têm profundidade?" — Se raso (1 frase genérica) → EXPANDIR com dados e benefícios concretos
3. "O texto convence?" — Se parece template → REESCREVER como copywriter profissional
4. "Os H3 dos cards dizem algo real?" — Se genérico ("Qualidade", "Eficiência") → REESCREVER com contexto do serviço
5. "Os subtítulos complementam o H2?" — Se são só filler → REESCREVER

### PROIBIDO FINALIZAR SE:

❌ Algum H2 tem menos de 5 palavras e não foi expandido
❌ Algum parágrafo parece copy de template genérico
❌ Alguma seção tem só 1 frase rasa de descrição
❌ Algum H3 de card é palavra genérica solta ("Qualidade", "Eficiência", "Conforto", "Experiência")
❌ Alguma seção não tem subtítulo
❌ A navegação usa nomes genéricos ("Benefícios", "Processo", "Incluído")
❌ Algum termo da lista 4B ("soluções completas", "equipe especializada", etc.) ainda presente

✔ CADA seção deve ser revisada individualmente
✔ CADA texto deve ser lido e avaliado: "Isso ficou PREMIUM?"
✔ Se NÃO ficou premium → REESCREVER até ficar

---

## MARCADOR DE CONCLUSÃO

```
✅ COPY CORRIGIDA — QUALIDADE PREMIUM
📝 Sentence case: [X H2 corrigidos]
📝 H2 expandidos: [X títulos reescritos]
📝 Stats inventados: [removidos/mantidos]
📝 Seções criadas: [X novas / 0 se já tinha 6+]
📝 Navegação: [itens verificados]
📝 Qualidade: CADA seção revisada individualmente — PREMIUM ✔
```
