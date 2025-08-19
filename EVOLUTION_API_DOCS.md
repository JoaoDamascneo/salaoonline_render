# Evolution API Integration - Documentação

## Visão Geral

Este sistema fornece endpoints especializados para integração com Evolution API via N8N, permitindo a criação automática de clientes e agendamentos a partir de interações do WhatsApp.

## Endpoints Disponíveis

### 1. Criar Cliente e Agendamento
**POST** `/api/evolution/client-appointment`

Cria um cliente (se não existir) e um agendamento em uma única operação.

**Payload:**
```json
{
  "establishmentId": 8,
  "clientData": {
    "name": "João Silva",
    "phone": "11999999999",
    "email": "joao@email.com",
    "notes": "Cliente via WhatsApp"
  },
  "appointmentData": {
    "serviceId": 4,
    "staffId": 14,
    "appointmentDate": "2025-06-30T14:00:00.000Z",
    "status": "agendado",
    "notes": "Agendamento via WhatsApp"
  },
  "apiKey": "sua-chave-api-opcional"
}
```

**Resposta:**
```json
{
  "success": true,
  "client": {
    "id": 17,
    "establishmentId": 8,
    "name": "João Silva",
    "phone": "11999999999",
    "email": "joao@email.com"
  },
  "appointment": {
    "id": 25,
    "clientId": 17,
    "serviceId": 4,
    "staffId": 14,
    "appointmentDate": "2025-06-30T14:00:00.000Z",
    "status": "agendado"
  },
  "message": "Cliente e agendamento criados com sucesso"
}
```

### 2. Criar/Atualizar Cliente
**POST** `/api/evolution/client`

Cria um novo cliente ou atualiza um existente.

**Payload:**
```json
{
  "establishmentId": 8,
  "clientData": {
    "name": "Maria Santos",
    "phone": "11888888888",
    "email": "maria@email.com",
    "notes": "Cliente cadastrado via WhatsApp"
  },
  "apiKey": "sua-chave-api-opcional"
}
```

**Resposta:**
```json
{
  "success": true,
  "client": {
    "id": 18,
    "establishmentId": 8,
    "name": "Maria Santos",
    "phone": "11888888888",
    "email": "maria@email.com"
  },
  "message": "Cliente processado com sucesso"
}
```

### 3. Buscar Informações do Estabelecimento
**GET** `/api/evolution/establishment/{id}/info`

Retorna informações necessárias para criar agendamentos.

**Resposta:**
```json
{
  "establishment": {
    "id": 8,
    "name": "Salão Teste",
    "phone": "11999999999",
    "whatsappNumber": "11999999999"
  },
  "services": [
    {
      "id": 4,
      "name": "Corte Simples",
      "price": "25.00",
      "duration": 30,
      "category": "Corte"
    }
  ],
  "staff": [
    {
      "id": 14,
      "name": "Funcionário 1",
      "specialties": "Corte, Barba"
    }
  ],
  "businessHours": [
    {
      "dayOfWeek": 1,
      "openTime": "08:00",
      "closeTime": "18:00",
      "isOpen": true
    }
  ]
}
```

## Funcionalidades Automáticas

### Detecção de Clientes Duplicados
- Busca por telefone e email existentes
- Atualiza informações se o cliente já existe
- Cria novo cliente apenas se não encontrar duplicatas

### Verificação de Conflitos
- Verifica se já existe agendamento no mesmo horário
- Retorna erro 409 se houver conflito
- Calcula automaticamente o horário de fim baseado na duração do serviço

### Integração N8N
- Dispara webhooks automáticos quando cliente é criado
- Dispara webhooks quando agendamento é criado
- Logs detalhados para debugging

## Códigos de Erro

| Código | Significado |
|--------|-------------|
| 200    | Sucesso |
| 400    | Dados obrigatórios ausentes |
| 404    | Estabelecimento/Serviço não encontrado |
| 409    | Conflito de horário |
| 500    | Erro interno do servidor |

## Exemplo de Uso com N8N

### Fluxo de Trabalho Sugerido:

1. **Receber mensagem WhatsApp** no Evolution API
2. **Processar texto** para extrair intenção (agendar, cancelar, etc.)
3. **Buscar informações** do estabelecimento via GET `/api/evolution/establishment/{id}/info`
4. **Interagir com cliente** via WhatsApp para coletar dados
5. **Criar agendamento** via POST `/api/evolution/client-appointment`
6. **Confirmar** agendamento via WhatsApp

### Exemplo de Integração N8N:

```javascript
// Node N8N - HTTP Request
const payload = {
  establishmentId: 8,
  clientData: {
    name: $node["WhatsApp Trigger"].json["pushName"],
    phone: $node["WhatsApp Trigger"].json["from"],
    notes: "Cliente via WhatsApp Evolution API"
  },
  appointmentData: {
    serviceId: parseInt($node["Service Selection"].json["serviceId"]),
    staffId: parseInt($node["Staff Selection"].json["staffId"]),
    appointmentDate: $node["Date Selection"].json["appointmentDate"],
    status: "agendado",
    notes: "Agendamento via WhatsApp"
  }
};

return {
  json: payload
};
```

## Logs e Debugging

Todos os endpoints geram logs detalhados:
- Criação de clientes
- Criação de agendamentos
- Erros de conflito
- Disparos de webhook

Os logs podem ser acessados via console do servidor ou através dos endpoints de webhook logs da integração N8N.