# 🚀 Guia Completo de Implantação no Render

Este guia irá ajudá-lo a implantar o sistema Salão Online no Render, removendo todas as dependências do Replit.

## ✅ Pré-requisitos

1. **Conta no Render** - [render.com](https://render.com)
2. **Conta no Neon** - [neon.tech](https://neon.tech) (banco PostgreSQL gratuito)
3. **Conta no Stripe** - [stripe.com](https://stripe.com) (pagamentos)
4. **Conta no SendGrid** - [sendgrid.com](https://sendgrid.com) (emails)
5. **Repositório Git** - GitHub, GitLab ou Bitbucket

## 📋 Checklist de Preparação

### 1. Banco de Dados (Neon)

1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a string de conexão (DATABASE_URL)
   - Formato: `postgresql://user:password@host:port/database`

### 2. Stripe (Pagamentos)

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com)
2. Vá em **Developers > API keys**
3. Copie a **Secret key** (começa com `sk_live_`)
4. Vá em **Developers > Webhooks**
5. Crie um novo webhook:
   - URL: `https://seu-app.onrender.com/api/stripe-webhook` (será atualizada depois)
   - Eventos: `checkout.session.completed`, `invoice.payment_succeeded`
6. Copie o **Signing secret** (começa com `whsec_`)

### 3. SendGrid (Emails)

1. Crie uma conta no [SendGrid](https://sendgrid.com)
2. Vá em **Settings > API Keys**
3. Crie uma nova API Key com permissões de **Mail Send**
4. Copie a chave da API

## 🚀 Implantação no Render

### Passo 1: Conectar Repositório

1. Faça login no [Render](https://render.com)
2. Clique em "New +" > "Web Service"
3. Conecte seu repositório (GitHub/GitLab/Bitbucket)
4. Selecione o repositório do Salão Online

### Passo 2: Configurar Serviço

Configure o serviço com os seguintes dados:

- **Name:** `salao-online`
- **Environment:** `Node`
- **Region:** Escolha a mais próxima (ex: São Paulo)
- **Branch:** `main` (ou sua branch principal)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### Passo 3: Variáveis de Ambiente

Clique em "Environment" e adicione as seguintes variáveis:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Stripe
STRIPE_SECRET_KEY_LIVE=sk_live_sua_chave_aqui
STRIPE_WEBHOOK_SECRET_LIVE=whsec_seu_webhook_secret_aqui

# Email (SendGrid)
SENDGRID_API_KEY=SG_sua_chave_sendgrid_aqui

# Session
SESSION_SECRET=uma_chave_secreta_aleatoria_muito_longa_aqui

# Email Settings
EMAIL_FROM=contato@salaoonline.site
EMAIL_NAME=Salão Online

# Base URL (será atualizada após o deploy)
BASE_URL=https://seu-app.onrender.com

# Environment
NODE_ENV=production
```

### Passo 4: Deploy

1. Clique em "Create Web Service"
2. Aguarde o build e deploy (5-10 minutos)
3. Anote a URL gerada (ex: `https://salao-online-abc123.onrender.com`)

### Passo 5: Configurar Webhook do Stripe

Após o deploy, atualize o webhook do Stripe:

1. Vá no [Dashboard do Stripe](https://dashboard.stripe.com)
2. **Developers > Webhooks**
3. Edite o webhook criado
4. Atualize a URL para: `https://sua-url-render.onrender.com/api/stripe-webhook`
5. Salve as alterações

### Passo 6: Atualizar BASE_URL

1. No Render, vá nas configurações do seu serviço
2. **Environment**
3. Atualize a variável `BASE_URL` com a URL real do seu app
4. Clique em "Save Changes"
5. O serviço será reiniciado automaticamente

## 🔧 Configuração Pós-Deploy

### 1. Testar Funcionalidades

Acesse sua URL e teste:

- ✅ Registro de estabelecimento
- ✅ Login de administrador
- ✅ Criação de funcionários
- ✅ Agendamento de horários
- ✅ Pagamentos (teste com cartão de teste do Stripe)

### 2. Configurar Domínio Personalizado (Opcional)

1. No Render, vá em **Settings**
2. **Custom Domains**
3. Adicione seu domínio
4. Configure os registros DNS conforme instruções

### 3. Monitoramento

- **Logs:** Acesse a aba "Logs" no Render para monitorar erros
- **Métricas:** Monitore o uso de recursos na aba "Metrics"

## 🛠️ Desenvolvimento Local

Para desenvolvimento local:

```bash
# Clonar repositório
git clone seu-repositorio
cd salao-online

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Edite o arquivo .env com suas configurações

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🔍 Troubleshooting

### Erro de Build

Se o build falhar:

1. Verifique os logs no Render
2. Certifique-se de que todas as dependências estão no `package.json`
3. Verifique se o Node.js está configurado corretamente

### Erro de Banco de Dados

1. Verifique se a `DATABASE_URL` está correta
2. Certifique-se de que o banco Neon está ativo
3. Verifique se as migrações foram executadas

### Erro de Pagamentos

1. Verifique as chaves do Stripe
2. Confirme se o webhook está configurado corretamente
3. Teste com cartões de teste do Stripe

### Erro de Emails

1. Verifique a chave do SendGrid
2. Confirme se o domínio está verificado no SendGrid
3. Teste o envio de emails

## 📞 Suporte

- **Documentação Render:** [docs.render.com](https://docs.render.com)
- **Documentação Neon:** [neon.tech/docs](https://neon.tech/docs)
- **Documentação Stripe:** [stripe.com/docs](https://stripe.com/docs)

## ✅ Checklist Final

- [ ] Banco de dados configurado (Neon)
- [ ] Stripe configurado (chaves + webhook)
- [ ] SendGrid configurado
- [ ] Deploy no Render realizado
- [ ] Webhook do Stripe atualizado
- [ ] BASE_URL configurada
- [ ] Funcionalidades testadas
- [ ] Domínio personalizado configurado (opcional)

---

**🎉 Parabéns!** Seu sistema Salão Online está agora implantado no Render e pronto para uso em produção!
