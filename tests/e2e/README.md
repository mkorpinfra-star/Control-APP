# Testes E2E (Playwright)

## Instalar (uma vez)
```bash
npm install -D @playwright/test
npx playwright install chromium
```

## Rodar
Contra a produção (padrão):
```bash
npx playwright test
```

Contra o dev local:
```bash
BASE_URL=http://localhost:5173 npx playwright test
```

Só um projeto (mobile ou desktop):
```bash
npx playwright test --project=mobile
npx playwright test --project=desktop
```

## Credenciais
Por padrão usa o admin de teste. Sobrescreva com variáveis de ambiente:
```bash
QA_EMAIL=seu@email.com QA_PASS=suaSenha npx playwright test
```

## O que cobrem
- `login.spec.js` — login válido/inválido e proteção de rota
- `smoke.spec.js` — navegação admin por todas as áreas sem erro de console + dashboard
- `contrato.spec.js` — criação de contrato ponta a ponta

> Observação: os seletores usam textos visíveis. Se a UI mudar, ajuste os seletores.
> Para robustez futura, adicionar atributos `data-testid` nos botões/inputs principais.
