import { storage } from './storage';

interface ScheduledLembrete {
  appointmentId: number;
  timeoutId: NodeJS.Timeout;
  scheduledTime: Date;
}

class LembreteScheduler {
  private scheduledLembretes: Map<number, ScheduledLembrete> = new Map();
  private isInitialized = false;
  private pollingInterval: NodeJS.Timeout | null = null;

  // Inicializar o scheduler
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🚀 Inicializando LembreteScheduler...');
    
    try {
      // Executar primeira busca imediatamente
      await this.executarCicloPolling();
      
      // Iniciar polling a cada 20 dias
      this.iniciarPolling20Dias();
      
      this.isInitialized = true;
      console.log('✅ LembreteScheduler inicializado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar LembreteScheduler:', error);
    }
  }

  // Iniciar polling a cada 20 dias
  private iniciarPolling20Dias() {
    const vinteDiasEmMs = 20 * 24 * 60 * 60 * 1000; // 20 dias em milissegundos
    
    this.pollingInterval = setInterval(async () => {
      try {
        console.log('🔄 Executando ciclo de polling (20 dias)...');
        await this.executarCicloPolling();
      } catch (error) {
        console.error('❌ Erro no ciclo de polling:', error);
      }
    }, vinteDiasEmMs);
    
    console.log(`⏰ Polling iniciado - próximo ciclo em 20 dias (${new Date(Date.now() + vinteDiasEmMs).toLocaleString('pt-BR')})`);
  }

  // Executar ciclo de polling
  private async executarCicloPolling() {
    try {
      console.log('📅 Buscando agendamentos dos próximos 20 dias...');
      
      const establishments = await storage.getAllEstablishments();
      
      for (const establishment of establishments) {
        await this.buscarEAgenarLembretes20Dias(establishment.id);
      }
      
      console.log('✅ Ciclo de polling concluído');
    } catch (error) {
      console.error('❌ Erro ao executar ciclo de polling:', error);
    }
  }

  // Buscar e agendar lembretes para os próximos 20 dias
  private async buscarEAgenarLembretes20Dias(establishmentId: number) {
    try {
      console.log(`🔍 Buscando agendamentos futuros para estabelecimento ${establishmentId}...`);
      
      // Buscar agendamentos futuros (método existente)
      const appointments = await storage.getNextUpcomingAppointments(establishmentId);
      
      console.log(`📋 Encontrados ${appointments.length} agendamentos futuros`);
      
      for (const appointment of appointments) {
        // Tentar agendar lembrete (só agenda se delay <= 24,8 dias)
        await this.scheduleLembrete(appointment);
      }
      
    } catch (error) {
      console.error(`❌ Erro ao buscar agendamentos para estabelecimento ${establishmentId}:`, error);
    }
  }



  // Agendar lembretes para um estabelecimento específico
  async scheduleLembretesForEstablishment(establishmentId: number) {
    try {
      const appointments = await storage.getNextUpcomingAppointments(establishmentId);
      
      for (const appointment of appointments) {
        await this.scheduleLembrete(appointment);
      }
      
    } catch (error) {
      console.error(`❌ Erro ao agendar lembretes para estabelecimento ${establishmentId}:`, error);
    }
  }

  // Agendar um lembrete específico
  async scheduleLembrete(appointment: any) {
    try {
      const appointmentId = appointment.id;
      
      console.log(`🔍 DEBUG: Tentando agendar lembrete para agendamento ${appointmentId}`);
      console.log(`🔍 DEBUG: appointment.dataInicio = ${appointment.dataInicio}`);
      console.log(`🔍 DEBUG: appointment.appointmentDate = ${appointment.appointmentDate}`);
      
      // Se já está agendado, cancelar o anterior
      this.cancelLembrete(appointmentId);
      
      // O appointmentDate está salvo como horário local de São Paulo
      // Precisamos converter para UTC para comparação correta
      const dataInicio = new Date(appointment.dataInicio || appointment.appointmentDate);
      
      // Converter de São Paulo (UTC-3) para UTC
      const brazilOffset = -3 * 60 * 60 * 1000; // UTC-3 em milissegundos
      const dataInicioUTC = new Date(dataInicio.getTime() - brazilOffset);
      
      // Calcular lembrete em UTC (30 minutos antes)
      const lembreteTimeUTC = new Date(dataInicioUTC.getTime() - 30 * 60 * 1000);
      const now = new Date();
      
      console.log(`🔍 DEBUG: dataInicio (local) = ${dataInicio.toISOString()}`);
      console.log(`🔍 DEBUG: dataInicioUTC = ${dataInicioUTC.toISOString()}`);
      console.log(`🔍 DEBUG: lembreteTimeUTC = ${lembreteTimeUTC.toISOString()}`);
      console.log(`🔍 DEBUG: now = ${now.toISOString()}`);
      
      // Calcular delay em milissegundos (comparação em UTC)
      const delayMs = lembreteTimeUTC.getTime() - now.getTime();
      
      console.log(`🔍 DEBUG: delayMs = ${delayMs} ms (${Math.floor(delayMs / (1000 * 60))} minutos)`);
      
      // Se o lembrete já passou, não agendar
      if (delayMs <= 0) {
        console.log(`⏰ Lembrete para agendamento ${appointmentId} já passou - não agendando`);
        console.log(`🔍 DEBUG: Saindo da função scheduleLembrete por delayMs <= 0`);
        return;
      }
      
      // Verificar se o delay excede o limite do setTimeout (2.147.483.647 ms ≈ 24.8 dias)
      const maxTimeoutMs = 2147483647;
      
      if (delayMs > maxTimeoutMs) {
        console.log(`⏰ Lembrete para agendamento ${appointmentId} muito distante (${Math.floor(delayMs / (1000 * 60 * 60 * 24))} dias) - não agendando agora`);
        console.log(`🔍 DEBUG: Saindo da função scheduleLembrete por delayMs > maxTimeout`);
        return;
      }
      
      console.log(`🔍 DEBUG: Passou pelas verificações, agendando lembrete...`);
      
      // Agendar o lembrete
      const timeoutId = setTimeout(async () => {
        console.log(`🔍 DEBUG: setTimeout executado para agendamento ${appointmentId}`);
        await this.executeLembrete(appointment);
      }, delayMs);
      
      // Armazenar informações do lembrete agendado
      this.scheduledLembretes.set(appointmentId, {
        appointmentId,
        timeoutId,
        scheduledTime: lembreteTimeUTC
      });
      
      console.log(`⏰ Lembrete agendado para agendamento ${appointmentId} em ${Math.floor(delayMs / (1000 * 60))} minutos (${lembreteTimeUTC.toLocaleString('pt-BR')})`);
      console.log(`🔍 DEBUG: Total de lembretes agendados: ${this.scheduledLembretes.size}`);
      console.log(`🔍 DEBUG: Finalizando função scheduleLembrete com sucesso`);
      
    } catch (error) {
      console.error(`❌ Erro ao agendar lembrete para agendamento ${appointment.id}:`, error);
    }
  }

  // Executar o lembrete
  private async executeLembrete(appointment: any) {
    try {
      console.log(`🔔 Executando lembrete para agendamento ${appointment.id}`);
      
      // Buscar dados completos do agendamento
      const establishment = await storage.getEstablishment(appointment.establishmentId);
      const webhookData = await storage.getN8nWebhookData(appointment.establishmentId);
      
      // Preparar dados do lembrete
      const lembreteData = {
        cliente_nome: appointment.clientName,
        cliente_id: appointment.clientId,
        cliente_telefone: appointment.clientPhone,
        cliente_email: appointment.clientEmail,
        estabelecimento_nome: establishment?.name || 'Estabelecimento',
        estabelecimento_id: appointment.establishmentId,
        instance_id: webhookData?.instanceId || '',
        servico_nome: appointment.serviceName,
        servico_preco: appointment.servicePrice,
        servico_duracao: appointment.duration,
        profissional_nome: appointment.staffName,
        agendamento_id: appointment.id,
        agendamento_data: new Date(appointment.appointmentDate).toLocaleDateString('pt-BR'),
        agendamento_hora: new Date(appointment.appointmentDate).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        agendamento_data_completa: appointment.appointmentDate,
        agendamento_status: appointment.status,
        agendamento_observacoes: appointment.notes || ''
      };

      // Enviar para o N8N
      const n8nWebhookUrl = 'https://n8n-n8n-start.ayp7v6.easypanel.host/webhook/lembrete';
      
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          total_lembretes: 1,
          lembretes: [lembreteData],
          timestamp: new Date().toISOString(),
          message: `Lembrete automático enviado para agendamento ${appointment.id}`
        })
      });
      
      if (response.ok) {
        console.log(`✅ Lembrete enviado com sucesso para agendamento ${appointment.id}`);
      } else {
        console.error(`❌ Erro ao enviar lembrete para agendamento ${appointment.id}. Status: ${response.status}`);
      }
      
      // Remover do mapa de lembretes agendados
      this.scheduledLembretes.delete(appointment.id);
      
    } catch (error) {
      console.error(`❌ Erro ao executar lembrete para agendamento ${appointment.id}:`, error);
    }
  }

  // Cancelar um lembrete agendado
  cancelLembrete(appointmentId: number) {
    const scheduled = this.scheduledLembretes.get(appointmentId);
    if (scheduled) {
      clearTimeout(scheduled.timeoutId);
      this.scheduledLembretes.delete(appointmentId);
      console.log(`❌ Lembrete cancelado para agendamento ${appointmentId}`);
    }
  }

  // Cancelar todos os lembretes
  cancelAllLembretes() {
    this.scheduledLembretes.forEach((scheduled) => {
      clearTimeout(scheduled.timeoutId);
    });
    this.scheduledLembretes.clear();
    

    
    // Parar polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    console.log('❌ Todos os lembretes cancelados e reavaliação parada');
  }

  // Obter status dos lembretes agendados
  getStatus() {
    const status = {
      totalAgendados: this.scheduledLembretes.size,
      lembretes: Array.from(this.scheduledLembretes.values()).map(scheduled => ({
        appointmentId: scheduled.appointmentId,
        scheduledTime: scheduled.scheduledTime,
        timeUntilExecution: scheduled.scheduledTime.getTime() - Date.now()
      }))
    };
    
    return status;
  }

  // Recarregar todos os lembretes (útil quando novos agendamentos são criados)
  async reloadAllLembretes() {
    console.log('🔄 Recarregando todos os lembretes...');
    this.cancelAllLembretes();
    await this.initialize();
  }
}

// Instância global do scheduler
export const lembreteScheduler = new LembreteScheduler();
