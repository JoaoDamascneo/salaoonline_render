# 🚀 Guia de Implantação Personalizado - Render

Este guia contém suas configurações específicas para implantar o Salão Online no Render.

## ✅ Suas Configurações Atuais

Você já possui todas as configurações necessárias do Replit. Vamos transferi-las para o Render.

### 📋 Variáveis de Ambiente para o Render

Ao criar o serviço no Render, adicione estas variáveis exatas na seção **Environment**:

```bash
# Database (Neon)
DATABASE_URL=postgresql://username:password@host:port/database

# Session
SESSION_SECRET=sua_chave_secreta_aqui

# Stripe (Produção)
STRIPE_SECRET_KEY_LIVE=sk_live_sua_chave_aqui
STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_sua_chave_aqui
STRIPE_WEBHOOK_SECRET_LIVE=whsec_seu_webhook_secret_aqui

# Stripe (Desenvolvimento - opcional)
STRIPE_SECRET_KEY=sk_test_sua_chave_aqui
VITE_STRIPE_PUBLIC_KEY=pk_live_sua_chave_aqui

# SMTP (Zoho)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=seu_email@exemplo.com
SMTP_PASS=sua_senha_aqui
SMTP_FROM_EMAIL=seu_email@exemplo.com
SMTP_FROM_NAME=Seu Nome

# Professional SMTP (mesmo que o SMTP acima)
PROFESSIONAL_SMTP_HOST=smtp.zoho.com
PROFESSIONAL_SMTP_PORT=465
PROFESSIONAL_SMTP_USER=seu_email@exemplo.com
PROFESSIONAL_SMTP_PASS=sua_senha_aqui

# Base URL (atualize depois do deploy)
BASE_URL=https://seu-app.onrender.com

# Environment
NODE_ENV=production
```

## 🚀 Passo a Passo Rápido

### 1. No Render

1. Acesse [render.com](https://render.com)
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub/GitLab
4. Configure:
   - **Name:** `salao-online`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

### 2. Adicionar Variáveis

1. Vá na aba **Environment**
2. Cole **uma por uma** as variáveis da seção acima
3. ⚠️ **IMPORTANTE:** Copie e cole exatamente como está

### 3. Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o build (5-10 minutos)
3. Anote a URL gerada (ex: `https://salao-online-abc123.onrender.com`)

### 4. Configurar Webhook do Stripe

Como você já tem o webhook configurado, apenas atualize a URL:

1. Acesse [Dashboard do Stripe](https://dashboard.stripe.com)
2. **Developers** → **Webhooks**
3. Encontre seu webhook existente
4. Atualize a URL para: `https://sua-url-render.onrender.com/api/stripe-webhook`
5. Salve as alterações

### 5. Atualizar BASE_URL

1. No Render, vá em **Environment**
2. Atualize `BASE_URL` com a URL real do seu app
3. Salve (o serviço reiniciará automaticamente)

## ✅ Verificação Rápida

Teste estes itens após o deploy:

- [ ] Site carrega normalmente
- [ ] Login funciona
- [ ] Emails são enviados (teste recuperação de senha)
- [ ] Pagamentos funcionam (teste com cartão do Stripe)
- [ ] Agendamentos são criados

## 🔧 Suas Configurações Específicas

### Banco de Dados
- **Provedor:** Neon (já configurado)
- **Status:** ✅ Ativo e funcionando

### Email
- **Provedor:** Zoho SMTP
- **Domínio:** contato@salaoonline.site
- **Status:** ✅ Configurado

### Pagamentos
- **Provedor:** Stripe
- **Modo:** Produção (Live)
- **Status:** ✅ Webhook configurado

## 🚨 Pontos de Atenção

1. **Webhook do Stripe:** Lembre-se de atualizar a URL após o deploy
2. **BASE_URL:** Deve ser atualizada com a URL real do Render
3. **SMTP:** Suas configurações Zoho já estão funcionando
4. **Banco:** Sua instância Neon já está configurada corretamente

## 📞 Se Algo Der Errado

### Erro de Build
- Verifique os logs na aba "Logs" do Render
- Certifique-se de que todas as variáveis foram copiadas corretamente

### Erro de Banco
- Sua DATABASE_URL está correta e testada
- Verifique se a instância Neon está ativa

### Erro de Email
- Suas configurações SMTP estão corretas
- Teste enviando um email de recuperação de senha

### Erro de Pagamento
- Verifique se o webhook do Stripe foi atualizado
- Teste com cartões de teste do Stripe

## 🎉 Pronto!

Com essas configurações específicas, seu sistema deve funcionar exatamente como estava no Replit, mas agora no Render com melhor performance e estabilidade!

---

**💡 Dica:** Guarde este guia, pois todas as configurações aqui são específicas do seu projeto e funcionam perfeitamente.
