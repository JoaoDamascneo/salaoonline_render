import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
// import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteGuard } from "@/components/RouteGuard";
import { UpdateNotification } from "@/components/UpdateNotification";
import { useWebSocket } from "@/hooks/useWebSocket";
import Dashboard from "@/pages/Dashboard";
import Appointments from "@/pages/Appointments";
import Clients from "@/pages/Clients";
import Services from "@/pages/Services";
import Staff from "@/pages/Staff";
import Inventory from "@/pages/Inventory";
import Finances from "@/pages/Finances";
import Loyalty from "@/pages/Loyalty";
import N8NTest from "@/pages/N8NTest";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import EstablishmentRegister from "@/pages/EstablishmentRegister";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import LandingPage from "@/pages/LandingPage";
import SelectPlan from "@/pages/SelectPlan";
import Payment from "@/pages/Payment";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCallback from "@/pages/PaymentCallback";
import PaymentReturn from "@/pages/PaymentReturn";
import ManualPaymentConfirm from "@/pages/ManualPaymentConfirm";

function DashboardApp() {
  // Initialize WebSocket for real-time updates
  const { isConnected } = useWebSocket();
  
  return (
    <ErrorBoundary>
      <RouteGuard requireAuth={true}>
        <Layout>
          <Switch>
            <Route path="/dashboard" component={() => (
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            )} />
            <Route path="/agendamentos" component={() => (
              <ErrorBoundary>
                <Appointments />
              </ErrorBoundary>
            )} />
            <Route path="/clientes" component={() => (
              <ErrorBoundary>
                <Clients />
              </ErrorBoundary>
            )} />
            <Route path="/servicos" component={() => (
              <ErrorBoundary>
                <Services />
              </ErrorBoundary>
            )} />
            <Route path="/colaboradores" component={() => (
              <ErrorBoundary>
                <Staff />
              </ErrorBoundary>
            )} />
            <Route path="/estoque" component={() => (
              <ErrorBoundary>
                <Inventory />
              </ErrorBoundary>
            )} />
            <Route path="/financeiro" component={() => (
              <ErrorBoundary>
                <Finances />
              </ErrorBoundary>
            )} />
            <Route path="/fidelidade" component={() => (
              <ErrorBoundary>
                <Loyalty />
              </ErrorBoundary>
            )} />
            <Route path="/configuracoes" component={() => (
              <ErrorBoundary>
                <Settings />
              </ErrorBoundary>
            )} />
            <Route path="/n8n-test" component={() => (
              <ErrorBoundary>
                <N8NTest />
              </ErrorBoundary>
            )} />
            <Route component={() => (
              <ErrorBoundary>
                <NotFound />
              </ErrorBoundary>
            )} />
          </Switch>
        </Layout>
      </RouteGuard>
    </ErrorBoundary>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/vendas" component={() => (
        <ErrorBoundary>
          <RouteGuard requireAuth={false}>
            <LandingPage />
          </RouteGuard>
        </ErrorBoundary>
      )} />
      <Route path="/login" component={() => (
        <ErrorBoundary>
          <RouteGuard requireAuth={false}>
            <Login />
          </RouteGuard>
        </ErrorBoundary>
      )} />
      <Route path="/esqueceu-senha" component={() => (
        <ErrorBoundary>
          <RouteGuard requireAuth={false}>
            <ForgotPassword />
          </RouteGuard>
        </ErrorBoundary>
      )} />
      <Route path="/redefinir-senha" component={() => (
        <ErrorBoundary>
          <RouteGuard requireAuth={false}>
            <ResetPassword />
          </RouteGuard>
        </ErrorBoundary>
      )} />
      <Route path="/terms-of-service" component={() => (
        <ErrorBoundary>
          <RouteGuard requireAuth={false}>
            <TermsOfService />
          </RouteGuard>
        </ErrorBoundary>
      )} />
      <Route path="/privacy-policy" component={() => (
        <ErrorBoundary>
          <RouteGuard requireAuth={false}>
            <PrivacyPolicy />
          </RouteGuard>
        </ErrorBoundary>
      )} />
      <Route path="/register" component={() => (
        <ErrorBoundary>
          <RouteGuard requireAuth={false}>
            <Register />
          </RouteGuard>
        </ErrorBoundary>
      )} />
      <Route path="/cadastro-estabelecimento" component={() => (
        <ErrorBoundary>
          <RouteGuard requireAuth={false}>
            <EstablishmentRegister />
          </RouteGuard>
        </ErrorBoundary>
      )} />
      <Route path="/selecionar-plano" component={() => (
        <ErrorBoundary>
          <RouteGuard requireAuth={false}>
            <SelectPlan />
          </RouteGuard>
        </ErrorBoundary>
      )} />
      <Route path="/pagamento" component={() => (
        <ErrorBoundary>
          <RouteGuard requireAuth={false}>
            <Payment />
          </RouteGuard>
        </ErrorBoundary>
      )} />
      <Route path="/pagamento-sucesso" component={() => (
        <ErrorBoundary>
          <RouteGuard requireAuth={false}>
            <PaymentSuccess />
          </RouteGuard>
        </ErrorBoundary>
      )} />
      <Route path="/pagamento-callback" component={() => (
        <ErrorBoundary>
          <RouteGuard requireAuth={false}>
            <PaymentCallback />
          </RouteGuard>
        </ErrorBoundary>
      )} />
      <Route path="/pagamento-retorno" component={() => (
        <ErrorBoundary>
          <RouteGuard requireAuth={false}>
            <PaymentReturn />
          </RouteGuard>
        </ErrorBoundary>
      )} />
      <Route path="/confirmar-pagamento" component={() => (
        <ErrorBoundary>
          <RouteGuard requireAuth={false}>
            <ManualPaymentConfirm />
          </RouteGuard>
        </ErrorBoundary>
      )} />
      <Route path="/" component={() => (
        <ErrorBoundary>
          <RouteGuard requireAuth={false}>
            <LandingPage />
          </RouteGuard>
        </ErrorBoundary>
      )} />
      <Route path="*" component={DashboardApp} />
    </Switch>
  );
}

// Functional theme provider with state management
function WorkingThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemPrefersDark) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  // Create theme context value
  const themeValue = { theme, toggleTheme };
  
  // Make it available globally for components
  useEffect(() => {
    (window as any).currentTheme = themeValue;
  }, [themeValue]);

  return <div className={theme} data-theme={theme}>{children}</div>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WorkingThemeProvider>
        <TooltipProvider>
          <Toaster />
          <UpdateNotification />
          <Router />
        </TooltipProvider>
      </WorkingThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
