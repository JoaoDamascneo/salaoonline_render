# Configuração do Webhook Stripe para Pagamento Automático

## URL do Webhook
```
https://salao-online-jpamdoliveira.replit.app/api/stripe-webhook
```

## Eventos que devem ser configurados no Stripe Dashboard:
1. `checkout.session.completed` - Quando checkout é finalizado
2. `checkout.session.async_payment_succeeded` - Quando checkout assíncrono é finalizado
3. `invoice.payment_succeeded` - Quando pagamento de fatura é bem-sucedido  
4. `payment_intent.succeeded` - Quando intenção de pagamento é bem-sucedida

## Como configurar no Stripe Dashboard:

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em "Add endpoint"
3. Cole a URL: `https://salao-online-jpamdoliveira.replit.app/api/stripe-webhook`
4. Selecione os eventos:
   - checkout.session.completed
   - checkout.session.async_payment_succeeded
   - invoice.payment_succeeded
   - payment_intent.succeeded
5. Clique em "Add endpoint"

## Status Atual:
✅ Webhook endpoint implementado e funcionando
✅ Processamento automático de pagamento implementado
✅ Webhook configurado no Stripe Dashboard
✅ Sistema 100% automático - TESTADO E FUNCIONANDO!
✅ Processa eventos: checkout.session.async_payment_succeeded
✅ Contas criadas automaticamente após pagamento confirmado

## Teste Manual:
Para testar o processamento manualmente, use:
```bash
curl -X POST http://localhost:5000/api/confirm-payment-manual \
  -H "Content-Type: application/json" \
  -d '{"stripeCustomerId": "SEU_CUSTOMER_ID"}'
```

## Fluxo Automático:
1. Cliente paga no Stripe Checkout
2. Stripe envia webhook para nossa URL
3. Sistema automaticamente:
   - Busca registro pendente
   - Cria estabelecimento
   - Cria usuário admin
   - Marca registro como completado
4. Cliente pode fazer login imediatamente