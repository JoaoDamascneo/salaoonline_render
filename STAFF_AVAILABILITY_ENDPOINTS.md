# Endpoints de Disponibilidade de Profissionais

Este documento descreve os endpoints para consultar disponibilidade de profissionais baseada em seus horários individuais de trabalho.

## ✅ Para N8N - Use estes cURLs:

### Buscar Dias da Semana que um Profissional Trabalha
```bash
curl -X GET "https://salao-online-jpamdoliveira.replit.app/api/n8n/staff-days?establishmentId=9&staffId=11"
```

### Buscar Dias Disponíveis do Mês (Alternativa Simples)
```bash
curl -X GET "https://salao-online-jpamdoliveira.replit.app/api/calendar/days?month=8&year=2025"
```

### Buscar Horários Específicos de um Profissional
```bash
curl -X GET "https://salao-online-jpamdoliveira.replit.app/api/n8n/establishment/9/availability?date=2025-08-06&staffId=11&serviceId=3"
```

## 1. Buscar Dias Disponíveis de um Profissional

**Endpoint:** `GET /api/staff/:staffId/available-days`

**Descrição:** Retorna os dias da semana em que um profissional específico está disponível para trabalhar, baseado em seus horários individuais configurados.

**Parâmetros:**
- `staffId` (path): ID do profissional

**Autenticação:** Requerida (sessão)

**Exemplo de Uso:**
```
GET /api/staff/11/available-days
```

**Resposta de Exemplo:**
```json
{
  "staffId": 11,
  "availableDays": [
    {
      "dayOfWeek": 2,
      "dayName": "Terça",
      "openTime": "09:00",
      "closeTime": "19:00"
    },
    {
      "dayOfWeek": 3,
      "dayName": "Quarta",
      "openTime": "10:00",
      "closeTime": "20:00"
    },
    {
      "dayOfWeek": 4,
      "dayName": "Quinta",
      "openTime": "09:00",
      "closeTime": "18:00"
    },
    {
      "dayOfWeek": 5,
      "dayName": "Sexta",
      "openTime": "09:00",
      "closeTime": "18:00"
    },
    {
      "dayOfWeek": 6,
      "dayName": "Sábado",
      "openTime": "09:00",
      "closeTime": "18:00"
    },
    {
      "dayOfWeek": 0,
      "dayName": "Domingo",
      "openTime": "11:00",
      "closeTime": "18:00"
    }
  ]
}
```

**Campos da Resposta:**
- `staffId`: ID do profissional
- `availableDays`: Array com os dias disponíveis
  - `dayOfWeek`: Número do dia da semana (0=Domingo, 1=Segunda, ..., 6=Sábado)
  - `dayName`: Nome do dia em português
  - `openTime`: Horário de início do trabalho
  - `closeTime`: Horário de fim do trabalho

## 2. Buscar Horários Disponíveis de um Profissional

**Endpoint:** `GET /api/staff/:staffId/available-times`

**Descrição:** Retorna os horários específicos disponíveis para um profissional em uma data específica, considerando seus horários de trabalho, agendamentos existentes e duração do serviço.

**Parâmetros:**
- `staffId` (path): ID do profissional
- `date` (query, obrigatório): Data no formato YYYY-MM-DD
- `serviceId` (query, opcional): ID do serviço para calcular duração

**Autenticação:** Requerida (sessão)

**Exemplo de Uso:**
```
GET /api/staff/11/available-times?date=2025-08-06&serviceId=3
```

**Resposta de Exemplo:**
```json
{
  "staffId": 11,
  "date": "2025-08-06",
  "serviceDuration": 60,
  "available": true,
  "workingHours": {
    "openTime": "09:00",
    "closeTime": "18:00"
  },
  "timeSlots": [
    {
      "time": "09:00",
      "available": true,
      "isPast": false,
      "isBooked": false,
      "serviceEndsAfterClose": false,
      "serviceDuration": 60,
      "endTime": "10:00"
    },
    {
      "time": "09:10",
      "available": true,
      "isPast": false,
      "isBooked": false,
      "serviceEndsAfterClose": false,
      "serviceDuration": 60,
      "endTime": "10:10"
    }
  ]
}
```

**Campos da Resposta:**
- `staffId`: ID do profissional
- `date`: Data consultada
- `serviceDuration`: Duração do serviço em minutos
- `available`: Se o profissional trabalha neste dia
- `workingHours`: Horários de trabalho do profissional no dia
- `timeSlots`: Array com slots de 10 minutos
  - `time`: Horário do slot
  - `available`: Se o slot está disponível
  - `isPast`: Se é horário passado (apenas para hoje)
  - `isBooked`: Se já está agendado
  - `serviceEndsAfterClose`: Se o serviço terminaria após o fechamento
  - `serviceDuration`: Duração do serviço
  - `endTime`: Horário de término do serviço

## Funcionalidades Implementadas

### ✅ Horários Individuais dos Profissionais
- Respeita os horários de trabalho específicos de cada profissional
- Ignora horários do estabelecimento quando o profissional tem horários próprios

### ✅ Cálculo de Disponibilidade Inteligente
- Slots a cada 10 minutos para flexibilidade
- Considera duração real do serviço selecionado
- Evita agendamentos que terminariam após o horário de fechamento

### ✅ Verificação de Conflitos
- Detecta sobreposição com agendamentos existentes
- Considera horários passados como indisponíveis (apenas para hoje)

### ✅ Integração com Sistema Existente
- Usa autenticação de sessão do sistema
- Respeita contexto do estabelecimento logado
- Compatível com estrutura de dados existente

## Casos de Uso

1. **Seleção de Profissional**: Use `/available-days` para mostrar quais dias da semana um profissional trabalha
2. **Agendamento**: Use `/available-times` para mostrar horários específicos disponíveis
3. **Interface Dinâmica**: Combine ambos para criar uma experiência de agendamento fluida

## Tratamento de Erros

- `400`: Data obrigatória não fornecida
- `500`: Erro interno do servidor
- Retorna `{ "available": false }` quando profissional não trabalha no dia solicitado