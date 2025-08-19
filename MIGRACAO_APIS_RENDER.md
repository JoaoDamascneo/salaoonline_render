# 🔄 Guia de Migração de APIs - Replit → Render

Este guia lista todas as configurações externas que precisam ser atualizadas após o deploy no Render.

## 📋 **APIs e Serviços para Atualizar**

### **1. Stripe Webhook** ⭐ **IMPORTANTE**

**Onde configurar:** Dashboard do Stripe

**URL Atual:**
```
https://salao-online-jpamdoliveira.replit.app/api/stripe-webhook
```

**Nova URL:**
```
https://seu-app.onrender.com/api/stripe-webhook
```

**Passo a passo:**
1. Acesse [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Developers** → **Webhooks**
3. Encontre o webhook existente
4. Clique em **"Edit"**
5. Atualize a URL para a nova
6. **Salve as alterações**

---

### **2. N8N Integrations**

**URLs base para atualizar:**

**Atual:**
```
https://salao-online-jpamdoliveira.replit.app/
```

**Nova:**
```
https://seu-app.onrender.com/
```

**Endpoints específicos:**
- `/webhook/n8n-info/9`
- `/webhook/n8n-establishment-lookup/`
- `/webhook/n8n-check-phone/`
- `/webhook/n8n-create-client`
- `/webhook/client/`
- `/webhook/staff/`
- `/webhook/appointment/`
- `/api/n8n/staff-days`
- `/api/calendar/days`
- `/api/n8n/establishment/availability`

---

### **3. Evolution API (WhatsApp)**

**WebSocket Atual:**
```
wss://salao-online-jpamdoliveira.replit.app/ws
```

**Nova WebSocket:**
```
wss://seu-app.onrender.com/ws
```

**Configuração:**
- Atualize no painel da Evolution API
- Ou nas configurações do seu sistema de WhatsApp

---

### **4. Qualquer outra integração externa**

**Padrão de substituição:**
- **De:** `https://salao-online-jpamdoliveira.replit.app`
- **Para:** `https://seu-app.onrender.com`

---

## 🚀 **Após o Deploy no Render**

### **1. Obter a URL do Render:**
- Acesse seu serviço no Render
- Copie a URL gerada (ex: `https://salao-online-abc123.onrender.com`)

### **2. Atualizar todas as configurações acima**

### **3. Testar as integrações:**
- ✅ Stripe webhook
- ✅ N8N endpoints
- ✅ Evolution API
- ✅ WebSocket connections

---

## ⚠️ **Importante**

- **Faça backup** das configurações atuais
- **Teste cada integração** após a atualização
- **Mantenha o Replit ativo** até confirmar que tudo funciona no Render
- **Só desative o Replit** após todos os testes passarem

---

## 📞 **Suporte**

Se alguma integração não funcionar:
1. Verifique se a URL está correta
2. Confirme se o Render está online
3. Teste os endpoints manualmente
4. Verifique os logs do Render

---

**🎯 Dica:** Use Ctrl+F para encontrar e substituir todas as URLs antigas pelas novas!
