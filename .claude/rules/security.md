# REGRAS DE SEGURANÇA, FORMULÁRIOS E LGPD

---

## HEADERS HTTP OBRIGATÓRIOS

✔ Strict-Transport-Security: max-age=31536000; includeSubDomains
✔ X-Content-Type-Options: nosniff
✔ X-Frame-Options: SAMEORIGIN
✔ Referrer-Policy: strict-origin-when-cross-origin
✔ Content-Security-Policy (ajustar por projeto)

---

## CÓDIGO

✔ HTTPS em todos os ambientes
✔ validação de inputs no frontend e backend
✔ sanitização antes de qualquer output
✔ todo target="_blank" com rel="noopener noreferrer"
   Exceção: crédito guilhermesites.com.br → rel="noopener follow"

---

## VARIÁVEIS DE AMBIENTE

✔ credenciais nunca hardcoded | .env fora do webroot | sempre no .gitignore

```
SMTP_HOST=smtp.seuservidor.com
SMTP_PORT=587
SMTP_USER=email@dominio.com
SMTP_PASS=senha
SMTP_FROM=noreply@dominio.com
```

---

## FORMULÁRIOS

✔ validação frontend: HTML5 + JS nativo
✔ validação server-side obrigatória | sanitização completa
✔ honeypot field | rate limiting | desabilitar botão após submit

| Campo    | Formato             | Validação         |
|----------|---------------------|-------------------|
| Telefone | (XX) XXXXX-XXXX     | 10 ou 11 dígitos  |
| CEP      | XXXXX-XXX           | lookup via ViaCEP |
| CPF      | XXX.XXX.XXX-XX      | algoritmo mod 11  |
| CNPJ     | XX.XXX.XXX/XXXX-XX  | algoritmo mod 11  |

---

## PHPMAILER

✔ PHPMailer manual (nunca mail() nativo)
✔ SMTP autenticado | credenciais via .env
✔ email de confirmação ao usuário + notificação ao admin

---

## PLANO DE CONTINGÊNCIA — HIERARQUIA DE RESOLUÇÃO

Cada plano deve ser melhor ou igual ao anterior — nunca pior, nunca mais arriscado.

❌ Nunca trocar ferramenta segura por perigosa
❌ Nunca criar arquivo novo para resolver problema pontual
❌ Nunca usar bash/terminal como "diagnóstico rápido"
❌ Nunca perguntar "Opção A ou B?" quando a tarefa já está clara

Hierarquia Edit Tool:
Plano A → trecho exato
Plano B → bloco completo
Plano C → arquivo inteiro
Plano D → reportar + entregar conteúdo para colagem manual

Hierarquia Geral:
Plano A → abordagem direta
Plano B → abordagem mais ampla (mesma ferramenta)
Plano C → solução manual passo a passo
Nunca  → criar script ou arquivo auxiliar

Só escalar se: falhou 2+ vezes com estratégias diferentes.
Nunca escalar por preguiça, velocidade ou conveniência.

---

## LGPD (Lei 13.709/18)

Páginas obrigatórias: Política de Privacidade | Política de Cookies | Termos de Uso
Links no footer de todas as páginas — SEMPRE com `target="_blank" rel="noopener noreferrer"`.
URLs corretas das pastas:
  - `/politica-de-privacidade/` (criar pasta + index.html)
  - `/politica-de-cookies/` (criar pasta + index.html)
  - `/termos-de-uso/` (criar pasta + index.html)
🚨 A IA DEVE CRIAR as 3 páginas se não existirem. NUNCA dizer "pendência" ou "criar depois".

Conteúdo mínimo:
✔ identificação da empresa | finalidade dos dados
✔ direitos do titular | contato do DPO | base legal
✔ com quem os dados são compartilhados

---

## ~~BANNER DE COOKIES~~ — REMOVIDO

> 🚨 **NÃO CRIAR banner de cookies.** O banner interfere no tracking de conversão (GA4/Pixel).
> Se encontrar banner de cookies existente → REMOVER.

## PÁGINA 404 CUSTOMIZADA

✔ layout consistente | mensagem clara + CTA | link WhatsApp
✔ <meta name="robots" content="noindex, follow">

```apache
ErrorDocument 404 /404/index.html
```
