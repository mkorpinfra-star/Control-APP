# 🚨 SOLUÇÃO DEFINITIVA - 403 FORBIDDEN

## 📊 STATUS ATUAL (Baseado nos Testes):

```
❌ j2s.puntoclicks.com → 403 Forbidden
❌ puntoclicks.com/index.html → 301 Redirect (ainda redirecionando)
❌ API CORS → Bloqueado (headers não estão funcionando)
```

---

## 🎯 PROBLEMA RAIZ:

**O arquivo `index.html` NÃO está no servidor.**

Quando você rodou `fetch('https://j2s.puntoclicks.com/')`, deu **403**.
Quando testou `fetch('https://puntoclicks.com/index.html')`, deu **301 redirect**.

**Isso significa:**
1. ❌ A pasta `dist/` **NÃO foi enviada** para o servidor
2. ❌ Ou foi enviada para pasta **errada**
3. ❌ Ou o servidor está vendo pasta vazia

---

## ✅ SOLUÇÃO (PASSO A PASSO DETALHADO):

### **Passo 1: Verificar Estrutura Atual no Servidor**

Conectar via **File Manager** ou **SSH** da Hostinger:

```bash
# Caminho correto:
/home/u123456789/domains/puntoclicks.com/public_html/
```

**Estrutura ATUAL (provavelmente INCORRETA):**
```
public_html/
├── api/ (existe)
├── backend/ (existe)
└── .htaccess (existe)
❌ index.html (NÃO EXISTE!)
❌ assets/ (NÃO EXISTE!)
```

**Estrutura CORRETA (que deveria ter):**
```
public_html/
├── index.html          ← dist/index.html (OBRIGATÓRIO!)
├── assets/             ← dist/assets/ (OBRIGATÓRIO!)
│   ├── index-C_GOeh6t.css
│   └── index-BWML2IsF.js
├── api/
├── backend/
└── .htaccess
```

---

### **Passo 2: Fazer Upload CORRETO dos Arquivos**

#### **Via File Manager Hostinger:**

1. **Ir para:** File Manager → `/domains/puntoclicks.com/public_html/`

2. **Upload do `index.html`:**
   - Clicar em **"Upload"**
   - Selecionar: `C:\Users\Guilherme\Desktop\app-cassio\dist\index.html`
   - ✅ Confirmar que foi para `public_html/index.html` (RAIZ)

3. **Upload da pasta `assets/`:**
   - Clicar em **"Upload"**
   - Selecionar TODA a pasta: `C:\Users\Guilherme\Desktop\app-cassio\dist\assets\`
   - ✅ Confirmar que foi para `public_html/assets/` (RAIZ)

4. **Upload do `.htaccess` atualizado:**
   - Clicar em **"Upload"**
   - Selecionar: `C:\Users\Guilherme\Desktop\app-cassio\.htaccess`
   - ✅ Substituir o arquivo existente

5. **Upload da API atualizada:**
   - Clicar em **"Upload"**
   - Selecionar: `C:\Users\Guilherme\Desktop\app-cassio\backend\api\tenants\get.php`
   - ✅ Substituir o arquivo existente em `public_html/api/tenants/get.php`

#### **Via FTP/FileZilla:**

1. **Conectar:**
   - Host: `ftp.puntoclicks.com`
   - Usuário: (seu usuário Hostinger)
   - Senha: (sua senha Hostinger)
   - Porta: 21

2. **Navegar para:** `/domains/puntoclicks.com/public_html/`

3. **Arrastar arquivos:**
   - `dist/index.html` → `public_html/index.html`
   - `dist/assets/` (PASTA INTEIRA) → `public_html/assets/`
   - `.htaccess` → `public_html/.htaccess` (substituir)
   - `backend/api/tenants/get.php` → `public_html/api/tenants/get.php`

---

### **Passo 3: Verificar Permissões (CRÍTICO)**

Via File Manager:

1. Clicar com direito em `index.html` → **"Change Permissions"**
   - ✅ Marcar: `644` (rw-r--r--)

2. Clicar com direito na pasta `assets/` → **"Change Permissions"**
   - ✅ Marcar: `755` (rwxr-xr-x)

3. Clicar com direito em `assets/index-C_GOeh6t.css` → **"Change Permissions"**
   - ✅ Marcar: `644`

4. Clicar com direito em `assets/index-BWML2IsF.js` → **"Change Permissions"**
   - ✅ Marcar: `644`

5. Clicar com direito em `.htaccess` → **"Change Permissions"**
   - ✅ Marcar: `644`

---

### **Passo 4: Limpar Cache do Cloudflare**

1. Ir para: **Cloudflare → Caching → Configuration**
2. Clicar em: **"Purge Everything"**
3. Confirmar purge
4. Aguardar 30 segundos

---

### **Passo 5: Testar Novamente**

**Teste 1: Verificar se `index.html` agora existe:**

```javascript
fetch('https://puntoclicks.com/index.html')
  .then(r => console.log(r.status === 200 ? '✅ OK' : '❌ ERRO:', r.status))

fetch('https://j2s.puntoclicks.com/index.html')
  .then(r => console.log(r.status === 200 ? '✅ OK' : '❌ ERRO:', r.status))
```

**Resultado esperado:** `✅ OK` para ambos

---

**Teste 2: Verificar API com CORS:**

```javascript
fetch('https://puntoclicks.com/api/tenants/get.php?slug=j2s')
  .then(r => r.json())
  .then(d => console.log('✅ API OK:', d))
  .catch(e => console.error('❌ ERRO:', e))
```

**Resultado esperado:**
```json
{
  "success": true,
  "tenant": {
    "id": 1,
    "slug": "j2s",
    "nome": "J2S Construções"
  }
}
```

---

**Teste 3: Acessar Domínios:**

1. **https://puntoclicks.com** → Landing page moderna (fundo escuro)
2. **https://j2s.puntoclicks.com** → App do tenant J2S

---

## 🔍 SE AINDA DER 403 APÓS UPLOAD CORRETO:

### **Diagnóstico Avançado:**

#### **1. Verificar se arquivo realmente existe via terminal:**

Via SSH Hostinger:
```bash
cd ~/domains/puntoclicks.com/public_html/
ls -la index.html
# Deve mostrar: -rw-r--r-- ... index.html
```

Se não mostrar o arquivo → **upload falhou**.

#### **2. Verificar error logs:**

```bash
tail -f ~/logs/puntoclicks.com/error.log
```

Acessar `https://j2s.puntoclicks.com` enquanto monitora o log.

Erros comuns:
- `403 Forbidden: You don't have permission` → Permissões incorretas
- `File does not exist` → Arquivo não foi enviado
- `mod_security` → Mod_security bloqueando

#### **3. Desabilitar `.htaccess` temporariamente:**

```bash
mv .htaccess .htaccess.bak
```

Testar: `https://j2s.puntoclicks.com`

- Se funcionar sem `.htaccess` → problema está nas regras
- Se continuar 403 → problema é permissões ou ausência do arquivo

#### **4. Criar `index.html` de teste diretamente no servidor:**

Via File Manager → Criar novo arquivo `test.html`:

```html
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><h1>Test OK</h1></body>
</html>
```

Acessar: `https://puntoclicks.com/test.html`

- Se funcionar → problema está com upload do build React
- Se der 403 → problema de permissões do servidor

---

## 🛠️ SOLUÇÃO ALTERNATIVA (SE TUDO FALHAR):

### **Criar `index.php` em vez de `index.html`:**

Criar arquivo `public_html/index.php`:

```php
<?php
// Servir index.html
$html = file_get_contents(__DIR__ . '/index.html');
header('Content-Type: text/html; charset=utf-8');
echo $html;
```

Alterar `.htaccess`:
```apache
DirectoryIndex index.php index.html
```

Isso pode contornar bloqueios de arquivos estáticos `.html`.

---

## 📋 CHECKLIST FINAL:

Antes de considerar resolvido:

- [ ] `index.html` existe em `public_html/` (não em subpasta)
- [ ] Pasta `assets/` existe em `public_html/` (não em subpasta)
- [ ] Permissões: `index.html` = 644, `assets/` = 755
- [ ] `.htaccess` atualizado (sem forçar HTTPS)
- [ ] `backend/api/tenants/get.php` com CORS headers
- [ ] Cache do Cloudflare limpo
- [ ] Teste: `curl -I https://puntoclicks.com/index.html` retorna `200 OK`
- [ ] Teste: `https://j2s.puntoclicks.com` carrega (não 403)
- [ ] Teste: API retorna JSON sem erro CORS

---

## 🚨 ATENÇÃO CRÍTICA:

**O problema NÃO é código.** O problema é **arquivo não está no servidor**.

Verifique MANUALMENTE via File Manager se `public_html/index.html` existe.

Se não existir → fazer upload.
Se existir e ainda der 403 → problema de permissões ou mod_security.

---

**Última Atualização:** 2026-03-10
