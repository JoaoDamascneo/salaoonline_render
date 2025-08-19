# Credenciais para Teste do Sistema como Colaborador

## Como testar as restrições de colaborador:

### Passo 1: Fazer Logout
Clique no botão de logout no sistema para sair da conta atual de administrador.

### Passo 2: Fazer Login como Colaborador
Use as seguintes credenciais:

**Email:** expert01@gmail.com  
**Senha:** 120300

### Passo 3: Verificar as Restrições
Após fazer login como colaborador, você verá:

**✓ Dashboard:**
- Apenas receita/faturamento dos seus próprios agendamentos
- Apenas quantidade de agendamentos que você tem para hoje
- Estatísticas globais (total de clientes, serviços ativos) ficam zeradas

**✓ Página de Agendamentos:**
- Apenas seus próprios agendamentos aparecem
- Não vê agendamentos de outros colaboradores

**✓ Página de Clientes:**
- Acesso bloqueado com mensagem: "Acesso negado. Colaboradores não podem gerenciar clientes"

**✓ Outras restrições:**
- Não pode alterar configurações do estabelecimento
- Não pode gerenciar outros colaboradores
- Não pode alterar horários de funcionamento
- Só pode ver comissões/salário próprios

### Dados do Colaborador de Teste:
- **Nome:** Expert 01
- **Cargo:** Barbeiro  
- **Estabelecimento:** Expert (ID: 2)
- **Status:** Ativo com acesso ao sistema

## Resultado Esperado:
O colaborador deve ver apenas dados relacionados aos próprios agendamentos e serviços, com acesso limitado comparado ao administrador.