# Configuração Email Profissional - contato@salaoonline.site

## 🎯 Visão Geral

Com o email profissional configurado, o sistema Salão Online enviará automaticamente notificações de agendamentos para todos os estabelecimentos usando `contato@salaoonline.site`, tornando a comunicação mais confiável e profissional.

## ⚙️ Configuração Técnica

### 1. Configurar no Provedor de Email

Você precisa configurar o email `contato@salaoonline.site` no seu provedor de hospedagem/email:

**Exemplos de provedores:**
- **Locaweb**: Painel de controle → Emails → Criar conta
- **Hostinger**: hPanel → Emails → Criar conta
- **GoDaddy**: Painel → Email → Criar conta
- **Google Workspace**: Admin console → Usuários

### 2. Obter Credenciais SMTP

Após criar o email, obtenha as configurações SMTP:

**Informações necessárias:**
- Servidor SMTP (ex: smtp.salaoonline.site)
- Porta (geralmente 587 ou 465)
- Usuário: contato@salaoonline.site
- Senha: a senha que você definiu

### 3. Configurar no Replit

Adicione estas variáveis na aba "Secrets" do Replit:

```bash
PROFESSIONAL_SMTP_HOST=smtp.salaoonline.site
PROFESSIONAL_SMTP_PORT=587
PROFESSIONAL_SMTP_USER=contato@salaoonline.site
PROFESSIONAL_SMTP_PASS=sua-senha-aqui
```

## 🚀 Como Funciona

### Fluxo Automático:
1. **Cliente faz agendamento** → Sistema detecta novo agendamento
2. **Sistema busca email do estabelecimento** → Da tabela establishments
3. **Envia notificação automática** → De contato@salaoonline.site para o estabelecimento
4. **Estabelecimento recebe email profissional** → Com todos os detalhes do agendamento

### Exemplo de Email Recebido:
```
De: Salão Online <contato@salaoonline.site>
Para: seusemail@estabelecimento.com
Assunto: 🗓️ Novo Agendamento - Seu Salão

Novo agendamento confirmado:
- Cliente: Maria Silva
- Serviço: Corte e Escova
- Profissional: Ana
- Data: 15/08/2025
- Horário: 14:00
- Telefone: (11) 99999-9999
```

## 💰 Custos

### Custo Inicial:
- **Domínio salaoonline.site**: ~R$ 50-80/ano
- **Email profissional**: Geralmente incluído na hospedagem

### Custo Mensal:
- **R$ 0,00** - Após configuração inicial
- Sem limites de envio (depende do plano de hospedagem)

## 🎯 Benefícios vs Configuração Individual

### Email Profissional (RECOMENDADO):
✅ **Uma configuração** serve todos os estabelecimentos  
✅ **Maior confiabilidade** - emails oficiais raramente vão para SPAM  
✅ **Controle centralizado** - você gerencia tudo  
✅ **Marca fortalecida** - clientes confiam mais  
✅ **Suporte técnico** - você resolve problemas diretamente  

### Configuração Individual:
❌ **Cada estabelecimento** precisa configurar  
❌ **Mais complexo** - suporte técnico distribuído  
❌ **Maior chance de SPAM** - emails pessoais são filtrados  
❌ **Dependência** - se o email do cliente parar, notificações param  

## 🔧 Troubleshooting

### Email não está sendo enviado:
1. Verifique se todas as variáveis estão configuradas
2. Teste as credenciais SMTP com cliente de email
3. Confirme se a porta está correta (587 ou 465)
4. Verifique logs do console para erros específicos

### Emails vão para SPAM:
1. Configure SPF record no DNS
2. Configure DKIM se disponível
3. Use remetente consistente (sempre contato@salaoonline.site)
4. Evite palavras de SPAM no assunto

### Estabelecimento não recebe:
1. Confirme se email está cadastrado corretamente
2. Peça para verificar pasta SPAM
3. Teste enviando email manual para o mesmo endereço

## 📊 Monitoramento

O sistema mostra logs no console:
- ✅ `Notificação de agendamento enviada com sucesso para: email@estabelecimento.com`
- 📧 `Usando configurações SMTP profissionais (contato@salaoonline.site)`
- ❌ `Erro ao enviar notificação de agendamento: [detalhes]`

## 🎉 Resultado Final

Quando configurado, cada novo agendamento resulta em:
1. **Email automático** enviado instantaneamente
2. **Design profissional** com logo e layout do Salão Online
3. **Informações completas** do agendamento
4. **Alta confiabilidade** de entrega
5. **Zero configuração** necessária para estabelecimentos

**Isso torna o sistema muito mais profissional e confiável para todos os usuários!**