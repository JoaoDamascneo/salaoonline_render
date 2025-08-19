import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Verificar se o pagamento foi confirmado
        const urlParams = new URLSearchParams(window.location.search);
        const paymentIntent = urlParams.get('payment_intent');
        
        if (paymentIntent) {
          // Confirmar o pagamento no backend
          const response = await apiRequest('POST', '/api/confirm-payment', {
            paymentIntentId: paymentIntent
          });

          if (!response.ok) {
            throw new Error('Erro ao confirmar pagamento');
          }
        }

        setIsProcessing(false);
      } catch (error) {
        console.error('Error confirming payment:', error);
        setError('Erro ao confirmar pagamento. Entre em contato com o suporte.');
        setIsProcessing(false);
      }
    };

    handlePaymentSuccess();
  }, []);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Confirmando Pagamento</h3>
            <p className="text-gray-600">Por favor, aguarde enquanto processamos sua assinatura...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 14.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-red-700">Erro no Pagamento</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <Button onClick={() => setLocation('/selecionar-plano')} variant="outline">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="text-green-500 mb-4">
            <CheckCircle className="w-16 h-16 mx-auto" />
          </div>
          <CardTitle className="text-2xl text-green-700 dark:text-green-400">Pagamento Confirmado!</CardTitle>
          <p className="text-green-600 dark:text-green-300 mt-2">
            Sua assinatura foi ativada com sucesso
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">O que acontece agora?</h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Sua conta foi criada automaticamente
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Seu plano está ativo e pronto para uso
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Você receberá um email de confirmação
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => setLocation('/login')}
              className="w-full"
              size="lg"
            >
              Acessar minha Conta
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              onClick={() => setLocation('/')}
              variant="outline"
              className="w-full"
            >
              Voltar ao Início
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Precisa de ajuda? Entre em contato com nosso suporte
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}