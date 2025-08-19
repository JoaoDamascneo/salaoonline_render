import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
// import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NotificationBell, Notifications } from "@/components/Notifications";
import { PlanBlockModal } from "@/components/PlanBlockModal";
import { PushNotificationManager } from "@/lib/pushNotifications";
import { 
  Scissors, 
  Calendar, 
  Users, 
  UserCheck, 
  Package, 
  Settings, 
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  LayoutDashboard,
  DollarSign,
  Lock,
  LogOut,
  Star
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

function getNavigationItems(permissions: any, planPermissions: any, userRole: string) {
  const hasFinancialAccess = planPermissions?.checkFinancialAccess?.() ?? false;
  const hasInventoryAccess = planPermissions?.checkInventoryAccess?.() ?? false;
  const hasLoyaltyAccess = planPermissions?.checkLoyaltyAccess?.() ?? false;
  const isStaff = userRole === 'staff';
  const isAdmin = userRole === 'admin' || userRole === 'manager' || userRole === 'owner';

  return [
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: LayoutDashboard, 
      enabled: true,
      blocked: false
    },
    { 
      name: "Agendamentos", 
      href: "/agendamentos", 
      icon: Calendar, 
      enabled: true,
      blocked: false
    },
    { 
      name: "Clientes", 
      href: "/clientes", 
      icon: Users, 
      enabled: isAdmin, // Only admins can see clients
      blocked: isStaff,
      requiresPlan: null
    },
    { 
      name: "Serviços", 
      href: "/servicos", 
      icon: Scissors, 
      enabled: isAdmin, // Only admins can manage services
      blocked: isStaff,
      requiresPlan: null
    },
    { 
      name: "Colaboradores", 
      href: "/colaboradores", 
      icon: UserCheck, 
      enabled: isAdmin, // Only admins can manage staff
      blocked: isStaff,
      requiresPlan: null
    },
    { 
      name: "Estoque", 
      href: "/estoque", 
      icon: Package, 
      enabled: isAdmin && hasInventoryAccess,
      blocked: isStaff || !hasInventoryAccess,
      requiresPlan: "Expert"
    },
    { 
      name: "Financeiro", 
      href: "/financeiro", 
      icon: DollarSign, 
      enabled: hasFinancialAccess,
      blocked: !hasFinancialAccess,
      requiresPlan: hasFinancialAccess ? null : "Core"
    },
    { 
      name: "Fidelidade", 
      href: "/fidelidade", 
      icon: Star, 
      enabled: isAdmin && hasLoyaltyAccess,
      blocked: isStaff || !hasLoyaltyAccess,
      requiresPlan: hasLoyaltyAccess ? null : "Core"
    }
  ];
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isPlanBlockModalOpen, setIsPlanBlockModalOpen] = useState(false);
  const [blockedFeature, setBlockedFeature] = useState<{ name: string; requiredPlan: string } | null>(null);
  const [location] = useLocation();
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
  const { user } = useAuth();
  const permissions = usePermissions();
  const planPermissions = usePlanPermissions();
  const { isConnected } = useWebSocket(); // Initialize WebSocket connection

  const navigation = getNavigationItems(permissions, planPermissions, user?.role || 'staff');
  const currentPage = navigation.find(item => item.href === location)?.name || "Dashboard";
  
  // Get first letter of user's name for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  // Function to handle navigation click and close sidebar on mobile
  const handleNavigationClick = () => {
    // Close sidebar on mobile after navigation with small delay to ensure navigation happens first
    if (window.innerWidth < 1024) { // lg breakpoint
      setTimeout(() => {
        setSidebarOpen(false);
      }, 100);
    }
  };

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    // Inicializar Service Worker para push notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          // SW registration logging removed for compute optimization
        })
        .catch((error) => {
          // Service Worker registration error log removed for compute optimization
        });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Solicitar permissão para notificações push quando usuário estiver logado (apenas admin)
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if (user && user.role !== 'staff' && PushNotificationManager.isSupported()) {
        const pushManager = new PushNotificationManager();
        const permission = await pushManager.checkAndRequestPermissionIfNeeded();
        
        if (permission === 'granted') {
          // Notification permission logging removed for compute optimization
        } else if (permission === 'denied') {
          // Notification denied logging removed for compute optimization
        } else {
          // Notification pending logging removed for compute optimization
        }
      }
    };

    // Aguardar um pouco após o login para solicitar permissão (apenas para admin)
    if (user && user.role !== 'staff') {
      setTimeout(requestNotificationPermission, 2000);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 shadow-lg transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="flex items-center justify-center p-6 border-b border-gray-200 dark:border-gray-700">
          <img 
            src="/attached_assets/logo-desktop-light.png" 
            alt="Salão Online" 
            className="h-16 w-auto max-w-[200px] block dark:hidden"
          />
          <img 
            src="/attached_assets/logo-desktop-dark.png" 
            alt="Salão Online" 
            className="h-16 w-auto max-w-[200px] hidden dark:block"
          />
        </div>
        
        <nav className="mt-6">
          <div className="px-6 py-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Principal</p>
          </div>
          {navigation.map((item: any) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            const isDisabled = !item.enabled;
            const isBlocked = item.blocked;
            
            // Handle blocked items (plan restrictions)
            if (isBlocked) {
              return (
                <div 
                  key={item.name} 
                  className="flex items-center px-6 py-3 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setBlockedFeature({ 
                      name: item.name, 
                      requiredPlan: item.requiresPlan || "Expert" 
                    });
                    setIsPlanBlockModalOpen(true);
                  }}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="flex-1">{item.name}</span>
                  <Lock className="h-4 w-4" />
                </div>
              );
            }
            
            // Handle role-disabled items
            if (isDisabled) {
              return (
                <div key={item.name} className="flex items-center px-6 py-3 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60">
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="flex-1">{item.name}</span>
                  <Lock className="h-4 w-4" />
                </div>
              );
            }
            
            // Handle normal navigation items
            return (
              <Link key={item.name} href={item.href}>
                <div 
                  className={`flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isActive ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600" : ""}`}
                  onClick={handleNavigationClick}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </div>
              </Link>
            );
          })}
          
          <div className="px-6 py-2 mt-6">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Conta</p>
          </div>
          <Link href="/configuracoes">
            <div 
              className={`flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${location === "/configuracoes" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600" : ""}`}
              onClick={handleNavigationClick}
            >
              <Settings className="h-5 w-5 mr-3" />
              Configurações
            </div>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  className="lg:hidden mr-4"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6 text-gray-500" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{currentPage}</h2>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="hover:bg-gradient-to-r hover:from-[#3db3ff] hover:to-[#004dde] hover:text-white transition-all"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                
                {/* Show notifications only for admin/owner users, not staff */}
                {user?.role !== 'staff' && (
                  <NotificationBell onClick={() => setNotificationsOpen(true)} />
                )}
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#3db3ff] to-[#004dde] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user ? getInitials(user.name) : 'U'}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user ? user.name : 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user ? (user.role === 'admin' ? 'Administrador' : 'Colaborador') : 'Administrador'}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Estabelecimento #{user?.establishmentId || 'N/A'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      // Clear user session and redirect to sales page
                      localStorage.removeItem('user');
                      // Force page reload to sales page
                      window.location.replace('/');
                    }}
                    className="text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-[#3db3ff] hover:to-[#004dde] hover:text-white transition-all"
                    title="Sair"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Notifications - only for admin/owner users */}
      {user?.role !== 'staff' && (
        <Notifications 
          isOpen={notificationsOpen} 
          onOpenChange={setNotificationsOpen} 
        />
      )}

      {/* Plan Block Modal */}
      {blockedFeature && (
        <PlanBlockModal
          isOpen={isPlanBlockModalOpen}
          onOpenChange={setIsPlanBlockModalOpen}
          requiredPlan={blockedFeature.requiredPlan}
          currentPlan={planPermissions?.getCurrentPlan?.() || "Base"}
          feature={blockedFeature.name}
        />
      )}
    </div>
  );
}