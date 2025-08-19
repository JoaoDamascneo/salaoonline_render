import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function PaymentReturn() {
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    
    // Simular processamento e redirecionar para callback
    setTimeout(() => {
      setLocation('/pagamento-callback');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mb-4">
            <CheckCircle className="w-16 h-16 mx-auto text-blue-500" />
          </div>
          <CardTitle className="text-2xl text-gray-700 dark:text-gray-300">
            Pagamento Realizado!
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Confirme para finalizar a criação da sua conta
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Próximos passos:</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
              <li>• Clique em "Confirmar e Criar Conta" abaixo</li>
              <li>• Sua conta será criada automaticamente</li>
              <li>• Você será redirecionado para o login</li>
              <li>• Comece a usar o sistema imediatamente</li>
            </ul>
          </div>

          <div className="text-center space-y-4">
            <Button 
              onClick={handleConfirmPayment}
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  Confirmar e Criar Conta
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Problemas com o pagamento?{' '}
                <button 
                  onClick={() => setLocation('/selecionar-plano')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Tente novamente
                </button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}