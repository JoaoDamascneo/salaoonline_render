import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, User, Plus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import { useAuth } from "@/hooks/useAuth";

const appointmentSchema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  staffId: z.string().min(1, "Profissional é obrigatório"),
  appointmentDate: z.string().min(1, "Data é obrigatória"),
  appointmentTime: z.string().min(1, "Horário é obrigatório"),
  notes: z.string().optional(),
});

interface AppointmentSchedulerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

export function AppointmentScheduler({ isOpen, onOpenChange, initialData }: AppointmentSchedulerProps) {
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlotData, setTimeSlotData] = useState<any>(null);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const form = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clientId: "",
      serviceId: "",
      staffId: "",
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: "",
      notes: "",
    },
  });

  // Optimized queries with caching - use staff-accessible endpoints
  const { data: clients } = useQuery({
    queryKey: user?.role === 'admin' ? ["/api/clients"] : ["/api/clients/list"],
    refetchOnWindowFocus: false,
    // staleTime: Infinity (padrão) - atualiza apenas via WebSocket invalidation
  });

  const { data: services } = useQuery({
    queryKey: user?.role === 'admin' ? ["/api/services"] : ["/api/services/list"],
    staleTime: 30 * 60 * 1000, // 30 minutes - services very static
    refetchOnWindowFocus: false,
  });

  const { data: staff } = useQuery({
    queryKey: user?.role === 'admin' ? ["/api/staff"] : ["/api/staff/list"],
    staleTime: 30 * 60 * 1000, // 30 minutes - staff rarely changes
    refetchOnWindowFocus: false,
  });

  // Watch form values for dynamic loading
  const watchStaff = form.watch("staffId");
  const watchService = form.watch("serviceId");
  const watchDate = form.watch("appointmentDate");

  // Populate form with initial data when editing or pre-selecting client
  useEffect(() => {
    if (initialData && isOpen) {
      // Check if this is editing an existing appointment (has appointmentDate) or pre-selecting a client
      if (initialData.appointmentDate) {
        try {
          // Extract date and time directly from stored string without timezone conversion
          const [datePart, timePart] = initialData.appointmentDate.split('T');
          const dateString = datePart;
          const timeString = timePart ? timePart.substring(0, 5) : "";
          
          form.reset({
            clientId: initialData.clientId?.toString() || "",
            serviceId: initialData.serviceId?.toString() || "",
            staffId: initialData.staffId?.toString() || "",
            appointmentDate: dateString,
            appointmentTime: timeString,
            notes: initialData.notes || "",
          });
        } catch (error) {
          console.error("Error processing initial data:", error);
          // Fallback to basic date processing without timezone conversion
          const [datePart, timePart] = initialData.appointmentDate.split('T');
          const dateString = datePart || "";
          const timeString = timePart ? timePart.substring(0, 5) : "";
          
          form.reset({
            clientId: initialData.clientId?.toString() || "",
            serviceId: initialData.serviceId?.toString() || "",
            staffId: initialData.staffId?.toString() || "",
            appointmentDate: dateString,
            appointmentTime: timeString,
            notes: initialData.notes || "",
          });
        }
      } else {
        // Pre-selecting client for new appointment
        form.reset({
          clientId: initialData.clientId?.toString() || "",
          serviceId: "",
          staffId: "",
          appointmentDate: initialData.appointmentDate || new Date().toISOString().split('T')[0],
          appointmentTime: "",
          notes: "",
        });
      }
    } else if (!initialData && isOpen) {
      // Reset form for new appointment
      form.reset({
        clientId: "",
        serviceId: "",
        staffId: "",
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: "",
        notes: "",
      });
    }
  }, [initialData, isOpen, form]);

  // Filter staff based on selected service
  useEffect(() => {
    if (Array.isArray(services) && Array.isArray(staff) && watchService) {
      const selectedServiceData = services.find((service: any) => service.id.toString() === watchService);
      
      if (selectedServiceData && selectedServiceData.staffIds) {
        try {
          // Parse the staffIds JSON array
          const serviceStaffIds = JSON.parse(selectedServiceData.staffIds);
          
          // Filter staff to only show those who can perform this service
          const availableStaff = staff.filter((staffMember: any) => 
            serviceStaffIds.includes(staffMember.id.toString())
          );
          
          setFilteredStaff(availableStaff);
          
          // If current selected staff can't perform this service, reset selection
          if (watchStaff && !serviceStaffIds.includes(watchStaff)) {
            form.setValue("staffId", "");
            setSelectedStaff("");
          }
        } catch (error) {
          console.error("Error parsing service staffIds:", error);
          // If there's an error parsing, show all staff as fallback
          setFilteredStaff(Array.isArray(staff) ? staff : []);
        }
      } else {
        // If no staffIds specified for service, show all staff
        setFilteredStaff(Array.isArray(staff) ? staff : []);
      }
    } else {
      // If no service selected, show all staff
      setFilteredStaff(Array.isArray(staff) ? staff : []);
    }
  }, [services, staff, watchService, watchStaff, form]);

  // Load available times when staff, service, or date changes
  useEffect(() => {
    const loadAvailableTimes = async () => {
      if (watchStaff && watchService && watchDate) {
        setLoadingTimes(true);
        try {
          const response = await apiRequest(
            `/api/appointments/available-times?staffId=${watchStaff}&serviceId=${watchService}&date=${watchDate}`,
            "GET"
          );
          setTimeSlotData(response);
        } catch (error) {
          console.error("Error loading available times:", error);
          setTimeSlotData(null);
        } finally {
          setLoadingTimes(false);
        }
      } else {
        setTimeSlotData(null);
      }
    };

    loadAvailableTimes();
  }, [watchStaff, watchService, watchDate]);

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const appointmentData = {
        ...data,
        establishmentId: user?.establishmentId || 1
      };
      return await apiRequest("/api/appointments", "POST", appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onOpenChange(false);
      form.reset();
      // Toast removed - dialog closure provides feedback
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Erro ao criar agendamento";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const appointmentData = {
        ...data,
        establishmentId: user?.establishmentId || 1
      };
      return await apiRequest(`/api/appointments/${initialData.id}`, "PUT", appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onOpenChange(false);
      form.reset();
      // Toast removed - dialog closure provides feedback
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Erro ao atualizar agendamento";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Validate that all required fields are present
    if (!data.appointmentTime) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um horário disponível",
        variant: "destructive",
      });
      return;
    }

    // Ensure appointmentDate is in YYYY-MM-DD format only
    let formattedDate = data.appointmentDate;
    if (formattedDate.includes('T')) {
      formattedDate = formattedDate.split('T')[0];
    }

    // Use local time directly without any timezone conversion
    const appointmentData = {
      clientId: data.clientId,
      serviceId: data.serviceId,
      staffId: data.staffId,
      appointmentDate: formattedDate,
      appointmentTime: data.appointmentTime,
      notes: data.notes || ""
    };

    console.log("Sending appointment data (local time):", appointmentData);
    
    // Use appropriate mutation based on whether we're editing or creating
    // Only update if initialData contains an appointment ID (editing existing appointment)
    if (initialData && initialData.id) {
      updateAppointmentMutation.mutate(appointmentData);
    } else {
      createAppointmentMutation.mutate(appointmentData);
    }
  };

  const selectedServiceData = (services && Array.isArray(services)) ? services.find((s: any) => s.id && s.id.toString() === watchService) : null;
  const selectedStaffData = (staff && Array.isArray(staff)) ? staff.find((s: any) => s.id && s.id.toString() === watchStaff) : null;

  const getTimeSlotStatus = (time: string) => {
    const selectedTime = form.watch("appointmentTime");
    
    if (selectedTime === time) return "selected";
    
    // Check if time slot is available from the API response
    if (timeSlotData && timeSlotData.timeSlots) {
      const timeSlot = timeSlotData.timeSlots.find((slot: any) => slot.time === time);
      if (timeSlot) {
        if (timeSlot.isPast) return "past";
        if (timeSlot.isBooked) return "booked";
        if (timeSlot.available) return "available";
      }
    }
    
    return "unavailable";
  };

  // Get time slots from API response or generate basic slots
  const getDisplayTimeSlots = () => {
    if (timeSlotData && timeSlotData.timeSlots) {
      return timeSlotData.timeSlots;
    }
    
    // Generate default slots for display when no data available
    const defaultSlots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        defaultSlots.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          available: false,
          isPast: false,
          isBooked: false
        });
      }
    }
    return defaultSlots;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {initialData ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
          <DialogDescription>
            {initialData ? "Edite os detalhes do agendamento existente." : "Preencha os dados para criar um novo agendamento."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Form Fields */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serviço</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um serviço" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(services) && services.map((service: any) => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              {service.name} - R$ {service.price} ({service.duration}min)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="staffId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profissional</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um profissional" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredStaff.length > 0 ? (
                            filteredStaff.map((member: any) => (
                              <SelectItem key={member.id} value={member.id.toString()}>
                                {member.name}
                              </SelectItem>
                            ))
                          ) : watchService ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              Nenhum profissional cadastrado para esse serviço
                            </div>
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              Selecione um serviço primeiro
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          min={new Date().toLocaleDateString('en-CA')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>

              {/* Right Column - Time Selection */}
              <div className="space-y-4">
                <div>
                  <FormLabel>Horários Disponíveis</FormLabel>
                  {selectedServiceData && (
                    <div className="text-sm text-gray-600 mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Duração do serviço: {selectedServiceData.duration} minutos</span>
                      </div>
                      <p className="text-xs text-blue-700">
                        O horário selecionado será ocupado por {selectedServiceData.duration} minutos. 
                        Funcionamento: 09:00 às 18:00
                      </p>
                    </div>
                  )}
                </div>

                {loadingTimes ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : !watchStaff || !watchService || !watchDate ? (
                  <Card className="p-6">
                    <div className="text-center text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Selecione cliente, serviço e profissional para ver horários disponíveis</p>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-4">
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {getDisplayTimeSlots().map((timeSlot: any) => {
                        const selectedTime = form.watch("appointmentTime");
                        const isSelected = selectedTime === timeSlot.time;
                        
                        let buttonClass = "";
                        let disabled = false;
                        
                        if (isSelected) {
                          buttonClass = "bg-blue-600 text-white";
                        } else if (timeSlot.isPast) {
                          buttonClass = "opacity-50 cursor-not-allowed bg-gray-200 text-gray-500";
                          disabled = true;
                        } else if (timeSlot.isBooked) {
                          buttonClass = "opacity-50 cursor-not-allowed bg-gray-300 text-gray-600";
                          disabled = true;
                        } else if (timeSlot.available) {
                          buttonClass = "border-green-500 text-green-700 hover:bg-green-50";
                        } else {
                          buttonClass = "opacity-50 cursor-not-allowed";
                          disabled = true;
                        }
                        
                        return (
                          <Button
                            key={timeSlot.time}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            disabled={disabled}
                            className={buttonClass}
                            onClick={() => timeSlot.available && !disabled ? form.setValue("appointmentTime", timeSlot.time) : null}
                          >
                            {timeSlot.time}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-green-500 rounded"></div>
                        <span>Disponível</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-300 rounded"></div>
                        <span>Ocupado/Passado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-600 rounded"></div>
                        <span>Selecionado</span>
                      </div>
                    </div>

                    {/* Show appropriate messages based on timeSlotData */}
                    {timeSlotData && timeSlotData.closed && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800 mb-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">Estabelecimento fechado neste dia</span>
                        </div>
                        <p className="text-xs text-yellow-700">
                          O estabelecimento não funciona neste dia da semana. 
                          Selecione outra data para visualizar os horários disponíveis.
                        </p>
                      </div>
                    )}

                    {timeSlotData && !timeSlotData.closed && timeSlotData.timeSlots && 
                     timeSlotData.timeSlots.filter((slot: any) => slot.available).length === 0 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800 mb-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">Nenhum horário disponível para esta data</span>
                        </div>
                        <p className="text-xs text-yellow-700">
                          Todos os horários estão ocupados ou o serviço ultrapassaria o horário de funcionamento.
                          Tente selecionar outra data ou verificar a agenda do profissional.
                        </p>
                      </div>
                    )}

                    {timeSlotData && !timeSlotData.closed && timeSlotData.timeSlots && 
                     timeSlotData.timeSlots.filter((slot: any) => slot.available).length > 0 && selectedServiceData && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs text-green-700">
                          <strong>{timeSlotData.timeSlots.filter((slot: any) => slot.available).length} horários disponíveis</strong> para este serviço de {selectedServiceData.duration} min.
                          {timeSlotData.businessHours && (
                            <span> Funcionamento: {timeSlotData.businessHours.open} às {timeSlotData.businessHours.close}</span>
                          )}
                        </p>
                      </div>
                    )}
                  </Card>
                )}

                {/* Notes field - moved to appear after time selection */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Observações sobre o agendamento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createAppointmentMutation.isPending || !form.watch("appointmentTime")}
                className="min-w-32"
              >
                {createAppointmentMutation.isPending ? "Agendando..." : "Criar Agendamento"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}