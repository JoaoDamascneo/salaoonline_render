# Webhook de Lembretes - Agendamentos Próximos

## Visão Geral

Este webhook retorna todos os lembretes de agendamentos que estão próximos de 30 minutos do horário agendado, organizados por cliente e com todas as informações necessárias para envio de lembretes automáticos.

## Endpoint

**GET** `/webhook/lembrete`

### URL Completa

```
https://salaoonline-render.onrender.com/webhook/lembrete
```

## Resposta

### Sucesso (200)

```json
{
  "success": true,
  "total_lembretes": 3,
  "lembretes": [
    {
      "cliente_nome": "João Santos",
      "cliente_id": 45,
      "cliente_telefone": "11999999999",
      "cliente_email": "joao@email.com",
      "estabelecimento_nome": "Salão da Maria",
      "estabelecimento_id": 1,
      "servico_nome": "Corte de Cabelo",
      "servico_preco": "25.00",
      "servico_duracao": 30,
      "profissional_nome": "Maria Silva",
      "agendamento_id": 123,
      "agendamento_data": "15/01/2025",
      "agendamento_hora": "14:30",
      "agendamento_data_completa": "2025-01-15T14:30:00.000Z",
      "agendamento_status": "confirmed",
      "agendamento_observacoes": "Cliente preferência por cabelo mais curto"
    },
    {
      "cliente_nome": "Ana Costa",
      "cliente_id": 46,
      "cliente_telefone": "11888888888",
      "cliente_email": "ana@email.com",
      "estabelecimento_nome": "Salão da Maria",
      "estabelecimento_id": 1,
      "servico_nome": "Manicure",
      "servico_preco": "35.00",
      "servico_duracao": 45,
      "profissional_nome": "Carlos Silva",
      "agendamento_id": 124,
      "agendamento_data": "15/01/2025",
      "agendamento_hora": "15:00",
      "agendamento_data_completa": "2025-01-15T15:00:00.000Z",
      "agendamento_status": "scheduled",
      "agendamento_observacoes": ""
    }
  ],
  "timestamp": "2025-01-15T14:00:00.000Z",
  "message": "Encontrados 3 lembrete(s) de agendamentos próximos de 30 minutos"
}
```

### Sem Lembretes (200)

```json
{
  "success": true,
  "total_lembretes": 0,
  "lembretes": [],
  "timestamp": "2025-01-15T14:00:00.000Z",
  "message": "Encontrados 0 lembrete(s) de agendamentos próximos de 30 minutos"
}
```

## Campos Retornados

### Informações do Cliente
- `cliente_nome`: Nome completo do cliente
- `cliente_id`: ID único do cliente
- `cliente_telefone`: Telefone do cliente (para SMS/WhatsApp)
- `cliente_email`: Email do cliente (para email)

### Informações do Estabelecimento
- `estabelecimento_nome`: Nome do estabelecimento
- `estabelecimento_id`: ID único do estabelecimento

### Informações do Serviço
- `servico_nome`: Nome do serviço agendado
- `servico_preco`: Preço do serviço
- `servico_duracao`: Duração em minutos

### Informações do Profissional
- `profissional_nome`: Nome do profissional

### Informações do Agendamento
- `agendamento_id`: ID único do agendamento
- `agendamento_data`: Data formatada (DD/MM/YYYY)
- `agendamento_hora`: Horário formatado (HH:MM)
- `agendamento_data_completa`: Data e hora completa (ISO)
- `agendamento_status`: Status do agendamento
- `agendamento_observacoes`: Observações do agendamento

## Critérios de Busca

O webhook retorna lembretes que atendem aos seguintes critérios:

1. **Todos os Estabelecimentos**: Busca em todos os estabelecimentos cadastrados
2. **Horário**: Agendamentos entre o momento atual e 30 minutos à frente
3. **Status**: Apenas agendamentos com status "confirmed" ou "scheduled"
4. **Cliente Único**: Se um cliente tem múltiplos agendamentos próximos, retorna apenas o mais próximo
5. **Ordenação**: Ordenados por data/hora do agendamento

## Casos de Uso

### 1. Lembretes Automáticos por SMS/WhatsApp
Use o campo `cliente_telefone` para enviar lembretes automáticos.

### 2. Lembretes por Email
Use o campo `cliente_email` para enviar lembretes por email.

### 3. Preparação da Equipe
Notifique a equipe sobre todos os clientes que estão chegando em breve.

### 4. Integração com N8N
Configure workflows para processar automaticamente todos os lembretes.

## Exemplo de Integração com N8N

### Configuração do Webhook Trigger
1. Adicione um **Webhook Trigger** no N8N
2. Configure a URL: `https://salaoonline-render.onrender.com/webhook/lembrete`
3. Defina o método como **GET**

### Processamento dos Dados
```javascript
// Function Node para processar os dados
const lembretes = $json.lembretes;

if (lembretes && lembretes.length > 0) {
  lembretes.forEach(lembrete => {
    // Verificar se o cliente tem telefone
    if (lembrete.cliente_telefone) {
      // Enviar SMS/WhatsApp para o cliente
      const message = `Olá ${lembrete.cliente_nome}! 
      Lembrete: seu agendamento para ${lembrete.servico_nome} 
      está marcado para hoje às ${lembrete.agendamento_hora} 
      com ${lembrete.profissional_nome} no ${lembrete.estabelecimento_nome}. 
      Aguardamos você! 😊`;
      
      // Lógica para enviar SMS/WhatsApp usando lembrete.cliente_telefone
    }
    
    // Verificar se o cliente tem email
    if (lembrete.cliente_email) {
      // Enviar email para o cliente
      const emailSubject = `Lembrete de Agendamento - ${lembrete.servico_nome}`;
      const emailBody = `Olá ${lembrete.cliente_nome},
      
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
      
      // Lógica para enviar email usando lembrete.cliente_email
    }
  });
}
```

## Teste do Webhook

Execute o script de teste incluído:

```bash
node teste-webhook-lembrete.js
```

## Vantagens do Novo Endpoint

1. **Simplicidade**: Uma única URL para todos os lembretes
2. **Completude**: Retorna lembretes de todos os estabelecimentos
3. **Organização**: Dados bem estruturados e em português
4. **Flexibilidade**: Pode ser usado para SMS, WhatsApp, email, etc.
5. **Performance**: Otimizado para consultas rápidas

## Observações Importantes

1. **Frequência de Consulta**: Recomenda-se consultar este webhook a cada 5-10 minutos
2. **Timezone**: As datas são retornadas no timezone do servidor (America/Sao_Paulo)
3. **Performance**: O webhook é otimizado para consultas rápidas
4. **Segurança**: Este endpoint é público, mas não expõe informações sensíveis
5. **Escalabilidade**: Funciona com múltiplos estabelecimentos

## Troubleshooting

### Erro 500 - Erro interno do servidor
- Verifique os logs do servidor
- Confirme se o banco de dados está acessível

### Nenhum lembrete retornado
- Verifique se existem agendamentos confirmados/agendados
- Confirme se os agendamentos estão dentro da janela de 30 minutos
- Verifique se existem estabelecimentos cadastrados
