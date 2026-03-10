# NAVEGAÇÃO INTERNA DE PÁGINAS DE SERVIÇO

> v1.0 — Regra obrigatória para todas as páginas de serviço

---

## PRINCÍPIO

Em páginas de serviço, TODOS os links do menu apontam para **seções internas da própria página**.
"Início" = topo da página atual (hero). NUNCA para a página anterior.

---

## 🚨 NOMES NO MENU — REGRA DE NOMENCLATURA

> Os itens do menu DEVEM ser versões curtas dos H2 REAIS das seções da página.
> Na MESMA ORDEM em que aparecem na página (top → bottom).
> Tom SEMPRE profissional e institucional. Nunca casual.

### Como definir os nomes:
1. Percorrer a página de cima para baixo
2. Para cada seção, ler o H2
3. Encurtar o H2 para no máximo 3 palavras
4. Manter o sentido profissional do título original

### Exemplo prático:
Se a página tem estas seções nesta ordem:
- Hero (não vai no menu)
- H2: "Sistemas hidráulicos sem vazamentos" → menu: **Sist. Hidráulicos**
- H2: "Subestação que entrega energia 24/7" → menu: **Subestações**
- H2: "Por que nos escolher" → menu: **Diferenciais**
- H2: "O que está incluído" → menu: **Escopo Incluído**
- H2: "Projetos realizados" → menu: **Projetos**
- Contato/CTA final → menu: **Contato**

O menu fica: `Início | Serviços ▾ | Sist. Hidráulicos | Subestações | Diferenciais | Escopo Incluído | Projetos | Contato`

### Regras:
✔ Os nomes DEVEM vir dos H2 reais da página — nunca inventados
✔ A ordem dos itens no menu = ordem EXATA das seções na página (1ª seção = 1º item, 2ª seção = 2º item...)
✔ Máximo 3 palavras por item
✔ Tom profissional, técnico e sério (site institucional)
✔ "Início" sempre primeiro → `#hero` (topo da PRÓPRIA página, NÃO ../)
✔ "Serviços" sempre segundo → dropdown com outras páginas
✔ "Contato" sempre último → `#contato`
✔ Seções intermediárias na ordem EXATA da página

### 🚨 LIMITE DE ITENS NO MENU — REGRA ABSOLUTA

> O menu NÃO é um índice da página. É uma navegação LIMPA e RÁPIDA.
> Mesmo que a página tenha 12 seções, o menu mostra NO MÁXIMO 7-8 itens totais.

✔ Estrutura fixa: **Início** + **Serviços ▾** + **[4-5 melhores seções]** + **Contato**
✔ Máximo 4-5 links internos (seções) — escolher as mais importantes
✔ Critério para escolher: seções que o VISITANTE quer acessar rápido (ex: Benefícios, Escopo, Dúvidas, Contato)
✔ Seções informativas/detalhadas (ex: Tipos, Dimensionamento, Processo) → NÃO precisam estar no menu
✔ Se a página tem 10 seções → escolher as 4-5 melhores, não colocar tudo

❌ PROIBIDO ter mais de 8 itens no menu (Início + Serviços + 5 links + Contato = 8 máximo)
❌ PROIBIDO colocar todas as seções no menu — o menu fica poluído e impossível
❌ PROIBIDO: "Por quê", "Por quê?", "Porque", "Incluído", "Processo" — são vagos e casuais
❌ NUNCA inventar nomes que não correspondem ao H2 da seção
❌ NUNCA colocar itens fora da ordem da página (se clico no 3º item do menu, ele NÃO pode pular pro final da página)
❌ NUNCA usar mais de 3 palavras por item no menu
❌ NUNCA "Início" apontar para ../ ou outra página — é sempre #hero (topo da página atual)

### Estrutura fixa do menu:
1. **Início** → `#hero` (topo da página ATUAL — nunca ../)
2. **Serviços** → dropdown com links para outras páginas de serviço
3-N. **[Nome curto do H2 da seção]** → `#id-da-seção` (na ordem EXATA da página)
Último. **Contato** → `#contato` (sempre o último item)

---

## REGRA OBRIGATÓRIA

### Links fixos:
- ✔ **Início** → `#hero` (topo da página atual — NUNCA ../)
- ✔ **Serviços** → dropdown com links para outras páginas de serviço

### Links internos (nomes baseados nos H2 reais, na ordem da página):
- ✔ **[Nome curto do 1º H2]** → `#id-secao-1`
- ✔ **[Nome curto do 2º H2]** → `#id-secao-2`
- ✔ ... (seguir ordem da página)
- ✔ **Contato** → `#contato` (CTA final ou footer)

### IDs obrigatórios:
- ✔ TODA `<section>` da página DEVE ter um atributo `id`
- ✔ Se a seção não tem ID → ADICIONAR ID baseado no texto do H2 (ex: H2 "Energia Solar" → `id="energia-solar"`)
- ✔ Se duas seções têm temas similares (ex: 2x "Como Funciona") → MESCLAR em uma seção só
- ❌ Seção sem ID = VIOLAÇÃO (o menu não pode apontar para ela)
- ❌ Seções duplicadas sobre o mesmo tema = VIOLAÇÃO (mesclar imediatamente)

---

## ESTRUTURA DE IDs OBRIGATÓRIA

Toda página de serviço deve ter ID `hero` na hero section e IDs em cada seção:

```html
<!-- Hero — OBRIGATÓRIO ter id="hero" -->
<section id="hero" class="relative min-h-screen flex items-center">
    <!-- hero content -->
</section>

<!-- Seções de conteúdo — IDs baseados no conteúdo real -->
<section id="instalacoes" class="py-16 bg-white">
    <!-- cards dos serviços -->
</section>

<section id="diferenciais" class="py-16 bg-gradient-to-br from-gray-900 to-black">
    <!-- benefícios -->
</section>

<section id="escopo" class="py-20 bg-gray-50">
    <!-- checklist -->
</section>

<!-- Contato — SEMPRE o último -->
<section id="contato" class="py-16 bg-gradient-to-r from-red-600 to-red-700">
    <!-- formulário ou CTAs -->
</section>
```

---

## MENU DESKTOP

```html
<nav class="hidden md:flex space-x-8">
    <a href="#hero" class="text-gray-200 hover:text-red-500 transition relative group py-2">
        Início
        <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
    </a>

    <div class="relative group">
        <a href="#servicos" class="text-gray-200 hover:text-red-500 transition relative py-2 flex items-center">
            Serviços
            <i class="bi bi-chevron-down ml-1 text-xs transition-transform group-hover:rotate-180"></i>
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
        </a>
        <div class="absolute left-0 mt-2 w-72 bg-zinc-900/95 backdrop-blur-md rounded-lg border border-gray-800 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
            <!-- dropdown com links para outras páginas de serviço -->
        </div>
    </div>

    <a href="#sobre" class="text-gray-200 hover:text-red-500 transition relative group py-2">
        Sobre nós
        <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
    </a>

    <a href="#portfolio" class="text-gray-200 hover:text-red-500 transition relative group py-2">
        Portfólio
        <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
    </a>

    <a href="#incluido" class="text-gray-200 hover:text-red-500 transition relative group py-2">
        Áreas de atuação
        <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
    </a>

    <a href="#contato" class="text-gray-200 hover:text-red-500 transition relative group py-2">
        Contato
        <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
    </a>
</nav>
```

---

## MENU MOBILE

```html
<nav class="flex-1 p-4 space-y-2">
    <a href="#hero" class="flex items-center gap-3 px-4 py-3 text-white hover:bg-zinc-900 rounded-lg transition-all group">
        <i class="bi bi-house text-[#CE0201] text-xl"></i>
        <span class="text-base">Início</span>
        <i class="bi bi-chevron-right ml-auto text-gray-700 group-hover:text-[#CE0201] group-hover:translate-x-1 transition-all"></i>
    </a>

    <a href="#sobre" class="flex items-center gap-3 px-4 py-3 text-white hover:bg-zinc-900 rounded-lg transition-all group">
        <i class="bi bi-info-circle text-[#CE0201] text-lg"></i>
        <span class="text-lg">Sobre nós</span>
        <i class="bi bi-chevron-right ml-auto text-gray-700 group-hover:text-[#CE0201] group-hover:translate-x-1 transition-all"></i>
    </a>

    <!-- Serviços com Dropdown -->
    <div class="space-y-2">
        <button id="mobile-services-toggle" class="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-zinc-900 rounded-lg transition-all group">
            <i class="bi bi-gear text-[#CE0201] text-lg"></i>
            <span class="text-base">Serviços</span>
            <i class="bi bi-chevron-down ml-auto text-gray-700 group-hover:text-[#CE0201] transition-all" id="mobile-services-icon"></i>
        </button>
        <!-- dropdown com links para outras páginas de serviço -->
    </div>

    <a href="#portfolio" class="flex items-center gap-3 px-4 py-3 text-white hover:bg-zinc-900 rounded-lg transition-all group">
        <i class="bi bi-briefcase text-[#CE0201] text-xl"></i>
        <span class="text-base">Portfólio</span>
        <i class="bi bi-chevron-right ml-auto text-gray-700 group-hover:text-[#CE0201] group-hover:translate-x-1 transition-all"></i>
    </a>

    <a href="#incluido" class="flex items-center gap-3 px-4 py-3 text-white hover:bg-zinc-900 rounded-lg transition-all group">
        <i class="bi bi-geo-alt text-[#CE0201] text-lg"></i>
        <span class="text-lg">Áreas de atuação</span>
        <i class="bi bi-chevron-right ml-auto text-gray-700 group-hover:text-[#CE0201] group-hover:translate-x-1 transition-all"></i>
    </a>

    <a href="#contato" class="flex items-center gap-3 px-4 py-3 text-white hover:bg-zinc-900 rounded-lg transition-all group">
        <i class="bi bi-envelope text-[#CE0201] text-lg"></i>
        <span class="text-base">Contato</span>
        <i class="bi bi-chevron-right ml-auto text-gray-700 group-hover:text-[#CE0201] group-hover:translate-x-1 transition-all"></i>
    </a>
</nav>
```

---

## SCROLL SUAVE

Obrigatório no `<head>` ou `<style>`:

```css
html {
    scroll-behavior: smooth;
}
```

---

## ERRADO vs CORRETO

❌ ERRADO — Início aponta para página anterior:
```html
<a href="../">Início</a>
<a href="../#sobre">Sobre nós</a>
```
☝️ Isso leva para OUTRA página. Início deve ficar na mesma página.

❌ ERRADO — nomes casuais e fora de ordem:
```html
<a href="#hero">Início</a>
<a href="#porque">Por quê?</a>  <!-- nome casual, seção fica lá embaixo -->
<a href="#incluido">Incluído</a>  <!-- nome vago -->
```

✅ CORRETO — nomes técnicos baseados nos H2, na ordem da página:
```html
<a href="#hero">Início</a>
<a href="#instalacoes">Sist. Hidráulicos</a>  <!-- 1ª seção = 1º item -->
<a href="#subestacoes">Subestações</a>         <!-- 2ª seção = 2º item -->
<a href="#diferenciais">Diferenciais</a>       <!-- 3ª seção = 3º item -->
<a href="#contato">Contato</a>                 <!-- último sempre -->
```
☝️ Nomes sérios, ordem correta, tudo aponta para seções internas.

---

## MENU MOBILE — FECHAR APÓS CLIQUE

Obrigatório: o menu mobile deve fechar automaticamente após clicar em link interno.

```js
// Fechar menu mobile ao clicar em link interno
document.querySelectorAll('#mobile-menu a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.add('hidden');
        document.getElementById('menu-icon').classList.remove('bi-x');
        document.getElementById('menu-icon').classList.add('bi-list');
        document.body.style.overflow = '';
    });
});
```

---

## CHECKLIST PRÉ-ENTREGA — NAVEGAÇÃO

- [ ] `html { scroll-behavior: smooth; }` presente
- [ ] Hero tem `id="hero"`
- [ ] Cada seção tem ID correspondente ao item do menu
- [ ] Menu desktop: "Início" aponta para `#hero` (NUNCA ../)
- [ ] Menu mobile: "Início" aponta para `#hero` (NUNCA ../)
- [ ] Nomes no menu = versões curtas dos H2 reais (máx 3 palavras, tom técnico)
- [ ] Ordem no menu = ordem EXATA das seções na página
- [ ] Nenhum nome casual: "Por quê?", "Benefícios", "Processo", "Incluído"
- [ ] Dropdown de serviços aponta para outras páginas de serviço
- [ ] Testado scroll suave em todos os links do menu
- [ ] Menu mobile fecha após clicar em link interno
