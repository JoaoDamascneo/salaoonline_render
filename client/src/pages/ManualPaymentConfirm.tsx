import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function ManualPaymentConfirm() {
  const [customerId, setCustomerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleConfirm = async () => {
    if (!customerId.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite o Customer ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/confirm-payment-manual", {
        stripeCustomerId: customerId.trim()
      });

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Conta criada com sucesso! Redirecionando para login...",
        });
        
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao confirmar pagamento");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao confirmar pagamento",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Confirmar Pagamento
          </CardTitle>
          <CardDescription>
            Digite o Customer ID do Stripe para confirmar seu pagamento e criar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer ID do Stripe</Label>
            <Input
              id="customerId"
              type="text"
              placeholder="cus_..."
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Exemplo: cus_SpD0WNvg7MNwkI
            </p>
          </div>

          <Button 
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Confirmando..." : "Confirmar Pagamento"}
          </Button>

          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => navigate("/login")}
              className="text-blue-600 dark:text-blue-400"
            >
              Voltar ao Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}