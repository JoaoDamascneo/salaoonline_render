import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lock, CheckCircle } from "lucide-react";

// Carregar o Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/pagamento-sucesso`,
        },
      });

      if (error) {
        toast({
          title: "Falha no Pagamento",
          description: error.message || "Erro ao processar pagamento",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao processar pagamento",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            Pagamento Seguro
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Seus dados estão protegidos com criptografia SSL
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Garantias incluídas:</span>
                </div>
                <ul className="text-sm text-green-600 dark:text-green-300 mt-2 space-y-1">
                  <li>• 7 dias de teste grátis</li>
                  <li>• Cancele a qualquer momento</li>
                  <li>• Suporte 24/7</li>
                </ul>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!stripe || isProcessing}
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Processando Pagamento...
                  </>
                ) : (
                  'Confirmar Pagamento'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Payment() {
  const [clientSecret, setClientSecret] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Extrair client_secret da URL
    const urlParams = new URLSearchParams(window.location.search);
    const secret = urlParams.get('client_secret');
    
    if (!secret) {
      setLocation('/selecionar-plano');
      return;
    }

    setClientSecret(secret);
  }, [setLocation]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Finalize sua Assinatura
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Complete o pagamento para ativar seu plano do Salão Online
          </p>
        </div>

        <Elements 
          stripe={stripePromise} 
          options={{ 
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#8b5cf6',
                colorBackground: '#ffffff',
                colorText: '#30313d',
                colorDanger: '#df1b41',
                fontFamily: 'system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px'
              }
            }
          }}
        >
          <PaymentForm />
        </Elements>
        
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade
          </p>
        </div>
      </div>
    </div>
  );
}