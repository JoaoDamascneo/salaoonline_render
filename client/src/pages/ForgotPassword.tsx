import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, digite seu email"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar email');
      }

      setEmailSent(true);
      toast({
        title: "Email enviado",
        description: "Se este email existir em nossos registros, você receberá instruções para redefinir sua senha."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao enviar email de recuperação"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="text-center lg:hidden">
            <img 
              src="/attached_assets/logo-mobile-light.png" 
              alt="Salão Online" 
              className="h-12 mx-auto mb-4 block dark:hidden"
            />
            <img 
              src="/attached_assets/logo-mobile-dark.png" 
              alt="Salão Online" 
              className="h-12 mx-auto mb-4 hidden dark:block"
            />
          </div>
          
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Login
              </Button>
            </Link>
          </div>

          {/* Desktop Logo */}
          <div className="text-center mb-8 hidden lg:block">
            <img 
              src="/attached_assets/logo-desktop-light.png" 
              alt="Salão Online" 
              className="h-16 mx-auto mb-6 block dark:hidden"
            />
            <img 
              src="/attached_assets/logo-desktop-dark.png" 
              alt="Salão Online" 
              className="h-16 mx-auto mb-6 hidden dark:block"
            />
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Email Enviado!</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Verifique sua caixa de entrada e clique no link recebido para redefinir sua senha.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="mb-2"><strong>Não recebeu o email?</strong></p>
                <ul className="text-left space-y-1">
                  <li>• Verifique sua caixa de spam</li>
                  <li>• Aguarde alguns minutos</li>
                  <li>• Certifique-se de que digitou o email correto</li>
                </ul>
              </div>
              <div className="mt-6">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Voltar ao Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Mobile Logo */}
        <div className="text-center lg:hidden">
          <img 
            src="/attached_assets/logo-mobile-light.png" 
            alt="Salão Online" 
            className="h-12 mx-auto mb-4 block dark:hidden"
          />
          <img 
            src="/attached_assets/logo-mobile-dark.png" 
            alt="Salão Online" 
            className="h-12 mx-auto mb-4 hidden dark:block"
          />
        </div>
        
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Login
            </Button>
          </Link>
        </div>

        {/* Desktop Logo */}
        <div className="text-center mb-8 hidden lg:block">
          <img 
            src="/attached_assets/logo-desktop-light.png" 
            alt="Salão Online" 
            className="h-16 mx-auto mb-6 block dark:hidden"
          />
          <img 
            src="/attached_assets/logo-desktop-dark.png" 
            alt="Salão Online" 
            className="h-16 mx-auto mb-6 hidden dark:block"
          />
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
          <h1 className="text-2xl font-semibold text-center mb-2 text-gray-900 dark:text-white">Recuperar Senha</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Digite seu email para receber as instruções de redefinição de senha
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                required
                className="mt-1"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200" 
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
            </Button>
          </form>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Lembrou da senha?{" "}
              <Link href="/login">
                <Button variant="link" className="text-sm p-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Fazer login
                </Button>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}