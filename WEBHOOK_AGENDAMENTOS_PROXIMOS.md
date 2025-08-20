# Webhook de Próximos Agendamentos de Clientes

## Visão Geral

Este webhook retorna o **próximo agendamento** de cada cliente que está próximo de 30 minutos do horário agendado, fornecendo informações completas incluindo o telefone do cliente para envio de lembretes automáticos.

## Endpoints Disponíveis

### 1. Todos os Clientes com Agendamentos Próximos

**GET** `/webhook/upcoming-appointments/:establishmentId`

#### Parâmetros
- `establishmentId` (obrigatório): ID do estabelecimento

#### Exemplo de URL
```
https://salaoonline-render.onrender.com/webhook/upcoming-appointments/1
```

### 2. Cliente Específico com Próximo Agendamento

**GET** `/webhook/upcoming-appointments/:establishmentId/:clientId`

#### Parâmetros
- `establishmentId` (obrigatório): ID do estabelecimento
- `clientId` (obrigatório): ID do cliente específico

#### Exemplo de URL
```
https://salaoonline-render.onrender.com/webhook/upcoming-appointments/1/45
```

## Respostas

### 1. Todos os Clientes (Sucesso 200)

```json
{
  "success": true,
  "establishment_id": 1,
  "establishment_name": "Salão da Maria",
  "total_clients": 2,
  "appointments": [
    {
      "appointment_id": 123,
      "appointment_date": "2025-01-15T14:30:00.000Z",
      "appointment_time": "14:30",
      "appointment_date_formatted": "15/01/2025",
      "staff_name": "Maria Silva",
      "service_name": "Corte de Cabelo",
      "establishment_id": 1,
      "establishment_name": "Salão da Maria",
      "client_name": "João Santos",
      "client_id": 45,
      "client_phone": "11999999999",
      "client_email": "joao@email.com",
      "duration": 30,
      "service_price": "25.00",
      "status": "confirmed",
      "notes": "Cliente preferência por cabelo mais curto"
    }
  ],
  "timestamp": "2025-01-15T14:00:00.000Z",
  "message": "Encontrados 2 cliente(s) com agendamento próximo de 30 minutos"
}
```

### 2. Cliente Específico (Sucesso 200)

#### Com Agendamento Próximo
```json
{
  "success": true,
  "establishment_id": 1,
  "establishment_name": "Salão da Maria",
  "client_id": 45,
  "client_name": "João Santos",
  "has_upcoming_appointment": true,
  "appointment": {
    "appointment_id": 123,
    "appointment_date": "2025-01-15T14:30:00.000Z",
    "appointment_time": "14:30",
    "appointment_date_formatted": "15/01/2025",
    "staff_name": "Maria Silva",
    "service_name": "Corte de Cabelo",
    "establishment_id": 1,
    "establishment_name": "Salão da Maria",
    "client_name": "João Santos",
    "client_id": 45,
    "client_phone": "11999999999",
    "client_email": "joao@email.com",
    "duration": 30,
    "service_price": "25.00",
    "status": "confirmed",
    "notes": "Cliente preferência por cabelo mais curto"
  },
  "timestamp": "2025-01-15T14:00:00.000Z",
  "message": "Próximo agendamento do cliente encontrado"
}
```

#### Sem Agendamento Próximo
```json
{
  "success": true,
  "establishment_id": 1,
  "establishment_name": "Salão da Maria",
  "client_id": 45,
  "client_name": "João Santos",
  "has_upcoming_appointment": false,
  "message": "Cliente não possui agendamento próximo de 30 minutos"
}
```

### Erro (400/404/500)

```json
{
  "success": false,
  "error": "Mensagem de erro específica",
  "message": "Descrição detalhada do erro"
}
```

## Critérios de Busca

O webhook retorna o **próximo agendamento** de cada cliente que atende aos seguintes critérios:

1. **Estabelecimento**: Pertencem ao establishmentId especificado
2. **Horário**: Estão entre o momento atual e 30 minutos à frente
3. **Status**: Apenas agendamentos com status "confirmed" ou "scheduled"
4. **Cliente Único**: Se um cliente tem múltiplos agendamentos próximos, retorna apenas o mais próximo
5. **Ordenação**: Ordenados por data/hora do agendamento

## Campos Retornados

### Informações do Agendamento
- `appointment_id`: ID único do agendamento
- `appointment_date`: Data e hora completa (ISO)
- `appointment_time`: Horário formatado (HH:MM)
- `appointment_date_formatted`: Data formatada (DD/MM/YYYY)
- `duration`: Duração em minutos
- `status`: Status do agendamento
- `notes`: Observações do agendamento

### Informações do Cliente
- `client_name`: Nome do cliente
- `client_id`: ID do cliente
- `client_phone`: Telefone do cliente (para envio de SMS/WhatsApp)
- `client_email`: Email do cliente (para envio de email)

### Informações do Profissional
- `staff_name`: Nome do profissional

### Informações do Serviço
- `service_name`: Nome do serviço
- `service_price`: Preço do serviço

### Informações do Estabelecimento
- `establishment_id`: ID do estabelecimento
- `establishment_name`: Nome do estabelecimento

## Casos de Uso

### 1. Lembretes Automáticos por SMS/WhatsApp
- **Endpoint 1**: Use para enviar lembretes em massa a todos os clientes com agendamentos próximos
- **Endpoint 2**: Use para enviar lembrete específico a um cliente determinado

### 2. Lembretes por Email
- **Endpoint 1**: Envie lembretes por email em massa
- **Endpoint 2**: Envie lembrete por email a um cliente específico

### 3. Preparação da Equipe
- **Endpoint 1**: Notifique a equipe sobre todos os clientes que estão chegando em breve
- **Endpoint 2**: Notifique sobre um cliente específico

### 4. Integração com N8N
- **Endpoint 1**: Configure workflows para processar automaticamente todos os próximos agendamentos
- **Endpoint 2**: Configure workflows para processar agendamentos de clientes específicos

### 5. Verificação Individual
- **Endpoint 2**: Ideal para verificar se um cliente específico tem agendamento próximo

## Exemplo de Integração com N8N

### Configuração do Webhook Trigger
1. Adicione um **Webhook Trigger** no N8N
2. Configure a URL: `https://salaoonline-render.onrender.com/webhook/upcoming-appointments/1`
3. Defina o método como **GET**

### Processamento dos Dados
```javascript
// Function Node para processar os dados
const appointments = $json.appointments;

if (appointments && appointments.length > 0) {
  appointments.forEach(appointment => {
    // Verificar se o cliente tem telefone
    if (appointment.client_phone) {
      // Enviar SMS/WhatsApp para o cliente
      const message = `Olá ${appointment.client_name}! 
      Lembrete: seu agendamento para ${appointment.service_name} 
      está marcado para hoje às ${appointment.appointment_time} 
      com ${appointment.staff_name}. 
      Aguardamos você! 😊`;
      
      // Lógica para enviar SMS/WhatsApp usando appointment.client_phone
    }
    
    // Verificar se o cliente tem email
    if (appointment.client_email) {
      // Enviar email para o cliente
      const emailSubject = `Lembrete de Agendamento - ${appointment.service_name}`;
      const emailBody = `Olá ${appointment.client_name},
      
      Lembrete: seu agendamento para ${appointment.service_name} 
      está marcado para hoje às ${appointment.appointment_time} 
      com ${appointment.staff_name}.
      
      Aguardamos você!
      
      Atenciosamente,
      ${appointment.establishment_name}`;
      
      // Lógica para enviar email usando appointment.client_email
    }
  });
}
```

## Teste dos Webhooks

Execute os scripts de teste incluídos:

### Teste de Todos os Clientes
```bash
node teste-webhook-agendamentos-proximos.js
```

### Teste de Cliente Específico
```bash
node teste-webhook-cliente-especifico.js
```

## Observações Importantes

1. **Frequência de Consulta**: Recomenda-se consultar este webhook a cada 5-10 minutos para não perder agendamentos
2. **Timezone**: As datas são retornadas no timezone do servidor (America/Sao_Paulo)
3. **Performance**: O webhook é otimizado para consultas rápidas
4. **Segurança**: Este endpoint é público, mas não expõe informações sensíveis

## Troubleshooting

### Erro 404 - Estabelecimento não encontrado
- Verifique se o `establishmentId` está correto
- Confirme se o estabelecimento existe no sistema

### Erro 500 - Erro interno do servidor
- Verifique os logs do servidor
- Confirme se o banco de dados está acessível

### Nenhum agendamento retornado
- Verifique se existem agendamentos confirmados/agendados
- Confirme se os agendamentos estão dentro da janela de 30 minutos
- Verifique se o `establishmentId` está correto
