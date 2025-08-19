import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DollarSign, TrendingUp, Calendar, UserCheck, Plus, ArrowUpCircle, ArrowDownCircle, Receipt, CreditCard, Trash2, Lock, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { PlanBlockModal } from "@/components/PlanBlockModal";
import { cn } from "@/lib/utils";

// Schema for financial transactions
const transactionSchema = z.object({
  type: z.enum(["income", "expense"], {
    required_error: "Selecione o tipo de transação",
  }),
  amount: z.string().min(1, "Valor é obrigatório"),
  description: z.string().min(2, "Descrição deve ter pelo menos 2 caracteres"),
  category: z.string().min(1, "Categoria é obrigatória"),
  paymentMethod: z.string().min(1, "Método de pagamento é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  notes: z.string().optional(),
});

const incomeCategories = [
  "Serviços Realizados",
  "Produtos Vendidos",
  "Pacotes/Combos",
  "Outros Rendimentos"
];

const expenseCategories = [
  "Compra de Produtos",
  "Salários e Comissões",
  "Aluguel",
  "Energia Elétrica",
  "Água",
  "Internet/Telefone",
  "Material de Limpeza",
  "Marketing/Publicidade",
  "Equipamentos",
  "Manutenção",
  "Impostos",
  "Outros Gastos"
];

const paymentMethods = [
  "Dinheiro",
  "Cartão de Débito",
  "Cartão de Crédito",
  "PIX",
  "Transferência Bancária",
  "Cheque"
];

export default function Finances() {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isSalaryCommissionOpen, setIsSalaryCommissionOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [commissionData, setCommissionData] = useState<any>(null);
  const [isPlanBlockModalOpen, setIsPlanBlockModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const permissions = usePermissions();
  const planPermissions = usePlanPermissions();

  // Auto-open commission dialog and set staff for staff members
  useEffect(() => {
    if (!permissions.canViewAllTransactions && user?.staffId) {
      setIsSalaryCommissionOpen(true);
      setSelectedStaff(user.staffId.toString());
    }
  }, [permissions.canViewAllTransactions, user?.staffId]);

  // Check if user has access to financial module - backend already handles all logic
  const hasFinancialAccess = planPermissions.checkFinancialAccess();

  // Show plan block modal when user tries to access financial features without permission
  useEffect(() => {
    if (!planPermissions.isLoading && !hasFinancialAccess) {
      setIsPlanBlockModalOpen(true);
    }
  }, [planPermissions.isLoading, hasFinancialAccess]);

  // Queries - only fetch if user has access
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/finances/stats"],
    enabled: hasFinancialAccess,
    // Removed refetchOnWindowFocus and staleTime - WebSocket will handle updates
  });

  // Pagination for transactions
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionPageSize] = useState(25); // Show only 25 transactions per page

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions", transactionPage, transactionPageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: transactionPage.toString(),
        limit: transactionPageSize.toString(),
      });
      const response = await fetch(`/api/transactions?${params}`);
      return response.json();
    },
    enabled: hasFinancialAccess,
    // staleTime: Infinity (padrão) - atualiza apenas via WebSocket invalidation
  });
  
  // Extract transactions from paginated response  
  const transactions = transactionsData?.transactions || [];
  const totalTransactions = transactionsData?.total || 0;

  // Query for transactions filtered by selected date
  const { data: dateFilteredTransactions, isLoading: dateFilteredLoading } = useQuery({
    queryKey: ["/api/transactions/date", format(selectedDate, "yyyy-MM-dd")],
    queryFn: () => apiRequest(`/api/transactions/date/${format(selectedDate, "yyyy-MM-dd")}`, "GET"),
    enabled: hasFinancialAccess,
    // Removed refetchOnWindowFocus and staleTime - WebSocket will handle updates
  });

  const { data: staff } = useQuery({
    queryKey: ["/api/staff"],
  });

  // Forms
  const transactionForm = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "income" as const,
      amount: "",
      description: "",
      category: "",
      paymentMethod: "",
      date: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  // Mutations
  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        transactionDate: new Date(data.date).toISOString(),
        establishmentId: user?.establishmentId || 1
      };
      return await apiRequest("/api/transactions", "POST", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/finances/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsAddTransactionOpen(false);
      transactionForm.reset();
      // Toast removed - modal closure provides feedback
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao registrar transação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/transactions/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/finances/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      // Toast removed - visual update provides feedback
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover transação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmitTransaction = (data: any) => {
    createTransactionMutation.mutate(data);
  };

  const handleDeleteTransaction = (transactionId: number) => {
    if (confirm('Tem certeza que deseja remover esta transação?')) {
      deleteTransactionMutation.mutate(transactionId);
    }
  };

  const handleSalaryCommissionCheck = async () => {
    // For staff users, they can only view their own commission - no staff selection needed
    if (user?.role === 'staff') {
      if (!startDate || !endDate) {
        toast({
          title: "Erro", 
          description: "Para consultar sua comissão, selecione o período desejado.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // For admin users, staff selection is required
      if (!selectedStaff) {
        toast({
          title: "Erro",
          description: "Selecione um colaborador.",
          variant: "destructive",
        });
        return;
      }

      // Get staff member details to check if it's commission-based
      const selectedStaffMember = Array.isArray(staff) && staff.find((member: any) => member.id.toString() === selectedStaff);
      
      if (!selectedStaffMember) {
        toast({
          title: "Erro",
          description: "Colaborador não encontrado.",
          variant: "destructive",
        });
        return;
      }

      // If staff has commission, require date range
      if (parseFloat(selectedStaffMember.commissionRate || "0") > 0 && (!startDate || !endDate)) {
        toast({
          title: "Erro", 
          description: "Para colaboradores comissionados, selecione o período desejado.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const payload = {
        staffId: user?.role === 'staff' ? null : parseInt(selectedStaff),
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0]
      };

      console.log("Enviando payload:", payload);
      const data = await apiRequest("/api/staff/salary-commission", "POST", payload);
      console.log("Dados recebidos:", data);
      setCommissionData(data);
      
      toast({
        title: "Sucesso",
        description: user?.role === 'staff' ? "Consulta de comissão realizada com sucesso!" : "Cálculo de comissão realizado com sucesso!",
        variant: "default",
      });
    } catch (error) {
      console.error("Commission calculation error:", error);
      toast({
        title: "Erro",
        description: "Erro ao calcular salário/comissão. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Handle staff selection change
  const handleStaffChange = (staffId: string) => {
    setSelectedStaff(staffId);
    setCommissionData(null); // Clear previous results
    
    // Get staff member details
    const selectedStaffMember = Array.isArray(staff) && staff.find((member: any) => member.id.toString() === staffId);
    
    if (selectedStaffMember) {
      // If staff has fixed salary only (no commission), show salary immediately
      const commissionRate = parseFloat(selectedStaffMember.commissionRate || "0");
      if (commissionRate === 0) {
        setCommissionData({
          staffName: selectedStaffMember.name,
          fixedSalary: parseFloat(selectedStaffMember.salaryAmount || "0"),
          commission: 0,
          totalServices: 0,
          totalServiceValue: 0,
          commissionValue: 0,
          services: [],
        });
      }
    }
  };

  const watchType = transactionForm.watch("type");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | Date): string => {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    return 'Data inválida';
  }
};

  // If user doesn't have access, show blocked content
  if (!hasFinancialAccess && !planPermissions.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financeiro</h2>
        </div>
        
        {/* Blocked content overlay */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="text-center space-y-4 p-8">
              <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Módulo Financeiro Bloqueado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Este recurso faz parte do plano {planPermissions.getRequiredPlanForFinancial()}.<br />
                  Seu plano atual: {planPermissions.getCurrentPlan()}
                </p>
                <Button 
                  onClick={() => setIsPlanBlockModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Ver Detalhes do Plano
                </Button>
              </div>
            </div>
          </div>
          
          {/* Blurred content preview */}
          <div className="filter blur-sm pointer-events-none">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      ****** *****
                    </CardTitle>
                    <div className="p-2 rounded-full bg-gray-100">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-400">R$ ****</div>
                    <p className="text-xs text-muted-foreground">
                      ****** ********
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>********** ***********</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <PlanBlockModal
          isOpen={isPlanBlockModalOpen}
          onOpenChange={setIsPlanBlockModalOpen}
          requiredPlan={planPermissions.getRequiredPlanForFinancial()}
          currentPlan={planPermissions.getCurrentPlan()}
          feature="Módulo Financeiro"
        />
      </div>
    );
  }

  if (statsLoading || transactionsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium h-4 bg-muted rounded w-32"></CardTitle>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financeiro</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isSalaryCommissionOpen} onOpenChange={setIsSalaryCommissionOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <UserCheck className="h-4 w-4 mr-2" />
                Verificar Salário/Comissão
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Verificar Salário/Comissão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Only show staff selection for admin users */}
                  {user?.role === 'admin' && (
                    <div>
                      <label className="text-sm font-medium">Colaborador</label>
                      <Select value={selectedStaff} onValueChange={handleStaffChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um colaborador" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(staff) && staff.map((member: any) => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              {member.name} - {member.commissionRate ? `${member.commissionRate}% comissão` : 'Salário fixo'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {/* Show staff name for staff users */}
                  {user?.role === 'staff' && (
                    <div>
                      <label className="text-sm font-medium">Colaborador</label>
                      <div className="p-2 border rounded text-sm bg-gray-50 dark:bg-gray-800">
                        {user?.name || "Seu perfil"}
                      </div>
                    </div>
                  )}
                  {(() => {
                    // For staff users, always show date fields
                    if (user?.role === 'staff') {
                      return (
                        <>
                          <div>
                            <label className="text-sm font-medium">Data Inicial</label>
                            <Input 
                              type="date" 
                              value={startDate} 
                              onChange={(e) => setStartDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Data Final</label>
                            <Input 
                              type="date" 
                              value={endDate} 
                              onChange={(e) => setEndDate(e.target.value)}
                            />
                          </div>
                        </>
                      );
                    }
                    
                    // For admin users, check if selected staff has commission
                    const selectedStaffMember = Array.isArray(staff) && staff.find((member: any) => member.id.toString() === selectedStaff);
                    const hasCommission = selectedStaffMember && parseFloat(selectedStaffMember.commissionRate || "0") > 0;
                    
                    return hasCommission ? (
                      <>
                        <div>
                          <label className="text-sm font-medium">Data Inicial</label>
                          <Input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Data Final</label>
                          <Input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
                {(() => {
                  // For staff users, always show the button
                  if (user?.role === 'staff') {
                    return (
                      <Button onClick={handleSalaryCommissionCheck} className="w-full">
                        {commissionData ? "Recalcular" : "Consultar Comissão"}
                      </Button>
                    );
                  }
                  
                  // For admin users, show button based on staff selection and commission
                  const selectedStaffMember = Array.isArray(staff) && staff.find((member: any) => member.id.toString() === selectedStaff);
                  
                  if (selectedStaffMember) {
                    const hasCommission = parseFloat(selectedStaffMember.commissionRate || "0") > 0;
                    return (
                      <Button onClick={handleSalaryCommissionCheck} className="w-full">
                        {commissionData ? "Recalcular" : hasCommission ? "Calcular Comissão" : "Verificar Salário"}
                      </Button>
                    );
                  }
                  
                  return null;
                })()}
                
                {commissionData && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold">
                      {commissionData.isStaffUser ? "Sua Comissão" : "Resultado do Cálculo"}
                    </h3>
                    
                    {/* Show message if no data found */}
                    {commissionData.message && (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-yellow-800 dark:text-yellow-200">{commissionData.message}</p>
                      </div>
                    )}
                    
                    {/* Show access level info for staff users */}
                    {commissionData.isStaffUser && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                          Você está visualizando apenas seus próprios dados financeiros.
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Informações do Colaborador</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p><strong>Nome:</strong> {commissionData.staffName}</p>
                          <p><strong>Salário Fixo:</strong> {formatCurrency(commissionData.fixedSalary || 0)}</p>
                          <p><strong>Comissão:</strong> {commissionData.commission}%</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Resumo Financeiro</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p><strong>Total de Serviços:</strong> {commissionData.totalServices}</p>
                          <p><strong>Valor Total dos Serviços:</strong> {formatCurrency(commissionData.totalServiceValue || 0)}</p>
                          <p><strong>Valor da Comissão:</strong> {formatCurrency(commissionData.commissionValue || 0)}</p>
                          <p className="text-lg font-bold border-t pt-2 mt-2">
                            <strong>Total a Receber:</strong> {formatCurrency((commissionData.fixedSalary || 0) + (commissionData.commissionValue || 0))}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {commissionData.services && commissionData.services.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Serviços Realizados no Período</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Serviço</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Comissão</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {commissionData.services.map((service: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell>{formatDate(service.date)}</TableCell>
                                  <TableCell>{service.clientName}</TableCell>
                                  <TableCell>{service.serviceName}</TableCell>
                                  <TableCell>{formatCurrency(service.price)}</TableCell>
                                  <TableCell>{formatCurrency(service.commissionAmount)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          {/* Only admins can register transactions */}
          {permissions.canCreateTransactions && (
          <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Movimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Movimento Financeiro</DialogTitle>
            </DialogHeader>
            <Form {...transactionForm}>
              <form onSubmit={transactionForm.handleSubmit(onSubmitTransaction)} className="space-y-4">
                <FormField
                  control={transactionForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Movimento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="income">
                            <div className="flex items-center">
                              <ArrowUpCircle className="h-4 w-4 mr-2 text-green-600" />
                              Entrada (Receita)
                            </div>
                          </SelectItem>
                          <SelectItem value="expense">
                            <div className="flex items-center">
                              <ArrowDownCircle className="h-4 w-4 mr-2 text-red-600" />
                              Saída (Despesa)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={transactionForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor (R$)</FormLabel>
                        <FormControl>
                          <Input placeholder="150.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={transactionForm.control}
                    name="date"
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
                </div>

                <FormField
                  control={transactionForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Corte de cabelo - Cliente Maria" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={transactionForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(watchType === 'income' ? incomeCategories : expenseCategories).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={transactionForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pagamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o método" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={transactionForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Informações adicionais..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsAddTransactionOpen(false);
                    transactionForm.reset();
                  }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createTransactionMutation.isPending}>
                    {createTransactionMutation.isPending ? "Registrando..." : "Registrar Movimento"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        )}
        </div>
      </div>

      {/* Financial Stats - Only for admins */}
      {permissions.canViewAllTransactions && (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita de Hoje
            </CardTitle>
            <div className="p-2 rounded-full text-green-600 bg-green-100">
              <ArrowUpCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency((stats as any)?.todayIncome || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Entrada de valores hoje
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesas de Hoje
            </CardTitle>
            <div className="p-2 rounded-full text-red-600 bg-red-100">
              <ArrowDownCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency((stats as any)?.todayExpenses || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Saída de valores hoje
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita do Mês
            </CardTitle>
            <div className="p-2 rounded-full text-blue-600 bg-blue-100">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency((stats as any)?.monthIncome || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Total mensal de entradas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro Líquido
            </CardTitle>
            <div className="p-2 rounded-full text-purple-600 bg-purple-100">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(((stats as any)?.monthIncome || 0) - ((stats as any)?.monthExpenses || 0))}</div>
            <p className="text-xs text-muted-foreground">
              Receita menos despesas
            </p>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Recent Transactions - Only for admins */}
      {permissions.canViewAllTransactions && (
        <Card className="mobile-fix-container">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Receipt className="h-5 w-5 mr-2" />
              Movimentações Recentes
            </CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-medium">Filtrar por data:</label>
              <Input
                type="date"
                value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(new Date(e.target.value + "T00:00:00"));
                  }
                }}
                className="w-full sm:w-40"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="card-content-mobile">
          {dateFilteredLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto"></div>
              </div>
            </div>
          ) : !dateFilteredTransactions || (dateFilteredTransactions as any).length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                Nenhuma transação encontrada para {format(selectedDate, "dd/MM/yyyy")}
              </p>
              <p className="text-gray-400 text-sm">Selecione uma data diferente ou registre novas movimentações</p>
            </div>
          ) : (
            <>
              {/* Mobile: Card layout */}
              <div className="lg:hidden space-y-4">
              {(dateFilteredTransactions as any).map((transaction: any) => (
                <Card key={transaction.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={transaction.type === 'income' 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                      }>
                        {transaction.type === 'income' ? (
                          <><ArrowUpCircle className="h-3 w-3 mr-1" />Entrada</>
                        ) : (
                          <><ArrowDownCircle className="h-3 w-3 mr-1" />Saída</>
                        )}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(transaction.transactionDate)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      disabled={deleteTransactionMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium">{transaction.description}</h4>
                      {transaction.notes && (
                        <p className="text-sm text-gray-500 mt-1">{transaction.notes}</p>
                      )}
                    </div>
                    
                    <div className="text-right mt-3">
                      <span className={`font-semibold text-lg ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(dateFilteredTransactions as any).map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                      <TableCell>
                        <Badge className={transaction.type === 'income' 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                        }>
                          {transaction.type === 'income' ? (
                            <><ArrowUpCircle className="h-3 w-3 mr-1" />Entrada</>
                          ) : (
                            <><ArrowDownCircle className="h-3 w-3 mr-1" />Saída</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          {transaction.notes && (
                            <div className="text-sm text-gray-500">{transaction.notes}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deleteTransactionMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            </>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
}
