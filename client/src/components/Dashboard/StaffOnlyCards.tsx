import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

// Função para extrair horário em timezone local (São Paulo UTC-3)
const getLocalTimeFromUTC = (utcDateString: string): string => {
  const utcDate = new Date(utcDateString);
  // Ajustar para UTC-3 (São Paulo)
  const localDate = new Date(utcDate.getTime() - (3 * 60 * 60 * 1000));
  return localDate.toTimeString().slice(0, 5);
};

interface StaffOnlyData {
  todayUpcomingAppointments: number;
  todayCompletedAppointments: number;
}

interface NextAppointment {
  id: number;
  appointmentDate: string;
  duration: number;
  clientName: string;
  serviceName: string;
  servicePrice: number;
}

export function StaffOnlyCards() {
  const { user } = useAuth();
  
  const { data: staffData, isLoading, error } = useQuery<StaffOnlyData>({
    queryKey: ["/api/staff/dashboard-data"],
    refetchOnWindowFocus: false,
    // staleTime: Infinity (padrão) - atualiza apenas via WebSocket invalidation
    enabled: !!user?.id, // Only run when user is loaded
    queryFn: async () => {
      const response = await fetch("/api/staff/dashboard-data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id?.toString() || "",
          "x-establishment-id": user?.establishmentId?.toString() || "",
          "x-user-role": user?.role || ""
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch staff data: ${response.status}`);
      }
      
      return response.json();
    }
  });

  const { data: nextAppointment, isLoading: isLoadingNext } = useQuery<NextAppointment | null>({
    queryKey: ["/api/staff/next-appointment"],
    refetchOnWindowFocus: false,
    enabled: !!user?.id, // Only run when user is loaded
    queryFn: async () => {
      const response = await fetch("/api/staff/next-appointment", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id?.toString() || "",
          "x-establishment-id": user?.establishmentId?.toString() || "",
          "x-user-role": user?.role || ""
        },
      });
      
      if (!response.ok) {
        if (response.status === 403) return null; // Staff access required
        throw new Error(`Failed to fetch next appointment: ${response.status}`);
      }
      
      return response.json();
    }
  });

  // Staff only cards logging removed for compute optimization

  if (isLoading || isLoadingNext) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
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
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Próximos Agendamentos de Hoje */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Próximos Agendamentos
          </CardTitle>
          <div className="p-2 rounded-full text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
            <Calendar className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{staffData?.todayUpcomingAppointments || 0}</div>
          <p className="text-xs text-muted-foreground">Agendamentos para hoje</p>
        </CardContent>
      </Card>

      {/* Agendamentos Realizados Hoje */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Agendamentos Realizados
          </CardTitle>
          <div className="p-2 rounded-full text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{staffData?.todayCompletedAppointments || 0}</div>
          <p className="text-xs text-muted-foreground">Atendimentos concluídos hoje</p>
        </CardContent>
      </Card>

      {/* Próximo Agendamento */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Próximo Agendamento
          </CardTitle>
          <div className="p-2 rounded-full text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300">
            <Clock className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          {nextAppointment ? (
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {nextAppointment.appointmentDate.split('T')[1].slice(0, 5)}
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="font-medium">{nextAppointment.clientName}</span>
                </div>
                <div className="text-xs">{nextAppointment.serviceName}</div>
                <div className="text-xs">
                  {format(new Date(nextAppointment.appointmentDate), "dd/MM/yyyy")}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-400 dark:text-gray-600">--:--</div>
              <p className="text-xs text-muted-foreground">
                Nenhum agendamento próximo
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}