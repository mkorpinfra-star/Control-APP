# 🚨 LEIA PRIMEIRO - CONTEXTO DO PROJETO

> **Para qualquer agente IA trabalhando neste projeto:**
> Este documento contém informações CRÍTICAS. Leia antes de fazer qualquer alteração.

---

## 🎯 O QUE É ESTE PROJETO?

**PuntoClicks** - Plataforma SaaS White Label para gestão de horas/obras

### História Rápida:

```
ANTES: j2s.ad/login → Sistema single-tenant (J2S Hores)
AGORA: puntoclicks.com → SaaS multi-tenant (PuntoClicks)
```

**J2S Construções** era o cliente único, agora é o **tenant piloto** (`tenant_id = 1`).

---

## 📁 ONDE ESTÁ HOSPEDADO?

```bash
Servidor: Hostinger
Domínio principal: puntoclicks.com
Diretório: public_html/ (padrão)
```

**Estrutura:**
```
public_html/
├── index.html (Landing Page)
├── assets/ (React build)
├── api/ ← ⚠️ BACKEND CENTRALIZADO (todos os tenants usam)
│   ├── tenants/get.php ← CRÍTICO para branding
│   ├── auth/login-central.php
│   └── ... (todas as APIs)
└── backend/ (legacy, será consolidado)
```

---

## 🌐 DOMÍNIOS E SUBDOMÍNIOS

| URL                       | O que é?              |
|---------------------------|-----------------------|
| `puntoclicks.com`         | Landing Page          |
| `admin.puntoclicks.com`   | Admin Panel           |
| `j2s.puntoclicks.com`     | Tenant J2S            |
| `*.puntoclicks.com`       | Qualquer tenant novo  |

**REGRA CRÍTICA:**
```bash
✅ API: puntoclicks.com/api/ (CENTRALIZADA)
❌ NÃO existe: j2s.puntoclicks.com/api/
❌ NÃO existe: admin.puntoclicks.com/api/

Isolamento = tenant_id no banco, NÃO por pasta/domínio
```

---

## 🔐 MULTI-TENANT: COMO FUNCIONA?

1. **Frontend detecta tenant por subdomain:**
   - `j2s.puntoclicks.com` → busca tenant "j2s"
   - Faz request: `puntoclicks.com/api/tenants/get.php?slug=j2s`
   - Aplica branding (logo, cores)

2. **Backend valida tenant no JWT:**
   - Usuário faz login → JWT contém `tenant_id`
   - Toda API valida: `$auth = validateTenantAccess()`
   - Filtra queries: `WHERE tenant_id = ?`

3. **Banco de dados isola por tenant_id:**
   - Toda tabela tem coluna `tenant_id`
   - J2S = tenant_id 1
   - Cliente2 = tenant_id 2
   - Nunca cruzam dados

---

## ⚠️ PROBLEMAS COMUNS E SOLUÇÕES

### ❌ Erro SSL 525 (Cloudflare)

**Causa:** Cloudflare em "Proxied" mas servidor sem SSL ou incompatível

**Solução rápida (2 min):**
```
Cloudflare → SSL/TLS → Overview → Mudar para "Flexible"
```

**Solução definitiva:**
```
Hostinger → SSL → Ativar Let's Encrypt Wildcard SSL
Cloudflare → SSL/TLS → Mudar para "Full"
```

### ❌ Frontend não detecta tenant

**Causa:** Arquivo `/api/tenants/get.php` não existe ou CORS bloqueado

**Solução:**
1. Verificar arquivo existe: `public_html/api/tenants/get.php`
2. Testar API: `curl "https://puntoclicks.com/api/tenants/get.php?slug=j2s"`
3. Verificar `.env.production`: `VITE_API_URL=https://puntoclicks.com/api`

### ❌ Tenant não encontrado no banco

**Causa:** Migration não foi executada ou tenant não foi criado

**Solução:**
```sql
-- Verificar se J2S existe:
SELECT * FROM tenants WHERE slug = 'j2s';

-- Se não existir, executar:
-- database/migrations/001_multi_tenant.sql
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

Leia nesta ordem:

1. **`ARQUITETURA_PUNTOCLICKS.md`** ← Arquitetura completa
2. **`MULTI_TENANT_MIGRATION.md`** ← Detalhes da migração multi-tenant
3. **`CLAUDE.md`** ← Regras de desenvolvimento

---

## 🚀 DEPLOY CHECKLIST RÁPIDO

Antes de apontar domínio ou adicionar tenant:

- [ ] DNS: Wildcard `*` apontando para servidor
- [ ] SSL: Wildcard SSL ativo na Hostinger
- [ ] API: `/api/tenants/get.php` existe e funciona
- [ ] Build: `npm run build` → upload `dist/` para `public_html/`
- [ ] Banco: Migration executada + tenant J2S existe
- [ ] Teste: `https://j2s.puntoclicks.com` carrega sem erro

---

## 📞 CONTATO

**Desenvolvedor:** Guilherme Gomes
**Site:** https://guilhermesites.com.br

---

**Criado:** 2026-03-10
