import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { PageLoadingSpinner } from './LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock, Home } from 'lucide-react';
import { Link, useLocation } from 'wouter';

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  permission?: string;
  planFeature?: 'financial' | 'inventory' | 'loyalty';
  redirectIfAuthenticated?: boolean;
}

export function RouteGuard({ 
  children, 
  requireAuth = true, 
  permission,
  planFeature,
  redirectIfAuthenticated = false
}: RouteGuardProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Simplify hook usage to avoid loops
  const permissions = usePermissions();
  const planPermissions = usePlanPermissions();

  // Handle redirects in useEffect to avoid state updates during render
  useEffect(() => {
    if (!authLoading && user && !requireAuth && 
        (location === '/login' || location === '/register') &&
        !location.includes('/selecionar-plano') && !location.includes('/pagamento')) {
      setLocation('/dashboard');
    }
  }, [user, authLoading, requireAuth, location, setLocation]);

  // Show loading only for auth
  if (authLoading) {
    return <PageLoadingSpinner text="Verificando permissões..." />;
  }

  // Removed redundant redirect logic that was causing loading loops

  // Check authentication
  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>Acesso Restrito</AlertTitle>
            <AlertDescription className="mt-2">
              Você precisa estar logado para acessar esta página.
              <div className="mt-4">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="w-full">
                    Fazer Login
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Check specific permission
  if (permission && permissions && !permissions[permission as keyof typeof permissions]) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <Lock className="h-4 w-4" />
            <AlertTitle>Acesso Negado</AlertTitle>
            <AlertDescription className="mt-2">
              Você não tem permissão para acessar esta página.
              <div className="mt-4">
                <Link href="/">
                  <Button variant="outline" size="sm" className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    Voltar ao Dashboard
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Check plan feature access
  if (planFeature) {
    let hasAccess = false;
    let requiredPlan = '';
    
    if (planFeature === 'financial') {
      hasAccess = planPermissions.checkFinancialAccess();
      requiredPlan = planPermissions.getRequiredPlanForFinancial();
    } else if (planFeature === 'inventory') {
      hasAccess = planPermissions.checkInventoryAccess();
      requiredPlan = planPermissions.getRequiredPlanForInventory();
    } else if (planFeature === 'loyalty') {
      hasAccess = planPermissions.checkLoyaltyAccess();
      requiredPlan = planPermissions.getRequiredPlanForLoyalty();
    }
    
    if (!hasAccess) {
      
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <Lock className="h-4 w-4" />
              <AlertTitle>Recurso Bloqueado</AlertTitle>
              <AlertDescription className="mt-2">
                Este recurso requer o plano {requiredPlan}. 
                Seu plano atual: {planPermissions.getCurrentPlan()}.
                <div className="mt-4 space-y-2">
                  <Link href="/configuracoes">
                    <Button variant="outline" size="sm" className="w-full">
                      Gerenciar Plano
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="ghost" size="sm" className="w-full">
                      <Home className="h-4 w-4 mr-2" />
                      Voltar ao Dashboard
                    </Button>
                  </Link>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}