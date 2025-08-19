import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function PaymentCallback() {
  const [status, setStatus] = useState<'checking' | 'success' | 'pending' | 'error'>('checking');
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Verificar parâmetros da URL para determinar status
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');

    if (success === 'true' || sessionId) {
      setStatus('success');
      setMessage('Pagamento realizado com sucesso! Sua conta será criada automaticamente em alguns instantes.');
      
      toast({
        title: "Pagamento Confirmado!",
        description: "Sua conta será criada automaticamente. Você pode fazer login em alguns minutos.",
      });
    } else if (canceled === 'true') {
      setStatus('error');
      setMessage('Pagamento cancelado. Você pode tentar novamente.');
    } else {
      setStatus('pending');
      setMessage('Aguardando confirmação do pagamento...');
    }
  }, [toast]);

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />;
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-500 mx-auto animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />;
      default:
        return <Clock className="w-16 h-16 text-blue-500 mx-auto animate-spin" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'success':
        return 'Pagamento Confirmado!';
      case 'pending':
        return 'Processando Pagamento...';
      case 'error':
        return 'Erro no Pagamento';
      default:
        return 'Verificando Pagamento...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {getIcon()}
          <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-4">
            {getTitle()}
          </CardTitle>
          <CardDescription className="text-center mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>Próximos passos:</strong><br/>
                  1. Sua conta será criada automaticamente<br/>
                  2. Aguarde alguns minutos<br/>
                  3. Faça login com os dados cadastrados
                </p>
              </div>
              <Button 
                onClick={() => navigate("/login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Ir para Login
              </Button>
            </div>
          )}

          {status === 'pending' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Aguarde enquanto processamos seu pagamento...
                </p>
              </div>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Atualizar Status
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <Button 
                onClick={() => navigate("/selecionar-plano")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Tentar Novamente
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/login")}
                className="w-full"
              >
                Ir para Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}