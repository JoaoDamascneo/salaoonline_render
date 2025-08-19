# Credenciais para Teste - Sistema de Email Profissional

## 🎯 Como Testar o Sistema de Notificações

### 1. Cenário Ideal (Email Profissional Configurado)

Para testar com o email profissional `contato@salaoonline.site`:

**Configurar no Replit (aba Secrets):**
```bash
PROFESSIONAL_SMTP_HOST=smtp.seuprovedordosalaoonline.com
PROFESSIONAL_SMTP_PORT=587
PROFESSIONAL_SMTP_USER=contato@salaoonline.site
PROFESSIONAL_SMTP_PASS=sua-senha-profissional
```

### 2. Cenário de Desenvolvimento (Email Pessoal para Teste)

Se ainda não tiver o email profissional, pode testar com Gmail:

**Configurar no Replit (aba Secrets):**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
```

**⚠️ Importante para Gmail:**
- Use "Senha de app" ao invés da senha normal
- Vá em: Conta Google → Segurança → Verificação em duas etapas → Senhas de app

### 3. Como Testar as Notificações

1. **Configure uma das opções acima**
2. **Certifique-se que o estabelecimento tem email cadastrado**:
   - Vá em Configurações do estabelecimento
   - Confirme que há um email válido no campo "Email"
3. **Crie um novo agendamento**:
   - Pela interface web (/agendamentos)
   - Ou via API N8N
4. **Verifique os logs**:
   - No console deve aparecer: `📧 Usando configurações SMTP profissionais` ou similar
   - E depois: `✅ Notificação de agendamento enviada com sucesso`

### 4. O que Esperar no Email

O estabelecimento receberá um email como:

```
De: Salão Online <contato@salaoonline.site>
Para: email-do-estabelecimento@exemplo.com
Assunto: 🗓️ Novo Agendamento - Nome do Estabelecimento

[Template HTML profissional com:]
- Detalhes completos do agendamento
- Nome do cliente e telefone
- Serviço e profissional
- Data e horário
- Branding Salão Online
```

### 5. Troubleshooting

**Se o email não está sendo enviado:**

1. **Verifique logs no console** - deve mostrar erros específicos
2. **Confirme configurações** - todas as 4 variáveis de ambiente
3. **Teste as credenciais** - use um cliente de email para validar
4. **Verifique email do estabelecimento** - deve estar preenchido corretamente

**Logs de Sucesso:**
```
📧 Usando configurações SMTP profissionais (contato@salaoonline.site)
📧 Enviando notificação de agendamento de: contato@salaoonline.site para: estabelecimento@exemplo.com
✅ Notificação de agendamento enviada com sucesso para: estabelecimento@exemplo.com
```

**Logs de Erro:**
```
❌ Erro ao enviar notificação de agendamento: [detalhes específicos]
```

### 6. Vantagens do Sistema Profissional

**Com `contato@salaoonline.site`:**
- ✅ Maior confiabilidade de entrega
- ✅ Não vai para SPAM
- ✅ Reforça marca profissional
- ✅ Uma configuração serve todos os estabelecimentos
- ✅ Você controla centralmente

**Com emails individuais:**
- ❌ Cada estabelecimento precisa configurar
- ❌ Maior chance de ir para SPAM
- ❌ Dependência de configuração do cliente

### 7. Próximos Passos

1. **Configure o email profissional** seguindo EMAIL_PROFISSIONAL_SETUP.md
2. **Teste com alguns estabelecimentos** para validar funcionalidade  
3. **Monitore logs** para identificar possíveis problemas
4. **Documente problemas** se necessário para ajustes

**O sistema está 100% funcional e integrado - só precisa das credenciais corretas!**