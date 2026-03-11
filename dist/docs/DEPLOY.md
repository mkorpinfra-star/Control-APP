# 🚀 GUIA DE DEPLOY - Sistema J2S Timesheet

## 📋 Pré-requisitos

### Servidor
- PHP 7.4+ (recomendado 8.0+)
- MySQL 5.7+ ou MariaDB 10.3+
- Apache ou Nginx
- Extensões PHP: `mysqli`, `json`, `pdo`, `pdo_mysql`

### Local (Desenvolvimento)
- Node.js 18+ e npm
- Git

---

## 🗄️ 1. CONFIGURAR BANCO DE DADOS

### 1.1 Criar banco e usuário
```sql
CREATE DATABASE j2s_timesheet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'j2s_user'@'localhost' IDENTIFIED BY 'SuaSenhaForte123!';
GRANT ALL PRIVILEGES ON j2s_timesheet.* TO 'j2s_user'@'localhost';
FLUSH PRIVILEGES;
```

### 1.2 Executar schema inicial
```bash
mysql -u j2s_user -p j2s_timesheet < backend/sql/schema.sql
```

### 1.3 Executar migration completa (IMPORTANTE!)
```bash
mysql -u j2s_user -p j2s_timesheet < backend/sql/migration_completa_v3.sql
```

### 1.4 Criar usuário admin
```bash
cd backend
php setup-admin.php
```
Isso criará um usuário:
- **Passaporte:** `ADMIN001`
- **Senha:** `admin123` (MUDE DEPOIS!)
- **Tipo:** admin

---

## 📁 2. BACKEND (PHP)

### 2.1 Fazer upload dos arquivos
Faça upload da pasta `backend/` para o servidor no caminho:
```
/home/seu-usuario/public_html/login/backend/
```

### 2.2 Configurar database.php
Edite `backend/config/database.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'j2s_timesheet');
define('DB_USER', 'j2s_user');
define('DB_PASS', 'SuaSenhaForte123!');
define('JWT_SECRET', 'MUDE-ESTE-SECRET-PARA-ALGO-ALEATORIO-E-SEGURO-123456789');
```

### 2.3 Permissões de pasta
```bash
chmod 755 backend/
chmod 755 backend/uploads/
chmod 644 backend/config/database.php
```

### 2.4 Testar API
Acesse: `https://j2s.ad/login/backend/test.php`

Deve retornar: `✓ Backend OK`

---

## 🎨 3. FRONTEND (React)

### 3.1 Configurar URL da API
Edite `.env.production`:
```env
VITE_API_URL=https://j2s.ad/login/backend/api
```

### 3.2 Gerar build
```bash
npm install
npm run build
```

Isso criará a pasta `dist/` com os arquivos otimizados.

### 3.3 Fazer upload do build
Faça upload de **TODO o conteúdo** da pasta `dist/` para:
```
/home/seu-usuario/public_html/login/
```

Estrutura final:
```
/login/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── backend/
    └── (arquivos PHP)
```

---

## ⚙️ 4. CONFIGURAÇÕES SMTP (Email)

### 4.1 Via PhpMyAdmin
Execute no banco `j2s_timesheet`:
```sql
UPDATE configuracoes SET valor = 'email-ssl.com.br' WHERE chave = 'smtp_host';
UPDATE configuracoes SET valor = '465' WHERE chave = 'smtp_port';
UPDATE configuracoes SET valor = 'contactes@j2s.ad' WHERE chave = 'smtp_user';
UPDATE configuracoes SET valor = 'SUA_SENHA_EMAIL' WHERE chave = 'smtp_password';
UPDATE configuracoes SET valor = 'contactes@j2s.ad' WHERE chave = 'smtp_from';
```

### 4.2 Via Interface (após login admin)
1. Login como admin
2. Ir em **Configuración**
3. Configurar SMTP
4. Testar envio

---

## 🔐 5. SEGURANÇA

### 5.1 Arquivo .htaccess (Apache)
Criar `backend/.htaccess`:
```apache
# Segurança
<FilesMatch "\.(sql|md|json|log)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# CORS
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
```

### 5.2 Mudar JWT_SECRET
Edite `backend/config/database.php` e mude `JWT_SECRET` para algo aleatório:
```bash
openssl rand -base64 64
```

### 5.3 Mudar senha do admin
1. Login como ADMIN001
2. Ir em **Empleados**
3. Editar ADMIN001
4. Mudar senha

---

## 📊 6. VALORES DE HORA (Financeiro)

### Via Interface
1. Login como admin
2. Ir em **Configuración**
3. Seção "Valores por Hora"
4. Definir:
   - **Hora Normal:** €21.00
   - **Hora Extra:** €28.00
   - **Hora Nocturna:** €30.00
5. Salvar

### Via SQL
```sql
INSERT INTO config_valores (valor_hora_normal, valor_hora_extra, valor_hora_noturna)
VALUES (21.00, 28.00, 30.00)
ON DUPLICATE KEY UPDATE
    valor_hora_normal = 21.00,
    valor_hora_extra = 28.00,
    valor_hora_noturna = 30.00;
```

---

## 🧪 7. TESTAR FLUXO COMPLETO

### 7.1 Criar dados de teste
1. **Login admin** → ADMIN001 / admin123
2. **Criar Cliente:**
   - Nome: "Construcciones ABC"
   - Email Financeiro: `financeiro@abc.com`
3. **Criar Encarregado:**
   - Passaporte: ENC001
   - Nome: Carlos Supervisor
   - Tipo: Encarregado
4. **Criar Funcionário:**
   - Passaporte: FUNC001
   - Nome: Juan García
   - Tipo: Funcionário
5. **Criar Obra:**
   - Número: OBR-2024-001
   - Cliente: Construcciones ABC
   - Encarregado: Carlos Supervisor
   - Email Financeiro: (preenche automaticamente)
6. **Vincular Funcionário à Obra:**
   - Na tela da obra, clicar em "Empleados"
   - Selecionar FUNC001
   - Salvar

### 7.2 Testar Timesheet
1. **Logout** e **Login como FUNC001**
2. Deve ir automaticamente para **Timesheet**
3. Lançar horas (ex: 8h normal, 2h extra)
4. **Enviar para aprovação**

### 7.3 Testar Aprovação
1. **Logout** e **Login como ENC001**
2. Deve ir automaticamente para **Aprobaciones**
3. Ver o apontamento pendente de FUNC001
4. **Aprobar** com assinatura
5. **Verificar email** em `financeiro@abc.com`

### 7.4 Testar Relatório Mensal
1. **Login como ADMIN001**
2. Ir em **Configuración**
3. Seção "Informe Mensual"
4. Selecionar obra e mês
5. **Generar Informe**
6. Verificar totais e valores em €

---

## 🐛 8. TROUBLESHOOTING

### Erro 401 Unauthorized
- Verificar JWT_SECRET está igual no frontend e backend
- Limpar localStorage do navegador
- Verificar token não expirou

### Email não enviando
- Verificar configurações SMTP no banco
- Ver logs do PHP: `tail -f /var/log/php_errors.log`
- Testar SMTP manualmente

### Obras não aparecem para funcionário
- Verificar vínculo em `funcionario_obra`
- SQL: `SELECT * FROM funcionario_obra WHERE funcionario_id = X;`

### Total de horas errado
- Executar migration v3 novamente
- Verificar campo `total_horas` existe
- Verificar JSON `horas_diarias` está correto

---

## 📞 9. SUPORTE

### Usuários padrão após setup
- **Admin:** ADMIN001 / admin123
- **Encarregado:** ENC001 / 123456 (do schema.sql)
- **Funcionário:** FUNC001 / 123456 (do schema.sql)

### Logs importantes
```bash
# PHP errors
tail -f /var/log/apache2/error.log

# MySQL slow queries
tail -f /var/log/mysql/slow.log

# Backend custom logs
tail -f backend/logs/app.log
```

---

## ✅ 10. CHECKLIST FINAL

- [ ] Banco criado e migrations rodadas
- [ ] Admin criado e senha trocada
- [ ] JWT_SECRET alterado
- [ ] SMTP configurado e testado
- [ ] Frontend buildado e deployado
- [ ] Valores de hora configurados
- [ ] Cliente de teste criado
- [ ] Obra de teste criada
- [ ] Funcionário vinculado à obra
- [ ] Fluxo completo testado
- [ ] Email de aprovação recebido
- [ ] Relatório mensal funcionando

---

**Deploy concluído! 🎉**

URL de acesso: `https://j2s.ad/login/`
