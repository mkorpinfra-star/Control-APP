# PADRÕES GLOBAIS — WHATSAPP, RODAPÉ E CONSISTÊNCIA

---

## WHATSAPP (obrigatório em todo site)

✔ botão flutuante: fixed | bottom 24px | right 24px | z-index 9999
✔ mensagem pré-preenchida via URL encode
✔ QR code no rodapé
✔ classe facebookclick + gtag_report_conversion

URL: https://wa.me/55XXXXXXXXXXX?text=Ol%C3%A1%2C+vim+pelo+site+e+gostaria+de+mais+informa%C3%A7%C3%B5es.

---

## RODAPÉ PADRÃO

✔ mapa do cliente (Google Maps embed)
✔ QR code WhatsApp | contatos | ícones de redes sociais
✔ links legais: Política de Privacidade | Política de Cookies | Termos de Uso
✔ 🚨 ANO DO COPYRIGHT: SEMPRE dinâmico via JavaScript — formato ANO ATUAL – ANO SEGUINTE
  - Usar: `<span id="year"></span>` + script abaixo
  - Formato obrigatório: `© 2026 – 2027 Nome da Empresa` (ano atual – ano+1)
  - Isso dá distância temporal no copyright antes de precisar editar novamente
✔ 🚨 LINKS LEGAIS — REGRAS OBRIGATÓRIAS:
  - TODOS os links legais DEVEM ter `target="_blank" rel="noopener noreferrer"`
  - Os links são páginas que NÃO merecem foco total — abrir em aba separada
  - URLs obrigatórias:
    - `/politica-de-privacidade/` (NÃO é /privacidade/)
    - `/politica-de-cookies/` (NÃO é /cookies/)
    - `/termos-de-uso/` (NÃO é /termos/)
  - A IA DEVE criar TODAS as 3 páginas se não existirem — NUNCA deixar como pendência
✔ crédito:

```html
<div class="flex gap-4 text-xs text-gray-500">
  <a href="/politica-de-privacidade/" target="_blank" rel="noopener noreferrer" class="hover:text-red-600">Política de Privacidade</a>
  <span>|</span>
  <a href="/politica-de-cookies/" target="_blank" rel="noopener noreferrer" class="hover:text-red-600">Política de Cookies</a>
  <span>|</span>
  <a href="/termos-de-uso/" target="_blank" rel="noopener noreferrer" class="hover:text-red-600">Termos de Uso</a>
</div>
<p class="text-xs text-gray-500 mt-4">© <span id="year"></span> Nome da Empresa. Todos os direitos reservados.</p>
<script>
  const y = new Date().getFullYear();
  document.getElementById('year').textContent = y + ' \u2013 ' + (y + 1);
</script>

<a href="https://www.guilhermesites.com.br" target="_blank" rel="noopener follow">
  Desenvolvido por Guilherme Sites
</a>
```

---

## CONSISTÊNCIA GLOBAL (toda página deve conter)

✔ SEO completo (seo.md)
✔ skeleton loading (design.md seção 7)
✔ performance otimizada (performance.md)
✔ formulário ou CTA funcional
✔ layout horizontal (max-w-7xl — nunca max-w-4xl ou menor)
✔ tipografia em px conforme design.md seção 3 (nunca classes text-*)
✔ tracking (tracking.md)
~~✔ banner de cookies (security.md)~~ → REMOVIDO (interfere no tracking de conversão)
✔ links legais no footer
✔ botão WhatsApp flutuante
✔ crédito no rodapé
