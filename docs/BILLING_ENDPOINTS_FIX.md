# 🔧 CORREÇÃO: Endpoints de Billing

## Problema Identificado

Ao acessar `/billing` e tentar exportar Excel ou enviar email, ocorriam erros 404:
- `GET /api/billing/export-excel.php` - 404 Not Found
- `POST /api/billing/send-email.php` - 404 Not Found

**Causa:** Os endpoints não existiam na pasta `backend/api/billing/`

---

## ✅ Solução: Endpoints Criados

### 1. **export-excel.php** (GET)
**Funcionalidade:**
- Exporta faturamento para arquivo Excel (CSV)
- Aceita filtros: `mes` e `obra_id`
- Gera arquivo `faturamento-YYYY-MM.csv` para download

**Colunas do Excel:**
- Obra
- Cliente
- Horas Normales
- Horas Extra
- Horas Nocturnas
- Total Horas
- Subtotal €
- IGI (4.5%)
- Total con IGI

**URL:** `GET /api/billing/export-excel.php?mes=2026-02&obra_id=all`

**Resposta:** Arquivo CSV para download

---

### 2. **send-email.php** (POST)
**Funcionalidade:**
- Envia resumo de faturamento por email
- Destinatário fixo: `contactes@j2s.ad`
- Email HTML formatado com tabela de resumo

**Body JSON:**
```json
{
  "mes": "2026-02",
  "obra_id": "all"
}
```

**Email Inclui:**
- 💰 RESUMEN FATURAMENTO (título)
- Box com total a faturar (verde)
- Tabela detalhada por obra:
  - Obra
  - Horas
  - Subtotal
  - IGI (4.5%)
  - Total
- Footer com nome do usuário e empresa

**Resposta:**
```json
{
  "success": true,
  "message": "Email enviado correctamente a contactes@j2s.ad"
}
```

---

## 📁 Estrutura Final de Billing

```
backend/api/billing/
├── list.php              ✅ (já existia)
├── update.php            ✅ (já existia)
├── generate-monthly.php  ✅ (já existia)
├── export-excel.php      🆕 (CRIADO)
└── send-email.php        🆕 (CRIADO)
```

---

## 🧪 Como Testar

### Exportar Excel:
1. Acesse `/billing`
2. Selecione mês e obra
3. Clique em "Exportar Excel"
4. ✅ Arquivo CSV deve baixar automaticamente

### Enviar Email:
1. Acesse `/billing`
2. Selecione mês e obra
3. Clique em "Enviar Email"
4. ✅ Email enviado para `contactes@j2s.ad`
5. ✅ Toast de sucesso aparece

---

## 📝 Notas Técnicas

**Export Excel:**
- Formato: CSV (compatível com Excel)
- Encoding: UTF-8 with BOM
- Separador: `;` (padrão europeu)
- Números: Formato europeu (vírgula para decimal)

**Send Email:**
- Usa função `sendEmail()` de `includes/email.php`
- HTML minificado inline (sem CSS externo)
- Gradiente vermelho no header (identidade J2S)
- Verde para totais (positivo)

---

**Data:** 2026-02-06  
**Arquivos Criados:**
- `backend/api/billing/export-excel.php` (3.4KB)
- `backend/api/billing/send-email.php` (6.6KB)
