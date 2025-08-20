#!/usr/bin/env node

import fetch from 'node-fetch';

const BASE_URL = 'https://salaoonline-render.onrender.com';

async function testarNotificacaoN8N() {
  try {
    console.log('🧪 Testando notificações do N8N...\n');

    // Dados de teste
    const establishmentId = 1; // Substitua pelo ID correto do seu estabelecimento
    const testData = {
      clientData: {
        name: "Cliente Teste N8N",
        email: "teste@n8n.com",
        phone: "(11) 99999-9999",
        notes: "Teste de notificação via N8N"
      },
      appointmentData: {
        staffId: 1, // Substitua pelo ID correto do staff
        serviceId: 1, // Substitua pelo ID correto do serviço
        dataInicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
        dataFim: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Amanhã + 1 hora
        duration: 60,
        notes: "Agendamento de teste via N8N"
      }
    };

    console.log('📤 Enviando requisição para N8N webhook...');
    console.log('URL:', `${BASE_URL}/webhook/n8n-appointment/${establishmentId}`);
    console.log('Dados:', JSON.stringify(testData, null, 2));

    const response = await fetch(`${BASE_URL}/webhook/n8n-appointment/${establishmentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    console.log('\n📥 Resposta do servidor:');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Body:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ Sucesso! Agendamento criado via N8N');
      console.log('🔍 Verifique se as notificações apareceram no dashboard');
    } else {
      console.log('\n❌ Erro na criação do agendamento');
    }

  } catch (error) {
    console.error('\n💥 Erro no teste:', error.message);
  }
}

// Executar o teste
testarNotificacaoN8N();
