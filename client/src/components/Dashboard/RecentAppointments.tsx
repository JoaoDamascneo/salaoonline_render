import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, User, Calendar } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { useAuth } from "@/hooks/useAuth";

interface AppointmentData {
  id: number;
  appointmentDate: string;
  duration: number;
  status: string;
  clientName: string;
  staffId: number;
  staffName: string;
  serviceName: string;
  servicePrice: number;
}

interface Staff {
  id: number;
  name: string;
}

export function RecentAppointments() {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("all");
  const { toast } = useToast();
  const { user } = useAuth();
  const isStaff = user?.role === 'staff';

  const { data, isLoading } = useQuery<AppointmentData[]>({
    queryKey: ["/api/dashboard/recent-appointments"],
    refetchOnWindowFocus: false,
    // staleTime: Infinity (padrão) - atualiza apenas via WebSocket invalidation
  });

  const { data: staffData } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
    enabled: !isStaff, // Only load staff data if not a staff member
    staleTime: 30 * 60 * 1000, // 30 minutes - staff list rarely changes
    refetchOnWindowFocus: false,
  });

  // For staff users: show confirmed and scheduled appointments (próximos agendamentos)  
  // For admin users: show confirmed and scheduled appointments
  const filteredData = useMemo(() => {
    let appointments;
    
    if (isStaff) {
      // Staff users: show confirmed and scheduled appointments (próximos agendamentos)
      appointments = data?.filter(appointment => 
        appointment.status === 'confirmed' || appointment.status === 'scheduled'
      ) || [];
      
      // Data already comes filtered for staff from backend, sort by appointment time
      return appointments.sort((a, b) => 
        new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
      );
    } else {
      // Admin users: show confirmed and scheduled appointments
      appointments = data?.filter(appointment => 
        appointment.status === 'confirmed' || appointment.status === 'scheduled'
      ) || [];
    }
    
    // If admin/owner, allow filtering by staff
    if (selectedStaffId !== "all") {
      appointments = appointments.filter(appointment => 
        appointment.staffId.toString() === selectedStaffId
      );
    }
    
    // Sort by appointment time
    return appointments.sort((a, b) => 
      new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
    );
  }, [data, selectedStaffId, isStaff]);

  const confirmAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      return await apiRequest(`/api/appointments/${appointmentId}/status`, 'PATCH', { status: 'completed' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/finances/stats'] });
      // Toast removed - WebSocket updates provide visual feedback
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível marcar o agendamento como realizado.",
        variant: "destructive",
      });
    }
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      return await apiRequest(`/api/appointments/${appointmentId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      // Toast removed - WebSocket updates provide visual feedback
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o agendamento.",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mr-4" />
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos Agendamentos
          </h3>
          {/* Only show filter for admin/owner users, not staff */}
          {!isStaff && (
            <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos os profissionais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os profissionais</SelectItem>
                {staffData?.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id.toString()}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {isStaff 
              ? "Nenhum agendamento próximo para você" 
              : selectedStaffId === "all" 
                ? "Nenhum agendamento para hoje" 
                : "Nenhum agendamento para este profissional hoje"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próximos Agendamentos
        </h3>
        {/* Only show filter for admin/owner users, not staff */}
        {!isStaff && (
          <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos os profissionais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os profissionais</SelectItem>
              {staffData?.map((staff) => (
                <SelectItem key={staff.id} value={staff.id.toString()}>
                  {staff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {filteredData.map((appointment, index) => (
        <div key={`appointment-${appointment.id || index}`} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white truncate">
                  {appointment.clientName}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {appointment.serviceName}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <div className="text-sm font-medium">
                {new Date(appointment.appointmentDate).toLocaleDateString('pt-BR')}
              </div>
              <div className="text-sm text-gray-500">
                R$ {appointment.servicePrice}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {appointment.appointmentDate.split('T')[1].slice(0, 5)}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="truncate">{appointment.staffName}</span>
            </div>
            
            <div className="flex items-center justify-end gap-2">
              {appointment.status === 'scheduled' && (
                <>
                  <Badge 
                    variant="secondary"
                    className="text-xs"
                  >
                    Agendado
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => confirmAppointmentMutation.mutate(appointment.id)}
                    disabled={confirmAppointmentMutation.isPending || deleteAppointmentMutation.isPending}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteAppointmentMutation.mutate(appointment.id)}
                    disabled={confirmAppointmentMutation.isPending || deleteAppointmentMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
              {appointment.status === 'confirmed' && (
                <>
                  <Badge 
                    variant="default"
                    className="text-xs"
                  >
                    Confirmado
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => confirmAppointmentMutation.mutate(appointment.id)}
                    disabled={confirmAppointmentMutation.isPending || deleteAppointmentMutation.isPending}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteAppointmentMutation.mutate(appointment.id)}
                    disabled={confirmAppointmentMutation.isPending || deleteAppointmentMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
