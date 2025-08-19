import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff, Check, X } from "lucide-react";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { toast } = useToast();

  // Extrair token da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      validateToken(tokenFromUrl);
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Token de redefinição não encontrado"
      });
      navigate("/login");
    }
  }, [navigate]);

  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await fetch(`/api/reset-password/${tokenToValidate}`);
      if (!response.ok) {
        throw new Error('Token inválido');
      }
      const data = await response.json();
      setIsValidToken(true);
      setEmail(data.email);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Token Inválido",
        description: "Este link de redefinição expirou ou é inválido"
      });
      setIsValidToken(false);
      setTimeout(() => navigate("/login"), 3000);
    } finally {
      setIsValidating(false);
    }
  };

  // Calcular força da senha
  useEffect(() => {
    let strength = 0;
    if (newPassword.length >= 6) strength++;
    if (newPassword.length >= 8) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
    setPasswordStrength(strength);
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        body: JSON.stringify({ 
          token,
          newPassword 
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao redefinir senha');
      }

      toast({
        title: "Sucesso!",
        description: "Senha redefinida com sucesso. Você pode fazer login agora."
      });
      
      navigate("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao redefinir senha"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const strengthLabels = ["Muito fraca", "Fraca", "Razoável", "Boa", "Muito forte"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-green-600"];

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Validando link de redefinição...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Link Inválido</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Este link de redefinição expirou ou é inválido. Você será redirecionado para a página de login.
              </p>
              <Link href="/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Ir para Login
                </Button>
              </Link>
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
          <h1 className="text-2xl font-semibold text-center mb-2 text-gray-900 dark:text-white">Redefinir Senha</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-2">
            Defina uma nova senha para sua conta
          </p>
          {email && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
              Email: {email}
            </p>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">Nova Senha</Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword && (
                <div className="mt-2">
                  <div className="flex space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 w-full rounded ${
                          i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                    Força da senha: {strengthLabels[passwordStrength - 1] || "Muito fraca"}
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">Confirmar Nova Senha</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs mt-1 text-red-600 dark:text-red-400">As senhas não coincidem</p>
              )}
              {confirmPassword && newPassword === confirmPassword && newPassword.length > 0 && (
                <p className="text-xs mt-1 text-green-600 dark:text-green-400 flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Senhas coincidem
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200" 
              disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 6}
            >
              {isLoading ? "Redefinindo..." : "Redefinir Senha"}
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