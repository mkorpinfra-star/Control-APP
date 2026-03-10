# 🚀 GUIA DE DEPLOY - PUNTOCLICKS.COM

## 📋 PRÉ-REQUISITOS

✅ Build do projeto concluído (`npm run build`)
✅ Domínio puntoclicks.com configurado
✅ Certificado SSL wildcard instalado (*.puntoclicks.com)
✅ Acesso ao servidor / hosting
✅ Banco de dados MySQL com migration executada

---

## 🗂️ ESTRUTURA DE ARQUIVOS NO SERVIDOR

```
/public_html/
├── index.html              (da pasta dist/)
├── assets/                 (da pasta dist/assets/)
│   ├── index-Cf-oklIO.css
│   └── index-_Ukx4wxM.js
├── api/                    (backend PHP)
│   ├── auth/
│   │   └── login-central.php
│   ├── tenants/
│   │   ├── create.php
│   │   ├── list.php
│   │   └── stats.php
│   ├── usuarios/
│   ├── obras/
│   ├── apontamentos/
│   ├── clientes/
│   ├── encarregados/
│   ├── payroll/
│   ├── billing/
│   ├── notificacoes/
│   └── funcoes/
├── config/
│   └── database.php
├── includes/
│   ├── jwt.php
│   └── tenant_middleware.php
└── .htaccess
```

---

## 📤 PASSO 1: UPLOAD DOS ARQUIVOS

### 1.1 Frontend (dist/)
```bash
# Fazer upload de:
dist/index.html          → /public_html/index.html
dist/assets/*            → /public_html/assets/
```

### 1.2 Backend (backend/)
```bash
# Fazer upload de:
backend/api/*            → /public_html/api/
backend/config/*         → /public_html/config/
backend/includes/*       → /public_html/includes/
```

---

## ⚙️ PASSO 2: CONFIGURAR .htaccess

Criar/editar `/public_html/.htaccess`:

```apache
# Forçar HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Remover www (opcional - escolher um padrão)
RewriteCond %{HTTP_HOST} ^www\.(.*)$ [NC]
RewriteRule ^(.*)$ https://%1/$1 [R=301,L]

# CORS Headers para API
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# SPA - Todas as rotas apontam para index.html
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Ignorar arquivos e diretórios existentes
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d

    # API routes passam direto
    RewriteCond %{REQUEST_URI} !^/api/

    # Tudo mais vai para index.html
    RewriteRule . /index.html [L]
</IfModule>

# Página 404 customizada (opcional)
ErrorDocument 404 /index.html

# Cache de assets estáticos
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType image/x-icon "access plus 1 year"
</IfModule>

# Compressão Gzip
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/javascript
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Headers de Segurança
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
    Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>
```

---

## 🗄️ PASSO 3: CONFIGURAR BANCO DE DADOS

### 3.1 Editar `/public_html/config/database.php`

```php
<?php
function getConnection() {
    $host = 'localhost';
    $dbname = 'u268549871_saas';  // ALTERAR para seu banco
    $username = 'u268549871_saas'; // ALTERAR
    $password = 'SUA_SENHA_AQUI';  // ALTERAR

    try {
        $pdo = new PDO(
            "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
            $username,
            $password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        error_log("Erro de conexão: " . $e->getMessage());
        http_response_code(500);
        die(json_encode(['error' => 'Erro de conexão com o banco de dados']));
    }
}
```

### 3.2 Executar Migration (se ainda não foi feita)

Via phpMyAdmin:
1. Importar `database/migrations/001_multi_tenant.sql`
2. Verificar se as 17 tabelas têm a coluna `tenant_id`

---

## 🌐 PASSO 4: CONFIGURAR DNS

### 4.1 Configuração de DNS (Wildcard)

No painel do domínio (ex: Cloudflare, GoDaddy):

```
Tipo    Nome                    Conteúdo              TTL
A       @                       SEU_IP_SERVIDOR       Auto
A       *                       SEU_IP_SERVIDOR       Auto
CNAME   www                     puntoclicks.com       Auto
```

**Importante:** O registro wildcard `*` permite todos os subdomínios (j2s.puntoclicks.com, admin.puntoclicks.com, etc.)

### 4.2 Certificado SSL Wildcard

Obter certificado que cubra:
- `puntoclicks.com`
- `*.puntoclicks.com`

**Opções:**
- Let's Encrypt (grátis) via Certbot
- Cloudflare SSL (grátis)
- Certificado comercial

---

## 🧪 PASSO 5: TESTAR

### 5.1 Testar Landing Page
```
https://puntoclicks.com/
```
✅ Deve carregar a home
✅ Navegar para /login funciona
✅ Navegar para /signup funciona
✅ Navegar para /pricing funciona

### 5.2 Testar Login Centralizado
```
https://puntoclicks.com/login
```
✅ Formulário de login aparece
✅ Fazer login com credenciais do J2S
✅ Deve redirecionar para `https://j2s.puntoclicks.com/dashboard`

### 5.3 Testar Tenant App
```
https://j2s.puntoclicks.com/
```
✅ Redireciona para login se não autenticado
✅ Após login, dashboard do J2S carrega
✅ Sidebar funcional
✅ Dados do tenant corretos

### 5.4 Testar Admin Panel
```
https://admin.puntoclicks.com/
```
✅ Login com credenciais de super_admin
✅ Dashboard com estatísticas carrega
✅ Lista de tenants funciona
✅ Criar novo tenant funciona

### 5.5 Testar Signup
```
https://puntoclicks.com/signup
```
✅ Formulário em 3 etapas funciona
✅ Criar novo tenant funciona
✅ Recebe mensagem de sucesso
✅ Pode fazer login em seguida

---

## ⚠️ CHECKLIST DE VERIFICAÇÃO FINAL

### Segurança
- [ ] HTTPS ativo e funcionando
- [ ] Redirect HTTP → HTTPS configurado
- [ ] Headers de segurança configurados
- [ ] `config/database.php` com credenciais corretas
- [ ] `.env` files NÃO estão na pasta pública

### Funcionalidade
- [ ] Login centralizado funciona
- [ ] Redirecionamento para subdomain correto
- [ ] Tenant detection funciona
- [ ] APIs retornam dados corretos
- [ ] CORS configurado corretamente

### Performance
- [ ] Assets com cache configurado
- [ ] Gzip habilitado
- [ ] Imagens otimizadas
- [ ] CSS/JS minificados (build fez isso)

### SEO (Landing Page)
- [ ] index.html tem meta tags
- [ ] Sitemap.xml (criar depois)
- [ ] robots.txt (criar depois)

---

## 🔧 TROUBLESHOOTING

### Erro: "API endpoint not found"
**Causa:** Rotas da API não estão sendo encontradas
**Solução:** Verificar `.htaccess` e estrutura de pastas `/api/`

### Erro: "CORS policy"
**Causa:** Headers CORS não configurados
**Solução:** Adicionar headers no `.htaccess` ou nos arquivos PHP

### Erro: "Database connection failed"
**Causa:** Credenciais incorretas em `config/database.php`
**Solução:** Verificar host, database, user, password

### Erro: "Subdomain not working"
**Causa:** DNS wildcard não configurado ou SSL inválido
**Solução:** Verificar DNS e certificado wildcard

### Erro: "404 em rotas React"
**Causa:** `.htaccess` não está redirecionando para `index.html`
**Solução:** Verificar `RewriteRule` no `.htaccess`

### Erro: "Login não redireciona"
**Causa:** URL de redirect incorreta ou tenant não encontrado
**Solução:** Verificar `login-central.php` e verificar se tenant existe no BD

---

## 📱 PASSO 6: ATUALIZAR APP ANDROID (OPCIONAL)

Se já tem app publicado:

1. Editar configuração do Capacitor
2. Alterar URL base para `https://puntoclicks.com/login`
3. Rebuild e gerar novo `.aab`
4. Upload para Google Play Console

---

## 🎉 DEPLOY COMPLETO!

Após concluir todos os passos:

✅ Landing page acessível em `puntoclicks.com`
✅ Login centralizado em `puntoclicks.com/login`
✅ Admin panel em `admin.puntoclicks.com`
✅ Tenants em `{slug}.puntoclicks.com`
✅ Arquitetura multi-tenant 100% funcional

---

## 📞 SUPORTE

Em caso de dúvidas ou problemas, verificar:
- Logs do servidor (error_log)
- Console do navegador (F12)
- Network tab para ver chamadas da API
- Verificar estrutura de arquivos no servidor

---

**Versão:** 1.0
**Data:** 09/03/2026
**Projeto:** PuntoClicks Multi-Tenant SaaS
