const https = require('https');

// Configurações do teste
const BASE_URL = 'https://salaoonline-render.onrender.com';

// Função para fazer requisição HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          reject(new Error(`Erro ao fazer parse do JSON: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout na requisição'));
    });
  });
}

// Teste do webhook de lembretes
async function testLembreteWebhook() {
  console.log('🧪 Testando webhook de lembretes...\n');
  
  const url = `${BASE_URL}/webhook/lembrete`;
  console.log(`📡 URL: ${url}\n`);
  
  try {
    const response = await makeRequest(url);
    
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`📊 Resposta:`);
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 200) {
      console.log('\n🎉 Webhook funcionando corretamente!');
      
      if (response.data.success) {
        console.log(`📅 Total de lembretes: ${response.data.total_lembretes}`);
        
        if (response.data.lembretes && response.data.lembretes.length > 0) {
          console.log('\n📋 Lembretes encontrados:');
          response.data.lembretes.forEach((lembrete, index) => {
            console.log(`\n${index + 1}. ${lembrete.cliente_nome} - ${lembrete.servico_nome}`);
            console.log(`   🏢 Estabelecimento: ${lembrete.estabelecimento_nome} (ID: ${lembrete.estabelecimento_id})`);
            console.log(`   👤 Cliente ID: ${lembrete.cliente_id}`);
            console.log(`   📅 Data: ${lembrete.agendamento_data}`);
            console.log(`   🕐 Horário: ${lembrete.agendamento_hora}`);
            console.log(`   👨‍💼 Profissional: ${lembrete.profissional_nome}`);
            console.log(`   💰 Valor: R$ ${lembrete.servico_preco}`);
            console.log(`   📱 Telefone: ${lembrete.cliente_telefone}`);
            console.log(`   📧 Email: ${lembrete.cliente_email}`);
            console.log(`   ⏱️  Duração: ${lembrete.servico_duracao} minutos`);
            console.log(`   📝 Observações: ${lembrete.agendamento_observacoes || 'Nenhuma'}`);
          });
          
          console.log('\n💡 Pronto para enviar lembretes!');
          console.log('   Use os campos "cliente_telefone" para SMS/WhatsApp');
          console.log('   Use os campos "cliente_email" para email');
          console.log('   Todos os dados estão organizados por cliente');
        } else {
          console.log('ℹ️  Nenhum lembrete encontrado.');
        }
      }
    } else {
      console.log('❌ Erro na resposta do webhook');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar webhook:', error.message);
  }
}

// Executar o teste
testLembreteWebhook();
