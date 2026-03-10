# REGRAS DE PERFORMANCE

---

## IMAGENS

✔ WebP ou AVIF obrigatório
✔ loading="lazy" fora do viewport | loading="eager" no hero
✔ width e height declarados em toda img (evita CLS)

---

## CARREGAMENTO

✔ skeleton loading via DaisyUI em todo conteúdo dinâmico
✔ nenhuma tela em branco em nenhum momento
✔ scripts com defer ou async
✔ evitar CSS render-blocking desnecessário

---

## FONTES

✔ <link rel="preload"> para fonte principal
✔ font-display: swap | máximo 1 família | Google Fonts com &subset=latin

---

## META DE QUALIDADE

✔ PageSpeed Insights: 90+ mobile e desktop
✔ Core Web Vitals: LCP < 2.5s | FID < 100ms | CLS < 0.1
