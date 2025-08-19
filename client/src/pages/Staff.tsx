import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Edit, Trash2, User, Phone, Mail, Briefcase, DollarSign, AlertCircle, Crown, Clock, Lock, Calendar, CalendarDays } from "lucide-react";
// Toast system removed for cleaner UX
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { PlanBlockModal } from "@/components/PlanBlockModal";

// Schema
const staffSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  role: z.string().min(2, "Função/cargo é obrigatório"),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  hasSystemAccess: z.boolean().default(false),
  salaryAmount: z.string().optional(),
  commissionRate: z.string().optional(),
}).refine((data) => {
  // At least one of salary or commission must be provided
  const hasSalary = data.salaryAmount && parseFloat(data.salaryAmount) > 0;
  const hasCommission = data.commissionRate && parseFloat(data.commissionRate) > 0;
  return hasSalary || hasCommission;
}, {
  message: "Deve informar pelo menos um: salário fixo ou comissão",
  path: ["salaryAmount"],
});

// Schema para horários de trabalho
const workingHoursSchema = z.object({
  workingHours: z.array(z.object({
    dayOfWeek: z.number(),
    openTime: z.string(),
    closeTime: z.string(),
    isAvailable: z.boolean(),
  }))
});

// Schema para férias/folgas
const vacationSchema = z.object({
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().min(1, "Data de fim é obrigatória"),
  type: z.string().default("vacation"),
  reason: z.string().optional(),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate >= startDate;
}, {
  message: "Data de fim deve ser igual ou posterior à data de início",
  path: ["endDate"],
});

export default function Staff() {
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [isPlanBlockModalOpen, setIsPlanBlockModalOpen] = useState(false);
  const [isWorkingHoursOpen, setIsWorkingHoursOpen] = useState(false);
  const [selectedStaffForHours, setSelectedStaffForHours] = useState<any>(null);
  const [isVacationsOpen, setIsVacationsOpen] = useState(false);
  const [selectedStaffForVacations, setSelectedStaffForVacations] = useState<any>(null);
  const [isAddVacationOpen, setIsAddVacationOpen] = useState(false);
  const [editingVacation, setEditingVacation] = useState<any>(null);
  
  // Toast removed for cleaner interface
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const planPermissions = usePlanPermissions();

  // Optimized queries with smart caching
  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["/api/staff"],
    refetchOnWindowFocus: false,
    // staleTime: Infinity (padrão) - atualiza apenas via WebSocket invalidation
  });

  // Query para horários do colaborador selecionado
  const { data: staffWorkingHours, refetch: refetchWorkingHours } = useQuery({
    queryKey: [`/api/staff/${selectedStaffForHours?.id}/working-hours`],
    enabled: !!selectedStaffForHours?.id,
    refetchOnWindowFocus: false,
    // staleTime: Infinity (padrão) - atualiza apenas via WebSocket invalidation
  });

  // Query para horários comerciais do estabelecimento
  const { data: businessHours = [] } = useQuery({
    queryKey: ["/api/business-hours"],
    staleTime: 60 * 60 * 1000, // 1 hour - business hours rarely change
    refetchOnWindowFocus: false,
  });

  // Query para férias do colaborador selecionado
  const { data: staffVacations = [], refetch: refetchVacations } = useQuery({
    queryKey: [`/api/staff/${selectedStaffForVacations?.id}/vacations`],
    enabled: !!selectedStaffForVacations?.id,
    refetchOnWindowFocus: false,
    // staleTime: Infinity (padrão) - atualiza apenas via WebSocket invalidation
  });

  // Forms
  const staffForm = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      role: "",
      phone: "",
      email: "",
      password: "",
      hasSystemAccess: false,
      salaryAmount: "",
      commissionRate: "",
    },
  });

  const editStaffSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    role: z.string().min(1, "Cargo é obrigatório"),
    phone: z.string().optional(),
    email: z.string().email("E-mail inválido"),
    hasSystemAccess: z.boolean().default(false),
    salaryAmount: z.string().optional(),
    commissionRate: z.string().optional(),
  });

  const editStaffForm = useForm({
    resolver: zodResolver(editStaffSchema),
    defaultValues: {
      name: "",
      role: "",
      phone: "",
      email: "",
      hasSystemAccess: false,
      salaryAmount: "",
      commissionRate: "",
    },
  });

  // Form para horários de trabalho
  const workingHoursForm = useForm({
    resolver: zodResolver(workingHoursSchema),
    defaultValues: {
      workingHours: [
        { dayOfWeek: 1, openTime: "08:00", closeTime: "18:00", isAvailable: false }, // Segunda
        { dayOfWeek: 2, openTime: "08:00", closeTime: "18:00", isAvailable: false }, // Terça
        { dayOfWeek: 3, openTime: "08:00", closeTime: "18:00", isAvailable: false }, // Quarta
        { dayOfWeek: 4, openTime: "08:00", closeTime: "18:00", isAvailable: false }, // Quinta
        { dayOfWeek: 5, openTime: "08:00", closeTime: "18:00", isAvailable: false }, // Sexta
        { dayOfWeek: 6, openTime: "08:00", closeTime: "18:00", isAvailable: false }, // Sábado
        { dayOfWeek: 0, openTime: "08:00", closeTime: "18:00", isAvailable: false }, // Domingo
      ]
    },
  });

  // Form para férias/folgas
  const vacationForm = useForm({
    resolver: zodResolver(vacationSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      type: "vacation",
      reason: "",
    },
  });

  // Get staff limit information
  const staffLimit = planPermissions.getStaffLimitInfo();
  const isAtStaffLimit = !staffLimit.isWithinLimit;

  // Check if user can add new staff
  const handleAddStaffClick = () => {
    if (isAtStaffLimit) {
      setIsPlanBlockModalOpen(true);
    } else {
      setIsAddStaffOpen(true);
    }
  };

  // Mutations
  const createStaffMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        establishmentId: user?.establishmentId || 1,
        phone: data.phone || null,
        email: data.email || null,
        salaryAmount: data.salaryAmount || null,
        commissionRate: data.commissionRate || null,
      };
      
      return await apiRequest("/api/staff", "POST", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      queryClient.invalidateQueries({ queryKey: ["/api/establishment/permissions"] });
      setIsAddStaffOpen(false);
      staffForm.reset();
      // Toast removed - form closure provides feedback
    },
    onError: (error: any) => {
      // Check if it's a plan limit error
      if (error.message?.includes("Limite de colaboradores atingido")) {
        setIsPlanBlockModalOpen(true);
        console.error("Limite de colaboradores:", error.message);
      } else {
        console.error("Erro ao adicionar colaborador:", error.message);
        console.error("Erro ao criar colaborador");
      }
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      console.log('Updating staff with data:', data);
      
      const payload = {
        ...data,
        establishmentId: user?.establishmentId || 1,
        email: data.email || null,
        salaryAmount: data.salaryAmount || null,
        commissionRate: data.commissionRate || null,
      };
      
      console.log('Payload being sent:', payload);
      
      return await apiRequest(`/api/staff/${id}`, "PUT", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      setEditingStaff(null);
      setIsEditStaffOpen(false);
      editStaffForm.reset();
      // Toast removed - form closure provides feedback
    },
    onError: (error) => {
      console.error('Error updating staff:', error);
      console.error("Erro ao atualizar colaborador");
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/staff/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      // Toast removed - visual update provides feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao remover colaborador:", error.message);
      console.error("Erro ao remover colaborador");
    },
  });

  // Mutation para salvar horários de trabalho
  const saveWorkingHoursMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/staff/${selectedStaffForHours?.id}/working-hours`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff", selectedStaffForHours?.id, "working-hours"] });
      setIsWorkingHoursOpen(false);
      setSelectedStaffForHours(null);
      // Toast removed - modal closure provides sufficient feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao salvar horários de trabalho:", error.message);
      // Toast removed - errors logged to console only
    },
  });

  // Mutations para férias/folgas
  const createVacationMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/staff/${selectedStaffForVacations?.id}/vacations`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/staff/${selectedStaffForVacations?.id}/vacations`] });
      refetchVacations();
      setIsAddVacationOpen(false);
      setEditingVacation(null);
      vacationForm.reset();
      // Toast removed - form closure and data refresh provide feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao adicionar férias/folga:", error.message);
      // Toast removed - errors logged to console only
    },
  });

  const updateVacationMutation = useMutation({
    mutationFn: async ({ vacationId, data }: { vacationId: number; data: any }) => {
      return await apiRequest(`/api/staff/${selectedStaffForVacations?.id}/vacations/${vacationId}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/staff/${selectedStaffForVacations?.id}/vacations`] });
      refetchVacations();
      setIsAddVacationOpen(false);
      setEditingVacation(null);
      vacationForm.reset();
      // Toast removed - form closure and data refresh provide feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar férias/folga:", error.message);
      // Toast removed - errors logged to console only
    },
  });

  const deleteVacationMutation = useMutation({
    mutationFn: async (vacationId: number) => {
      return await apiRequest(`/api/staff/${selectedStaffForVacations?.id}/vacations/${vacationId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/staff/${selectedStaffForVacations?.id}/vacations`] });
      refetchVacations();
      // Toast removed - data refresh provides sufficient feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao remover férias/folga:", error.message);
      // Toast removed - errors logged to console only
    },
  });

  // Handlers
  const handleEditStaff = (member: any) => {
    setEditingStaff(member);
    editStaffForm.reset({
      name: member.name || '',
      role: member.role || '',
      phone: member.phone || '',
      email: member.email || '',
      hasSystemAccess: member.hasSystemAccess || false,
      salaryAmount: member.salaryAmount || '',
      commissionRate: member.commissionRate || '',
    });
    setIsEditStaffOpen(true);
  };

  const handleDeleteStaff = (staffId: number) => {
    if (confirm('Tem certeza que deseja remover este colaborador?')) {
      deleteStaffMutation.mutate(staffId);
    }
  };

  const onSubmitStaff = (data: any) => {
    createStaffMutation.mutate(data);
  };

  const onSubmitEditStaff = (data: any) => {
    if (editingStaff) {
      updateStaffMutation.mutate({ id: editingStaff.id, data });
    }
  };

  // Handler para abrir modal de horários
  const handleConfigureHours = async (member: any) => {
    setSelectedStaffForHours(member);
    setIsWorkingHoursOpen(true);
    
    // Aguarda um pouco para garantir que a query seja executada
    setTimeout(async () => {
      await refetchWorkingHours();
    }, 100);
  };

  // Handler para fechar modal de horários
  const handleCloseWorkingHours = () => {
    setIsWorkingHoursOpen(false);
    setSelectedStaffForHours(null);
    workingHoursForm.reset();
  };

  // Handler para submeter horários
  const onSubmitWorkingHours = (data: any) => {
    saveWorkingHoursMutation.mutate(data);
  };

  // Handlers para férias/folgas
  const handleManageVacations = (member: any) => {
    setSelectedStaffForVacations(member);
    setIsVacationsOpen(true);
    setTimeout(async () => {
      await refetchVacations();
    }, 100);
  };

  const handleAddVacation = () => {
    setEditingVacation(null);
    vacationForm.reset({
      startDate: "",
      endDate: "",
      type: "vacation",
      reason: "",
    });
    setIsAddVacationOpen(true);
  };

  const handleEditVacation = (vacation: any) => {
    setEditingVacation(vacation);
    
    // Converte as datas para o formato YYYY-MM-DD para os inputs
    let startDate = "";
    let endDate = "";
    
    try {
      if (vacation.startDate) {
        const startDateObj = new Date(vacation.startDate);
        startDate = startDateObj.toISOString().split('T')[0];
      }
      if (vacation.endDate) {
        const endDateObj = new Date(vacation.endDate);
        endDate = endDateObj.toISOString().split('T')[0];
      }
    } catch (error) {
      console.error('Erro ao converter datas:', error);
    }
    
    vacationForm.reset({
      startDate,
      endDate,
      type: vacation.type || "vacation",
      reason: vacation.reason || "",
    });
    setIsAddVacationOpen(true);
  };

  const handleDeleteVacation = (vacationId: number) => {
    if (confirm('Tem certeza que deseja remover estas férias/folga?')) {
      deleteVacationMutation.mutate(vacationId);
    }
  };

  const onSubmitVacation = (data: any) => {
    if (editingVacation) {
      updateVacationMutation.mutate({ vacationId: editingVacation.id, data });
    } else {
      createVacationMutation.mutate(data);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      
      // Verifica se a data é válida
      if (isNaN(date.getTime())) {
        return dateString; // Retorna a string original se não conseguir converter
      }
      
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString; // Retorna a string original em caso de erro
    }
  };

  const getVacationTypeLabel = (type: string) => {
    const types = {
      vacation: 'Férias',
      sick_leave: 'Atestado Médico',
      time_off: 'Folga'
    };
    return types[type as keyof typeof types] || type;
  };

  // UseEffect separado só para carregar dados quando staffWorkingHours mudar
  useEffect(() => {
    if (selectedStaffForHours && isWorkingHoursOpen && staffWorkingHours !== undefined) {
      console.log('Loading working hours for staff:', selectedStaffForHours.id);
      console.log('Staff working hours data:', staffWorkingHours);
      
      let hoursToSet = [];
      
      if (staffWorkingHours && Array.isArray(staffWorkingHours) && staffWorkingHours.length > 0) {
        // Criar array com base nos dados existentes
        console.log('Using existing hours from database');
        hoursToSet = [1, 2, 3, 4, 5, 6, 0].map(dayOfWeek => {
          const existing = staffWorkingHours.find((h: any) => h.dayOfWeek === dayOfWeek);
          if (existing) {
            console.log(`Day ${dayOfWeek} found:`, existing);
            return {
              dayOfWeek,
              openTime: existing.openTime,
              closeTime: existing.closeTime,
              isAvailable: existing.isAvailable
            };
          } else {
            const businessHour = Array.isArray(businessHours) ? businessHours.find((bh: any) => bh.dayOfWeek === dayOfWeek) : null;
            return { 
              dayOfWeek, 
              openTime: businessHour?.openTime || "08:00", 
              closeTime: businessHour?.closeTime || "18:00", 
              isAvailable: false 
            };
          }
        });
      } else {
        // Usar valores padrão baseados nos horários comerciais do estabelecimento
        console.log('Using default hours from business hours');
        hoursToSet = [1, 2, 3, 4, 5, 6, 0].map(dayOfWeek => {
          const businessHour = Array.isArray(businessHours) ? businessHours.find((bh: any) => bh.dayOfWeek === dayOfWeek) : null;
          return {
            dayOfWeek,
            openTime: businessHour?.openTime || "08:00",
            closeTime: businessHour?.closeTime || "18:00",
            isAvailable: false
          };
        });
      }
      
      console.log('Final hours to set:', hoursToSet);
      workingHoursForm.setValue('workingHours', hoursToSet);
    }
  }, [staffWorkingHours]);

  // Helper para mapear dias da semana
  const getDayName = (dayOfWeek: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayOfWeek];
  };

  const formatSalary = (member: any) => {
    const salary = parseFloat(member.salaryAmount || "0");
    const commission = parseFloat(member.commissionRate || "0");
    
    if (salary > 0 && commission > 0) {
      return `R$ ${salary.toFixed(2)} + ${commission}% comissão`;
    } else if (commission > 0) {
      return `${commission}% comissão`;
    } else if (salary > 0) {
      return `R$ ${salary.toFixed(2)}`;
    }
    return "Não definido";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 animate-pulse" />
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse" />
        </div>
        <div className="responsive-grid">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="responsive-padding">
                <div className="animate-pulse">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3" />
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mx-auto mb-2" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32 mx-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Colaboradores</h2>
        
        {/* Staff limit alert */}
        {isAtStaffLimit && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              Limite de colaboradores atingido ({staffLimit.current}/{staffLimit.max}). 
              <Button 
                variant="link" 
                className="p-0 h-auto text-amber-800 dark:text-amber-200 underline ml-1"
                onClick={() => setIsPlanBlockModalOpen(true)}
              >
                Atualize seu plano
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <Dialog open={isAddStaffOpen} onOpenChange={(open) => {
          setIsAddStaffOpen(open);
          if (open) {
            // Reset form when opening add dialog
            staffForm.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={(e) => {
                if (isAtStaffLimit) {
                  e.preventDefault();
                  handleAddStaffClick();
                }
              }}
              disabled={isAtStaffLimit}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {isAtStaffLimit ? `Limite Atingido (${staffLimit.current}/${staffLimit.max})` : "Adicionar Colaborador"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Colaborador</DialogTitle>
            </DialogHeader>
            <Form {...staffForm}>
              <form onSubmit={staffForm.handleSubmit(onSubmitStaff)} className="space-y-4">
                <FormField
                  control={staffForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Maria Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={staffForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={staffForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="maria@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={staffForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha para Acesso ao Sistema</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Digite uma senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={staffForm.control}
                    name="hasSystemAccess"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Acesso ao Sistema</FormLabel>
                          <FormDescription>
                            Permitir que este colaborador acesse o sistema
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={staffForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Função/Cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Cabeleireira, Manicure, Esteticista" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={staffForm.control}
                    name="salaryAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salário Fixo (R$)</FormLabel>
                        <FormControl>
                          <Input placeholder="1500.00" type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={staffForm.control}
                    name="commissionRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comissão (%)</FormLabel>
                        <FormControl>
                          <Input placeholder="10" type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>



                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsAddStaffOpen(false);
                    setEditingStaff(null);
                    staffForm.reset();
                  }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createStaffMutation.isPending}>
                    {createStaffMutation.isPending ? "Salvando..." : "Adicionar Colaborador"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição Separado */}
        <Dialog open={isEditStaffOpen} onOpenChange={setIsEditStaffOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Colaborador</DialogTitle>
            </DialogHeader>
            <Form {...editStaffForm}>
              <form onSubmit={editStaffForm.handleSubmit(onSubmitEditStaff)} className="space-y-4">
                <FormField
                  control={editStaffForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do colaborador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editStaffForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editStaffForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editStaffForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Cabeleireiro, Manicure, Barbeiro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editStaffForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha para Acesso ao Sistema</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Digite uma senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editStaffForm.control}
                    name="hasSystemAccess"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Acesso ao Sistema</FormLabel>
                          <FormDescription>
                            Permitir que este colaborador acesse o sistema
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editStaffForm.control}
                    name="salaryAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salário Fixo (R$)</FormLabel>
                        <FormControl>
                          <Input placeholder="1500.00" type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editStaffForm.control}
                    name="commissionRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comissão (%)</FormLabel>
                        <FormControl>
                          <Input placeholder="10" type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>



                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsEditStaffOpen(false);
                    setEditingStaff(null);
                    editStaffForm.reset();
                  }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updateStaffMutation.isPending}>
                    {updateStaffMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {!staff || !Array.isArray(staff) || staff.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Nenhum colaborador cadastrado</p>
            <p className="text-gray-400 text-sm">Adicione colaboradores para começar a gerenciar sua equipe</p>
          </CardContent>
        </Card>
      ) : (
        <div className="responsive-grid">
          {Array.isArray(staff) && staff.map((member: any) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="responsive-padding pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                      {member.name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">{member.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1 ml-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditStaff(member)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleConfigureHours(member)}
                      title="Configurar horários"
                    >
                      <Clock className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleManageVacations(member)}
                      title="Gerenciar férias/folgas"
                    >
                      <CalendarDays className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteStaff(member.id)}
                      disabled={deleteStaffMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="responsive-padding pt-0 space-y-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="mobile-text-truncate">{member.phone || 'Não informado'}</span>
                </div>
                
                {member.email && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="mobile-text-truncate">{member.email}</span>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="mobile-text-truncate">{formatSalary(member)}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-sm">
                    <Lock className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Acesso ao Sistema</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.hasSystemAccess 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                  }`}>
                    {member.hasSystemAccess ? 'Liberado' : 'Bloqueado'}
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Horários de Trabalho */}
      <Dialog open={isWorkingHoursOpen} onOpenChange={handleCloseWorkingHours}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Horários de Trabalho - {selectedStaffForHours?.name}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...workingHoursForm}>
            <form onSubmit={workingHoursForm.handleSubmit(onSubmitWorkingHours)} className="space-y-6">
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Configure os horários individuais de trabalho. O colaborador só poderá receber agendamentos nos dias e horários selecionados abaixo.
                  </AlertDescription>
                </Alert>

                {workingHoursForm.watch('workingHours').map((_, index) => {
                  const dayOfWeek = workingHoursForm.watch(`workingHours.${index}.dayOfWeek`);
                  const businessHour = Array.isArray(businessHours) ? businessHours.find((bh: any) => bh.dayOfWeek === dayOfWeek) : null;
                  const isEstablishmentOpen = businessHour?.isOpen;
                  
                  return (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium">{getDayName(dayOfWeek)}</h4>
                          {!isEstablishmentOpen && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                              Estabelecimento fechado
                            </span>
                          )}
                        </div>
                        
                        <FormField
                          control={workingHoursForm.control}
                          name={`workingHours.${index}.isAvailable`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value && isEstablishmentOpen}
                                  onCheckedChange={(checked) => field.onChange(checked)}
                                  disabled={!isEstablishmentOpen}
                                />
                              </FormControl>
                              <FormLabel className="text-sm">Disponível</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>

                      {workingHoursForm.watch(`workingHours.${index}.isAvailable`) && isEstablishmentOpen && (
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={workingHoursForm.control}
                            name={`workingHours.${index}.openTime`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Horário de Abertura</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="time" 
                                    {...field}
                                    min={businessHour?.openTime}
                                    max={businessHour?.closeTime}
                                  />
                                </FormControl>
                                <FormMessage />
                                {businessHour && (
                                  <p className="text-xs text-gray-500">
                                    Estabelecimento: {businessHour.openTime} - {businessHour.closeTime}
                                  </p>
                                )}
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={workingHoursForm.control}
                            name={`workingHours.${index}.closeTime`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Horário de Fechamento</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="time" 
                                    {...field}
                                    min={businessHour?.openTime}
                                    max={businessHour?.closeTime}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseWorkingHours}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={saveWorkingHoursMutation.isPending}
                >
                  {saveWorkingHoursMutation.isPending ? "Salvando..." : "Salvar Horários"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Gerenciamento de Férias/Folgas */}
      <Dialog open={isVacationsOpen} onOpenChange={setIsVacationsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Férias e Folgas - {selectedStaffForVacations?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Períodos de Ausência</h3>
              <Button 
                onClick={handleAddVacation}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Adicionar Período
              </Button>
            </div>

            {staffVacations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhum período de férias ou folga cadastrado
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {staffVacations.map((vacation: any) => (
                  <Card key={vacation.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              vacation.type === 'vacation' 
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                                : vacation.type === 'sick_leave'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                            }`}>
                              {getVacationTypeLabel(vacation.type)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Período:</strong> {formatDate(vacation.startDate)} até {formatDate(vacation.endDate)}
                          </div>
                          {vacation.reason && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Motivo:</strong> {vacation.reason}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditVacation(vacation)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteVacation(vacation.id)}
                            disabled={deleteVacationMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsVacationsOpen(false);
                setSelectedStaffForVacations(null);
              }}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar/Editar Férias */}
      <Dialog open={isAddVacationOpen} onOpenChange={setIsAddVacationOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingVacation ? 'Editar' : 'Adicionar'} Período de Ausência
            </DialogTitle>
          </DialogHeader>
          
          <Form {...vacationForm}>
            <form onSubmit={vacationForm.handleSubmit(onSubmitVacation)} className="space-y-4">
              <FormField
                control={vacationForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="vacation">Férias</SelectItem>
                        <SelectItem value="sick_leave">Atestado Médico</SelectItem>
                        <SelectItem value="time_off">Folga</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={vacationForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={vacationForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Fim</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={vacationForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Férias anuais, viagem, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddVacationOpen(false);
                    setEditingVacation(null);
                    vacationForm.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createVacationMutation.isPending || updateVacationMutation.isPending}
                >
                  {createVacationMutation.isPending || updateVacationMutation.isPending 
                    ? "Salvando..." 
                    : editingVacation ? "Salvar Alterações" : "Adicionar Período"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Plan Block Modal */}
      <PlanBlockModal
        isOpen={isPlanBlockModalOpen}
        onOpenChange={setIsPlanBlockModalOpen}
        requiredPlan={planPermissions.getCurrentPlan() === "Base" ? "Core" : "Expert"}
        currentPlan={planPermissions.getCurrentPlan()}
        feature="Adicionar Colaboradores"
      />
    </div>
  );
}