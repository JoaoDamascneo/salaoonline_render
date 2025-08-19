import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, ChevronLeft, ChevronRight, Edit, X, Clock, User, Scissors, Calendar, Check, RefreshCw } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";

// Toast system removed for cleaner UX
import { useLocation } from "wouter";
import { AppointmentScheduler } from "@/components/AppointmentScheduler";
import { useAuth } from "@/hooks/useAuth";

// Schema para formulário de agendamento
const appointmentSchema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  staffId: z.string().min(1, "Profissional é obrigatório"),
  appointmentDate: z.string().min(1, "Data é obrigatória"),
  appointmentTime: z.string().min(1, "Horário é obrigatório"),
  notes: z.string().optional(),
});

// Horários de funcionamento (8h às 18h, intervalos de 30min)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

export default function Appointments() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [preSelectedClient, setPreSelectedClient] = useState<{id: string, name: string} | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { user } = useAuth();
  const isStaff = user?.role === 'staff';
  
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50); // Show only 50 appointments per page

  // Optimized query with pagination, date filtering, and status filtering
  const { data: appointmentsData, isLoading, isFetching } = useQuery({
    queryKey: ["/api/appointments", currentPage, pageSize, format(currentDate, 'yyyy-MM'), statusFilter],
    queryFn: async () => {
      // Only load current month's appointments + pagination + status filter
      try {
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', pageSize.toString());
        params.append('month', format(currentDate, 'yyyy-MM'));
        params.append('status', statusFilter);
        
        const url = `/api/appointments?${params.toString()}`;
        console.log('🔍 Fetching appointments from:', url);
        
        // Add authentication headers
        const headers: Record<string, string> = {};
        if (user?.id && user?.establishmentId) {
          headers["x-user-id"] = user.id.toString();
          headers["x-establishment-id"] = user.establishmentId.toString();
          headers["x-user-role"] = user.role || "admin";
        }
        
        const response = await fetch(url, {
          headers,
          credentials: "include"
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        console.log('✅ Appointments data received:', data.total);
        return data;
      } catch (error) {
        console.error('❌ Error fetching appointments:', error);
        throw error;
      }
    },
    // staleTime: Infinity (padrão) - atualiza apenas via WebSocket invalidation
    retry: 2,
  });
  
  // Extract appointments from paginated response
  const appointments = appointmentsData?.appointments || [];
  const totalAppointments = appointmentsData?.total || 0;

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: services } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ["/api/staff"],
  });

  // Get current staff member's ID for staff users  
  const currentStaffMember = isStaff && staff && Array.isArray(staff) ? 
    staff.find((member: any) => member.name === user?.name || member.email === user?.email) : 
    null;
    
  // Auto-set staff filter for staff users
  useEffect(() => {
    if (isStaff && currentStaffMember && selectedStaffId === "all") {
      setSelectedStaffId(currentStaffMember.id.toString());
    }
  }, [isStaff, currentStaffMember, selectedStaffId]);

  // Reset to page 1 when month or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentDate, statusFilter]);

  // Check URL params for auto-opening modal with pre-selected client
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('clientId');
    const clientName = urlParams.get('clientName');
    const openModal = urlParams.get('openModal');
    
    if (clientId && clientName && openModal === 'true') {
      setPreSelectedClient({ id: clientId, name: decodeURIComponent(clientName) });
      setIsNewAppointmentOpen(true);
      // Clean URL
      window.history.replaceState({}, '', '/appointments');
    }
  }, [location]);

  // Check for new appointments when page becomes visible or gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      }
    };

    const handleWindowFocus = () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [queryClient]);

  // Show notification when new appointments are detected using localStorage
  useEffect(() => {
    if (appointments && Array.isArray(appointments) && appointments.length > 0) {
      const storageKey = 'appointments_count';
      const previousCount = parseInt(localStorage.getItem(storageKey) || '0');
      
      if (previousCount > 0 && appointments.length > previousCount) {
        const newAppointments = appointments.length - previousCount;
        // Toast removed for cleaner interface
      }
      
      // Update localStorage with current count
      localStorage.setItem(storageKey, appointments.length.toString());
    }
  }, [appointments]);

  // Form para novo agendamento
  const appointmentForm = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clientId: "",
      serviceId: "",
      staffId: "",
      appointmentDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : "",
      appointmentTime: "",
      notes: "",
    },
  });

  // Reset form when pre-selected client changes
  useEffect(() => {
    if (preSelectedClient) {
      appointmentForm.reset({
        clientId: preSelectedClient.id,
        serviceId: "",
        staffId: "",
        appointmentDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : "",
        appointmentTime: "",
        notes: "",
      });
    }
  }, [preSelectedClient, selectedDate, appointmentForm]);

  // Form para editar agendamento
  const editForm = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clientId: "",
      serviceId: "",
      staffId: "",
      appointmentDate: "",
      appointmentTime: "",
      notes: "",
    },
  });

  // Mutations
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof appointmentSchema>) => {
      const appointmentData = {
        clientId: data.clientId,
        serviceId: data.serviceId,
        staffId: data.staffId,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        notes: data.notes || "",
        establishmentId: user?.establishmentId || 1
      };
      return await apiRequest("/api/appointments", "POST", appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsNewAppointmentOpen(false);
      appointmentForm.reset();
      // Toast removed - form closure provides feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao criar agendamento:", error.message);
      // Toast removed - errors logged to console only
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof appointmentSchema> }) => {
      const appointmentData = {
        clientId: data.clientId,
        serviceId: data.serviceId,
        staffId: data.staffId,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        notes: data.notes || "",
        establishmentId: user?.establishmentId || 1
      };
      return await apiRequest(`/api/appointments/${id}`, "PUT", appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setEditingAppointment(null);
      editForm.reset();
      // Toast removed - form closure provides feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar agendamento:", error.message);
      // Toast removed - errors logged to console only
    },
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/appointments/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      // Toast removed - data refresh provides feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao cancelar agendamento:", error.message);
      // Toast removed - errors logged to console only
    },
  });

  const confirmAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/appointments/${id}/status`, 'PATCH', { status: 'completed' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/finances/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/date"] });
      // Toast removed - data refresh provides feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao marcar agendamento como realizado:", error.message);
      // Toast removed - errors logged to console only  
    },
  });

  // Handlers
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    appointmentForm.setValue('appointmentDate', format(date, 'yyyy-MM-dd'));
  };

  const handleEditAppointment = (appointment: any) => {
    setEditingAppointment(appointment);
    const appointmentDate = new Date(appointment.appointmentDate);
    editForm.setValue('clientId', appointment.clientId ? appointment.clientId.toString() : '');
    editForm.setValue('serviceId', appointment.serviceId ? appointment.serviceId.toString() : '');
    editForm.setValue('staffId', appointment.staffId ? appointment.staffId.toString() : '');
    editForm.setValue('appointmentDate', format(appointmentDate, 'yyyy-MM-dd'));
    editForm.setValue('appointmentTime', format(appointmentDate, 'HH:mm'));
    editForm.setValue('notes', appointment.notes || '');
  };

  const onSubmitNewAppointment = (data: z.infer<typeof appointmentSchema>) => {
    createAppointmentMutation.mutate(data);
  };

  const onSubmitEditAppointment = (data: z.infer<typeof appointmentSchema>) => {
    if (editingAppointment) {
      updateAppointmentMutation.mutate({ id: editingAppointment.id, data });
    }
  };

  // Calendar setup
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Get appointments for selected date with staff filter
  const selectedDateAppointments = selectedDate && Array.isArray(appointments) 
    ? appointments.filter((apt: any) => {
        if (!apt.appointmentDate) return false;
        // Extract date directly from string without timezone conversion
        const aptDate = apt.appointmentDate.split('T')[0];
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        const matchesDate = aptDate === selectedDateStr;
        const matchesStaff = selectedStaffId === "all" || (apt.staffId && apt.staffId.toString() === selectedStaffId);
        return matchesDate && matchesStaff;
      })
    : [];

  // Get time slots excluding already booked ones
  const getAvailableTimeSlots = () => {
    const allSlots = generateTimeSlots();
    const selectedDateStr = appointmentForm.watch('appointmentDate');
    if (!selectedDateStr) return allSlots;

    const bookedSlots = Array.isArray(appointments) 
      ? appointments
          .filter((apt: any) => {
            if (!apt.appointmentDate) return false;
            // Extract date directly from string without timezone conversion
            const aptDate = apt.appointmentDate.split('T')[0];
            return aptDate === selectedDateStr;
          })
          .map((apt: any) => {
            // Extract time directly from string without timezone conversion
            const timePart = apt.appointmentDate.split('T')[1];
            return timePart ? timePart.substring(0, 5) : '';
          })
      : [];

    return allSlots.filter(slot => !bookedSlots.includes(slot));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 animate-pulse" />
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agendamentos</h2>
          {isFetching && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              Atualizando...
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/appointments"] })}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsNewAppointmentOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>



      {/* Calendar */}
      <Card className="mobile-fix-container">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="card-content-mobile">
          {/* Calendar Grid */}
          <div className="calendar-grid grid grid-cols-7 gap-1 mb-4">
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>
          <div className="calendar-grid grid grid-cols-7 gap-1">
            {/* Empty cells for days before month start */}
            {Array.from({ length: monthStart.getDay() }, (_, i) => (
              <div key={`empty-${i}`} className="p-2 text-center text-sm text-gray-400" />
            ))}
            
            {/* Month days */}
            {monthDays.map(day => {
              const dayAppointments = Array.isArray(appointments) ? appointments.filter((apt: any) => 
                apt.appointmentDate && 
                isSameDay(new Date(apt.appointmentDate), day)
              ) : [];

              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  className={`calendar-day p-2 text-center text-xs sm:text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    isToday(day) 
                      ? 'bg-blue-600 text-white font-medium' 
                      : isSelected
                      ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200'
                      : isSameMonth(day, currentDate)
                      ? 'text-gray-900 dark:text-gray-100 hover:border-gray-300'
                      : 'text-gray-400'
                  }`}
                >
                  <div>{format(day, 'd')}</div>
                  {dayAppointments.length > 0 && (
                    <div className="flex justify-center mt-1">
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                        dayAppointments.length > 3 ? 'bg-red-500' : 
                        dayAppointments.length > 1 ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Appointments for Selected Date */}
      {selectedDate && (
        <Card className="mobile-fix-container">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Agendamentos para {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
              
              {/* Filtros lado a lado */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="scheduled">Confirmados</SelectItem>
                    <SelectItem value="completed">Realizados</SelectItem>
                  </SelectContent>
                </Select>

                {isStaff ? (
                  // For staff users, show only their name as locked/read-only
                  <div className="w-48">
                    <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <span className="text-gray-700 dark:text-gray-300">
                        {currentStaffMember ? currentStaffMember.name : 'Carregando...'}
                      </span>
                    </div>
                  </div>
                ) : (
                  // For admin users, show full dropdown
                  <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os profissionais</SelectItem>
                      {!staffLoading && staff && Array.isArray(staff) ? staff.map((member: any) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.name}
                        </SelectItem>
                      )) : null}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="card-content-mobile">
            {selectedDateAppointments.length > 0 ? (
              <div className="space-y-4">
                {selectedDateAppointments.map((appointment: any) => (
                  <div key={appointment.id} className="appointment-card flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">{appointment.clientName}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Scissors className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{appointment.serviceName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{appointment.appointmentDate.split('T')[1].slice(0, 5)} - {appointment.staffName}</span>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{appointment.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
                      <Badge variant={
                        appointment.status === "completed" ? "default" :
                        appointment.status === "confirmed" ? "default" :
                        appointment.status === "cancelled" ? "destructive" :
                        appointment.status === "in_progress" ? "secondary" :
                        "outline"
                      } className="self-start sm:self-center">
                        {appointment.status === "completed" ? "Realizado" :
                         appointment.status === "confirmed" ? "Confirmado" :
                         appointment.status === "cancelled" ? "Cancelado" :
                         appointment.status === "in_progress" ? "Em Andamento" :
                         "Agendado"}
                      </Badge>
                      <div className="button-group-mobile sm:flex sm:gap-1">
                        {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmAppointmentMutation.mutate(appointment.id)}
                            disabled={confirmAppointmentMutation.isPending}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Marcar como realizado"
                          >
                            <Check className="h-4 w-4" />
                            <span className="sm:hidden ml-2">Realizar</span>
                          </Button>
                        )}
                        {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAppointment(appointment)}
                            title="Editar agendamento"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sm:hidden ml-2">Editar</span>
                          </Button>
                        )}
                        {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelAppointmentMutation.mutate(appointment.id)}
                            disabled={cancelAppointmentMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Cancelar agendamento"
                          >
                            <X className="h-4 w-4" />
                            <span className="sm:hidden ml-2">Cancelar</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Nenhum agendamento para esta data
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Appointment Dialog */}
      <Dialog open={!!editingAppointment} onOpenChange={() => setEditingAppointment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEditAppointment)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.isArray(clients) && clients.map((client: any) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviço</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.isArray(services) && services.map((service: any) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name} - R$ {service.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="staffId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissional</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um profissional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.isArray(staff) && staff.map((member: any) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Horário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {generateTimeSlots().map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Observações sobre o agendamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingAppointment(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateAppointmentMutation.isPending}>
                  {updateAppointmentMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* AppointmentScheduler Component */}
      <AppointmentScheduler
        isOpen={isNewAppointmentOpen}
        onOpenChange={setIsNewAppointmentOpen}
        initialData={preSelectedClient ? {
          clientId: parseInt(preSelectedClient.id),
          clientName: preSelectedClient.name,
          appointmentDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
        } : undefined}
      />
    </div>
  );
}