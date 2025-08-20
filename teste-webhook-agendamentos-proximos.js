const https = require('https');

// Configurações do teste
const BASE_URL = 'https://salaoonline-render.onrender.com';
const ESTABLISHMENT_ID = 1; // Altere para o ID do seu estabelecimento

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

// Teste do webhook
async function testUpcomingAppointmentsWebhook() {
  console.log('🧪 Testando webhook de próximos agendamentos de clientes...\n');
  
  const url = `${BASE_URL}/webhook/upcoming-appointments/${ESTABLISHMENT_ID}`;
  console.log(`📡 URL: ${url}`);
  console.log(`🏢 Establishment ID: ${ESTABLISHMENT_ID}\n`);
  
  try {
    const response = await makeRequest(url);
    
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`📊 Resposta:`);
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 200) {
      console.log('\n🎉 Webhook funcionando corretamente!');
      
      if (response.data.success) {
        console.log(`👥 Total de clientes com agendamento próximo: ${response.data.total_clients}`);
        
        if (response.data.appointments && response.data.appointments.length > 0) {
          console.log('\n📋 Próximos agendamentos por cliente:');
          response.data.appointments.forEach((apt, index) => {
            console.log(`\n${index + 1}. ${apt.client_name} - ${apt.service_name}`);
            console.log(`   📅 Data: ${apt.appointment_date_formatted}`);
            console.log(`   🕐 Horário: ${apt.appointment_time}`);
            console.log(`   👨‍💼 Profissional: ${apt.staff_name}`);
            console.log(`   💰 Valor: R$ ${apt.service_price}`);
            console.log(`   📱 Telefone para mensagem: ${apt.client_phone}`);
            console.log(`   📧 Email: ${apt.client_email}`);
          });
          
          console.log('\n💡 Pronto para enviar lembretes!');
          console.log('   Use o campo "client_phone" para enviar SMS/WhatsApp');
          console.log('   Use o campo "client_email" para enviar email');
        } else {
          console.log('ℹ️  Nenhum cliente com agendamento próximo de 30 minutos encontrado.');
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
testUpcomingAppointmentsWebhook();
