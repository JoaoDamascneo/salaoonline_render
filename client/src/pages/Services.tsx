import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Scissors, Hand, Edit, Trash2, Clock, DollarSign, Users, Tag } from "lucide-react";
// Toast system removed for cleaner UX
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

// Schemas
const serviceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  duration: z.number().min(1, "Duração deve ser pelo menos 1 minuto"),
  price: z.string().min(1, "Preço é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  staffIds: z.array(z.string()).min(1, "Selecione pelo menos um profissional"),
  description: z.string().optional(),
});

const categorySchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
});

export default function Services() {
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  
  // Toast removed for cleaner interface
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();



  // Optimized queries with caching
  const { data: services, isLoading } = useQuery({
    queryKey: ["/api/services"],
    staleTime: 30 * 60 * 1000, // 30 minutes - services are very static
    refetchOnWindowFocus: false,
  });

  const { data: staff } = useQuery({
    queryKey: ["/api/staff"],
    staleTime: 30 * 60 * 1000, // 30 minutes - staff rarely changes
    refetchOnWindowFocus: false,
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/service-categories"],
    staleTime: 30 * 60 * 1000, // 30 minutes - categories very static
    refetchOnWindowFocus: false,
  });

  // Forms
  const serviceForm = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      duration: 30,
      price: "",
      category: "",
      staffIds: [],
      description: "",
    },
  });

  const categoryForm = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Mutations
  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const serviceData = {
        ...data,
        establishmentId: user?.establishmentId || 1
      };
      return await apiRequest("/api/services", "POST", serviceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setIsAddServiceOpen(false);
      setEditingService(null);
      serviceForm.reset();
      // Toast removed - form submission provides feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao criar serviço:", error.message);
      // Toast removed - errors logged to console only
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const serviceData = {
        ...data,
        establishmentId: user?.establishmentId || 1
      };
      return await apiRequest(`/api/services/${id}`, "PUT", serviceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setIsAddServiceOpen(false);
      setEditingService(null);
      serviceForm.reset();
      // Toast removed - form submission provides feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar serviço:", error.message);
      // Toast removed - errors logged to console only
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/services/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      // Toast removed - visual update provides feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao remover serviço:", error.message);
      // Toast removed - errors logged to console only
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const categoryData = {
        ...data,
        establishmentId: user?.establishmentId || 1
      };
      return await apiRequest("/api/service-categories", "POST", categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-categories"] });
      setIsAddCategoryOpen(false);
      categoryForm.reset();
      // Toast removed - form closure provides sufficient feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao criar categoria:", error.message);
      // Toast removed - errors logged to console only
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/service-categories/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-categories"] });
      // Toast removed - visual list update provides sufficient feedback
    },
    onError: (error: Error) => {
      console.error("Erro ao remover categoria:", error.message);
      // Toast removed - errors logged to console only
    },
  });

  // Handlers
  const handleEditService = (service: any) => {
    setEditingService(service);
    serviceForm.setValue('name', service.name || '');
    serviceForm.setValue('duration', service.duration || 30);
    serviceForm.setValue('price', service.price || '');
    serviceForm.setValue('category', service.category || '');
    serviceForm.setValue('description', service.description || '');
    
    // Parse staff IDs if they exist
    const staffIds = service.staffIds ? JSON.parse(service.staffIds) : [];
    serviceForm.setValue('staffIds', staffIds);
    setIsAddServiceOpen(true);
  };

  const handleDeleteService = (serviceId: number) => {
    if (confirm('Tem certeza que deseja remover este serviço?')) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (confirm('Tem certeza que deseja remover esta categoria?')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const onSubmitService = (data: any) => {
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data });
    } else {
      createServiceMutation.mutate(data);
    }
  };

  const onSubmitCategory = (data: any) => {
    createCategoryMutation.mutate(data);
  };

  // Group services by category
  const servicesByCategory = Array.isArray(services) 
    ? services.reduce((acc: any, service: any) => {
        const category = service.category || 'Sem categoria';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(service);
        return acc;
      }, {})
    : {};

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('corte') || category.toLowerCase().includes('penteado')) return <Scissors className="h-5 w-5" />;
    if (category.toLowerCase().includes('manicure') || category.toLowerCase().includes('pedicure')) return <Hand className="h-5 w-5" />;
    return <Scissors className="h-5 w-5" />;
  };

  const getCategoryColor = (category: string) => {
    if (category.toLowerCase().includes('corte') || category.toLowerCase().includes('penteado')) return 'text-blue-600 dark:text-blue-400';
    if (category.toLowerCase().includes('manicure') || category.toLowerCase().includes('pedicure')) return 'text-pink-600 dark:text-pink-400';
    if (category.toLowerCase().includes('tratamento')) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getStaffNames = (staffIds: string) => {
    if (!staffIds || !Array.isArray(staff)) return 'Nenhum profissional';
    
    try {
      const ids = JSON.parse(staffIds);
      const names = ids.map((id: string) => {
        const staffMember = staff.find((s: any) => s.id.toString() === id);
        return staffMember?.name || 'Desconhecido';
      });
      return names.length > 0 ? names.join(', ') : 'Nenhum profissional';
    } catch {
      return 'Nenhum profissional';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Carregando serviços...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Serviços</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-green-600 text-green-600 hover:bg-green-50"
            onClick={() => setIsCategoryManagementOpen(true)}
          >
            <Tag className="h-4 w-4 mr-2" />
            Gerenciar Categorias
          </Button>

          <Dialog open={isAddServiceOpen} onOpenChange={(open) => {
            setIsAddServiceOpen(open);
            if (!open) {
              setEditingService(null);
              serviceForm.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingService ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
              </DialogHeader>
              <Form {...serviceForm}>
                <form onSubmit={serviceForm.handleSubmit(onSubmitService)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={serviceForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Serviço</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Corte Masculino" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={serviceForm.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duração (minutos)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={serviceForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço (R$)</FormLabel>
                          <FormControl>
                            <Input placeholder="50.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={serviceForm.control}
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
                              {Array.isArray(categories) && categories.map((category: any) => (
                                <SelectItem key={category.id} value={category.name}>
                                  {category.name}
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
                    control={serviceForm.control}
                    name="staffIds"
                    render={() => (
                      <FormItem>
                        <FormLabel>Profissionais que podem realizar este serviço</FormLabel>
                        <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-3">
                          {Array.isArray(staff) && staff.map((staffMember: any) => (
                            <FormField
                              key={staffMember.id}
                              control={serviceForm.control}
                              name="staffIds"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={staffMember.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(staffMember.id.toString())}
                                        onCheckedChange={(checked) => {
                                          const currentValue = field.value || [];
                                          return checked
                                            ? field.onChange([...currentValue, staffMember.id.toString()])
                                            : field.onChange(
                                                currentValue.filter(
                                                  (value: string) => value !== staffMember.id.toString()
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {staffMember.name}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={serviceForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descrição do serviço" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsAddServiceOpen(false);
                      setEditingService(null);
                      serviceForm.reset();
                    }}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createServiceMutation.isPending || updateServiceMutation.isPending}>
                      {createServiceMutation.isPending || updateServiceMutation.isPending 
                        ? "Salvando..." 
                        : editingService ? "Salvar Alterações" : "Adicionar Serviço"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Category Management Modal */}
      <Dialog open={isCategoryManagementOpen} onOpenChange={setIsCategoryManagementOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Categorias</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Create Category Section */}
            <div className="border-b pb-4">
              <Button 
                onClick={() => setIsAddCategoryOpen(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Nova Categoria
              </Button>
            </div>

            {/* Categories List */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Categorias Existentes</h4>
              {Array.isArray(categories) && categories.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categories.map((category: any) => (
                    <div 
                      key={category.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center flex-1">
                        {getCategoryIcon(category.name)}
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white truncate">
                          {category.name}
                        </span>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        className="h-7 w-7 ml-2 flex-shrink-0"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deleteCategoryMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Nenhuma categoria cadastrada
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Category Modal */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Nova Categoria</DialogTitle>
          </DialogHeader>
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4">
              <FormField
                control={categoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Corte e Penteado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={categoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição da categoria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createCategoryMutation.isPending}>
                  {createCategoryMutation.isPending ? "Criando..." : "Criar Categoria"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {Object.keys(servicesByCategory).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Nenhum serviço cadastrado ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(servicesByCategory).map(([category, categoryServices]: [string, any]) => (
            <Card key={category} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className={`flex items-center ${getCategoryColor(category)}`}>
                  {getCategoryIcon(category)}
                  <span className="ml-2">{category}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryServices.map((service: any) => (
                    <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{service.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {service.duration} min
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            R$ {parseFloat(service.price || "0").toFixed(2)}
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Users className="h-3 w-3 mr-1" />
                          {getStaffNames(service.staffIds)}
                        </div>
                        {service.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteService(service.id)}
                          disabled={deleteServiceMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}