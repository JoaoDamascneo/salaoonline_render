# 👤 Guia para Criar Usuário Manualmente

Este guia mostra como criar um usuário com establishment e plano diretamente no banco de dados.

## 🚀 **Opção 1: Script Automático (Recomendado)**

### **Passo 1: Configurar variável de ambiente**
```bash
# Adicione sua DATABASE_URL no .env ou exporte no terminal
export DATABASE_URL="postgresql://neondb_owner:npg_7WzVcIJfq6OP@ep-fragrant-king-a6na8g6b.us-west-2.aws.neon.tech/neondb?sslmode=require"
```

### **Passo 2: Executar o script**
```bash
# Script simples (cria usuário padrão)
node create-user-simple.js

# Script completo (permite personalizar dados)
node create-user.js
```

### **Passo 3: Resultado**
```
✅ Usuário criado com sucesso!
========================================
🏢 Establishment: Salão Teste
👤 Usuário: João Teste
📧 Email: joao@salaoteste.com
🔑 Senha: 123456
🎯 Plano: Base (ID: 1)
========================================

🔗 Para acessar:
   URL: http://localhost:5000
   Email: joao@salaoteste.com
   Senha: 123456
```

---

## 🛠️ **Opção 2: Personalizar Dados**

### **Editar o script `create-user.js`:**

```javascript
// Dados do establishment (modifique aqui)
const establishmentData = {
  name: "Meu Salão",                    // ← Nome do salão
  ownerName: "Seu Nome",                // ← Seu nome
  email: "seu@email.com",               // ← Seu email
  phone: "(11) 99999-9999",             // ← Seu telefone
  whatsappNumber: "(11) 99999-9999",    // ← WhatsApp
  segment: "Salão de Beleza",           // ← Segmento
  address: "Sua rua, 123 - Cidade, SP", // ← Endereço
  planId: 1,                            // ← Plano (1=Base, 2=Core, 3=Expert)
  subscriptionStatus: "active"
};

// Dados do usuário
const userData = {
  name: "Seu Nome",                     // ← Seu nome
  email: "seu@email.com",               // ← Seu email
  password: "suasenha123",              // ← Sua senha
  role: "admin"                         // ← Função (admin ou staff)
};
```

### **Executar novamente:**
```bash
node create-user.js
```

---

## 📋 **Planos Disponíveis**

| ID | Nome | Preço | Funcionalidades |
|----|------|-------|-----------------|
| 1 | **Base** | R$ 29/mês | • Até 2 colaboradores<br>• 100 agendamentos/mês<br>• Integração WhatsApp |
| 2 | **Core** | R$ 59/mês | • Até 5 colaboradores<br>• 500 agendamentos/mês<br>• Módulo Financeiro |
| 3 | **Expert** | R$ 99/mês | • Colaboradores ilimitados<br>• Agendamentos ilimitados<br>• Todos os módulos |

---

## 🔍 **Verificar Usuários Existentes**

### **Listar todos os establishments:**
```sql
SELECT id, name, email, plan_id, subscription_status 
FROM establishments;
```

### **Listar todos os usuários:**
```sql
SELECT u.id, u.name, u.email, u.role, e.name as establishment
FROM users u
JOIN establishments e ON u.establishment_id = e.id;
```

### **Verificar planos:**
```sql
SELECT id, name, price, max_staff_members, max_monthly_appointments
FROM plans
WHERE is_active = true;
```

---

## ⚠️ **Importante**

### **Segurança:**
- ✅ **Senhas são criptografadas** automaticamente
- ✅ **Verificação de duplicatas** antes de criar
- ✅ **Validação de dados** no script

### **Após criar o usuário:**
1. **Teste o login** no sistema
2. **Configure dados adicionais** (horários, serviços, etc.)
3. **Adicione colaboradores** se necessário
4. **Configure integrações** (WhatsApp, pagamentos)

### **Em caso de erro:**
- Verifique se a `DATABASE_URL` está correta
- Confirme se o banco está acessível
- Verifique se as tabelas existem
- Consulte os logs de erro

---

## 🎯 **Exemplo de Uso Completo**

```bash
# 1. Configurar ambiente
export DATABASE_URL="sua_url_do_banco"

# 2. Executar script
node create-user-simple.js

# 3. Verificar resultado
# 4. Acessar o sistema
# 5. Fazer login com as credenciais
```

**Pronto! Agora você tem um usuário criado e pode acessar o sistema!** 🎉
