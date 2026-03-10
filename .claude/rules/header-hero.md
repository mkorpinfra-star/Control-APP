# HEADER E HERO — PADRÃO OBRIGATÓRIO

Aplicar em TODOS os projetos.
Toda tipografia segue obrigatoriamente o typescale via @layer base (design.md seção 3).
❌ NUNCA usar classes Tailwind de tamanho (text-5xl, text-lg, etc.) — o @layer base já aplica os tamanhos corretos.

---

## 1. HEADER — NAVEGAÇÃO COM GLASS EFFECT

### 1.1 Estrutura Obrigatória

✔ position: fixed | z-index: 50
✔ backdrop-filter: blur(10px) (glass effect)
✔ bg-black/95 | border-b border-gray-800
✔ w-[92%] lg:w-[85%] max-w-[1800px] mx-auto — MESMO container das seções do corpo
✔ 🚨 **ALINHAMENTO OBRIGATÓRIO**: A logo do header DEVE estar alinhada verticalmente com o conteúdo do hero abaixo
  - O container do header DEVE ter o MESMO padding (ou zero padding) que o container do hero
  - Se o header usa `px-4` e o hero NÃO usa → a logo fica deslocada para a direita → REMOVER o `px-4` do header OU adicionar o mesmo `px-4` no hero
  - Regra: header container = hero container = body container → TODOS com MESMAS classes
  - Testar visualmente: a logo deve estar na mesma linha vertical que o H1 do hero

### 1.2 Logo Padrão

✔ link para / (home)
✔ texto principal: font-size 32.44px | font-weight 800 | letter-spacing: -3px | cor primária
✔ subtexto linha 1: font-size 18px | font-weight 300
✔ subtexto linha 2: font-size 12.64px | font-weight 300 | text-gray-400

```html
<a href="../#" class="flex items-center group">
  <span class="text-[#CE0201] group-hover:text-glow transition-all"
        style="font-size: 32.44px; font-weight: 800; letter-spacing: -3px;">J2S</span>
  <div class="flex flex-col ml-2">
    <span class="text-white" style="font-size: 18px; font-weight: 300;">Engenharia</span>
    <span class="text-gray-400 -mt-1" style="font-size: 12.64px; font-weight: 300;">& Instalações</span>
  </div>
</a>
```

### 1.3 Menu Desktop (hidden md:flex)

✔ space-x-8 entre itens
✔ itens: font-size 16px | font-weight 400
✔ hover com linha inferior animada (span bottom-0, w-0 → w-full)
✔ dropdown nos serviços:
  - bg-zinc-900/95 backdrop-blur-md | border border-gray-800 | rounded-lg | w-72
  - opacity-0 invisible → opacity-100 visible no hover
  - ícones Bootstrap Icons na cor primária
  - itens dropdown: font-size 14.22px | font-weight 400

```html
<div class="relative group">
  <a href="../#servicos"
     class="text-gray-200 hover:text-red-500 transition relative py-2 flex items-center"
     style="font-size: 16px; font-weight: 400;">
    Serviços
    <i class="bi bi-chevron-down ml-1 text-xs transition-transform group-hover:rotate-180"></i>
    <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
  </a>
  <div class="absolute left-0 mt-2 w-72 bg-zinc-900/95 backdrop-blur-md rounded-lg border border-gray-800 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
    <!-- itens do dropdown -->
  </div>
</div>
```

### 1.4 Language Switcher (PERGUNTAR ANTES)

SEMPRE perguntar: "Este projeto precisa de seletor de idiomas? Quais idiomas?"

Se SIM:

### 🚨 TABELA DE FLAGS — CÓDIGOS EXATOS (NUNCA INVENTAR)

| Idioma    | Código | URL flagcdn                      | Rótulo |
|-----------|--------|----------------------------------|--------|
| Português | **br** | `https://flagcdn.com/br.svg`     | PT     |
| English   | **us** | `https://flagcdn.com/us.svg`     | EN     |
| Español   | **es** | `https://flagcdn.com/es.svg`     | ES     |
| Français  | **fr** | `https://flagcdn.com/fr.svg`     | FR     |
| Catalá    | **ad** | `https://flagcdn.com/ad.svg`     | CA     |

❌ `ad.svg` é ANDORRA 🇦🇩 (catalão) — NUNCA usar para português!
❌ `pt.svg` é PORTUGAL 🇵🇹 — NUNCA usar para português brasileiro!
✔ Português BR = SEMPRE `br.svg` 🇧🇷

### 🚨 BOTÃO VISÍVEL = IDIOMA DA PÁGINA ATUAL

| Domínio   | Botão (visível)      | Dropdown (outros idiomas)  |
|-----------|----------------------|----------------------------|
| `.br/`    | `br.svg` + "PT"      | EN, ES (SEM PT)            |
| `.es/`    | `es.svg` + "ES"      | PT, EN (SEM ES)            |
| `.com/`   | `us.svg` + "EN"      | PT, ES (SEM EN)            |

❌ PROIBIDO: botão mostra bandeira diferente do idioma da página
❌ PROIBIDO: repetir o idioma da página dentro do dropdown

✔ dropdown estilo menu de serviços | w-40
✔ flags: width="22" height="16" | border border-gray-700 rounded-sm
✔ rótulo: font-size 14.22px

```html
<!-- EXEMPLO PARA PÁGINA .br/ (português brasileiro) -->
<div class="relative group">
  <!-- BOTÃO: mostra BR porque a página É brasileira -->
  <button class="flex items-center gap-2 text-gray-300 hover:text-white focus:outline-none pr-2">
    <img src="https://flagcdn.com/br.svg" width="22" height="16" alt="Português" class="rounded-sm border border-gray-700">
    <span style="font-size: 14.22px;">PT</span>
    <i class="bi bi-chevron-down text-xs transition-transform group-hover:rotate-180"></i>
  </button>
  <!-- DROPDOWN: só EN e ES (NÃO inclui PT pois a página JÁ é PT) -->
  <div class="absolute right-0 mt-2 w-40 bg-zinc-900/95 backdrop-blur-md rounded-lg border border-gray-800 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
    <a href="URL_EN" class="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-zinc-800 hover:text-white">
      <img src="https://flagcdn.com/us.svg" width="22" height="16" alt="English" class="rounded-sm border border-gray-700">
      <span style="font-size: 14.22px;">English</span>
    </a>
    <a href="URL_ES" class="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-zinc-800 hover:text-white">
      <img src="https://flagcdn.com/es.svg" width="22" height="16" alt="Español" class="rounded-sm border border-gray-700">
      <span style="font-size: 14.22px;">Español</span>
    </a>
  </div>
</div>
```

Se NÃO → pular completamente o language switcher.

### 1.5 CTA no Header (Desktop)

✔ button-gradient | rounded-full px-6 py-2
✔ ícone WhatsApp + texto: font-size 16px | font-weight 400
✔ classe facebookclick + onclick="gtag_report_conversion(this.href); return true;"

### 1.6 Menu Mobile (md:hidden)

✔ hambúrguer: bi-list | z-[100000]
✔ menu fullscreen: fixed inset-0 bg-zinc-950 z-[99999] overflow-y-auto
✔ header interno com logo + botão fechar (bi-x-lg)
✔ itens do menu: font-size 18px | font-weight 300
✔ itens de dropdown: font-size 16px | font-weight 400
✔ footer mobile com CTA: font-size 14.22px

```js
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuClose = document.getElementById('mobile-menu-close');
const menuIcon = document.getElementById('menu-icon');

menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
  menuIcon.classList.toggle('bi-list');
  menuIcon.classList.toggle('bi-x');
  document.body.style.overflow = mobileMenu.classList.contains('hidden') ? '' : 'hidden';
});

mobileMenuClose.addEventListener('click', () => {
  mobileMenu.classList.add('hidden');
  menuIcon.classList.remove('bi-x');
  menuIcon.classList.add('bi-list');
  document.body.style.overflow = '';
});

const servicesToggle = document.getElementById('mobile-services-toggle');
const servicesDropdown = document.getElementById('mobile-services-dropdown');
const servicesIcon = document.getElementById('mobile-services-icon');

servicesToggle.addEventListener('click', () => {
  servicesDropdown.classList.toggle('hidden');
  servicesIcon.classList.toggle('bi-chevron-down');
  servicesIcon.classList.toggle('bi-chevron-up');
});
```

---

## 2. HERO SECTION — VÍDEO/IMAGEM COM OVERLAY

### 2.1 Estrutura Obrigatória

✔ min-h-screen | relative overflow-hidden | flex items-center

### 2.2 Background (PERGUNTAR ANTES)

SEMPRE perguntar: "Você quer vídeo ou imagem de fundo no hero?"

Se VÍDEO:
```html
<video autoplay loop muted playsinline class="absolute w-full h-full object-cover" style="object-position: 65% center;">
  <source src="caminho/video.mp4" type="video/mp4">
</video>
```

Se IMAGEM:
```html
<img src="caminho/imagem.webp" alt="Descrição" class="absolute w-full h-full object-cover" style="object-position: center;" loading="eager">
```

### 2.3 Overlay Obrigatório (Estilo Netflix)

```html
<div class="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40 z-10"></div>
```

✔ background em z-0 | overlay em z-10 | conteúdo em z-20

### 2.4 Conteúdo (esquerda)

✔ w-[92%] lg:w-[85%] max-w-[1800px] mx-auto relative z-20 | max-w-2xl no wrapper interno

🚨 **ALINHAMENTO CRÍTICO — O TEXTO DA HERO DEVE ALINHAR COM A LOGO E AS SEÇÕES ABAIXO**

> O container do conteúdo da hero DEVE ser IDÊNCO ao container do header e das seções do corpo.
> Se o H1 da hero começa mais à esquerda ou mais à direita que a logo → **VIOLAÇÃO GRAVE**.

**Regras obrigatórias:**
- O container da hero DEVE usar `w-[92%] lg:w-[85%] max-w-[1800px] mx-auto` — EXATAMENTE igual ao header e às seções
- NUNCA usar `container mx-auto px-6` — isso cria largura diferente e desalinha
- NUNCA usar `px-4`, `px-6`, `px-8` no container da hero se o header NÃO tem o mesmo padding
- Se a `<section>` da hero tiver `px-4` mas a `<section>` abaixo não → REMOVER o `px-4` da hero OU adicionar nas outras
- **MOBILE**: o texto da hero DEVE ter o mesmo respiro lateral que a logo e as seções abaixo. Se o texto cola na borda da tela → o container `w-[92%]` já garante 2% de margem em cada lado
- **TESTE VISUAL**: traçar uma linha vertical imaginaria na borda esquerda da logo → o H1 da hero DEVE começar na MESMA posição → o H2 da primeira seção TAMBÉM

**Erros comuns que causam desalinhamento:**
1. Hero usa `<div class="container mx-auto px-6">` enquanto seções usam `w-[92%] lg:w-[85%]`
2. Hero tem padding extra (`px-4`) que as outras seções não têm
3. Hero usa width diferente (`w-full`, `w-[90%]`) do padrão
4. A `<section>` da hero tem `px-*` mas as seções do corpo não

✔ estrutura: breadcrumb → h1 → subtítulo 1 → subtítulo 2 → CTAs

```html
<!-- CORRETO — hero alinhado com logo e seções -->
<div class="w-[92%] lg:w-[85%] max-w-[1800px] mx-auto relative z-20">
  <div class="text-left max-w-2xl">
    <!-- breadcrumb + h1 + subtítulos + CTAs aqui -->
  </div>
</div>

<!-- ERRADO — desalinha do header -->
<!-- <div class="container mx-auto px-6 relative z-20"> -->

### 2.5 Breadcrumb

```html
<nav class="mb-6">
  <ol class="flex items-center space-x-2" style="font-size: 14.22px;">
    <li><a href="../" class="text-gray-400 hover:text-red-500 transition">Início</a></li>
    <li><i class="bi bi-chevron-right text-xs text-gray-400"></i></li>
    <li><a href="../#servicos" class="text-gray-400 hover:text-red-500 transition">Serviços</a></li>
    <li><i class="bi bi-chevron-right text-xs text-gray-400"></i></li>
    <li class="text-red-500" style="font-size: 14.22px;">Nome do Serviço</li>
  </ol>
</nav>
```

### 2.6 H1 (Título Principal)

✔ font-size: 32.44px (via @layer base) | font-weight: 800 (extrabold) | line-height: 1.2 | letter-spacing: 0.02em
✔ cor: text-white | mb-6 | máximo 2 linhas
✔ palavras-chave em span na cor primária
✔ NUNCA colocar style inline nem classes Tailwind de tamanho — o @layer base aplica automaticamente

```html
<h1 class="text-white mb-6">
  Instalações Elétricas para <span class="text-red-500">Indústrias</span>
</h1>
```

### 2.7 Subtítulos

✔ Ambos os parágrafos: font-size 16px | font-weight 400 | line-height 1.6 | letter-spacing 0.04em | text-gray-300
✔ Subtítulo 1: mb-3 (dor + solução)
✔ Subtítulo 2: mb-8 (benefício adicional)

```html
<p class="text-gray-300 mb-3"
   style="font-size: 16px; font-weight: 400; line-height: 1.6; letter-spacing: 0.04em;">
  Subtítulo 1 — dor + solução em até 2 linhas.
</p>
<p class="text-gray-300 mb-8"
   style="font-size: 16px; font-weight: 400; line-height: 1.6; letter-spacing: 0.04em;">
  Subtítulo 2 — benefício adicional.
</p>
```

### 2.8 CTAs (2 botões)

```html
<div class="flex flex-col sm:flex-row gap-4">
  <a href="../#contato"
     class="facebookclick button-gradient px-8 py-4 rounded-lg inline-flex items-center justify-center transition shadow-lg hover:shadow-red-600/30"
     style="font-size: 16px; font-weight: 400;"
     onclick="gtag_report_conversion(this.href); return true;">
    <i class="bi bi-whatsapp mr-2"></i>
    Solicitar orçamento gratuito
  </a>
  <a href="tel:+55XXXXXXXXXXX"
     class="facebookclick bg-white/10 backdrop-blur-sm border border-white/30 px-8 py-4 rounded-lg inline-flex items-center justify-center hover:bg-white/20 transition text-white"
     style="font-size: 16px; font-weight: 400;"
     onclick="gtag_report_conversion(this.href); return true;">
    <i class="bi bi-headset mr-2"></i>
    Falar com especialista
  </a>
</div>
```

🚨 **CONTATOS PLACEHOLDER — PROIBIDO**
- NUNCA usar tel:+5511999999999 ou números fictícios nos CTAs
- NUNCA usar wa.me/5511999999999 no WhatsApp flutuante
- Se o usuário não forneceu telefone/WhatsApp → BUSCAR no site existente (home ou contato)
- Se não encontrar em lugar nenhum → PERGUNTAR ao usuário antes de continuar
- Regra: é preferível deixar href="#contato" do que colocar número fake

---

## 3. CSS OBRIGATÓRIO

```css
.button-gradient {
  background: linear-gradient(135deg, #D50405 0%, #AB0304 100%);
  color: #ffffff;
}
.button-gradient:hover {
  background: linear-gradient(135deg, #AB0304 0%, #8B0303 100%);
}
.glass-effect {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
```

IMPORTANTE: Trocar #D50405 e #AB0304 pela cor primária do projeto.

---

## 4. RESPONSIVIDADE

✔ desktop: logo, menu horizontal, language switcher (se aplicável), CTA
✔ mobile (< md): logo reduzido, hambúrguer, menu fullscreen
✔ hero: CTAs em coluna no mobile → sm:flex-row no desktop

---

## 5. ACESSIBILIDADE

✔ foco visível em todos os botões e links
✔ aria-label="Abrir menu" no botão hambúrguer
✔ aria-expanded nos dropdowns
✔ navegação por teclado funcional

---

## 6. CHECKLIST HEADER/HERO

✔ glass effect no header funcionando
✔ dropdown de serviços com todos os itens
✔ language switcher (se aplicável) funcional
✔ CTA no header com facebookclick + gtag_report_conversion
✔ menu mobile fullscreen funcional
✔ breadcrumb correto no hero
✔ vídeo/imagem carregando | overlay gradiente aplicado
✔ 2 CTAs no hero com tracking
✔ nenhuma classe text-* de tamanho — todos em font-size px
✔ responsividade: 360px, 768px, 1024px

---

## 7. PERGUNTAS OBRIGATÓRIAS AO INICIAR

Sempre perguntar antes de qualquer implementação:

1. "Este projeto precisa de seletor de idiomas?"
   → Se sim: "Quais idiomas?"
   → Se não: pular language switcher

2. "Você quer vídeo ou imagem de fundo no hero?"
   → Se vídeo: solicitar URL do .mp4
   → Se imagem: solicitar URL do .webp

3. "Qual é a cor primária do projeto?" (#XXXXXX)

Nunca assumir. Sempre perguntar.
