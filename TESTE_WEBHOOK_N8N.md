# 🧪 Teste do Webhook N8N com Notificações

Este guia mostra como testar se o webhook N8N está funcionando corretamente e enviando notificações em tempo real.

## 🎯 **O que foi corrigido:**

### **Antes:**
- ✅ Agendamento era criado via N8N
- ❌ WebSocket não era notificado
- ❌ Dashboard não atualizava
- ❌ Notificações não apareciam

### **Depois:**
- ✅ Agendamento é criado via N8N
- ✅ WebSocket é notificado automaticamente
- ✅ Dashboard atualiza em tempo real
- ✅ Notificações aparecem instantaneamente

## 🚀 **Como testar:**

### **1. Preparar o ambiente:**
```bash
# Iniciar o servidor
npm run dev

# Acessar o sistema
http://localhost:5000
```

### **2. Abrir o dashboard em duas abas:**
- **Aba 1:** Dashboard do staff (para ver notificações)
- **Aba 2:** Sistema aberto (para ver atualizações)

### **3. Testar via cURL:**
```bash
# Testar criação de agendamento via N8N
curl -X POST http://localhost:5000/webhook/n8n-appointment/1 \
  -H "Content-Type: application/json" \
  -d '{
    "clientData": {
      "name": "Cliente Teste N8N",
      "email": "teste@n8n.com",
      "phone": "(11) 99999-9999",
      "notes": "Teste via N8N"
    },
    "appointmentData": {
      "staffId": 1,
      "serviceId": 1,
      "dataInicio": "2025-08-19T15:00:00.000Z",
      "dataFim": "2025-08-19T16:00:00.000Z",
      "duration": 60,
      "notes": "Agendamento criado via N8N"
    }
  }'
```

### **4. Verificar se funcionou:**

#### **✅ Indicadores de sucesso:**
- **Dashboard atualiza** automaticamente
- **Notificação aparece** no sistema
- **Card "Próximos Agendamentos"** mostra o novo agendamento
- **Lista de agendamentos** inclui o novo item

#### **❌ Se não funcionar:**
- Dashboard não atualiza
- Notificação não aparece
- Card não mostra novo agendamento

## 🔍 **Logs para verificar:**

### **No terminal do servidor:**
```bash
# Deve aparecer:
[INFO] WebSocket notification sent
[INFO] Appointment created via N8N
[INFO] Staff dashboard updated
```

### **No console do browser:**
```bash
# Deve aparecer:
🔌 WebSocket message received: appointment_created
📊 Dashboard data invalidated
🔔 New notification received
```

## 🛠️ **Solução de problemas:**

### **Problema: WebSocket não conecta**
```bash
# Verificar se o servidor está rodando
curl http://localhost:5000

# Verificar logs do WebSocket
# Deve aparecer: "WebSocket server started"
```

### **Problema: Notificação não aparece**
```bash
# Verificar se o usuário está logado
# Verificar se o establishmentId está correto
# Verificar logs de erro no console
```

### **Problema: Dashboard não atualiza**
```bash
# Verificar se o React Query está funcionando
# Verificar se as queries estão sendo invalidadas
# Verificar se o WebSocket está enviando mensagens
```

## 📋 **Checklist de teste:**

- [ ] **Servidor iniciado** corretamente
- [ ] **WebSocket conectado** (verificar console)
- [ ] **Usuário logado** no sistema
- [ ] **Agendamento criado** via N8N
- [ ] **Notificação apareceu** instantaneamente
- [ ] **Dashboard atualizou** automaticamente
- [ ] **Card "Próximos Agendamentos"** mostra novo item
- [ ] **Lista de agendamentos** inclui novo item

## 🎉 **Resultado esperado:**

Após criar um agendamento via N8N, você deve ver:

1. **Notificação instantânea** no sistema
2. **Dashboard atualizado** automaticamente
3. **Card "Próximos Agendamentos"** com novo horário
4. **Lista de agendamentos** com novo item
5. **Logs no terminal** confirmando as notificações

---

**🎯 Agora o webhook N8N funciona perfeitamente com notificações em tempo real!**

**Teste e me diga se funcionou!** 🚀
