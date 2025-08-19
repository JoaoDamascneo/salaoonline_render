import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: number;
  name: string;
  price: string;
  maxStaffMembers: number;
  maxMonthlyAppointments: number | null;
  hasFinancialModule: boolean;
  hasInventoryModule: boolean;
  hasWhatsappIntegration: boolean;
  description: string;
  isActive: boolean;
}

export default function SelectPlan() {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const { data: plans, isLoading } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
  });

  const handleSelectPlan = async (planId: number) => {
    setIsProcessing(true);
    try {
      // Get registration data from localStorage
      const registrationData = localStorage.getItem('pendingRegistration');
      if (!registrationData) {
        toast({
          title: "Erro",
          description: "Dados de cadastro não encontrados. Tente novamente.",
          variant: "destructive",
        });
        setLocation('/registro');
        return;
      }

      const parsedData = JSON.parse(registrationData);
      
      // Create subscription with selected plan
      const data = await apiRequest('/api/create-subscription', 'POST', {
        ...parsedData,
        planId: planId
      });
      
      // Store customer ID for post-payment processing
      localStorage.setItem('stripeCustomerId', data.customerId);
      
      // Clean up old registration data
      localStorage.removeItem('pendingRegistration');
      
      // Redirect to external Stripe payment link
      window.location.href = data.paymentLink;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar plano selecionado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'base':
        return <Star className="h-6 w-6" />;
      case 'core':
        return <Zap className="h-6 w-6" />;
      case 'expert':
        return <Crown className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'base':
        return 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-950';
      case 'core':
        return 'border-blue-300 bg-blue-100 ring-2 ring-blue-500 dark:border-blue-600 dark:bg-blue-900 dark:ring-blue-400';
      case 'expert':
        return 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-950';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Escolha o Plano Ideal para seu Salão
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Selecione o plano que melhor atende às necessidades do seu estabelecimento. 
            Você pode alterar ou cancelar a qualquer momento.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans?.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg ${getPlanColor(plan.name)} ${
                selectedPlan === plan.id ? 'ring-4 ring-primary' : ''
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.name.toLowerCase() === 'core' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-1">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <div className="mb-4 flex justify-center">
                  {getPlanIcon(plan.name)}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">R$ {plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400">/mês</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Até {plan.maxStaffMembers} colaborador{plan.maxStaffMembers > 1 ? 'es' : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {plan.maxMonthlyAppointments 
                        ? `${plan.maxMonthlyAppointments} agendamentos/mês` 
                        : 'Agendamentos ilimitados'
                      }
                    </span>
                  </div>

                  {plan.hasWhatsappIntegration && (
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Integração WhatsApp</span>
                    </div>
                  )}

                  {plan.hasFinancialModule && (
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Módulo Financeiro</span>
                    </div>
                  )}

                  {plan.hasInventoryModule && (
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Controle de Estoque</span>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full mt-6" 
                  variant={selectedPlan === plan.id ? "default" : "outline"}
                  disabled={isProcessing}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan(plan.id);
                  }}
                >
                  {isProcessing && selectedPlan === plan.id ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Processando...
                    </>
                  ) : (
                    'Escolher este Plano'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 max-w-2xl mx-auto border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Como funciona o pagamento?
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p>• Após escolher o plano, você será redirecionado para o pagamento seguro via Stripe</p>
              <p>• 7 dias de teste grátis - você só paga após o período de teste</p>
              <p>• Sua conta será criada automaticamente após a confirmação do pagamento</p>
              <p>• Cancele ou altere seu plano a qualquer momento</p>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Ainda tem dúvidas? Entre em contato conosco para esclarecimentos.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setLocation('/register')}
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Voltar ao Cadastro
          </Button>
        </div>
      </div>
    </div>
  );
}