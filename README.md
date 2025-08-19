# Salão Online - Sistema de Gestão para Salões de Beleza

Sistema completo de gestão para salões de beleza com agendamento, gestão de clientes, funcionários, serviços e pagamentos.

## 🚀 Implantação no Render

### Pré-requisitos

1. **Conta no Render** - [render.com](https://render.com)
2. **Banco de dados PostgreSQL** - Recomendamos Neon (gratuito)
3. **Conta no Stripe** - Para processamento de pagamentos
4. **Conta no SendGrid** - Para envio de emails

### Passo a Passo para Implantação

#### 1. Preparar o Banco de Dados

1. Crie uma conta no [Neon](https://neon.tech) (gratuito)
2. Crie um novo projeto
3. Copie a string de conexão (DATABASE_URL)

#### 2. Configurar Stripe

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com)
2. Vá em **Developers > API keys**
3. Copie a **Secret key** (começa com `sk_live_`)
4. Vá em **Developers > Webhooks**
5. Crie um novo webhook com URL: `https://seu-app.onrender.com/api/stripe-webhook`
6. Copie o **Signing secret** (começa com `whsec_`)

#### 3. Configurar SendGrid

1. Crie uma conta no [SendGrid](https://sendgrid.com)
2. Vá em **Settings > API Keys**
3. Crie uma nova API Key com permissões de **Mail Send**
4. Copie a chave da API

#### 4. Implantar no Render

1. **Conecte seu repositório:**
   - Faça login no Render
   - Clique em "New +" > "Web Service"
   - Conecte seu repositório GitHub/GitLab

2. **Configure o serviço:**
   - **Name:** `salao-online`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

3. **Configure as variáveis de ambiente:**
   - Clique em "Environment" na aba do seu serviço
   - Adicione as seguintes variáveis:

```
DATABASE_URL=sua-string-de-conexao-neon
STRIPE_SECRET_KEY_LIVE=sua-chave-secreta-stripe
STRIPE_WEBHOOK_SECRET_LIVE=seu-webhook-secret-stripe
SENDGRID_API_KEY=sua-chave-api-sendgrid
SESSION_SECRET=uma-chave-secreta-aleatoria-para-sessoes
EMAIL_FROM=contato@salaoonline.site
EMAIL_NAME=Salão Online
NODE_ENV=production
```

4. **Deploy:**
   - Clique em "Create Web Service"
   - Aguarde o build e deploy (pode levar alguns minutos)

#### 5. Configurar Webhook do Stripe

Após o deploy, atualize o webhook do Stripe com a URL correta:
`https://seu-app.onrender.com/api/stripe-webhook`

#### 6. Executar Migrações do Banco

O sistema executará automaticamente as migrações na primeira inicialização.

### 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Edite o arquivo .env com suas configurações

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start
```

### 📁 Estrutura do Projeto

```
├── client/          # Frontend React
├── server/          # Backend Node.js/Express
├── shared/          # Código compartilhado
├── migrations/      # Migrações do banco
└── attached_assets/ # Assets estáticos
```

### 🔧 Tecnologias Utilizadas

- **Frontend:** React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend:** Node.js, Express, TypeScript
- **Banco:** PostgreSQL com Drizzle ORM
- **Pagamentos:** Stripe
- **Emails:** SendGrid
- **Build:** Vite

### 📞 Suporte

Para dúvidas sobre a implantação, consulte a documentação do Render ou entre em contato.

---

**Nota:** Este projeto foi migrado do Replit para o Render. Todos os arquivos específicos do Replit foram removidos e o projeto está otimizado para implantação em produção.
