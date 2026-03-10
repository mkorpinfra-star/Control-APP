# REGRAS DE LAYOUT E LARGURA — PADRÃO DE CONTAINERS

---

## 🚨 PRINCÍPIO CENTRAL

> O conteúdo ocupa ~78% da viewport em desktop.
> ~22% de espaço lateral (11% cada lado) para respiro visual.
> Em telas menores, o conteúdo ocupa proporcionalmente mais.

---

## CONTAINER PADRÃO — CLASSE OBRIGATÓRIA

```
w-[92%] lg:w-[85%] max-w-[1800px] mx-auto
```

### Por que esta abordagem:
- `w-[92%]`: mobile/tablet → conteúdo ocupa 96%, 4% de respiro (mais largo no mobile)
- `lg:w-[85%]`: desktop → conteúdo ocupa 85%, 15% de respiro
- `max-w-[1800px]`: cap para monitores ultra-wide (não esticar infinitamente)
- `mx-auto`: centralizado

### Responsividade automática:
| Viewport       | Largura conteúdo | Respiro lateral |
|----------------|------------------|-----------------|
| Mobile (375px) | 345px (92%)      | 30px total      |
| Tablet (768px) | 706px (92%)      | 62px total      |
| Desktop (1280px)| 998px (78%)     | 282px total     |
| Desktop (1440px)| 1123px (78%)    | 317px total     |
| Full HD (1920px)| 1498px (78%)   | 422px total     |
| Ultra-wide     | 1800px (cap)     | variável        |

---

## ONDE APLICAR

TODAS as seções da página usam o mesmo container. Sem exceção.

### Header
```html
<header class="fixed w-full z-50 bg-black/95 backdrop-blur-md">
  <div class="w-[92%] lg:w-[85%] max-w-[1800px] mx-auto py-3">
    <!-- conteúdo -->
  </div>
</header>
```

### Hero
```html
<section class="relative min-h-screen flex items-center">
  <div class="w-[92%] lg:w-[85%] max-w-[1800px] mx-auto relative z-20">
    <div class="text-left max-w-2xl">
      <!-- texto SEMPRE alinhado à esquerda -->
    </div>
  </div>
</section>
```

### Seções de conteúdo
```html
<section class="py-16 bg-white">
  <div class="w-[92%] lg:w-[85%] max-w-[1800px] mx-auto">
    <div class="text-left mb-20">
      <h2>...</h2>
      <p>...</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- conteúdo -->
    </div>
  </div>
</section>
```

### Footer
```html
<footer class="py-8 bg-gray-900">
  <div class="w-[92%] lg:w-[85%] max-w-[1800px] mx-auto">
    <!-- conteúdo -->
  </div>
</footer>
```

~~### Banner de Cookies~~ — REMOVIDO
> 🚨 NÃO criar banner de cookies — interfere no tracking de conversão.

---

## PROIBIÇÕES

❌ NUNCA usar `max-w-7xl` como container principal (limita a 1280px = muito estreito)
❌ NUNCA usar `max-w-6xl`, `max-w-5xl`, `max-w-4xl` como wrapper
❌ NUNCA usar `container` do Tailwind (largura inconsistente por breakpoint)
❌ NUNCA usar largura diferente entre seções (desalinha verticalmente)
❌ NUNCA centralizar texto do hero (`text-center` proibido no hero)

---

## 🚨 LAYOUTS PROIBIDOS — NUNCA CRIAR

### ❌ TIMELINE VERTICAL / STEPS VERTICAIS
Nunca criar seções com layout vertical tipo "linha do tempo" com bolhas conectadas por linhas.
Processo e etapas DEVEM usar grid horizontal (3-4 colunas com cards numerados).

```html
<!-- ❌ ERRADO — vertical timeline com bolhas -->
<div class="space-y-8">
  <div class="flex items-start gap-4">
    <div class="bg-red-600 rounded-full w-10 h-10">1</div>
    <div>Etapa 1</div>
  </div>
  <div class="flex items-start gap-4">
    <div class="bg-red-600 rounded-full w-10 h-10">2</div>
    <div>Etapa 2</div>
  </div>
</div>

<!-- ✔ CORRETO — grid horizontal com cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  <div class="bg-white/5 rounded-xl p-8 border border-gray-800">
    <span class="text-red-600 text-4xl font-bold">01</span>
    <h3>Etapa 1</h3>
    <p>Descrição</p>
  </div>
  <!-- ... mais cards -->
</div>
```

### ❌ ZIG-ZAG COM FUNDO PRETO
Nunca criar seções onde itens alternam esquerda/direita com fundo preto entre eles.
Use grid com cards uniformes em fundo BRANCO ou seção padrão com alternância clara.

### ❌ LISTA COMPLETAMENTE VERTICAL
Nunca empilhar conteúdo numa coluna vertical infinita. Desktop SEMPRE deve usar grid 2-4 colunas.

---

## ALINHAMENTO HERO

✔ Texto SEMPRE alinhado à esquerda: `text-left`
✔ Bloco de texto limitado: `max-w-2xl` (dentro do container, não no container)
✔ CTAs alinhados à esquerda com o texto

```html
<!-- CORRETO -->
<div class="w-[92%] lg:w-[85%] max-w-[1800px] mx-auto relative z-20">
  <div class="text-left max-w-2xl">
    <h1 class="font-extrabold text-white">Título</h1>
    <p class="text-lg text-gray-200 mt-4">Subtítulo</p>
    <div class="flex gap-4 mt-8">
      <a href="#" class="btn">CTA 1</a>
      <a href="#" class="btn">CTA 2</a>
    </div>
  </div>
</div>

<!-- ERRADO -->
<div class="max-w-7xl mx-auto text-center"> ❌
  <h1>Texto centralizado num container estreito</h1> ❌
</div>
```

---

## LOGO NO HEADER

> 🚨 REGRA ABSOLUTA: **NÃO MEXER NA LOGO.**
> Se a logo já tem qualquer estilo (inline px, classes Tailwind, CSS inline),
> foi proposital. Não alterar tamanho, font-size, classes, nem inline styles da logo.
> Isso vale para auditoria, criação de página, e qualquer outra tarefa.
> A logo é a ÚNICA exceção onde inline px é aceitável.

```html
<!-- CORRETO -->
<a href="../" class="flex items-center group">
  <span class="text-red-600 text-4xl font-bold">MARCA</span>
  <div class="flex flex-col ml-2">
    <span class="text-white text-lg">Nome</span>
    <span class="text-gray-400 text-xs -mt-1">Complemento</span>
  </div>
</a>

<!-- ERRADO -->
<span style="font-size: 32.44px; font-weight: 800;">MARCA</span> ❌
```

---

## EQUILÍBRIO IMAGEM × TEXTO EM LAYOUTS DIVIDIDOS

> Quando uma seção tem texto de um lado e imagem do outro,
> a imagem NUNCA pode ser visualmente maior/mais alta que o bloco de texto.
> O conteúdo textual e a imagem devem ter proporção equilibrada.

### Regra de proporção em grids de 2 colunas:

✔ Grid: `grid-cols-1 lg:grid-cols-2 gap-12 items-center`
✔ `items-center` obrigatório — alinha verticalmente no meio
✔ Imagem com `max-h-[400px]` ou `max-h-[500px]` para limitar altura
✔ Imagem com `object-cover rounded-xl` para manter proporção
✔ Imagem com `w-full` para preencher a coluna

```html
<!-- CORRETO — imagem proporcional ao texto -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
  <div>
    <h2 class="text-gray-900 mb-6">
      Título com <span class="text-red-600">destaque</span>
    </h2>
    <p class="text-gray-600 mb-6">Parágrafo explicativo...</p>
    <ul class="space-y-4">
      <li>✔ Item 1</li>
      <li>✔ Item 2</li>
      <li>✔ Item 3</li>
    </ul>
  </div>
  <div>
    <img src="foto.webp" alt="descrição"
         class="w-full max-h-[450px] object-cover rounded-xl shadow-lg"
         loading="lazy">
  </div>
</div>

<!-- ERRADO — imagem gigante esmagando o texto -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
  <div>
    <h3>Título pequeno</h3>
    <p>Texto curto</p>
  </div>
  <div>
    <img src="foto.webp" class="w-full"> ❌ sem max-h, sem items-center
  </div>
</div>
```

### Checklist de proporção:
✔ Imagem NUNCA ultrapassa 500px de altura em layout lado-a-lado
✔ `items-center` no grid para alinhar verticalmente
✔ Se o texto ocupa ~300px de altura, a imagem deve ter ~300-400px (não 600px)
✔ `object-cover` para a imagem não distorcer
✔ `rounded-xl` para suavizar as bordas
✔ Imagem e texto devem "conversar" visualmente — equilíbrio

❌ NUNCA deixar imagem 2x mais alta que o texto ao lado
❌ NUNCA imagem sem `max-h` em layout de 2 colunas
❌ NUNCA grid sem `items-center` quando tem texto + imagem

---

## REGRA DE AUDITORIA

Ao auditar/criar página, verificar:
✔ TODOS os containers usam `w-[92%] lg:w-[85%] max-w-[1800px] mx-auto`
✔ Nenhum container usa `max-w-7xl` como wrapper principal
✔ Hero com texto à esquerda (`text-left`)
✔ Hero com `max-w-2xl` no bloco de texto (não no container)
✔ Logo usa classes Tailwind (não inline px)
✔ Todas as seções têm a MESMA largura (alinhamento vertical)

Se encontrar violação → corrigir imediatamente.

---

## DETECÇÃO DE VIOLAÇÕES

```bash
# Detectar max-w-7xl em containers principais
grep -n "max-w-7xl" arquivo.html

# Detectar inline px no logo
grep -n 'font-size:' arquivo.html

# Detectar hero centralizado
grep -n 'text-center' arquivo.html
```
