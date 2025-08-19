import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock } from "lucide-react";

interface StaffStats {
  todayUpcomingAppointments: string;
  todayCompletedAppointments: string;
  activeServices: string;
}

interface StaffDashboardCardsProps {
  stats?: StaffStats | null;
  isLoading?: boolean;
  error?: Error | null;
}

export function StaffDashboardCards({ stats, isLoading, error }: StaffDashboardCardsProps) {
  console.log('🏥 [STAFF DASHBOARD] Props received - isLoading:', isLoading, 'stats:', stats);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="text-center p-4">Carregando dados do dashboard...</div>
      </div>
    );
  }

  if (error) {
    console.error('❌ [STAFF DASHBOARD] Error:', error);
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="text-center p-4 text-red-500">
          Erro ao carregar dados: {error.message}
        </div>
      </div>
    );
  }

  if (!stats) {
    console.error('❌ [STAFF DASHBOARD] No stats data received');
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="text-center p-4">
          Nenhum dado disponível no momento.
        </div>
      </div>
    );
  }

  // Debug the actual structure
  console.log('🏥 [STAFF DASHBOARD] Raw stats received:', stats);
  console.log('🏥 [STAFF DASHBOARD] Stats type:', typeof stats);
  console.log('🏥 [STAFF DASHBOARD] Stats keys:', stats ? Object.keys(stats) : 'no stats');
  
  // Now we expect staff-specific format data
  if (stats && 'todayUpcomingAppointments' in stats) {
    console.log('✅ [STAFF DASHBOARD] Dados corretos de staff recebidos');
  } else {
    console.error('❌ [STAFF DASHBOARD] Formato de dados inesperado!');
    console.error('❌ [STAFF DASHBOARD] Dados esperados: todayUpcomingAppointments, todayCompletedAppointments, etc.');
    console.error('❌ [STAFF DASHBOARD] Dados recebidos:', Object.keys(stats || {}));
  }

  // Use staff-specific today data
  const todayUpcomingAppointments = parseInt(stats?.todayUpcomingAppointments || "0");
  const todayCompletedAppointments = parseInt(stats?.todayCompletedAppointments || "0");
  const activeServices = parseInt(stats?.activeServices || "0");

  console.log('📊 [STAFF DASHBOARD] Extracted data:', {
    todayUpcomingAppointments,
    todayCompletedAppointments,
    activeServices
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Próximos Agendamentos de Hoje */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Próximos Agendamentos de Hoje</CardTitle>
          <div className="p-2 rounded-full text-blue-600 bg-blue-100">
            <Calendar className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayUpcomingAppointments}</div>
          <p className="text-xs text-muted-foreground">Agendamentos confirmados para hoje</p>
        </CardContent>
      </Card>

      {/* Agendamentos Realizados Hoje */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Agendamentos Realizados Hoje</CardTitle>
          <div className="p-2 rounded-full text-green-600 bg-green-100">
            <CheckCircle className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayCompletedAppointments}</div>
          <p className="text-xs text-muted-foreground">Atendimentos concluídos hoje</p>
        </CardContent>
      </Card>

      {/* Serviços Ativos */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Serviços Ativos</CardTitle>
          <div className="p-2 rounded-full text-orange-600 bg-orange-100">
            <Clock className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeServices}</div>
          <p className="text-xs text-muted-foreground">Serviços disponíveis</p>
        </CardContent>
      </Card>
    </div>
  );
}