import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Crown, TrendingUp, Package, MessageCircle, Users, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlanBlockModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  requiredPlan: string;
  currentPlan: string;
  feature: string;
}

const planFeatures = {
  "Base": {
    icon: Users,
    color: "bg-blue-500",
    features: [
      "Até 2 colaboradores",
      "Agendamentos básicos",
      "Gestão de clientes",
      "Gestão de serviços",
      "Suporte por email"
    ]
  },
  "Core": {
    icon: TrendingUp,
    color: "bg-green-500",
    features: [
      "Até 5 colaboradores",
      "Todos os recursos do Base",
      "Módulo Financeiro completo",
      "Relatórios avançados",
      "Comissões de colaboradores",
      "Suporte prioritário"
    ]
  },
  "Expert": {
    icon: Crown,
    color: "bg-purple-500",
    features: [
      "Colaboradores ilimitados",
      "Todos os recursos anteriores",
      "Módulo de Estoque",
      "Integração WhatsApp",
      "Relatórios personalizados",
      "Suporte 24/7"
    ]
  }
};

export function PlanBlockModal({ isOpen, onOpenChange, requiredPlan, currentPlan, feature }: PlanBlockModalProps) {
  const RequiredIcon = planFeatures[requiredPlan as keyof typeof planFeatures]?.icon || Crown;
  const requiredColor = planFeatures[requiredPlan as keyof typeof planFeatures]?.color || "bg-purple-500";
  const requiredFeatures = planFeatures[requiredPlan as keyof typeof planFeatures]?.features || [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lock className="h-5 w-5 text-amber-500" />
            Recurso Bloqueado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current limitation message */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                  {feature} faz parte do plano {requiredPlan}
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Seu plano atual ({currentPlan}) não inclui este recurso. Atualize para desbloquear.
                </p>
              </div>
            </div>
          </div>

          {/* Plan comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Plan */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Users className="h-4 w-4" />
                  </div>
                  Plano Atual
                  <Badge variant="secondary">{currentPlan}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {planFeatures[currentPlan as keyof typeof planFeatures]?.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Required Plan */}
            <Card className="border-2 border-purple-200 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className={`p-2 ${requiredColor} rounded-lg`}>
                    <RequiredIcon className="h-4 w-4 text-white" />
                  </div>
                  Plano Recomendado
                  <Badge className="bg-purple-500 text-white">{requiredPlan}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {requiredFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Continuar com Plano Atual
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                onOpenChange(false);
                // Here you would typically navigate to a pricing/upgrade page
                // For now, we'll just show an alert
                alert("Funcionalidade de upgrade será implementada em breve!");
              }}
            >
              <Crown className="h-4 w-4 mr-2" />
              Atualizar Plano
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}