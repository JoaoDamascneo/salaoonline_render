import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FileText, Shield, ExternalLink } from "lucide-react";

interface TermsAcceptanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  establishmentId: number;
  onAccepted: () => void;
}

export function TermsAcceptanceModal({ 
  open, 
  onOpenChange, 
  establishmentId, 
  onAccepted 
}: TermsAcceptanceModalProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAccept = async () => {
    if (!termsAccepted || !privacyAccepted) {
      toast({
        variant: "destructive",
        title: "Aceitação obrigatória",
        description: "Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar."
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/accept-terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          establishmentId,
          termsVersion: "1.0",
          privacyPolicyVersion: "1.0"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao aceitar termos');
      }

      toast({
        title: "Termos aceitos",
        description: "Obrigado por aceitar nossos termos e política de privacidade."
      });

      onAccepted();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao salvar aceitação dos termos"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Aceite os Termos para Continuar
          </DialogTitle>
          <DialogDescription>
            Para utilizar o Salão Online, você deve aceitar nossos Termos de Uso e Política de Privacidade.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="px-6 max-h-96">
          <div className="space-y-6">
            {/* Terms Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Resumo dos Termos de Uso
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Sistema de gestão para estabelecimentos de beleza</li>
                <li>• Uso responsável e em conformidade com as leis</li>
                <li>• Integração WhatsApp não oficial (terceiros)</li>
                <li>• Possibilidade de alterações nos termos</li>
              </ul>
            </div>

            {/* Privacy Summary */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Resumo da Política de Privacidade
              </h3>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>• Coletamos dados para funcionamento do sistema</li>
                <li>• Não compartilhamos dados com terceiros</li>
                <li>• Medidas de segurança implementadas</li>
                <li>• Direito de acesso e exclusão dos dados</li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/terms-of-service" target="_blank">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ler Termos Completos
                </Button>
              </Link>
              <Link href="/privacy-policy" target="_blank">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ler Política Completa
                </Button>
              </Link>
            </div>
          </div>
        </ScrollArea>

        {/* Acceptance Checkboxes */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms-acceptance"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <Label 
              htmlFor="terms-acceptance" 
              className="text-sm leading-relaxed cursor-pointer"
            >
              Eu li, compreendi e aceito os{" "}
              <Link href="/terms-of-service" target="_blank">
                <span className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
                  Termos de Uso
                </span>
              </Link>
              {" "}do Salão Online.
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacy-acceptance"
              checked={privacyAccepted}
              onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
            />
            <Label 
              htmlFor="privacy-acceptance" 
              className="text-sm leading-relaxed cursor-pointer"
            >
              Eu li, compreendi e aceito a{" "}
              <Link href="/privacy-policy" target="_blank">
                <span className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
                  Política de Privacidade
                </span>
              </Link>
              {" "}do Salão Online.
            </Label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!termsAccepted || !privacyAccepted || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Salvando..." : "Aceitar e Continuar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}