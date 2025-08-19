# Configuração SMTP Completa - Sistema de Emails

## 🎯 Duas Funcionalidades de Email:

### 1. **Emails de Recuperação de Senha** (configuração individual)
### 2. **Notificações de Agendamentos** (usando email profissional) ⭐ NOVO

---

## 📧 CONFIGURAÇÃO PROFISSIONAL (RECOMENDADA)

### Email Profissional: contato@salaoonline.site

**Vantagens:**
- ✅ **100% Gratuito** após configuração inicial
- ✅ **Mais Confiável** - emails não vão para SPAM
- ✅ **Profissional** - fortalece a marca Salão Online
- ✅ **Automático** - envia notificações para todos os estabelecimentos

**Como Funciona:**
1. Você configura o email `contato@salaoonline.site` uma única vez
2. Sistema automaticamente envia notificações para os estabelecimentos
3. Cada estabelecimento recebe emails profissionais do Salão Online

**Configuração (variáveis do Replit):**
```bash
PROFESSIONAL_SMTP_HOST=smtp.seuprovedordosalaoonline.com
PROFESSIONAL_SMTP_PORT=587
PROFESSIONAL_SMTP_USER=contato@salaoonline.site
PROFESSIONAL_SMTP_PASS=senha-do-email-profissional
```

---

## 🔐 Configuração Individual (Recuperação de Senha)

Se preferir que cada estabelecimento configure seu próprio email:

## 📧 Provedores Nacionais (Brasil)

### 1. Gmail (Mais Usado) ⭐
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seuemail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM=seuemail@gmail.com
```
**Exemplo Real:**
- EMAIL_USER=salao.bela@gmail.com
- EMAIL_PASS=xpto 1234 abcd efgh (senha de app de 16 dígitos)

**Como gerar senha de app:**
1. Acesse myaccount.google.com
2. Segurança → Verificação em duas etapas (ative primeiro)
3. Senhas de app → Selecione "Email" → "Outro"
4. Digite "Salao Online" → Gerar

### 2. Outlook/Hotmail
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seuemail@outlook.com
EMAIL_PASS=suasenhanormal
EMAIL_FROM=seuemail@outlook.com
```
**Exemplo Real:**
- EMAIL_USER=salao.bela@outlook.com
- EMAIL_PASS=MinhaSenh@123 (senha normal da conta)

### 3. UOL
```bash
EMAIL_HOST=smtps.uol.com.br
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seuemail@uol.com.br
EMAIL_PASS=suasenhanormal
EMAIL_FROM=seuemail@uol.com.br
```
**Exemplo Real:**
- EMAIL_USER=salao.bela@uol.com.br
- EMAIL_PASS=minhauol2024

### 4. BOL
```bash
EMAIL_HOST=smtps.bol.com.br
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seuemail@bol.com.br
EMAIL_PASS=suasenhanormal
EMAIL_FROM=seuemail@bol.com.br
```

### 5. Terra
```bash
EMAIL_HOST=smtp.terra.com.br
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seuemail@terra.com.br
EMAIL_PASS=suasenhanormal
EMAIL_FROM=seuemail@terra.com.br
```

### 6. IG
```bash
EMAIL_HOST=smtp.ig.com.br
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seuemail@ig.com.br
EMAIL_PASS=suasenhanormal
EMAIL_FROM=seuemail@ig.com.br
```

### 7. Yahoo Brasil
```bash
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seuemail@yahoo.com.br
EMAIL_PASS=senha-de-app-16-digitos
EMAIL_FROM=seuemail@yahoo.com.br
```

## 🌎 Provedores Internacionais

### 8. Yahoo Internacional
```bash
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seuemail@yahoo.com
EMAIL_PASS=senha-de-app-16-digitos
EMAIL_FROM=seuemail@yahoo.com
```

### 9. iCloud (Apple)
```bash
EMAIL_HOST=smtp.mail.me.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=seuemail@icloud.com
EMAIL_PASS=senha-de-app-especifica
EMAIL_FROM=seuemail@icloud.com
```

## 🏢 Hospedagem/Domínio Próprio

### 10. Locaweb
```bash
EMAIL_HOST=email-ssl.com.br
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=contato@seudominio.com.br
EMAIL_PASS=suasenha123
EMAIL_FROM=contato@seudominio.com.br
```

### 11. Hostinger
```bash
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=contato@seudominio.com
EMAIL_PASS=suasenha123
EMAIL_FROM=contato@seudominio.com
```

### 12. GoDaddy
```bash
EMAIL_HOST=smtpout.secureserver.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=contato@seudominio.com
EMAIL_PASS=suasenha123
EMAIL_FROM=contato@seudominio.com
```

### 13. Kinghost
```bash
EMAIL_HOST=smtp.kinghost.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=contato@seudominio.com.br
EMAIL_PASS=suasenha123
EMAIL_FROM=contato@seudominio.com.br
```

## ⚙️ Como Configurar no Replit

1. **Vá nas Configurações do Projeto:**
   - Clique na aba "Secrets" (🔒) no painel lateral

2. **Adicione as Variáveis:**
   ```
   Key: EMAIL_HOST        Value: smtp.gmail.com
   Key: EMAIL_PORT        Value: 587
   Key: EMAIL_SECURE      Value: false
   Key: EMAIL_USER        Value: seuemail@gmail.com
   Key: EMAIL_PASS        Value: sua-senha-ou-senha-de-app
   Key: EMAIL_FROM        Value: seuemail@gmail.com
   ```

3. **Reinicie o Projeto:**
   - Clique no botão "Run" novamente

## 🧪 Como Testar

1. Acesse a página de login: `/login`
2. Clique em "Esqueceu a senha?"
3. Digite um email válido
4. Clique em "Enviar Link de Recuperação"
5. Verifique sua caixa de entrada (e pasta SPAM)

## ❗ Dicas Importantes

### Para Gmail e Yahoo:
- **OBRIGATÓRIO** usar senha de app (16 dígitos)
- **NÃO** usar a senha normal da conta
- Ativar verificação em duas etapas primeiro

### Para Outlook:
- Pode usar a senha normal da conta
- Mais simples de configurar

### Para Provedores Brasileiros (UOL, Terra, IG):
- Geralmente usam a senha normal
- Configuração mais direta

### Para Domínio Próprio:
- Consulte a documentação do seu provedor de hospedagem
- Porta geralmente é 587 ou 465
- Alguns podem exigir SSL (EMAIL_SECURE=true)

## 🔍 Solução de Problemas

**"Authentication failed":**
- Gmail/Yahoo: Use senha de app, não senha normal
- Verifique se email e senha estão corretos
- Confirme se ativou verificação em duas etapas

**Emails não chegam:**
- Verifique pasta SPAM
- Confirme configurações SMTP
- Teste com email diferente

**Erro de conexão:**
- Verifique se a porta está correta (587 ou 465)
- Teste EMAIL_SECURE=true se 587 não funcionar

## ✅ Funcionamento Após Configuração

Quando configurado corretamente:
1. Usuário clica "Esqueceu a senha?"
2. Sistema gera link único de recuperação
3. Email é enviado automaticamente
4. Usuário clica no link recebido
5. Define nova senha
6. Volta ao sistema com acesso liberado

**Todos os emails incluem design profissional e instruções claras para o usuário.**

---

## 💡 Recomendação: Use o Email Profissional

**Para máxima eficiência e profissionalismo:**
1. Configure apenas o email profissional `contato@salaoonline.site`
2. Todos os estabelecimentos receberão emails automáticos
3. Você terá controle total sobre as notificações
4. Os clientes confiarão mais na comunicação oficial

**Custo:** Gratuito após compra do domínio e configuração do email.