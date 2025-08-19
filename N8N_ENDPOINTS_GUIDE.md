# Guia de Endpoints N8N para Automação de Agendamentos

## Visão Geral

Estes endpoints foram criados especificamente para integração com N8N, permitindo automação completa do processo de agendamento por estabelecimento. Todos os endpoints são **SEM AUTENTICAÇÃO** para facilitar o uso em fluxos automatizados.

## Endpoints Disponíveis

### 1. Buscar Informações do Estabelecimento

**Endpoint:** `GET /webhook/n8n-info/:id`

**Descrição:** Retorna todas as informações necessárias sobre um estabelecimento específico.

**Exemplo de Uso:**
```
GET https://salao-online-jpamdoliveira.replit.app/webhook/n8n-info/9
```

### 1.1. Buscar Establishment ID por Instance ID

**Endpoint:** `GET /webhook/n8n-establishment-lookup/:instanceId`

**Descrição:** Retorna establishment_id baseado no instance_id e envia automaticamente os dados para N8N.

**Exemplo de Uso:**
```
GET https://salao-online-jpamdoliveira.replit.app/webhook/n8n-establishment-lookup/06e63b25-17b6-495a-9a4f-5a133b152033
```

**Resposta:**
```json
{
  "success": true,
  "message": "Establishment ID encontrado e enviado para N8N",
  "data": {
    "instance_id": "06e63b25-17b6-495a-9a4f-5a133b152033",
    "establishment_id": 9,
    "establishment_name": "Teste Avançado",
    "api_key": "12345678...",
    "found_at": "2025-07-14T18:30:00.000Z"
  }
}
```

### 1.2. Verificar Telefone Existente

**Endpoint:** `GET /webhook/n8n-check-phone/:establishmentId/:phone`

**Descrição:** Verifica se um telefone já está cadastrado no estabelecimento específico.

**Exemplo de Uso:**
```
GET https://salao-online-jpamdoliveira.replit.app/webhook/n8n-check-phone/9/11988775544
```

**Resposta:**
```json
{
  "exists": true
}
```

### 1.3. Criar Novo Cliente

**Endpoint:** `POST /webhook/n8n-create-client`

**Descrição:** Cria um novo cliente com verificação de duplicatas por telefone.

**Exemplo de Uso:**
```
POST https://salao-online-jpamdoliveira.replit.app/webhook/n8n-create-client
Content-Type: application/json

{
  "establishment_id": 9,
  "name": "João Silva",
  "phone": "11999887766"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Cliente criado com sucesso",
  "data": {
    "id": 123,
    "name": "João Silva",
    "phone": "11999887766",
    "email": null,
    "establishmentId": 9,
    "createdAt": "2025-07-14T18:30:00.000Z"
  }
}
```

**Resposta:**
```json
{
  "establishment": {
    "id": 1,
    "name": "Salão Beleza Total",
    "email": "contato@salaobeleza.com",
    "phone": "(11) 99999-9999",
    "address": "Rua das Flores, 123"
  },
  "services": [
    {
      "id": 1,
      "name": "Corte de Cabelo",
      "description": "Corte feminino e masculino",
      "price": 50.00,
      "duration": 60,
      "categoryId": 1
    }
  ],
  "staff": [
    {
      "id": 1,
      "name": "Maria Silva",
      "email": "maria@salao.com",
      "phone": "(11) 88888-8888",
      "services": [1, 2, 3]
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

### 2. Verificar Disponibilidade de Horários

**Endpoint:** `GET /api/n8n/establishment/:id/availability`

**Parâmetros:**
- `date`: Data no formato YYYY-MM-DD (obrigatório)
- `staffId` (opcional): ID do profissional específico
- `serviceId` (opcional): ID do serviço - usa duração real do serviço para cálculo de slots

**Funcionalidades:**
- ✅ Respeita horários individuais dos colaboradores
- ✅ Usa duração real do serviço para calcular slots disponíveis
- ✅ Verifica conflitos de agendamentos existentes
- ✅ Considera horários passados como indisponíveis

**Exemplo de Uso:**
```
GET /api/n8n/establishment/9/availability?date=2025-08-05&staffId=11&serviceId=3
```

**Resposta de Exemplo:**
```json
{
  "date": "2025-08-05",
  "available": true,
  "establishmentId": 9,
  "staffId": 11,
  "serviceId": 3,
  "serviceDuration": 60,
  "timeSlots": [
    {
      "time": "15:40",
      "available": true,
      "isPast": false,
      "isBooked": false,
      "serviceDuration": 60,
      "endTime": "16:40"
    }
  ]
}
```

**Resposta:**
```json
{
  "date": "2025-07-04",
  "available": true,
  "establishmentId": 1,
  "staffId": 1,
  "serviceId": 5,
  "serviceDuration": 40,
  "businessHours": {
    "openTime": "09:00",
    "closeTime": "18:00"
  },
  "timeSlots": [
    {
      "time": "09:00",
      "endTime": "09:40",
      "available": true,
      "serviceDuration": 40,
      "isPast": false,
      "isBooked": false
    },
    {
      "time": "09:10",
      "endTime": "09:50",
      "available": true,
      "serviceDuration": 40,
      "isPast": false,
      "isBooked": false
    }
  ]
}
```

### 3. Criar Agendamento

**Endpoint:** `POST /api/n8n/establishment/:id/appointment`

**Corpo da Requisição:**
```json
{
  "clientData": {
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 77777-7777",
    "address": "Rua A, 123",
    "notes": "Cliente preferencial"
  },
  "appointmentData": {
    "staffId": 1,
    "serviceId": 1,
    "dataInicio": "2025-07-04T10:00:00.000Z",
    "dataFim": "2025-07-04T11:00:00.000Z",
    "notes": "Agendamento via WhatsApp",
    "price": 50.00
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Agendamento criado com sucesso",
  "data": {
    "appointmentId": 123,
    "clientId": 45,
    "establishmentId": 1,
    "scheduledTime": "2025-07-04T10:00:00.000Z",
    "status": "agendado"
  }
}
```

### 4. Confirmar Agendamento

**Endpoint:** `PUT /api/n8n/appointment/:id/confirm`

**Exemplo de Uso:**
```
PUT /api/n8n/appointment/123/confirm
```

**Resposta:**
```json
{
  "success": true,
  "message": "Agendamento confirmado com sucesso",
  "data": {
    "appointmentId": 123,
    "status": "confirmado",
    "confirmedAt": "2025-07-04T14:30:00.000Z"
  }
}
```

## Fluxo de Uso no N8N

### 1. Identificar Estabelecimento
- Cliente envia mensagem mencionando o estabelecimento
- N8N identifica o ID do estabelecimento (1, 2, 3, etc.)

### 2. Buscar Informações
- Fazer GET para `/api/n8n/establishment/:id/info`
- Obter lista de serviços e profissionais

### 3. Verificar Disponibilidade
- Cliente escolhe data
- Fazer GET para `/api/n8n/establishment/:id/availability?date=YYYY-MM-DD`
- Mostrar horários disponíveis

### 4. Criar Agendamento
- Cliente confirma dados
- Fazer POST para `/api/n8n/establishment/:id/appointment`
- Sistema cria cliente (se não existir) e agendamento

### 5. Confirmar Agendamento
- Fazer PUT para `/api/n8n/appointment/:id/confirm`
- Status muda para "confirmado"

## Tratamento de Erros

Todos os endpoints retornam códigos de status HTTP apropriados:

- **200**: Sucesso
- **400**: Dados inválidos
- **404**: Recurso não encontrado
- **409**: Conflito (horário já ocupado)
- **500**: Erro interno do servidor

## Exemplo de Integração N8N

```javascript
// 1. Buscar informações do estabelecimento
const establishmentInfo = await $http.get('/api/n8n/establishment/1/info');

// 2. Verificar disponibilidade
const availability = await $http.get('/api/n8n/establishment/1/availability?date=2025-07-04');

// 3. Criar agendamento
const appointment = await $http.post('/api/n8n/establishment/1/appointment', {
  clientData: {
    name: "Cliente WhatsApp",
    email: "cliente@email.com",
    phone: "(11) 99999-9999"
  },
  appointmentData: {
    staffId: 1,
    serviceId: 1,
    dataInicio: "2025-07-04T10:00:00.000Z",
    dataFim: "2025-07-04T11:00:00.000Z"
  }
});

// 4. Confirmar agendamento
const confirmation = await $http.put(`/api/n8n/appointment/${appointment.data.appointmentId}/confirm`);
```

## Características Importantes

1. **Multi-Tenant**: Cada estabelecimento tem seus próprios dados isolados
2. **Sem Autenticação**: Endpoints públicos para facilitar automação
3. **Detecção de Conflitos**: Verifica se horário já está ocupado
4. **Criação Automática de Clientes**: Cria cliente se não existir
5. **Horários Dinâmicos**: Calcula slots disponíveis baseado nos horários de funcionamento
6. **Validação Completa**: Verifica se estabelecimento, serviço e profissional existem

## Endpoint 5: Consulta de Establishment por Instance ID

**URL**: `GET /webhook/n8n-establishment-lookup/:instanceId`

**Descrição**: Busca dados do estabelecimento usando instance_id e envia automaticamente para N8N

**Parâmetros**:
- `instanceId`: ID da instância do WhatsApp

**Resposta**:
```json
{
  "success": true,
  "message": "Establishment ID encontrado e enviado para N8N",
  "data": {
    "instance_id": "0bf0468e-b823-40a0-8155-7b9b9ce21675",
    "establishment_id": 9,
    "establishment_name": "teste",
    "api_key": "9DA1C640...",
    "found_at": "2025-07-04T16:46:19.812Z"
  }
}
```

**Teste**:
```bash
curl -X GET "https://salao-online-jpamdoliveira.replit.app/webhook/n8n-establishment-lookup/0bf0468e-b823-40a0-8155-7b9b9ce21675"
```

## Endpoint 6: Verificação de Telefone

**URL**: `GET /webhook/n8n-check-phone/:establishmentId/:phone`

**Descrição**: Verifica se um número de telefone já existe cadastrado em um estabelecimento específico

**Parâmetros**:
- `establishmentId`: ID do estabelecimento
- `phone`: Número de telefone a ser verificado

**Resposta**:
```json
{
  "exists": true
}
```

**Teste**:
```bash
curl -X GET "https://salao-online-jpamdoliveira.replit.app/webhook/n8n-check-phone/9/11988775544"
```

**Casos de Uso**:
- Verificar se cliente já existe antes de criar novo registro
- Evitar duplicatas de clientes no sistema
- Validação de telefone em automações N8N

## Endpoint 7: Criar Novo Cliente

**URL**: `POST /webhook/n8n-create-client`

**Descrição**: Cria um novo cliente associado a um estabelecimento específico

**Parâmetros no Body**:
```json
{
  "establishment_id": 9,
  "name": "Nome do Cliente",
  "phone": "11987654321"
}
```

**Resposta de Sucesso**:
```json
{
  "success": true,
  "message": "Cliente criado com sucesso",
  "data": {
    "id": 20,
    "name": "Nome do Cliente",
    "phone": "11987654321",
    "email": null,
    "establishmentId": 9,
    "createdAt": "2025-07-11T19:18:00.000Z"
  }
}
```

**Resposta de Erro (Cliente Já Existe)**:
```json
{
  "error": "Cliente já existe",
  "message": "Já existe um cliente com o telefone 11987654321 neste estabelecimento"
}
```

**Teste**:
```bash
curl -X POST "https://salao-online-jpamdoliveira.replit.app/webhook/n8n-create-client" \
-H "Content-Type: application/json" \
-d '{
  "establishment_id": 9,
  "name": "Cliente Teste N8N",
  "phone": "11987654321"
}'
```

**Casos de Uso**:
- Criar novos clientes via automações N8N
- Integração com sistemas externos de captura de leads
- Cadastro automático de clientes via WhatsApp ou formulários web
- Prevenção de duplicatas por telefone dentro do mesmo estabelecimento

### 6. Buscar Cliente por Telefone
**Endpoint:** `GET /webhook/client/:establishmentId/:phone`

**Descrição:** Busca informações completas do cliente pelo número de telefone em um estabelecimento específico.

**Exemplo de Uso:**
```
GET https://salao-online-jpamdoliveira.replit.app/webhook/client/9/11988775544
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": {
    "clientId": 10,
    "name": "Teste Cliente Avançado",
    "phone": "11988775544",
    "email": "",
    "establishmentId": 9,
    "notes": "000\n",
    "totalSpent": "0.00",
    "lastVisit": null,
    "createdAt": "2025-06-16T10:19:47.265Z"
  }
}
```

**Resposta de Erro (Cliente Não Encontrado):**
```json
{
  "error": "Cliente não encontrado",
  "message": "Nenhum cliente encontrado com o telefone 11999999999 no estabelecimento 9"
}
```

**Casos de Uso:**
- Verificar se cliente existe antes de criar agendamento
- Buscar informações do cliente para automações WhatsApp
- Validar dados do cliente em fluxos N8N
- Recuperar clientId para outros endpoints

### 7. Buscar Profissionais/Staff com Serviços
**Endpoint:** `GET /webhook/staff/:establishmentId`

**Descrição:** Retorna todos os profissionais/staff de um estabelecimento específico, incluindo os serviços que cada um está habilitado a realizar.

**Exemplo de Uso:**
```
GET https://salao-online-jpamdoliveira.replit.app/webhook/staff/9
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": [
    {
      "id": 11,
      "establishmentId": 9,
      "name": "Staff Avançado",
      "phone": "11988776655",
      "email": "savancado@gmail.com",
      "role": "Barbeiro",
      "specialties": null,
      "salaryType": "fixed",
      "salaryAmount": "1500.00",
      "commissionRate": "20.00",
      "isAvailable": true,
      "isActive": true,
      "hasSystemAccess": false,
      "createdAt": "2025-07-15T10:30:00.000Z",
      "services": [
        {
          "id": 5,
          "name": "Corte Masculino",
          "description": "Corte tradicional masculino",
          "price": "25.00",
          "duration": 30,
          "category": "Cabelo"
        },
        {
          "id": 8,
          "name": "Barba Completa",
          "description": "Corte e modelagem de barba",
          "price": "20.00",
          "duration": 20,
          "category": "Barba"
        }
      ],
      "totalServices": 2
    }
  ],
  "count": 1,
  "establishmentId": 9
}
```

**Novos Campos na Resposta:**
- `services[]`: Array com todos os serviços que o profissional pode realizar
- `totalServices`: Número total de serviços que o profissional pode realizar

**Casos de Uso:**
- Filtrar profissionais por serviço específico
- Mostrar opções de serviços disponíveis por profissional
- Validar se um profissional pode realizar determinado serviço
- Automatizar seleção de profissional baseado no serviço escolhido

**Exemplo de Uso no N8N:**
```javascript
// Filtrar profissionais que podem fazer "Corte Masculino"
const profissionaisCorte = staff.filter(p => 
  p.services.some(s => s.name.includes("Corte"))
);

// Buscar profissional por serviceId
const profissionalPorServico = staff.find(p => 
  p.services.some(s => s.id === serviceId)
);
```

### 8. Criar Agendamento
**Endpoint:** `POST /webhook/appointment/:establishmentId`

**Descrição:** Cria um novo agendamento com validação completa de conflitos e relacionamentos.

**Exemplo de Uso:**
```
POST https://salao-online-jpamdoliveira.replit.app/webhook/appointment/9
Content-Type: application/json
```

**Payload:**
```json
{
  "clientId": 10,
  "staffId": 11,
  "serviceId": 3,
  "appointmentDate": "2025-07-22",
  "appointmentTime": "14:00",
  "notes": "Agendamento via automação N8N"
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Agendamento criado com sucesso",
  "data": {
    "id": 29,
    "establishmentId": 9,
    "clientId": 10,
    "clientName": "Teste Cliente Avançado",
    "staffId": 11,
    "staffName": "Staff Avançado",
    "serviceId": 3,
    "serviceName": "Corte Social",
    "servicePrice": "55.00",
    "serviceDuration": 60,
    "appointmentDate": "2025-07-22T14:00:00.000Z",
    "appointmentDateFormatted": "22/07/2025, 11:00",
    "status": "confirmed",
    "notes": "Agendamento via automação N8N",
    "createdAt": "2025-07-21T13:50:26.190Z"
  }
}
```

**Resposta de Erro (Conflito de Horário):**
```json
{
  "error": "Conflito de horário: já existe um agendamento para este profissional neste horário",
  "conflictingAppointment": {
    "id": 29,
    "date": "2025-07-22T14:00:00.000Z"
  }
}
```

**Validações Realizadas:**
- Verificação da existência do estabelecimento
- Verificação da existência do cliente no estabelecimento
- Verificação da existência do profissional no estabelecimento
- Verificação da existência do serviço no estabelecimento
- Detecção de conflitos de horário para o mesmo profissional
- Validação de campos obrigatórios

**Casos de Uso:**
- Criação automática de agendamentos via WhatsApp
- Integração com sistemas externos de agendamento
- Automação de reservas por formulários web
- Sincronização com calendários externos