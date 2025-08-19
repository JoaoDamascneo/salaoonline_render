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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Package, Plus, Edit, Trash2, AlertTriangle, TrendingDown, TrendingUp, Lock, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { PlanBlockModal } from "@/components/PlanBlockModal";

// Schema for product creation/editing
const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  brand: z.string().optional(),
  price: z.string().min(1, "Preço é obrigatório"),
  cost: z.string().optional(),
  currentStock: z.number().min(0, "Estoque deve ser maior ou igual a 0"),
  minStock: z.number().min(0, "Estoque mínimo deve ser maior ou igual a 0"),
  description: z.string().optional(),
});

// Schema for product sale
const saleSchema = z.object({
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
});

export default function Inventory() {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isPlanBlockModalOpen, setIsPlanBlockModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [productToSell, setProductToSell] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const planPermissions = usePlanPermissions();

  // Check if user has access to inventory module
  const hasInventoryAccess = planPermissions.checkInventoryAccess();

  // Show plan block modal when user tries to access inventory features without permission
  useEffect(() => {
    if (!planPermissions.isLoading && !hasInventoryAccess) {
      setIsPlanBlockModalOpen(true);
    }
  }, [planPermissions.isLoading, hasInventoryAccess]);

  // Queries - only fetch if user has access
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    enabled: hasInventoryAccess,
  });

  // Form for adding/editing products
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      brand: "",
      price: "",
      cost: "",
      currentStock: 0,
      minStock: 0,
      description: "",
    },
  });

  // Form for product sales
  const saleForm = useForm({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/products", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsAddProductOpen(false);
      form.reset();
      // Toast removed - form closure provides feedback
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar produto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/products/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsEditProductOpen(false);
      setEditingProduct(null);
      form.reset();
      // Toast removed - form closure provides feedback
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/products/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      // Toast removed - visual update provides feedback
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover produto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const sellProductMutation = useMutation({
    mutationFn: (data: { productId: number; quantity: number; unitPrice: number; productName: string }) =>
      apiRequest("/api/products/sell", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/finances/stats"] });
      setIsSaleModalOpen(false);
      setProductToSell(null);
      saleForm.reset();
      // Toast removed - modal closure provides feedback
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao processar venda. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: any) => {
    const productData = {
      ...data,
      price: parseFloat(data.price),
      cost: data.cost ? parseFloat(data.cost) : 0,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  // Handle add product - always clear fields
  const handleAddProduct = () => {
    setEditingProduct(null);
    form.reset({
      name: "",
      category: "",
      brand: "",
      price: "",
      cost: "",
      currentStock: 0,
      minStock: 0,
      description: "",
    });
    setIsAddProductOpen(true);
  };

  // Handle add product modal open/close - ensure fields are always clean when opening
  const handleAddProductModalChange = (open: boolean) => {
    if (open && !editingProduct) {
      // Only reset if we're opening for add (not edit)
      form.reset({
        name: "",
        category: "",
        brand: "",
        price: "",
        cost: "",
        currentStock: 0,
        minStock: 0,
        description: "",
      });
    }
    setIsAddProductOpen(open);
  };

  // Handle edit product
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      category: product.category,
      brand: product.brand || "",
      price: product.price.toString(),
      cost: product.cost?.toString() || "",
      currentStock: product.currentStock,
      minStock: product.minStock,
      description: product.description || "",
    });
    setIsEditProductOpen(true);
  };

  // Handle delete product
  const handleDeleteProduct = (product: any) => {
    if (confirm(`Tem certeza que deseja remover o produto "${product.name}"?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  // Handle sell product
  const handleSellProduct = (product: any) => {
    setProductToSell(product);
    saleForm.reset({ quantity: 1 });
    setIsSaleModalOpen(true);
  };

  // Handle sale form submission
  const onSaleSubmit = (data: any) => {
    if (!productToSell) return;
    
    // Validate quantity against available stock
    if (data.quantity > productToSell.currentStock) {
      toast({
        title: "Erro",
        description: `Quantidade solicitada (${data.quantity}) excede o estoque disponível (${productToSell.currentStock})`,
        variant: "destructive",
      });
      return;
    }
    
    const saleData = {
      productId: productToSell.id,
      quantity: data.quantity,
      unitPrice: parseFloat(productToSell.price),
      productName: productToSell.name,
    };
    
    sellProductMutation.mutate(saleData);
  };

  // Calculate total sale amount
  const calculateTotal = () => {
    if (!productToSell) return 0;
    const quantity = saleForm.watch("quantity") || 0;
    return quantity * parseFloat(productToSell.price);
  };

  // Get stock status
  const getStockStatus = (product: any) => {
    if (product.currentStock === 0) {
      return { label: "Sem Estoque", variant: "destructive" as const, icon: AlertTriangle };
    }
    if (product.currentStock <= product.minStock) {
      return { label: "Estoque Baixo", variant: "secondary" as const, icon: TrendingDown };
    }
    return { label: "Em Estoque", variant: "default" as const, icon: TrendingUp };
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // If user doesn't have access, show blocked content
  if (!hasInventoryAccess && !planPermissions.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Controle de Estoque</h2>
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
                  Módulo de Estoque Bloqueado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Este recurso faz parte do plano {planPermissions.getRequiredPlanForInventory()}.<br />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">****** *****</p>
                        <p className="text-2xl font-bold text-gray-400">**</p>
                      </div>
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>******** ** ********</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
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
          requiredPlan={planPermissions.getRequiredPlanForInventory()}
          currentPlan={planPermissions.getCurrentPlan()}
          feature="Módulo de Estoque"
        />
      </div>
    );
  }

  if (productsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Controle de Estoque</h2>
        <Dialog open={isAddProductOpen} onOpenChange={handleAddProductModalChange}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={handleAddProduct}>
              <Plus className="h-4 w-4" />
              Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Produto</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Produto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Shampoo Profissional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Cosméticos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: L'Oréal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço de Venda</FormLabel>
                        <FormControl>
                          <Input placeholder="0.00" type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custo</FormLabel>
                        <FormControl>
                          <Input placeholder="0.00" type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="currentStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estoque Atual</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="0" 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estoque Mínimo</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="0" 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descrição opcional do produto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => handleAddProductModalChange(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createProductMutation.isPending}>
                    {createProductMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {Array.isArray(products) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Produtos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Array.isArray(products) ? products.length : 0}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Produtos com Estoque Baixo</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Array.isArray(products) ? products.filter((p: any) => p.currentStock <= p.minStock && p.currentStock > 0).length : 0}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Produtos Sem Estoque</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Array.isArray(products) ? products.filter((p: any) => p.currentStock === 0).length : 0}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos em Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          {products && Array.isArray(products) && products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(products) && products.map((product: any) => {
                  const status = getStockStatus(product);
                  const StatusIcon = status.icon;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.brand || "-"}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        {product.currentStock} / {product.minStock} (mín)
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSellProduct(product)}
                            disabled={product.currentStock === 0}
                            className={product.currentStock === 0 ? "opacity-50 cursor-not-allowed" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                          >
                            <ShoppingCart className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum produto cadastrado</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Clique em "Adicionar Produto" para começar
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Produto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Shampoo Profissional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Cosméticos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: L'Oréal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Venda</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custo</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="currentStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque Atual</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0" 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque Mínimo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0" 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição opcional do produto" {...field} />
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
                    setIsEditProductOpen(false);
                    setEditingProduct(null);
                    form.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateProductMutation.isPending}>
                  {updateProductMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Sale Product Dialog */}
      <Dialog open={isSaleModalOpen} onOpenChange={setIsSaleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Venda</DialogTitle>
          </DialogHeader>
          {productToSell && (
            <Form {...saleForm}>
              <form onSubmit={saleForm.handleSubmit(onSaleSubmit)} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Produto</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{productToSell.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Preço Unitário</p>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(productToSell.price)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estoque Disponível</p>
                    <p className="text-lg font-semibold text-blue-600">{productToSell.currentStock} unidades</p>
                  </div>
                  
                  <FormField
                    control={saleForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade a Vender</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max={productToSell.currentStock}
                            placeholder="1" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(calculateTotal())}</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsSaleModalOpen(false);
                      setProductToSell(null);
                      saleForm.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={sellProductMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {sellProductMutation.isPending ? "Processando..." : "Confirmar Venda"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}