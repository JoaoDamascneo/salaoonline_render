import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
// import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { 
  Calendar, 
  Users, 
  Scissors, 
  Clock, 
  BarChart3, 
  Smartphone,
  Check,
  Star,
  Zap,
  Shield,
  ArrowRight,
  Instagram,
  Linkedin,
  Facebook,
  Bell,
  DollarSign,
  Play,
  CheckCircle2,
  TrendingUp,
  HeadphonesIcon,
  Sparkles,
  Target,
  Award,
  Moon,
  Sun
} from "lucide-react";

export default function LandingPage() {
  // Get theme from global window object
  const [theme, setTheme] = useState("light");
  const [toggleTheme, setToggleTheme] = useState(() => () => {});
  
  useEffect(() => {
    const checkTheme = () => {
      if ((window as any).currentTheme) {
        setTheme((window as any).currentTheme.theme);
        setToggleTheme(() => (window as any).currentTheme.toggleTheme);
      }
    };
    
    checkTheme();
    const interval = setInterval(checkTheme, 100);
    return () => clearInterval(interval);
  }, []);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px = md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {isMobile ? (
                <img 
                  src={theme === "dark" ? "/attached_assets/logo-mobile-dark.png" : "/attached_assets/logo-mobile-light.png"}
                  alt="Salão Online" 
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <img 
                  src={theme === "dark" ? "/attached_assets/logo-desktop-dark.png" : "/attached_assets/logo-desktop-light.png"}
                  alt="Salão Online" 
                  className="h-10 w-auto object-contain"
                />
              )}
            </div>
            
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#3db3ff] hover:to-[#004dde] hover:bg-clip-text hover:text-transparent transition-all font-medium">Recursos</a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#3db3ff] hover:to-[#004dde] hover:bg-clip-text hover:text-transparent transition-all font-medium">Preços</a>
              <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#3db3ff] hover:to-[#004dde] hover:bg-clip-text hover:text-transparent transition-all font-medium">Depoimentos</a>
              <a href="#contact" className="text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#3db3ff] hover:to-[#004dde] hover:bg-clip-text hover:text-transparent transition-all font-medium">Contato</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#3db3ff] hover:to-[#004dde] hover:text-white transition-all"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#3db3ff] hover:to-[#004dde] hover:text-white transition-all">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-[#3db3ff] to-[#004dde] hover:from-[#29a3ff] hover:to-[#003bb8] text-white shadow-lg">Ver Planos</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 pt-20 pb-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Sistema completo de gestão para salões de beleza
            </Badge>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Transforme seu salão com 
              <span className="bg-gradient-to-r from-[#3db3ff] to-[#004dde] bg-clip-text text-transparent">
                {" "}gestão inteligente{" "}
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Organize agendamentos, automatize o WhatsApp, controle financeiro e fidelize clientes. 
              O Salão Online é a solução completa para salões, barbearias e estúdios de estética.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-[#3db3ff] to-[#004dde] hover:from-[#29a3ff] hover:to-[#003bb8] text-white shadow-xl px-8 py-4 text-lg">
                  <Zap className="mr-2 h-5 w-5" />
                  Conhecer Planos
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Setup em minutos
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Suporte dedicado
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                Segurança garantida
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating UI Elements - Only on extra large screens */}
        <div className="absolute top-16 left-8 hidden 2xl:block z-10">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 border border-gray-100 dark:border-gray-700 w-52">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-xs">Agendamento confirmado!</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Maria Silva • 14:30</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-24 right-8 hidden 2xl:block z-10">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 border border-gray-100 dark:border-gray-700 w-44">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-xs">+R$ 2.450</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Faturamento hoje</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Recursos que <span className="text-blue-600">fazem a diferença</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Funcionalidades completas para organizar e automatizar a gestão do seu negócio
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {/* Feature 1 - Agendamentos */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2 dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-[#3db3ff] to-[#004dde] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Agendamentos Inteligentes</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Automatize agendamentos via WhatsApp e organize a agenda por profissional. Seus clientes agendam sem complicação.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Agendamento automático por WhatsApp
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Visualização por profissional
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Horários personalizáveis
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2 - Financeiro */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2 dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-[#3db3ff] to-[#004dde] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Controle Financeiro</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Acompanhe receitas, despesas e comissões automaticamente. Visualize o desempenho do seu salão em tempo real.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Lançamentos automáticos
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Controle de comissões e salários
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Dashboard com métricas diárias
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3 - Gestão Completa */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2 dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-[#3db3ff] to-[#004dde] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Gestão Completa</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Organize equipe, clientes, serviços e estoque. Cadastre combos personalizados e fidelize clientes com programa de pontos.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Cadastro de colaboradores e horários
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Histórico completo de clientes
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Programa de fidelidade com pontos
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Agenda Dinâmica</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Visualização por colaborador com horários personalizados</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Automação WhatsApp</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Lembretes automáticos e confirmações pelo WhatsApp</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Controle de Estoque</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Gestão de produtos e alertas de reposição</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <HeadphonesIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Multi-unidades</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Gerencie múltiplos salões em uma única plataforma</p>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gradient-to-r from-blue-50/50 to-blue-100/50 dark:from-slate-800 dark:to-slate-700">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Salões que já usam o <span className="text-blue-600">Salão Online</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Depoimentos reais de donos de salão que transformaram seus negócios</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  "O Salão Online transformou completamente meu salão! O WhatsApp automático economiza horas do meu tempo e meus clientes adoram a praticidade de agendar direto pelo celular."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#3db3ff] to-[#004dde] rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    M
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Maria Silva</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Salão Beleza & Estilo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  "Com o Salão Online organizei completamente minha barbearia. O controle financeiro e o programa de fidelidade trouxeram muito mais clientes fiéis. Recomendo demais!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#3db3ff] to-[#004dde] rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    J
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">João Santos</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Barbearia Clássica</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  "Minhas clientes se sentiram muito mais valorizadas com o programa de pontos. A organização da agenda melhorou 100% e não tenho mais problemas com faltas ou cancelamentos de última hora."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#3db3ff] to-[#004dde] rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    A
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Ana Costa</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Studio Ana Costa</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Planos que <span className="text-blue-600">crescem</span> com você
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Escolha o plano ideal para o seu negócio</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plano Base */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-colors dark:bg-slate-800">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Base</h3>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    R$ 59<span className="text-lg font-normal text-gray-500 dark:text-gray-400">/mês</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Ideal para salões iniciantes</p>
                </div>
                
                <ul className="space-y-4 mb-8 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Até 2 profissionais
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Agendamentos ilimitados
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    WhatsApp integrado
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Suporte por email
                  </li>
                </ul>
                
                <Link href="/register">
                  <Button className="w-full" variant="outline">Assinar Plano</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Plano Core */}
            <Card className="border-2 border-blue-500 relative shadow-xl dark:bg-slate-800 dark:border-blue-500">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1">
                  <Award className="h-4 w-4 mr-1" />
                  Mais Popular
                </Badge>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Core</h3>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    R$ 79<span className="text-lg font-normal text-gray-500 dark:text-gray-400">/mês</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Para salões em crescimento</p>
                </div>
                
                <ul className="space-y-4 mb-8 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Até 5 profissionais
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Gestão financeira completa
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Relatórios avançados
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Suporte prioritário
                  </li>
                </ul>
                
                <Link href="/register">
                  <Button className="w-full bg-gradient-to-r from-[#3db3ff] to-[#004dde] hover:from-[#29a3ff] hover:to-[#003bb8] text-white transition-all">Assinar Plano</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Plano Expert */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 transition-colors dark:bg-slate-800">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Expert</h3>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    R$ 129<span className="text-lg font-normal text-gray-500 dark:text-gray-400">/mês</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Para redes e grandes salões</p>
                </div>
                
                <ul className="space-y-4 mb-8 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Profissionais ilimitados
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Controle de estoque
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    API completa
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    Suporte telefônico 24/7
                  </li>
                </ul>
                
                <Link href="/register">
                  <Button className="w-full" variant="outline">Assinar Plano</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[#3db3ff] to-[#004dde]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Transforme seu salão com o Salão Online
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Escolha o plano ideal e comece a organizar agendamentos, automatizar WhatsApp e controlar suas finanças hoje mesmo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl px-8 py-4 text-lg">
                <Zap className="mr-2 h-5 w-5" />
                Conhecer Planos
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-blue-100">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Dados protegidos
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Setup em minutos
            </div>
            <div className="flex items-center">
              <HeadphonesIcon className="h-5 w-5 mr-2" />
              Suporte especializado
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-slate-950 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center">
                <img 
                  src="/attached_assets/logo-desktop-dark.png" 
                  alt="Salão Online" 
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-400 dark:text-gray-300 leading-relaxed">
                A plataforma mais completa para gestão de salões de beleza, barbearias e estúdios de estética.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 dark:bg-slate-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-[#3db3ff] hover:to-[#004dde] hover:text-white transition-all">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 dark:bg-slate-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-[#3db3ff] hover:to-[#004dde] hover:text-white transition-all">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 dark:bg-slate-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-[#3db3ff] hover:to-[#004dde] hover:text-white transition-all">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-6 text-white">Recursos</h4>
              <ul className="space-y-3 text-gray-400 dark:text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Agendamento via WhatsApp</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Gestão Financeira</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Controle de Equipe</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Relatórios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-6 text-white">Suporte</h4>
              <ul className="space-y-3 text-gray-400 dark:text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status do Sistema</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Comunidade</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-6 text-white">Empresa</h4>
              <ul className="space-y-3 text-gray-400 dark:text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 dark:border-slate-800 pt-8 text-center text-gray-400 dark:text-gray-300">
            <p>&copy; 2025 Salão Online. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}