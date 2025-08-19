import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { queryClient } from '@/lib/queryClient';

interface WebSocketMessage {
  type: 'appointment_change' | 'financial_change' | 'new_notification' | 'dashboard_change' | 'client_change' | 'inventory_change' | 'staff_dashboard_change' | 'staff_appointment_notification';
  staffId?: number;
  data?: any;
}

export function useWebSocket() {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user?.establishmentId) return;

    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    // WebSocket connection log removed for compute optimization
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // WebSocket connected log removed for compute optimization
        setIsConnected(true);
        
        // Send authentication data
        const authMessage = {
          type: 'auth',
          establishmentId: user.establishmentId,
          userId: user.id,
          userRole: user.role
        };
        
        ws.send(JSON.stringify(authMessage));
        // WebSocket auth log removed for compute optimization
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          // WebSocket message log removed for compute optimization
          
          // Handle different types of updates
          switch (message.type) {
            case 'appointment_change':
              // Optimized invalidation - only essential queries
              queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
              queryClient.invalidateQueries({ queryKey: ['/api/staff/dashboard-data'] });
              queryClient.invalidateQueries({ queryKey: ['/api/staff/next-appointment'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-appointments'] });
              queryClient.invalidateQueries({ queryKey: ['/api/finances/stats'] });
              // Log removed for compute optimization
              break;
              
            case 'financial_change':
              // Optimized invalidation - only essential queries
              queryClient.invalidateQueries({ queryKey: ['/api/finances/stats'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
              // Log removed for compute optimization
              break;
              
            case 'dashboard_change':
              // Invalidate dashboard-specific queries
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-appointments'] });
              queryClient.invalidateQueries({ queryKey: ['/api/finances/stats'] });
              // Log removed for compute optimization
              break;
              
            case 'inventory_change':
              // Invalidate inventory queries
              queryClient.invalidateQueries({ queryKey: ['/api/products'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
              queryClient.invalidateQueries({ queryKey: ['/api/finances/stats'] });
              // Log removed for compute optimization
              break;
              
            case 'new_notification':
              // Invalidate notifications
              queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
              queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread'] });
              queryClient.invalidateQueries({ queryKey: ['/api/appointments/pending'] });
              // Log removed for compute optimization
              break;
              
            case 'client_change':
              // Invalidate client queries
              queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
              queryClient.invalidateQueries({ queryKey: ['/api/clients/list'] });
              // Log removed for compute optimization
              break;
              
            case 'staff_dashboard_change':
              // Invalidate staff-specific dashboard data
              queryClient.invalidateQueries({ queryKey: ['/api/staff/dashboard-data'] });
              queryClient.invalidateQueries({ queryKey: ['/api/staff/next-appointment'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-appointments'] });
              queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
              // Log removed for compute optimization
              break;
              
            case 'staff_appointment_notification':
              // Staff-specific notification handling
              queryClient.invalidateQueries({ queryKey: ['/api/appointments/pending'] });
              queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread'] });
              queryClient.invalidateQueries({ queryKey: ['/api/staff/dashboard-data'] });
              queryClient.invalidateQueries({ queryKey: ['/api/staff/next-appointment'] });
              // Log removed for compute optimization
              break;
          }
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      ws.onclose = () => {
        // WebSocket disconnect log removed for compute optimization
        setIsConnected(false);
        
        // Try to reconnect after 3 seconds
        setTimeout(() => {
          // WebSocket reconnect log removed for compute optimization
          // The useEffect will run again and create a new connection
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('❌ Erro WebSocket:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('❌ Erro ao criar conexão WebSocket:', error);
    }

    // Cleanup function
    return () => {
      if (wsRef.current) {
        // WebSocket close log removed for compute optimization
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user?.establishmentId, user?.id, user?.role]);

  return {
    isConnected,
    sendMessage: (message: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      }
    }
  };
}