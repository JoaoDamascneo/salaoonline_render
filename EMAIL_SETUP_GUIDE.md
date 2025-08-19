# Guia de Configuração de Email - Salão Online

## Como Configurar Emails Automáticos (100% Gratuito)

O sistema agora envia emails automáticos sempre que um novo agendamento é criado. Para ativar essa funcionalidade, você precisa configurar algumas variáveis de ambiente SMTP.

### Opção 1: Gmail (Recomendado - Gratuito)

**1. Ativar "Senhas de app" no Gmail:**
- Acesse sua conta Google: https://myaccount.google.com/
- Vá em "Segurança" → "Verificação em duas etapas" (ative se não estiver)
- Clique em "Senhas de app" 
- Selecione "Email" e "Outro" 
- Digite "Salao Online" e clique em "Gerar"
- Copie a senha de 16 dígitos gerada

**2. Configure as seguintes variáveis de ambiente no Replit:**

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=senha-de-app-de-16-digitos
SMTP_FROM=seu-email@gmail.com
```

### Opção 2: Outlook/Hotmail (Gratuito)

```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=seu-email@outlook.com
SMTP_PASS=sua-senha-normal
SMTP_FROM=seu-email@outlook.com
```

### Opção 3: Yahoo (Gratuito)

**1. Ativar "Senhas de app" no Yahoo:**
- Acesse: https://login.yahoo.com/account/security
- Clique em "Gerar senha de app"
- Selecione "Outro" e digite "Salao Online"
- Copie a senha gerada

**2. Configure:**
```
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=seu-email@yahoo.com
SMTP_PASS=senha-de-app-gerada
SMTP_FROM=seu-email@yahoo.com
```

## Como Adicionar no Replit

1. No seu projeto Replit, vá na aba "Secrets" (🔒)
2. Adicione cada variável uma por vez:
   - Key: `SMTP_HOST`
   - Value: `smtp.gmail.com` (ou outro provedor)
3. Repita para todas as variáveis necessárias
4. Reinicie o projeto

## O que Acontece Após Configurar

✅ **Emails automáticos serão enviados contendo:**
- Nome do cliente
- Serviço solicitado
- Profissional responsável
- Data e horário do agendamento
- Telefone do cliente (se disponível)
- Design profissional e responsivo

✅ **Você receberá notificação por email sempre que:**
- Um novo agendamento for criado
- Via interface web do sistema
- Via integração com WhatsApp/N8N

## Logs e Monitoramento

O sistema mostra logs no console:
- ✅ `Email enviado com sucesso para: email@exemplo.com`
- ❌ `Erro ao enviar email: [detalhes do erro]`
- ⚠️ `Configurações SMTP não encontradas`

## Solução de Problemas

**Erro "Authentication failed":**
- Verifique se ativou a verificação em duas etapas (Gmail)
- Use senha de app, não sua senha normal (Gmail/Yahoo)
- Verifique se o email e senha estão corretos

**Emails não chegam:**
- Verifique a pasta de SPAM
- Confirme se o email de destino (estabelecimento) está correto
- Verifique os logs no console do Replit

**Sem configuração:**
- O sistema funciona normalmente sem email
- Apenas pula o envio e mostra aviso no console
- Agendamentos são criados independentemente do status do email

## Benefícios

- ✅ **100% Gratuito** usando provedores tradicionais
- ✅ **Configuração simples** em poucos minutos  
- ✅ **Confiável** usando SMTP padrão
- ✅ **Sem limites** de envio (depende do provedor)
- ✅ **Template profissional** incluso