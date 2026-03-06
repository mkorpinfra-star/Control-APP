# ⚡ QUICK START - TESTAR EM 5 MINUTOS

## 1️⃣ EXECUTAR MIGRATION SQL (1 min)

### Opção A: phpMyAdmin
1. Abrir phpMyAdmin
2. Selecionar seu banco
3. Clicar "SQL"
4. Copiar e colar todo o arquivo: `backend/sql/migration_payroll_billing.sql`
5. Clicar "Executar"

### Opção B: Terminal
```bash
mysql -u seu_usuario -p seu_banco < backend/sql/migration_payroll_billing.sql
```

✅ **Feito!** Tabelas criadas.

---

## 2️⃣ CONFIGURAR VALORES (1 min)

1. Login como Admin
2. Menu → **Configuración**
3. Encontrar seção "Valores de Hora" (se existir)
4. Ou criar valores manualmente no banco:

```sql
-- Inserir valores padrão
INSERT INTO config_valores_faturamento
(valor_hora_normal_faturamento, valor_hora_extra_faturamento, valor_hora_noturna_faturamento)
VALUES (30.00, 42.00, 48.00);
```

✅ **Feito!** Valores configurados.

---

## 3️⃣ CADASTRAR 1 FUNCIONÁRIO TESTE (2 min)

1. Menu → **Empleados**
2. Clicar "Nuevo Usuario"
3. Preencher:
   - Nome: `João Teste`
   - Passaporte: `TEST123`
   - Tipo: `Funcionário`
   - Senha: `123456`
   - **Función:** `Pedreiro`

4. Rolar até os **campos ROXOS**:
   - Salário Base: `1200`
   - Salário/Hora: `15`
   - Vale Moradia: `200`
   - IBF: `50`

5. Salvar

✅ **Feito!** Funcionário teste criado.

---

## 4️⃣ TESTAR PÁGINAS NOVAS (1 min)

### Dashboard Financeiro
1. Menu → **Dashboard Financiero**
2. Deve abrir página (vazia ainda - sem dados)
3. ✅ Funcionou? Passou!

### Aprovados c/ Valores
1. Menu → **Aprovados c/ Valores**
2. Deve abrir página (vazia - sem aprovações ainda)
3. ✅ Funcionou? Passou!

### Folha de Pagamento
1. Menu → **Folha de Pagamento**
2. Escolher mês atual
3. Clicar "Generar Folha del Mes"
4. Deve dar erro ou criar folha vazia (normal - sem horas aprovadas)
5. ✅ Funcionou? Passou!

### Faturamento
1. Menu → **Faturamento**
2. Escolher mês atual
3. Clicar "Generar Facturas del Mes"
4. Deve dar erro ou criar vazia (normal - sem horas aprovadas)
5. ✅ Funcionou? Passou!

---

## 5️⃣ VERIFICAR QUE ESTÁ TUDO OK (30 seg)

### Checklist Rápido:
- [ ] Migration executou sem erro?
- [ ] Funcionário teste foi criado com campos roxos?
- [ ] Menu mostra 4 páginas novas?
- [ ] Dashboard Financeiro abre?
- [ ] Aprovados c/ Valores abre?
- [ ] Folha de Pagamento abre?
- [ ] Faturamento abre?

**Tudo OK?** ✅ Sistema funcionando!

---

## 🎯 PRÓXIMO TESTE COMPLETO (Opcional - 10 min)

Se quiser testar o fluxo completo:

### 1. Criar Obra Teste
1. Menu → **Proyectos**
2. Criar obra: `001 - Teste`

### 2. Preencher Timesheet
1. Logout
2. Login como `João Teste` / `123456`
3. Deve abrir **Timesheet** automaticamente
4. Escolher obra `001 - Teste`
5. Preencher horas:
   - Segunda: 8h normal
   - Terça: 8h normal
   - Quarta: 8h normal, 2h extra
   - Quinta: 8h normal
   - Sexta: 8h normal, 1h noturna
   - Sábado: 6h normal
6. Clicar "Guardar"
7. Clicar "Enviar para Aprobación"

### 3. Aprovar como Admin
1. Logout
2. Login como Admin
3. Menu → **Aprobaciones**
4. Ver apontamento pendente
5. Clicar "Aprobar"
6. Assinar
7. Confirmar

### 4. Ver Valores
1. Menu → **Aprovados c/ Valores**
2. Escolher mês atual
3. Deve mostrar as horas aprovadas COM valores calculados
4. Ver breakdown:
   - 46h × €15 = €690 (normal)
   - 2h × €21 = €42 (extra 1.4×)
   - 1h × €24 = €24 (noturna 1.6×)
   - **TOTAL: €756**

### 5. Gerar Folha
1. Menu → **Folha de Pagamento**
2. Escolher mês atual
3. Clicar "Generar Folha del Mes"
4. Deve criar folha com:
   - Horas: 46 + 2 + 1
   - Valores calculados
   - CAS descontos
   - Líquido a pagar

### 6. Gerar Faturamento
1. Menu → **Faturamento**
2. Escolher mês atual
3. Clicar "Generar Facturas del Mes"
4. Deve criar fatura com:
   - Valores de cliente (×2 da folha)
   - IGI 4.5%
   - Total fatura

### 7. Ver Lucro
1. Menu → **Dashboard Financiero**
2. Escolher mês atual
3. Deve mostrar:
   - Receita (faturamento)
   - Custo (folha)
   - **Lucro**
   - Margem %

---

## ✅ TUDO FUNCIONANDO?

**Sim?** Sistema 100% operacional! 🎉

**Não?** Verifique:
1. Migration SQL executou?
2. Campos roxos foram preenchidos?
3. Console do navegador mostra erro?

---

## 🆘 PROBLEMAS COMUNS

### "Erro ao gerar folha"
**Causa:** Sem horas aprovadas ou funcionário sem salário
**Solução:** Aprovar horas primeiro + preencher campos roxos

### "Página em branco"
**Causa:** Erro de build
**Solução:** `npm run build` e copiar dist/ pro servidor

### "Não consigo aprovar"
**Causa:** Assinatura não funciona
**Solução:** Canvas precisa estar visível, tentar em tela maior

---

**QUICK START COMPLETO!** ⚡

Sistema testado em 5 minutos. Pronto para usar!
