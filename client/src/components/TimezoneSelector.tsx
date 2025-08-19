import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BRAZILIAN_TIMEZONES, getTimezoneLabel } from "@/utils/timezones";
import { apiRequest } from "@/lib/queryClient";
import { Clock } from "lucide-react";

interface TimezoneSelectorProps {
  currentTimezone?: string;
  onUpdate?: () => void;
}

export function TimezoneSelector({ currentTimezone = "America/Sao_Paulo", onUpdate }: TimezoneSelectorProps) {
  const [selectedTimezone, setSelectedTimezone] = useState(currentTimezone);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (selectedTimezone === currentTimezone) {
      toast({
        description: "Nenhuma alteração foi feita.",
        variant: "default"
      });
      return;
    }

    setIsUpdating(true);
    try {
      await apiRequest({
        url: "/api/establishment/timezone",
        method: "PATCH",
        body: { timezone: selectedTimezone }
      });

      // Update localStorage for immediate effect
      localStorage.setItem('establishment_timezone', selectedTimezone);

      toast({
        description: "Fuso horário atualizado com sucesso!",
        variant: "default"
      });

      onUpdate?.();
    } catch (error) {
      console.error("Erro ao atualizar fuso horário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o fuso horário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-full text-blue-600 bg-blue-100">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base">Fuso Horário</CardTitle>
            <CardDescription className="text-sm">
              Configure o fuso horário do seu estabelecimento
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Selecione seu fuso horário:</label>
          <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o fuso horário">
                {getTimezoneLabel(selectedTimezone)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {BRAZILIAN_TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{tz.label}</span>
                    <span className="text-xs text-muted-foreground">{tz.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleUpdate} 
            disabled={isUpdating || selectedTimezone === currentTimezone}
            className="flex-1"
          >
            {isUpdating ? "Atualizando..." : "Salvar Alterações"}
          </Button>
        </div>

        {selectedTimezone !== currentTimezone && (
          <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>Importante:</strong> Todos os horários do sistema serão ajustados para o novo fuso horário após salvar.
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>Fuso atual:</strong> {getTimezoneLabel(currentTimezone)}</p>
          <p><strong>Horário atual:</strong> {new Date().toLocaleString("pt-BR", { 
            timeZone: selectedTimezone,
            dateStyle: "short",
            timeStyle: "medium"
          })}</p>
        </div>
      </CardContent>
    </Card>
  );
}