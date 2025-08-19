import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scissors, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [establishmentName, setEstablishmentName] = useState("");
  const [phone, setPhone] = useState("");
  const [segment, setSegment] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Erro na Senha",
        description: "As senhas não coincidem. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Termos de Uso",
        description: "Você deve aceitar os termos de uso para continuar.",
        variant: "destructive",
      });
      return;
    }



    if (!establishmentName.trim()) {
      toast({
        title: "Estabelecimento Obrigatório",
        description: "Nome do estabelecimento é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!phone.trim()) {
      toast({
        title: "Telefone Obrigatório",
        description: "Telefone é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!segment) {
      toast({
        title: "Segmento Obrigatório",
        description: "Selecione o segmento do seu estabelecimento.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Salvar dados temporariamente no localStorage para usar na seleção de planos
      const registrationData = {
        establishmentName,
        ownerName: name,
        email,
        phone,
        whatsappNumber: phone, // Usar o mesmo telefone como WhatsApp por padrão
        segment,
        address: "Endereço a ser definido", // Valor temporário
        userName: name,
        password,
      };
      
      localStorage.setItem('pendingRegistration', JSON.stringify(registrationData));
      
      toast({
        title: "Dados Salvos!",
        description: "Agora selecione o plano ideal para seu salão.",
      });
      
      // Redirecionar para seleção de planos
      setLocation("/selecionar-plano");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Erro no Registro",
        description: error.message || "Não foi possível criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
    if (password.match(/\d/)) strength += 1;
    if (password.match(/[^a-zA-Z\d]/)) strength += 1;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["Muito fraca", "Fraca", "Regular", "Boa", "Forte"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

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

      {/* Right Panel - Register Form with theme support */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900">
        <div className="max-w-md w-full">
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
            <h1 className="text-2xl font-semibold text-center mb-2 text-gray-900 dark:text-white">Criar Conta</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              Gerencie seu salão com facilidade
            </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite seu nome completo"
                    required
                    className="mt-1"
                  />
                </div>

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

                <div>
                  <Label htmlFor="establishmentName" className="text-gray-700 dark:text-gray-300">Nome do Estabelecimento</Label>
                  <Input
                    id="establishmentName"
                    type="text"
                    value={establishmentName}
                    onChange={(e) => setEstablishmentName(e.target.value)}
                    placeholder="Digite o nome do seu salão"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="segment" className="text-gray-700 dark:text-gray-300">Segmento do Estabelecimento</Label>
                  <Select value={segment} onValueChange={setSegment} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o tipo do seu negócio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Salão de Beleza">Salão de Beleza</SelectItem>
                      <SelectItem value="Barbearia">Barbearia</SelectItem>
                      <SelectItem value="Estúdio de Unhas">Estúdio de Unhas</SelectItem>
                      <SelectItem value="Clínica de Estética">Clínica de Estética</SelectItem>
                      <SelectItem value="Spa">Spa</SelectItem>
                      <SelectItem value="Centro de Beleza">Centro de Beleza</SelectItem>
                      <SelectItem value="Estúdio de Sobrancelhas">Estúdio de Sobrancelhas</SelectItem>
                      <SelectItem value="Salão Misto">Salão Misto</SelectItem>
                    </SelectContent>
                  </Select>
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
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="flex space-x-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded ${
                              i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-200 dark:bg-gray-600"
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
                  <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">Confirmar Senha</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua senha"
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
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs mt-1 text-red-600 dark:text-red-400">As senhas não coincidem</p>
                  )}
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    Aceito os{" "}
                    <Link href="/terms-of-service" target="_blank">
                      <Button variant="link" className="text-sm p-0 h-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        termos de uso
                      </Button>
                    </Link>{" "}
                    e{" "}
                    <Link href="/privacy-policy" target="_blank">
                      <Button variant="link" className="text-sm p-0 h-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        política de privacidade
                      </Button>
                    </Link>
                  </Label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200" 
                  disabled={isLoading || !acceptTerms || password !== confirmPassword}
                >
                  {isLoading ? "Salvando dados..." : "Continuar para Planos"}
                </Button>
              </form>
              
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Já tem uma conta?{" "}
                  <Link href="/login">
                    <Button variant="link" className="text-sm p-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      Faça login
                    </Button>
                  </Link>
                </p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}