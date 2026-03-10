# 🚨 TROUBLESHOOTING - 403 Forbidden + Too Many Redirects

> **Status Atual:**
> - `puntoclicks.com` → Too many redirects
> - `j2s.puntoclicks.com` → 403 Forbidden
> - API bloqueada por CORS

---

## 🔍 DIAGNÓSTICO DOS PROBLEMAS

### **Erro 1: Too Many Redirects (puntoclicks.com)**

**Causa:** Loop de redirecionamento HTTPS no `.htaccess`

```
Cloudflare (HTTPS) → Servidor (HTTP)
      ↓
.htaccess força HTTPS novamente
      ↓
Cloudflare já está em HTTPS → LOOP INFINITO
```

**Como acontece:**
1. Usuário acessa: `https://puntoclicks.com`
2. Cloudflare em modo "Flexible" conecta ao servidor via HTTP
3. `.htaccess` vê `HTTPS=off` e força redirect para HTTPS
4. Volta ao passo 1 → LOOP INFINITO

**Solução:** Comentar redirecionamento HTTPS no `.htaccess` (JÁ FIZ)

---

### **Erro 2: 403 Forbidden (j2s.puntoclicks.com)**

**Causa:** Arquivo `index.html` NÃO está no servidor

```bash
# Console mostrou:
GET https://j2s.puntoclicks.com/index.html 404 (Not Found)
```

**Isso significa:**
- ❌ Pasta `dist/` NÃO foi enviada para o servidor
- ❌ Ou foi enviada para pasta errada
- ❌ Ou permissões estão bloqueando acesso

---

### **Erro 3: CORS Bloqueado (API)**

**Causa:** Headers CORS não estão sendo aplicados

```bash
# Console mostrou:
Access to fetch at 'https://puntoclicks.com/api/tenants/get.php?slug=j2s'
from origin 'https://j2s.puntoclicks.com' has been blocked by CORS policy
```

**Solução:**
1. `.htaccess` precisa ter `Header always set` (JÁ FIZ)
2. Ou adicionar headers diretamente nos arquivos PHP

---

## ✅ SOLUÇÃO COMPLETA (PASSO A PASSO)

### **Passo 1: Atualizar `.htaccess` no servidor**

Fazer upload do arquivo `.htaccess` atualizado para `public_html/`.

**Mudanças:**
- ✅ Comentado redirecionamento HTTPS (evita loop)
- ✅ Adicionado `Header always set` para CORS funcionar

### **Passo 2: Fazer Upload dos Arquivos do Build**

**Estrutura OBRIGATÓRIA no servidor:**

```
/home/uXXXXXXXXX/domains/puntoclicks.com/public_html/
├── index.html          ← dist/index.html (OBRIGATÓRIO)
├── assets/             ← dist/assets/ (TODA a pasta)
│   ├── index-C_GOeh6t.css
│   └── index-BWML2IsF.js
├── api/                ← Backend PHP
│   ├── tenants/
│   │   └── get.php
│   └── auth/
│       └── login-central.php
├── backend/            ← Legacy (opcional)
└── .htaccess           ← Arquivo atualizado
```

**⚠️ CRÍTICO:**
- O arquivo `index.html` PRECISA estar na RAIZ de `public_html/`
- A pasta `assets/` PRECISA estar na RAIZ de `public_html/`

### **Passo 3: Verificar Permissões**

Via File Manager ou SSH:

```bash
# Permissões corretas:
chmod 755 public_html/
chmod 755 public_html/assets/
chmod 644 public_html/index.html
chmod 644 public_html/assets/*
chmod 644 public_html/.htaccess
chmod 755 public_html/api/
```

**Via File Manager Hostinger:**
1. Clicar com direito no arquivo/pasta
2. "Change Permissions" ou "Permissões"
3. Arquivos: `644` (rw-r--r--)
4. Pastas: `755` (rwxr-xr-x)

### **Passo 4: Adicionar CORS nos Arquivos PHP (Backup)**

Se `.htaccess` não resolver, adicionar manualmente em CADA arquivo `.php` da API:

**Arquivo:** `backend/api/tenants/get.php`

```php
<?php
// CORS Headers (ADICIONAR NO TOPO, ANTES DE QUALQUER OUTPUT)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 3600');

// Se for OPTIONS (preflight), retornar 200 imediatamente
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Resto do código...
```

Fazer isso em TODOS os arquivos PHP da API:
- `/api/tenants/get.php`
- `/api/auth/login-central.php`
- `/api/usuarios/list.php`
- etc...

---

## 🧪 TESTES APÓS UPLOAD

### **Teste 1: Verificar se index.html existe**

No navegador (console F12):

```javascript
fetch('https://puntoclicks.com/index.html')
  .then(r => r.status === 200 ? console.log('✅ index.html OK') : console.log('❌ 404'))

fetch('https://j2s.puntoclicks.com/index.html')
  .then(r => r.status === 200 ? console.log('✅ index.html OK') : console.log('❌ 404'))
```

**Resultado esperado:** `✅ index.html OK`

---

### **Teste 2: Verificar API + CORS**

```javascript
fetch('https://puntoclicks.com/api/tenants/get.php?slug=j2s')
  .then(r => r.json())
  .then(data => console.log('✅ API OK:', data))
  .catch(e => console.error('❌ ERRO:', e))
```

**Resultado esperado:**
```json
{
  "success": true,
  "tenant": {
    "id": 1,
    "slug": "j2s",
    "nome": "J2S Construções",
    ...
  }
}
```

---

### **Teste 3: Acessar Landing Page**

```
https://puntoclicks.com
```

**Resultado esperado:** Hero section com fundo escuro e botão "Entrar"

---

### **Teste 4: Acessar Tenant J2S**

```
https://j2s.puntoclicks.com
```

**Resultado esperado:** App do tenant J2S carrega com branding

---

## 🔧 SE AINDA DER ERRO

### **Loop de Redirecionamento Persistente**

**Causa:** Cloudflare + .htaccess brigando

**Solução A:** Desabilitar Cloudflare temporariamente
1. Cloudflare → DNS → Mudar TODOS registros para **DNS only** (nuvem cinza)
2. Aguardar 2-3 minutos
3. Testar: `https://puntoclicks.com`

**Solução B:** Usar .htaccess vazio
1. Renomear `.htaccess` para `.htaccess.bak`
2. Criar novo `.htaccess` vazio
3. Testar se o loop some
4. Se sumir, o problema estava no `.htaccess`

---

### **403 Persistente Mesmo com index.html**

**Causa:** Mod_security ou permissões

**Solução A:** Verificar logs de erro
```bash
# Via SSH:
tail -f ~/logs/puntoclicks.com/error.log
```

**Solução B:** Desabilitar .htaccess temporariamente
```bash
mv .htaccess .htaccess.bak
```

Se funcionar sem `.htaccess` → problema está nas regras.

**Solução C:** Verificar se pasta `public_html/` tem `index.html`
```bash
ls -la public_html/index.html
# Deve mostrar: -rw-r--r-- ... index.html
```

---

### **CORS Persistente**

**Causa:** `.htaccess` não está sendo lido ou mod_headers desabilitado

**Solução:** Adicionar headers MANUALMENTE em cada arquivo `.php`:

```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
```

---

## 📋 CHECKLIST FINAL

Antes de considerar resolvido:

- [ ] `index.html` existe em `public_html/`
- [ ] Pasta `assets/` existe em `public_html/`
- [ ] `.htaccess` atualizado (sem forçar HTTPS)
- [ ] Permissões: 644 para arquivos, 755 para pastas
- [ ] Teste: `https://puntoclicks.com` → Landing page carrega
- [ ] Teste: `https://j2s.puntoclicks.com` → App carrega
- [ ] Teste: API retorna JSON sem erro CORS
- [ ] Cloudflare em modo "Flexible" ou "DNS only"

---

## 📞 SUPORTE

Se nada funcionar, verificar:
1. Hostinger → Painel → Websites → puntoclicks.com → "Error Logs"
2. Cloudflare → Analytics → verificar se requests estão chegando
3. SSH: `ls -la public_html/` → confirmar estrutura de arquivos

---

**Última Atualização:** 2026-03-10
