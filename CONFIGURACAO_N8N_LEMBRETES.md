# Configuração N8N - Webhook de Lembretes

## Visão Geral

Este guia mostra como configurar o N8N para receber lembretes de agendamentos próximos e enviar notificações automáticas para os clientes.

## URLs de Produção

### Webhook do Sistema (Fonte de Dados)
```
GET https://salaoonline-render.onrender.com/webhook/lembrete
```

### Webhook do N8N (Destino)
```
POST https://n8n-n8n-start.ayp7v6.easypanel.host/webhook/lembrete
```

## Configuração do Workflow no N8N

### 1. Webhook Trigger (Receber Dados)

**Configuração:**
- **Node Type**: Webhook
- **HTTP Method**: GET
- **Path**: `/lembrete`
- **URL Completa**: `https://n8n-n8n-start.ayp7v6.easypanel.host/webhook/lembrete`

**Dados Recebidos:**
```json
{
  "success": true,
  "total_lembretes": 2,
  "lembretes": [
    {
      "cliente_nome": "João Santos",
      "cliente_telefone": "11999999999",
      "cliente_email": "joao@email.com",
      "estabelecimento_nome": "Salão da Maria",
      "servico_nome": "Corte de Cabelo",
      "profissional_nome": "Maria Silva",
      "agendamento_data": "15/01/2025",
      "agendamento_hora": "14:30"
    }
  ]
}
```

### 2. Function Node (Processar Dados)

**Código JavaScript:**
```javascript
// Verificar se há lembretes
const lembretes = $json.lembretes;

if (!lembretes || lembretes.length === 0) {
  return {
    json: {
      message: "Nenhum lembrete encontrado",
      total: 0,
      processados: []
    }
  };
}

// Processar cada lembrete
const processados = lembretes.map(lembrete => {
  // Criar mensagem para WhatsApp/SMS
  const mensagemWhatsApp = `Olá ${lembrete.cliente_nome}! 

Lembrete: seu agendamento para ${lembrete.servico_nome} 
está marcado para hoje às ${lembrete.agendamento_hora} 
com ${lembrete.profissional_nome} no ${lembrete.estabelecimento_nome}.

Aguardamos você! 😊`;

  // Criar mensagem para email
  const mensagemEmail = `Olá ${lembrete.cliente_nome},

Lembrete: seu agendamento para ${lembrete.servico_nome} 
está marcado para hoje às ${lembrete.agendamento_hora} 
com ${lembrete.profissional_nome} no ${lembrete.estabelecimento_nome}.

Detalhes do agendamento:
- Serviço: ${lembrete.servico_nome}
- Profissional: ${lembrete.profissional_nome}
- Data: ${lembrete.agendamento_data}
- Horário: ${lembrete.agendamento_hora}
- Duração: ${lembrete.servico_duracao} minutos
- Valor: R$ ${lembrete.servico_preco}

Aguardamos você!

Atenciosamente,
${lembrete.estabelecimento_nome}`;

  return {
    cliente_nome: lembrete.cliente_nome,
    cliente_telefone: lembrete.cliente_telefone,
    cliente_email: lembrete.cliente_email,
    estabelecimento_nome: lembrete.estabelecimento_nome,
    servico_nome: lembrete.servico_nome,
    profissional_nome: lembrete.profissional_nome,
    agendamento_data: lembrete.agendamento_data,
    agendamento_hora: lembrete.agendamento_hora,
    mensagem_whatsapp: mensagemWhatsApp,
    mensagem_email: mensagemEmail,
    tem_telefone: !!lembrete.cliente_telefone,
    tem_email: !!lembrete.cliente_email
  };
});

return {
  json: {
    message: "Lembretes processados com sucesso",
    total: lembretes.length,
    processados: processados
  }
};
```

### 3. Switch Node (Separar por Tipo de Envio)

**Condições:**
- **WhatsApp/SMS**: `$json.processados[0].tem_telefone === true`
- **Email**: `$json.processados[0].tem_email === true`

### 4. WhatsApp Node (Enviar Lembretes)

**Configuração:**
- **Connection**: Sua conexão WhatsApp
- **Message**: `{{ $json.processados[0].mensagem_whatsapp }}`
- **To**: `{{ $json.processados[0].cliente_telefone }}`

### 5. Email Node (Enviar Lembretes)

**Configuração:**
- **From**: `contato@salaoonline.site`
- **To**: `{{ $json.processados[0].cliente_email }}`
- **Subject**: `Lembrete de Agendamento - {{ $json.processados[0].servico_nome }}`
- **Message**: `{{ $json.processados[0].mensagem_email }}`

## Workflow Completo

```
[Webhook Trigger] → [Function] → [Switch] → [WhatsApp] → [Email]
```

## Configuração de Agendamento

### Cron Trigger (Opcional)
Para verificar lembretes automaticamente:

**Configuração:**
- **Node Type**: Cron
- **Cron Expression**: `*/5 * * * *` (a cada 5 minutos)
- **HTTP Request**: GET `https://salaoonline-render.onrender.com/webhook/lembrete`

## Exemplo de Workflow Completo

### 1. Trigger (Cron ou Webhook)
```javascript
// Cron: */5 * * * * (a cada 5 minutos)
// Ou Webhook: GET /lembrete
```

### 2. HTTP Request (Buscar Lembretes)
```javascript
// Method: GET
// URL: https://salaoonline-render.onrender.com/webhook/lembrete
```

### 3. Function (Processar)
```javascript
// Código do Function Node acima
```

### 4. Split In Batches (Processar Individualmente)
```javascript
// Batch Size: 1
// Options: Process each item individually
```

### 5. Switch (Verificar Tipo)
```javascript
// Condição: $json.tem_telefone === true
```

### 6. WhatsApp (Enviar)
```javascript
// To: $json.cliente_telefone
// Message: $json.mensagem_whatsapp
```

### 7. Email (Enviar)
```javascript
// To: $json.cliente_email
// Subject: Lembrete de Agendamento
// Message: $json.mensagem_email
```

## Teste do Workflow

### 1. Teste Manual
1. Acesse o N8N
2. Execute o workflow manualmente
3. Verifique os logs de execução

### 2. Teste Automático
1. Configure o Cron Trigger
2. Aguarde a execução automática
3. Verifique se os lembretes foram enviados

## Monitoramento

### Logs Importantes
- **Webhook recebido**: Verificar se os dados chegam corretamente
- **Lembretes processados**: Quantidade de lembretes encontrados
- **Envio de mensagens**: Status de envio para WhatsApp/Email
- **Erros**: Tratamento de erros e falhas

### Métricas
- **Total de lembretes**: Quantos lembretes foram processados
- **Taxa de sucesso**: Quantos lembretes foram enviados com sucesso
- **Tempo de resposta**: Tempo entre verificação e envio

## Troubleshooting

### Problema: Webhook não recebe dados
**Solução:**
- Verificar se a URL está correta
- Testar o endpoint diretamente: `https://salaoonline-render.onrender.com/webhook/lembrete`
- Verificar logs do N8N

### Problema: Mensagens não são enviadas
**Solução:**
- Verificar conexão WhatsApp/Email
- Validar formato do telefone/email
- Verificar logs de erro

### Problema: Lembretes duplicados
**Solução:**
- Implementar controle de envio
- Usar IDs únicos dos agendamentos
- Verificar frequência de execução

## Configuração de Produção

### Variáveis de Ambiente
```bash
# N8N
WEBHOOK_URL=https://n8n-n8n-start.ayp7v6.easypanel.host/webhook/lembrete
SISTEMA_URL=https://salaoonline-render.onrender.com/webhook/lembrete

# WhatsApp
WHATSAPP_API_KEY=sua_chave_api
WHATSAPP_INSTANCE_ID=seu_instance_id

# Email
SMTP_HOST=smtp.zoho.com
SMTP_USER=contato@salaoonline.site
SMTP_PASS=sua_senha
```

### Segurança
- **Webhook Secret**: Configure um secret para validar as requisições
- **Rate Limiting**: Limite o número de requisições por minuto
- **Logs**: Mantenha logs detalhados para auditoria

## Próximos Passos

1. **Configure o workflow** no N8N seguindo este guia
2. **Teste manualmente** para verificar funcionamento
3. **Configure o agendamento** para execução automática
4. **Monitore os logs** para garantir funcionamento correto
5. **Ajuste as mensagens** conforme necessário
