# MKORP Control

App que conecta equipes de campo, gestores e almoxarifado: ponto eletrônico com GPS, ordens de serviço, registro de campo com fotos, requisição e movimentação de materiais.

- **Front/app:** React 19 + Vite 7 + Tailwind 4, empacotado para Android com Capacitor 8 (`br.com.mkorp.solutions`, target API 36)
- **Backend:** Supabase (Auth, Postgres com RLS por papel, Storage, Edge Functions em `supabase/functions`)

## Rodar
```bash
npm ci
cp .env.example .env        # URL e chave anon do Supabase
npm run dev
```

## Testes
```bash
npm run lint
npm run test:unit
# API, Edge Functions e E2E rodam contra um Supabase LOCAL com dados fictícios: veja tests/local/README.md
```

## Android
```bash
cp .env.example .env.production
npm run build:android && npx cap open android   # Android Studio Otter+, JDK 21
```

## Documentação
- `docs/DEPLOY-PLAY.md` — passo a passo para banco, funções, site e Google Play
- `docs/QA-AUDITORIA-PLAY-STORE.md` — auditoria, problemas corrigidos e pendências
