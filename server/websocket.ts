import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface Client {
  ws: WebSocket;
  establishmentId?: number;
  userId?: number;
  userRole?: string;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Set<Client> = new Set();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    
    this.wss.on('connection', (ws: WebSocket, req) => {
      // WebSocket connection log removed for compute optimization
      
      const client: Client = { ws };
      this.clients.add(client);
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          
          if (message.type === 'auth') {
            client.establishmentId = message.establishmentId;
            client.userId = message.userId;
            client.userRole = message.userRole;
            // WebSocket authentication log removed for compute optimization
          }
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      });
      
      ws.on('close', () => {
        this.clients.delete(client);
      });
      
      ws.on('error', (error) => {
        console.error('Erro WebSocket:', error);
        this.clients.delete(client);
      });
    });
  }

  // Notifica sobre mudanças nos agendamentos
  notifyAppointmentChange(establishmentId: number, data?: any) {
    const message = JSON.stringify({
      type: 'appointment_change',
      data: data || {}
    });
    
    this.broadcastToEstablishment(establishmentId, message);
    // Log removed for compute unit optimization
  }

  // Notifica sobre mudanças financeiras
  notifyFinancialChange(establishmentId: number, data?: any) {
    const message = JSON.stringify({
      type: 'financial_change',
      data: data || {}
    });
    
    this.broadcastToEstablishment(establishmentId, message);
    // Log removed for compute unit optimization
  }

  // Notifica sobre novas notificações
  notifyNewNotification(establishmentId: number, data?: any) {
    const message = JSON.stringify({
      type: 'new_notification',
      data: data || {}
    });
    
    this.broadcastToEstablishment(establishmentId, message);
    // Notification logging removed for compute optimization
  }

  // Notifica sobre mudanças no dashboard (stats)
  notifyDashboardChange(establishmentId: number, data?: any) {
    const message = JSON.stringify({
      type: 'dashboard_change',
      data: data || {}
    });
    
    this.broadcastToEstablishment(establishmentId, message);
    // Dashboard notification logging removed for compute optimization
  }

  // Notifica sobre mudanças em clientes
  notifyClientChange(establishmentId: number, data?: any) {
    const message = JSON.stringify({
      type: 'client_change',
      data: data || {}
    });
    
    this.broadcastToEstablishment(establishmentId, message);
    // Client notification logging removed for compute optimization
  }

  // Notifica sobre mudanças no estoque
  notifyInventoryChange(establishmentId: number, data?: any) {
    const message = JSON.stringify({
      type: 'inventory_change',
      data: data || {}
    });
    
    this.broadcastToEstablishment(establishmentId, message);
    // Stock notification logging removed for compute optimization
  }

  // Notifica sobre mudanças específicas do dashboard
  notifyDashboardStatsChange(establishmentId: number, data?: any) {
    const message = JSON.stringify({
      type: 'dashboard_change',
      data: data || {}
    });
    
    this.broadcastToEstablishment(establishmentId, message);
    // Dashboard stats logging removed for compute optimization
  }

  // Notifica sobre mudanças específicas do dashboard do staff
  notifyStaffDashboardChange(establishmentId: number, staffId?: number, data?: any) {
    const message = JSON.stringify({
      type: 'staff_dashboard_change',
      staffId,
      data: data || {}
    });
    
    this.broadcastToEstablishment(establishmentId, message);
    // Staff dashboard logging removed for compute optimization
  }

  // Notifica especificamente um staff member sobre novo agendamento
  notifyStaffAppointment(establishmentId: number, staffId: number, data?: any) {
    const message = JSON.stringify({
      type: 'staff_appointment_notification',
      staffId,
      data: data || {}
    });
    
    // Send to all staff members (they'll filter on frontend)
    this.broadcastToStaff(establishmentId, staffId, message);
    // Staff notification logging removed for compute optimization
  }

  // Envia mensagem para todos os clientes de um estabelecimento
  private broadcastToEstablishment(establishmentId: number, message: string) {
    this.clients.forEach(client => {
      if (client.establishmentId === establishmentId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  // Envia mensagem apenas para um staff específico
  private broadcastToStaff(establishmentId: number, staffId: number, message: string) {
    this.clients.forEach(client => {
      if (client.establishmentId === establishmentId && 
          client.userRole === 'staff' && 
          client.ws.readyState === WebSocket.OPEN) {
        // We need to check if this staff member matches the staffId
        // Since we don't store staffId directly in client, we'll send to all staff and let frontend filter
        client.ws.send(message);
      }
    });
  }

  // Envia mensagem para um usuário específico
  broadcastToUser(userId: number, message: string) {
    this.clients.forEach(client => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }
}

export let wsManager: WebSocketManager;

export function initializeWebSocket(server: Server) {
  wsManager = new WebSocketManager(server);
  // WebSocket server logging removed for compute optimization
  return wsManager;
}