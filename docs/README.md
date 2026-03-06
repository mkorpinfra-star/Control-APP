# Sistema de Marcação de Ponto / Sistema de Control Horario

Sistema completo de controle de horas para funcionários com fluxo de aprovação digital.

## 🚀 Deploy

### Frontend (React + Vite)

1. **Build de produção:**
```bash
cd app-cassio
npm install
npm run build
```

2. **Upload:** Envie o conteúdo da pasta `dist/` para o FTP em `/login`

### Backend (PHP + MySQL)

1. **Upload:** Envie a pasta `backend/` para o FTP em `/backend`

2. **Banco de dados:**
   - Acesse o phpMyAdmin
   - Crie um banco chamado `j2s_ponto` (ou outro nome)
   - Importe o arquivo `backend/sql/schema.sql`

3. **Configurar conexão:**
   - Edite `backend/config/database.php`
   - Altere `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`

---

## 👤 Usuários de Teste

| Tipo | Passaporte | Senha |
|------|------------|-------|
| Encarregado | ENC001 | 123456 |
| Funcionário | FUNC001 | 123456 |
| Funcionário | FUNC002 | 123456 |

---

## 📁 Estrutura de Pastas

```
app-cassio/
├── dist/                   # Build de produção (→ /login)
├── backend/                # API PHP (→ /backend)
│   ├── api/
│   │   ├── auth/login.php
│   │   ├── apontamentos/
│   │   ├── obras/
│   │   └── config/
│   ├── config/database.php
│   ├── includes/
│   └── sql/schema.sql
└── src/                    # Código fonte React
```

---

## 🔧 Configuração SMTP

Após o primeiro login como **Encarregado**, acesse as configurações do sistema para definir:

- Servidor SMTP
- Porta (587 para TLS)
- Usuário e senha SMTP
- E-mail remetente
- E-mail do financeiro

---

## 🌐 Idiomas

O sistema suporta:
- **Español (es)** - Padrão
- **Català (ca)**

O usuário pode trocar o idioma no login ou na sidebar.
