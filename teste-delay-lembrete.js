#!/usr/bin/env node

// Script para testar o cálculo do delay dos lembretes
function testarCalculoDelay() {
  console.log('🧪 Testando cálculo do delay dos lembretes...\n');
  
  // Simular diferentes cenários
  const cenarios = [
    {
      nome: "Agendamento para hoje em 2 horas",
      appointmentDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas à frente
      esperado: "Deve agendar lembrete para 1h30min"
    },
    {
      nome: "Agendamento para hoje em 1 hora",
      appointmentDate: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hora à frente
      esperado: "Deve agendar lembrete para 30min"
    },
    {
      nome: "Agendamento para hoje em 20 minutos",
      appointmentDate: new Date(Date.now() + 20 * 60 * 1000), // 20 minutos à frente
      esperado: "Deve agendar lembrete para -10min (já passou)"
    },
    {
      nome: "Agendamento para amanhã",
      appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // amanhã
      esperado: "Não deve agendar (data diferente)"
    }
  ];
  
  cenarios.forEach((cenario, index) => {
    console.log(`\n📋 Cenário ${index + 1}: ${cenario.nome}`);
    console.log(`Esperado: ${cenario.esperado}`);
    
    const now = new Date();
    const appointmentDate = cenario.appointmentDate;
    
    // Verificar se é o mesmo dia
    const appointmentDateStr = appointmentDate.toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'});
    const currentDateStr = now.toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'});
    
    console.log(`Data do agendamento: ${appointmentDateStr}`);
    console.log(`Data atual: ${currentDateStr}`);
    console.log(`Mesmo dia: ${appointmentDateStr === currentDateStr ? '✅ Sim' : '❌ Não'}`);
    
    if (appointmentDateStr !== currentDateStr) {
      console.log(`❌ Não agendaria lembrete - data diferente`);
      return;
    }
    
    // Calcular horário do lembrete (30 minutos antes)
    const lembreteTime = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
    
    // Calcular delay em milissegundos
    const delay = lembreteTime.getTime() - now.getTime();
    
    console.log(`Horário atual: ${now.toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo'})}`);
    console.log(`Horário do agendamento: ${appointmentDate.toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo'})}`);
    console.log(`Horário do lembrete: ${lembreteTime.toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo'})}`);
    console.log(`Delay: ${Math.round(delay/1000/60)} minutos (${delay} ms)`);
    
    if (delay <= 0) {
      console.log(`❌ Não agendaria lembrete - já passou do horário`);
    } else {
      console.log(`✅ Agendaria lembrete em ${Math.round(delay/1000/60)} minutos`);
    }
  });
  
  console.log('\n🎯 Teste concluído!');
}

// Executar o teste
testarCalculoDelay();