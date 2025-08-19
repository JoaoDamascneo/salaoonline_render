import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Scissors, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro no login");
      }

      const data = await response.json();
      
      login(data);
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${data.name}!`,
      });
      
      // Aguardar um pouco antes de redirecionar para garantir que o estado foi atualizado
      setTimeout(() => {
        setLocation("/dashboard");
      }, 100);
      
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erro no Login",
        description: error instanceof Error ? error.message : "E-mail ou senha incorretos. Verifique suas credenciais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900">
      {/* Left Panel - Always White with Salon Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-white p-12 items-center justify-center">
        <div className="max-w-lg text-center">
          {/* Salon Illustration */}
          <div className="w-full flex items-center justify-center">
            <img 
              src="/salon-illustration.png" 
              alt="Ambiente moderno de salão" 
              className="w-full max-w-lg h-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form with theme support */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900">
        <div className="max-w-sm w-full">
          {/* Mobile Logo */}
          <div className="text-center mb-8 lg:hidden">
            <img 
              src="/attached_assets/logo-desktop-light.png" 
              alt="Salão Online" 
              className="h-12 mx-auto mb-4 block dark:hidden"
            />
            <img 
              src="/attached_assets/logo-desktop-dark.png" 
              alt="Salão Online" 
              className="h-12 mx-auto mb-4 hidden dark:block"
            />
          </div>
          
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>

          {/* Desktop Logo above form */}
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
          
          <div className="bg-white dark:bg-slate-900">
            <h1 className="text-2xl font-semibold text-center mb-8 text-gray-900 dark:text-white">Bem-vindo de Volta</h1>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Endereço de E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Senha</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">Lembrar de mim</Label>
                </div>
                <Link href="/esqueceu-senha">
                  <Button variant="link" className="text-sm text-blue-600 dark:text-blue-400 p-0">Esqueceu a senha?</Button>
                </Link>
              </div>
              
              <button 
                type="button" 
                className="w-full bg-blue-600 hover:bg-blue-700 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 text-white"
                disabled={isLoading}
                onClick={async (e) => {
                  e.preventDefault();
                  const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                  await handleSubmit(fakeEvent);
                }}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </button>
            </div>
            
            <div className="text-center mt-6 space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Não tem uma conta?{" "}
                <Link href="/register">
                  <Button variant="link" className="text-sm p-0 text-blue-600 dark:text-blue-400">
                    Criar conta
                  </Button>
                </Link>
              </p>
              
              <div className="flex justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <Link href="/terms-of-service" target="_blank">
                  <Button variant="link" className="text-xs p-0 h-auto text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Termos de Uso
                  </Button>
                </Link>
                <span>•</span>
                <Link href="/privacy-policy" target="_blank">
                  <Button variant="link" className="text-xs p-0 h-auto text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Política de Privacidade
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
