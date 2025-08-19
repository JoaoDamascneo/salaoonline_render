import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Edit, Calendar, Phone, Mail, MapPin, DollarSign, Trash2, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
// Toast system removed for cleaner UX
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { AppointmentScheduler } from "@/components/AppointmentScheduler";
import { useAuth } from "@/hooks/useAuth";

// Schemas
const clientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
});

const appointmentSchema = z.object({
  serviceId: z.string().min(1, "Selecione um serviço"),
  staffId: z.string().min(1, "Selecione um profissional"),
  date: z.string().min(1, "Selecione uma data"),
  time: z.string().min(1, "Selecione um horário"),
  notes: z.string().optional(),
});

// Time slot generator
const getAvailableTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [appointmentClient, setAppointmentClient] = useState<any>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  
  // Toast removed for cleaner interface
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { user } = useAuth();



  // Optimized queries with smart caching
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ["/api/clients"],
    refetchOnWindowFocus: false,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });

  const { data: services } = useQuery({
    queryKey: ["/api/services"],
    staleTime: 30 * 60 * 1000, // 30 minutes - services very static
    refetchOnWindowFocus: false,
  });

  const { data: staff } = useQuery({
    queryKey: ["/api/staff"],
    staleTime: 30 * 60 * 1000, // 30 minutes - staff rarely changes
    refetchOnWindowFocus: false,
  });

  const { data: clientsWithLoyalty } = useQuery({
    queryKey: ["/api/loyalty/clients-with-rewards"],
    refetchOnWindowFocus: false,
    // staleTime: Infinity (padrão) - atualiza apenas via WebSocket invalidation
  });

  // Query appointments with caching - get appointments array or empty array as fallback
  const { data: appointmentsData } = useQuery<any>({
    queryKey: ["/api/appointments"],
    refetchOnWindowFocus: false,
    // staleTime: Infinity (padrão) - atualiza apenas via WebSocket invalidation
  });

  // Extract appointments safely
  const appointments = Array.isArray(appointmentsData?.appointments) 
    ? appointmentsData.appointments 
    : Array.isArray(appointmentsData) 
    ? appointmentsData 
    : [];

  // Função para encontrar a última data de serviço do cliente
  const getLastServiceDate = (clientId: number) => {
    if (!Array.isArray(appointments) || appointments.length === 0) return null;
    
    const clientAppointments = appointments
      .filter((apt: any) => apt.clientId === clientId && apt.status === 'completed')
      .sort((a: any, b: any) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
    
    return clientAppointments.length > 0 ? clientAppointments[0].appointmentDate : null;
  };

  // Forms
  const addClientForm = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    },
  });

  const editClientForm = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    },
  });

  const appointmentForm = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      serviceId: "",
      staffId: "",
      date: "",
      time: "",
      notes: "",
    },
  });

  // Mutations
  const createClientMutation = useMutation({
    mutationFn: async (data: z.infer<typeof clientSchema>) => {
      const clientData = {
        ...data,
        establishmentId: user?.establishmentId || 1
      };
      return await apiRequest("/api/clients", "POST", clientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsAddClientOpen(false);
      addClientForm.reset();
      // Toast removed - form closure provides sufficient feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao criar cliente:", error.message);
      // Toast removed - errors logged to console only
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof clientSchema> }) => {
      const clientData = {
        ...data,
        establishmentId: user?.establishmentId || 1
      };
      return await apiRequest(`/api/clients/${id}`, "PUT", clientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setEditingClient(null);
      editClientForm.reset();
      // Toast removed - form closure provides sufficient feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar cliente:", error.message);
      // Toast removed - errors logged to console only
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/clients/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      // Toast removed - data refresh provides feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao remover cliente:", error.message);
      // Toast removed - errors logged to console only
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof appointmentSchema>) => {
      const appointmentData = {
        clientId: appointmentClient?.id,
        serviceId: parseInt(data.serviceId),
        staffId: parseInt(data.staffId),
        appointmentDate: data.date,
        appointmentTime: data.time,
        notes: data.notes || "",
      };

      return await apiRequest("/api/appointments", "POST", appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setAppointmentClient(null);
      appointmentForm.reset();
      // Toast removed - form closure and cache refresh provide sufficient feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao criar agendamento:", error.message);
      // Toast removed - errors logged to console only
    },
  });

  // Event handlers
  const handleEditClient = (client: any) => {
    setEditingClient(client);
    editClientForm.setValue('name', client.name);
    editClientForm.setValue('phone', client.phone || '');
    editClientForm.setValue('email', client.email || '');
    editClientForm.setValue('address', client.address || '');
    editClientForm.setValue('notes', client.notes || '');
  };

  const handleBookAppointment = (client: any) => {
    // Open appointment scheduler modal directly on clients page with client pre-selected
    setAppointmentClient(client);
    setIsAppointmentModalOpen(true);
  };

  const handleDeleteClient = (clientId: number) => {
    if (confirm('Tem certeza que deseja remover este cliente?')) {
      deleteClientMutation.mutate(clientId);
    }
  };

  const onSubmitAddClient = (data: z.infer<typeof clientSchema>) => {
    createClientMutation.mutate(data);
  };

  const onSubmitEditClient = (data: z.infer<typeof clientSchema>) => {
    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, data });
    }
  };

  const onSubmitAppointment = (data: z.infer<typeof appointmentSchema>) => {
    createAppointmentMutation.mutate(data);
  };

  // Helper function to get client loyalty points
  const getClientLoyaltyPoints = (clientId: number) => {
    if (!Array.isArray(clientsWithLoyalty)) return null;
    return clientsWithLoyalty.find((c: any) => c.clientId === clientId);
  };

  // Filter clients
  const filteredClients = Array.isArray(clients) ? clients.filter((client: any) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm) ||
                         (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === "all") return matchesSearch;
    if (filterType === "recent") {
      const lastVisit = client.lastVisit ? new Date(client.lastVisit) : null;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return matchesSearch && lastVisit && lastVisit > thirtyDaysAgo;
    }
    if (filterType === "inactive") {
      const lastVisit = client.lastVisit ? new Date(client.lastVisit) : null;
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      return matchesSearch && (!lastVisit || lastVisit < sixtyDaysAgo);
    }
    return matchesSearch;
  }) : [];



  if (isLoading) {
    return <div className="p-6">Carregando clientes...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes e histórico</p>
        </div>
        <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            </DialogHeader>
            <Form {...addClientForm}>
              <form onSubmit={addClientForm.handleSubmit(onSubmitAddClient)} className="space-y-4">
                <FormField
                  control={addClientForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addClientForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone *</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addClientForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addClientForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Endereço completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addClientForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Informações adicionais sobre o cliente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddClientOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createClientMutation.isPending}>
                    {createClientMutation.isPending ? "Criando..." : "Criar Cliente"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Buscar por nome, telefone ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="recent">Recentes</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>



      {/* Clients Grid */}
      <div className="responsive-grid">
        {filteredClients.map((client: any) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 truncate">{client.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span className="mobile-text-truncate">{client.phone}</span>
                    </div>
                    {client.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="mobile-text-truncate">{client.email}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="mobile-text-truncate">{client.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClient(client)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClient(client.id)}
                    disabled={deleteClientMutation.isPending}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {(() => {
                        const lastServiceDate = getLastServiceDate(client.id);
                        return lastServiceDate 
                          ? `Último serviço: ${format(new Date(lastServiceDate), "dd/MM/yyyy", { locale: ptBR })}`
                          : 'Nenhum serviço realizado';
                      })()}
                    </span>
                  </div>
                </div>
                
                {/* Loyalty Points */}
                {(() => {
                  const loyaltyData = getClientLoyaltyPoints(client.id);
                  if (loyaltyData && loyaltyData.totalPoints > 0) {
                    return (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                          <svg 
                            className="w-3 h-3 fill-current text-white" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span className="font-medium">{loyaltyData.totalPoints} pontos</span>
                        </div>
                        {loyaltyData.canRedeem && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                            Pode resgatar!
                          </span>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => handleBookAppointment(client)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum cliente encontrado</p>
        </div>
      )}

      {/* Edit Client Dialog */}
      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <Form {...editClientForm}>
            <form onSubmit={editClientForm.handleSubmit(onSubmitEditClient)} className="space-y-4">
              <FormField
                control={editClientForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editClientForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editClientForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editClientForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Endereço completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editClientForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Informações adicionais sobre o cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingClient(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateClientMutation.isPending}>
                  {updateClientMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Appointment Scheduler Modal */}
      <AppointmentScheduler
        isOpen={isAppointmentModalOpen}
        onOpenChange={setIsAppointmentModalOpen}
        initialData={appointmentClient ? { clientId: appointmentClient.id } : undefined}
      />
    </div>
  );
}