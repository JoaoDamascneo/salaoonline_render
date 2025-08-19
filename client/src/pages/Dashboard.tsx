import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Calendar, 
  Users, 
  Package, 
  TrendingUp, 
  Clock,
  User,
  Phone,
  MapPin,
  Star,
  Check,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatBrazilTime } from "@/lib/timezone";
import { useAuth } from "@/hooks/useAuth";
import { RecentAppointments } from "@/components/Dashboard/RecentAppointments";
import { StaffOnlyCards } from "@/components/Dashboard/StaffOnlyCards";

export default function Dashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isStaff = user?.role === 'staff';
  
  // Dashboard logging removed for compute optimization

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: !isStaff, // Only load admin stats if not staff
    refetchOnWindowFocus: false, // WebSocket handles updates
    // staleTime: Infinity (padrão) - atualiza apenas via WebSocket invalidation
  });

  const { data: financialStats, isLoading: financialStatsLoading } = useQuery({
    queryKey: ["/api/finances/stats"],
    refetchOnWindowFocus: false, // WebSocket handles updates
    // staleTime: Infinity (padrão) - atualiza apenas via WebSocket invalidation
  });

  const confirmAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      return await apiRequest(`/api/appointments/${appointmentId}/status`, 'PATCH', { status: 'completed' });
    },
    onSuccess: () => {
      // Only invalidate specific queries - avoid mass cache clearing
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-appointments'] });
      // WebSocket will handle stats updates automatically
      toast({
        title: "Agendamento realizado",
        description: "O agendamento foi marcado como realizado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível marcar o agendamento como realizado.",
        variant: "destructive",
      });
    }
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      return await apiRequest(`/api/appointments/${appointmentId}`, 'DELETE');
    },
    onSuccess: () => {
      // Only invalidate necessary queries
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-appointments'] });
      // WebSocket handles stats updates
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o agendamento.",
        variant: "destructive",
      });
    }
  });

  if (statsLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      </div>

      {/* Stats Cards - Different for Staff and Admin */}
      {isStaff ? (
        <StaffOnlyCards />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Hoje</CardTitle>
              <div className="p-2 rounded-full text-green-600 bg-green-100">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {(((financialStats as any)?.todayIncome || 0) - ((financialStats as any)?.todayExpenses || 0)).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Entrada menos saídas</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Agendamentos Hoje</CardTitle>
              <div className="p-2 rounded-full text-blue-600 bg-blue-100">
                <Calendar className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dashboardStats as any)?.todaysAppointments || 0}
              </div>
              <p className="text-xs text-muted-foreground">Confirmados e agendados</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Total</CardTitle>
              <div className="p-2 rounded-full text-purple-600 bg-purple-100">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dashboardStats as any)?.totalClients || 0}
              </div>
              <p className="text-xs text-muted-foreground">Base de clientes</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Produtos em Falta</CardTitle>
              <div className="p-2 rounded-full text-orange-600 bg-orange-100">
                <Package className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dashboardStats as any)?.lowStockProducts || 0}
              </div>
              <p className="text-xs text-muted-foreground">Requer reposição</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Appointments */}
      <Card>
        <CardContent className="p-6">
          <RecentAppointments />
        </CardContent>
      </Card>
    </div>
  );
}