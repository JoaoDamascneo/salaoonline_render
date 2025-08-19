# 🔧 Correção da URL do Email de Recuperação de Senha

## 🚨 **PROBLEMA IDENTIFICADO:**

O email de recuperação de senha está enviando links com a URL antiga do Replit:
```
❌ https://salao-online-jpamdoliveira.replit.app/redefinir-senha?token=ABC123
```

Quando deveria enviar com a nova URL do Render:
```
✅ https://salaoonline-render.onrender.com/redefinir-senha?token=ABC123
```

## 🔧 **SOLUÇÃO:**

### **Passo 1: Acessar o Render**
1. Vá para [dashboard.render.com](https://dashboard.render.com)
2. Acesse seu serviço `salaoonline-render`
3. Clique em **"Environment"**

### **Passo 2: Atualizar variável BASE_URL**
1. Encontre a variável `BASE_URL`
2. **Valor atual:** `https://salao-online-jpamdoliveira.replit.app`
3. **Novo valor:** `https://salaoonline-render.onrender.com`
4. Clique em **"Save Changes"**

### **Passo 3: Deploy automático**
- O Render fará deploy automático com a nova variável
- Aguarde alguns minutos para o deploy completar

## 🧪 **Como testar:**

### **1. Testar recuperação de senha:**
1. Acesse: `https://salaoonline-render.onrender.com/esqueceu-senha`
2. Digite um email válido
3. Clique em "Enviar Link de Recuperação"
4. Verifique o email recebido

### **2. Verificar se o link está correto:**
O link no email deve ser:
```
✅ https://salaoonline-render.onrender.com/redefinir-senha?token=ABC123
```

**NÃO:**
```
❌ https://salao-online-jpamdoliveira.replit.app/redefinir-senha?token=ABC123
```

## 📋 **Checklist:**

- [ ] **Acessar dashboard do Render**
- [ ] **Encontrar variável BASE_URL**
- [ ] **Atualizar para URL correta**
- [ ] **Salvar alterações**
- [ ] **Aguardar deploy automático**
- [ ] **Testar envio de email**
- [ ] **Verificar se link funciona**

## 🎯 **Resultado esperado:**

Após a correção:
- ✅ Emails enviados com URL correta
- ✅ Links funcionam no Render
- ✅ Recuperação de senha funciona perfeitamente
- ✅ Sistema totalmente migrado do Replit para Render

---

**🚀 Execute esses passos e o problema estará resolvido!**
