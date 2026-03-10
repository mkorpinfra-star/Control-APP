# REGRAS DE CTA, TRACKING E CONVERSÃO

---

## CTA — PADRÃO OBRIGATÓRIO

Todo botão de conversão:
```html
class="facebookclick"
onclick="gtag_report_conversion(this.href); return true;"
```

Aplicar em: botões de contato | WhatsApp | links de conversão | submits

---

## GOOGLE ANALYTICS 4 (obrigatório)

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Eventos: page_view (auto) | generate_lead (formulário) | contact (WhatsApp) | click (CTAs)
~~⚠️ Inicializar apenas após aceite do banner de cookies.~~ → GA4 deve carregar imediatamente (sem banner de cookies)

---

## META PIXEL (se solicitado)

✔ PageView (auto) | Lead (formulário) | Contact (WhatsApp)
⚠️ Verificar se Pixel está instalado antes de usar facebookclick.
~~⚠️ Inicializar apenas após aceite de cookies.~~ → Pixel deve carregar imediatamente (sem banner de cookies)

---

## DESIGN DE CONVERSÃO

✔ CTA principal acima da dobra | CTA repetido a cada 2–3 seções
✔ urgência ou escassez apenas quando verdadeiro
