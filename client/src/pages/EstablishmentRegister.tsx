import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Building, User, Mail, Phone, MapPin, Camera, Briefcase } from "lucide-react";

const registerSchema = z.object({
  // Establishment information
  establishmentName: z.string().min(2, "Nome do estabelecimento deve ter pelo menos 2 caracteres"),
  ownerName: z.string().min(2, "Nome do responsável deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  whatsappNumber: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos"),
  segment: z.string().min(1, "Selecione um segmento"),
  address: z.string().min(10, "Endereço completo é obrigatório"),
  logo: z.string().optional(),
  // User credentials
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function EstablishmentRegister() {
  const { toast } = useToast();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      establishmentName: "",
      ownerName: "",
      email: "",
      phone: "",
      whatsappNumber: "",
      segment: "",
      address: "",
      logo: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await apiRequest('POST', '/api/register/establishment', {
        establishment: {
          name: data.establishmentName,
          ownerName: data.ownerName,
          email: data.email,
          phone: data.phone,
          whatsappNumber: data.whatsappNumber,
          segment: data.segment,
          address: data.address,
          logo: data.logo,
        },
        user: {
          name: data.ownerName,
          email: data.email,
          password: data.password,
        },
      });
      return response;
    },
    onSuccess: (data) => {
      // Configure user data with correct format for authentication
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role as "admin" | "staff",
        establishmentId: data.user.establishmentId,
        staffId: data.user.staffId
      };
      
      // Login the user automatically
      login(userData);
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: `Bem-vindo ao ${data.establishment.name}! Você já está logado no sistema.`,
      });
      
      // Redirect to dashboard with a small delay to ensure login is processed
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setIsSubmitting(true);
    registerMutation.mutate(data, {
      onSettled: () => {
        setIsSubmitting(false);
      }
    });
  };

  const segmentOptions = [
    { value: "salon", label: "Salão de Beleza" },
    { value: "barbershop", label: "Barbearia" },
    { value: "aesthetic", label: "Estética e Spa" },
    { value: "nail_salon", label: "Nail Design" },
    { value: "beauty_center", label: "Centro de Beleza" },
    { value: "other", label: "Outro" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            Criar Nova Conta
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            Cadastre seu estabelecimento e comece a gerenciar seus agendamentos
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Establishment Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                  <Building className="h-5 w-5" />
                  Informações do Estabelecimento
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="establishmentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Estabelecimento *</FormLabel>
                        <FormControl>
                          <Input placeholder="Salão da Maria" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="segment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Segmento *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o segmento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {segmentOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
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
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço Completo *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Rua das Flores, 123 - Centro - São Paulo/SP - CEP: 01234-567"
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone de Atendimento *</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp *</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormDescription>
                          Número para integração WhatsApp
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo do Estabelecimento</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="URL da imagem ou deixe em branco"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Você pode adicionar o logo agora ou depois nas configurações
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Owner/Admin Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                  <User className="h-5 w-5" />
                  Dados do Responsável/Administrador
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ownerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Maria Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="maria@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Este será seu login no sistema
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting || registerMutation.isPending}
                >
                  {isSubmitting || registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Já tem uma conta?{" "}
                    <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                      Fazer login
                    </a>
                  </p>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}