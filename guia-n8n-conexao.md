# Guia Completo: Conectando N8N ao Salão Online

## Visão Geral

O sistema Salão Online possui APIs internas que automaticamente enviam dados para o N8N quando eventos importantes acontecem (novos agendamentos, clientes, etc.). Este guia mostra como configurar essas integrações.

## Pré-requisitos

1. **N8N instalado e funcionando**
2. **Acesso às APIs do Salão Online**
3. **URL base do sistema**: Sua URL do Replit (ex: `https://seu-projeto.replit.app`)

## Configuração Inicial no N8N

### 1. Criando um Workflow de Webhook

1. Abra o N8N
2. Crie um novo workflow
3. Adicione um nó **"Webhook"** como trigger
4. Configure o webhook:
   - **Authentication**: None (ou Bearer Token se preferir)
   - **HTTP Method**: POST
   - **Path**: `/webhook/salao-online` (ou qualquer path de sua escolha)
5. Salve e ative o workflow
6. **Copie a URL do webhook** gerada pelo N8N

### 2. Registrando a Integração no Sistema

Use a API do sistema para registrar sua integração N8N:

```bash
# Exemplo usando curl
curl -X POST https://seu-projeto.replit.app/api/n8n-integrations \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "name": "Notificações WhatsApp",
    "webhookUrl": "https://seu-n8n.com/webhook/salao-online",
    "apiKey": "seu-token-opcional",
    "triggerEvents": [
      "appointment_created",
      "appointment_confirmed", 
      "client_created"
    ],
    "isActive": true
  }'
```

**Parâmetros:**
- `name`: Nome descritivo da integração
- `webhookUrl`: URL copiada do N8N
- `apiKey`: Token opcional para autenticação (recomendado)
- `triggerEvents`: Eventos que devem disparar o webhook
- `isActive`: true para ativar imediatamente

## Eventos Disponíveis

### appointment_created
Disparado quando um novo agendamento é criado.

**Dados recebidos:**
```json
{
  "event": "appointment_created",
  "data": {
    "id": 123,
    "clientName": "João Silva",
    "clientPhone": "+5511999999999",
    "serviceName": "Corte de Cabelo",
    "staffName": "Maria Santos",
    "appointmentDate": "2025-06-25T14:30:00.000Z",
    "duration": 30,
    "price": "25.00",
    "status": "scheduled"
  },
  "establishmentId": 8,
  "timestamp": "2025-06-24T17:15:00.000Z"
}
```

### client_created
Disparado quando um novo cliente é cadastrado.

**Dados recebidos:**
```json
{
  "event": "client_created",
  "data": {
    "id": 45,
    "name": "Ana Costa",
    "phone": "+5511888888888",
    "email": "ana@email.com",
    "createdAt": "2025-06-24T17:15:00.000Z"
  },
  "establishmentId": 8,
  "timestamp": "2025-06-24T17:15:00.000Z"
}
```

### staff_created
Disparado quando um novo colaborador é cadastrado.

**Dados recebidos:**
```json
{
  "event": "staff_created",
  "data": {
    "id": 12,
    "name": "Carlos Silva",
    "phone": "+5511777777777",
    "email": "carlos@email.com",
    "role": "Cabeleireiro",
    "createdAt": "2025-06-24T17:15:00.000Z"
  },
  "establishmentId": 8,
  "timestamp": "2025-06-24T17:15:00.000Z"
}
```

## Exemplo: Workflow de Notificação WhatsApp

### Configuração no N8N

1. **Webhook Trigger** (configurado acima)
2. **Switch Node** para filtrar eventos:
   ```javascript
   // Condição para appointment_created
   return items.filter(item => item.json.event === 'appointment_created');
   ```
3. **Function Node** para formatar mensagem:
   ```javascript
   const data = $json.data;
   const message = `🎉 Novo agendamento confirmado!
   
   👤 Cliente: ${data.clientName}
   ✂️ Serviço: ${data.serviceName}
   👨‍💼 Profissional: ${data.staffName}
   📅 Data: ${new Date(data.appointmentDate).toLocaleString('pt-BR')}
   💰 Valor: R$ ${data.price}
   
   Estamos ansiosos para atendê-lo! 😊`;
   
   return {
     json: {
       to: data.clientPhone,
       message: message
     }
   };
   ```
4. **WhatsApp Node** (ou SMS) para enviar a mensagem

## Testando a Integração

### 1. Teste Manual via API

```bash
curl -X POST https://seu-projeto.replit.app/api/n8n-integrations/test \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "webhookUrl": "https://seu-n8n.com/webhook/salao-online",
    "apiKey": "seu-token-opcional",
    "event": "test"
  }'
```

### 2. Teste Real
Crie um novo agendamento no sistema e verifique se o webhook é disparado.

## Monitoramento e Logs

### Visualizar Logs de Webhook

```bash
curl -X GET https://seu-projeto.replit.app/api/n8n-integrations/ID-DA-INTEGRACAO/logs \
  -H "Cookie: your-session-cookie"
```

**Resposta:**
```json
[
  {
    "id": 1,
    "event": "appointment_created",
    "status": "success",
    "response": "OK",
    "createdAt": "2025-06-24T17:15:00.000Z"
  }
]
```

## Exemplos de Automação

### 1. Lembrete de Agendamento
- **Trigger**: appointment_created
- **Aguardar**: 1 hora antes do agendamento
- **Ação**: Enviar lembrete via WhatsApp

### 2. Follow-up Pós-Atendimento
- **Trigger**: appointment_completed (quando implementado)
- **Aguardar**: 24 horas
- **Ação**: Enviar pesquisa de satisfação

### 3. Boas-vindas para Novos Clientes
- **Trigger**: client_created
- **Ação**: Enviar mensagem de boas-vindas com informações do salão

## Gerenciamento de Integrações

### Listar Integrações
```bash
curl -X GET https://seu-projeto.replit.app/api/n8n-integrations \
  -H "Cookie: your-session-cookie"
```

### Atualizar Integração
```bash
curl -X PUT https://seu-projeto.replit.app/api/n8n-integrations/ID \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "isActive": false
  }'
```

### Deletar Integração
```bash
curl -X DELETE https://seu-projeto.replit.app/api/n8n-integrations/ID \
  -H "Cookie: your-session-cookie"
```

## Segurança

1. **Use HTTPS**: Sempre configure URLs com HTTPS
2. **API Keys**: Configure tokens de autenticação no N8N
3. **Validação**: Valide dados recebidos antes de processar
4. **Rate Limiting**: Configure limites no N8N se necessário

## Solução de Problemas

### Webhook não dispara
1. Verifique se a integração está ativa
2. Confirme a URL do webhook
3. Verifique logs de erro na API

### Dados não chegam
1. Teste a URL manualmente
2. Verifique filtros de eventos
3. Confirme autenticação (API Key)

### Falhas de entrega
1. Monitore logs via API
2. Implemente retry no N8N
3. Configure alertas de falha

## Suporte

Para problemas específicos:
1. Verifique logs via API `/api/n8n-integrations/ID/logs`
2. Teste conexão via `/api/n8n-integrations/test`
3. Monitore console do navegador para erros de rede