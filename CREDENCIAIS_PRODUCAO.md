# 🔐 CREDENCIAIS DE PRODUÇÃO - PUNTOCLICKS.COM

## 🗄️ BANCO DE DADOS

```
Host:     localhost
Database: u268549871_saaas
Username: u268549871_saaas
Password: Legolego0304!@
```

⚠️ **IMPORTANTE:** Já configurado em `backend/config/database.php`

---

## 📤 ANTES DO DEPLOY - MIGRAR DADOS

### Opção 1: Exportar do banco antigo e importar no novo

**1. Exportar do banco `u268549871_saas` (antigo):**
- Via phpMyAdmin
- Selecionar banco `u268549871_saas`
- Exportar → Método Rápido → SQL
- Salvar arquivo

**2. Importar no banco `u268549871_saaas` (novo):**
- Via phpMyAdmin
- Selecionar banco `u268549871_saaas`
- Importar → Escolher arquivo `.sql`
- Executar

**3. Verificar após importação:**
```sql
-- Verificar se tenant J2S existe
SELECT * FROM tenants WHERE id = 1;

-- Verificar se tabelas têm tenant_id
SHOW COLUMNS FROM usuarios LIKE 'tenant_id';
```

### Opção 2: Copiar dados entre bancos (se no mesmo servidor)

```sql
-- Copiar todas as tabelas do banco antigo para o novo
USE u268549871_saaas;

-- Copiar cada tabela
INSERT INTO u268549871_saaas.tenants SELECT * FROM u268549871_saas.tenants;
INSERT INTO u268549871_saaas.usuarios SELECT * FROM u268549871_saas.usuarios;
INSERT INTO u268549871_saaas.obras SELECT * FROM u268549871_saas.obras;
-- ... repetir para todas as 17 tabelas
```

---

## ✅ BUILD ATUALIZADO

**Build gerado em:** 09/03/2026
**Tempo de build:** 12.98s
**Status:** ✅ Sucesso com novas credenciais

**Arquivos gerados:**
```
dist/index.html                  2.12 kB
dist/assets/index-Cf-oklIO.css   109.77 kB
dist/assets/index-_Ukx4wxM.js    1.67 MB (483 KB gzipped)
```

---

## 🚀 PRÓXIMO PASSO

**Fazer upload para puntoclicks.com:**

1. Upload `dist/` → `/public_html/`
2. Upload `backend/` → `/public_html/api/`, `/config/`, `/includes/`
3. Criar `.htaccess` (ver DEPLOY_GUIDE.md)
4. **MIGRAR DADOS DO BANCO ANTIGO PARA O NOVO**
5. Configurar DNS wildcard
6. Instalar SSL
7. Testar!

---

⚠️ **NÃO ESQUECER:** Migrar os dados do banco `u268549871_saas` → `u268549871_saaas` antes de testar!
