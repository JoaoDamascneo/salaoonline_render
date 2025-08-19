import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Clock, User, Phone, Mail, Check, X, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface NotificationsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Notifications({ isOpen, onOpenChange }: NotificationsProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for pending appointments (mantido para compatibilidade)
  const { data: pendingAppointments, isLoading: isLoadingPending } = useQuery({
    queryKey: ["/api/appointments/pending"],
    // Removed refetchInterval - WebSocket notifications will handle updates
  });

  // Query for notifications
  const { data: notifications, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ["/api/notifications/unread"],
    // Removed refetchInterval - WebSocket notifications will handle updates
  });

  // Mutation for updating appointment status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest(`/api/appointments/${id}/status`, 'PATCH', { status });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      // Invalidate financial queries when appointment status changes to completed
      if (status === "completed") {
        queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/finances/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/transactions/date"] });
      }
      
      setIsDetailOpen(false);
      setSelectedAppointment(null);
      toast({
        title: "Sucesso",
        description: status === "completed" ? "Serviço marcado como realizado!" : 
                    status === "confirmed" ? "Agendamento confirmado!" : "Agendamento recusado!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar agendamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutation for marking notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return await apiRequest(`/api/notifications/${notificationId}/read`, 'PATCH');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread"] });
    },
  });

  const handleConfirm = (appointmentId: number) => {
    updateStatusMutation.mutate({ id: appointmentId, status: "confirmed" });
  };

  const handleReject = (appointmentId: number) => {
    updateStatusMutation.mutate({ id: appointmentId, status: "rejected" });
  };

  const handleComplete = (appointmentId: number) => {
    updateStatusMutation.mutate({ id: appointmentId, status: "completed" });
  };

  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsDetailOpen(true);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const formatTime = (dateString: string) => {
    // Extract time directly from the datetime string (YYYY-MM-DDTHH:MM:SS format)
    const timePart = dateString.split('T')[1];
    if (timePart) {
      return timePart.substring(0, 5); // Return HH:MM format
    }
    // Fallback
    return dateString;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const pendingCount = Array.isArray(pendingAppointments) ? pendingAppointments.length : 0;
  const notificationCount = Array.isArray(notifications) ? notifications.length : 0;
  const totalCount = pendingCount + notificationCount;
  
  const isLoading = isLoadingPending || isLoadingNotifications;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notificações
              {totalCount > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {totalCount}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : totalCount === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Nenhuma notificação pendente</p>
              <p className="text-gray-400 text-sm">Novos agendamentos aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mostrar notificações de sistema primeiro */}
              {Array.isArray(notifications) && notifications.map((notification: any) => (
                <Card key={`notification-${notification.id}`} className="border-l-4 border-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Badge variant="outline" className="text-xs px-2 py-1 mr-2">
                            {notification.type === 'appointment' ? 'Agendamento' : notification.type}
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(notification.createdAt)} às {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <h4 className="font-semibold text-base mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 whitespace-pre-line">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          disabled={markAsReadMutation.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Mostrar agendamentos pendentes depois */}
              {Array.isArray(pendingAppointments) && pendingAppointments.map((appointment: any) => (
                <Card key={appointment.id} className="border-l-4 border-orange-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <User className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-semibold">{appointment.clientName}</span>
                          <Badge className="ml-2 bg-orange-100 text-orange-800">
                            Pendente
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(appointment.appointmentDate)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(appointment.appointmentDate)}
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <span className="text-sm font-medium">{appointment.serviceName}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            • {appointment.staffName}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(appointment)}
                        >
                          Ver Detalhes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => handleConfirm(appointment.id)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Confirmar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleReject(appointment.id)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Recusar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Appointment Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-6">
              {/* Client Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Informações do Cliente
                </h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Nome:</strong> {selectedAppointment.clientName}</div>
                  {selectedAppointment.clientPhone && (
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {selectedAppointment.clientPhone}
                    </div>
                  )}
                  {selectedAppointment.clientEmail && (
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {selectedAppointment.clientEmail}
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Detalhes do Agendamento
                </h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Data:</strong> {formatDate(selectedAppointment.appointmentDate)}</div>
                  <div><strong>Horário:</strong> {formatTime(selectedAppointment.appointmentDate)}</div>
                  <div><strong>Duração:</strong> {selectedAppointment.duration} minutos</div>
                  <div><strong>Serviço:</strong> {selectedAppointment.serviceName}</div>
                  <div><strong>Profissional:</strong> {selectedAppointment.staffName}</div>
                  <div><strong>Valor:</strong> {formatCurrency(parseFloat(selectedAppointment.servicePrice || "0"))}</div>
                  {selectedAppointment.notes && (
                    <div><strong>Observações:</strong> {selectedAppointment.notes}</div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Fechar
                </Button>
                {selectedAppointment.status === "pending" && (
                  <>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleConfirm(selectedAppointment.id)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Confirmar Agendamento
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(selectedAppointment.id)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Recusar Agendamento
                    </Button>
                  </>
                )}
                {selectedAppointment.status === "confirmed" && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleComplete(selectedAppointment.id)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Marcar como Realizado
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Bell icon component with notification count
export function NotificationBell({ onClick }: { onClick: () => void }) {
  const { data: pendingAppointments } = useQuery({
    queryKey: ["/api/appointments/pending"],
    // Removed refetchInterval - WebSocket notifications will handle updates
  });

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications/unread"],
    // Removed refetchInterval - WebSocket notifications will handle updates
  });

  const pendingCount = Array.isArray(pendingAppointments) ? pendingAppointments.length : 0;
  const notificationCount = Array.isArray(notifications) ? notifications.length : 0;
  const totalCount = pendingCount + notificationCount;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative hover:bg-gradient-to-r hover:from-[#3db3ff] hover:to-[#004dde] hover:text-white transition-all"
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      {totalCount > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs p-0 flex items-center justify-center">
          {totalCount > 9 ? '9+' : totalCount}
        </Badge>
      )}
    </Button>
  );
}