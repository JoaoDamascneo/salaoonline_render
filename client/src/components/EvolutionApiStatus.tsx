import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Wifi, WifiOff, Loader2, QrCode, RefreshCw, Plus, Trash2 } from "lucide-react";
const connectionSchema = z.object({
  instanceName: z.string().min(1, "Nome da instância é obrigatório"),
  apiUrl: z.string().url("URL da API inválida"),
  apiKey: z.string().min(1, "API Key é obrigatória"),
});

type ConnectionFormData = z.infer<typeof connectionSchema>;

interface EvolutionConnection {
  id: number;
  instanceName: string;
  apiUrl: string;
  status: "connected" | "disconnected" | "connecting" | "error";
  qrCode?: string;
  qrCodeExpiration?: string;
  lastStatusCheck?: string;
  errorMessage?: string;
}

export function EvolutionApiStatus() {
  const [selectedConnection, setSelectedConnection] = useState<EvolutionConnection | null>(null);
  const [showQrCode, setShowQrCode] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ConnectionFormData>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      instanceName: "",
      apiUrl: "",
      apiKey: "",
    },
  });

  // Buscar conexões
  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["/api/evolution-connections"],
    // Removed refetchInterval - WebSocket notifications will handle updates
  });

  // Criar nova conexão
  const createConnection = useMutation({
    mutationFn: (data: ConnectionFormData) => 
      apiRequest("/api/evolution-connections", "POST", data),
    onSuccess: () => {
      toast({ title: "Conexão criada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/evolution-connections"] });
      form.reset();
    },
    onError: () => {
      toast({ 
        title: "Erro ao criar conexão", 
        variant: "destructive" 
      });
    },
  });

  // Solicitar QR Code
  const requestQrCode = useMutation({
    mutationFn: (connectionId: number) => 
      apiRequest(`/api/evolution-connections/${connectionId}/qr-code`, "POST"),
    onSuccess: () => {
      toast({ title: "QR Code solicitado via N8N" });
      queryClient.invalidateQueries({ queryKey: ["/api/evolution-connections"] });
    },
    onError: () => {
      toast({ 
        title: "Erro ao solicitar QR Code", 
        variant: "destructive" 
      });
    },
  });

  // Deletar conexão
  const deleteConnection = useMutation({
    mutationFn: (connectionId: number) => 
      apiRequest(`/api/evolution-connections/${connectionId}`, "DELETE"),
    onSuccess: () => {
      toast({ title: "Conexão removida com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/evolution-connections"] });
    },
    onError: () => {
      toast({ 
        title: "Erro ao remover conexão", 
        variant: "destructive" 
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <Wifi className="h-4 w-4 text-green-500" />;
      case "connecting":
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      case "error":
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: "bg-green-100 text-green-800",
      connecting: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800",
      disconnected: "bg-gray-100 text-gray-800",
    };

    const labels = {
      connected: "Conectado",
      connecting: "Conectando",
      error: "Erro",
      disconnected: "Desconectado",
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.disconnected}>
        {labels[status as keyof typeof labels] || "Desconhecido"}
      </Badge>
    );
  };

  const handleQrCodeRequest = (connection: EvolutionConnection) => {
    requestQrCode.mutate(connection.id);
  };

  const onSubmit = (data: ConnectionFormData) => {
    createConnection.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Evolution API</h2>
          <p className="text-muted-foreground">
            Gerencie conexões WhatsApp via Evolution API
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conexão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Conexão Evolution API</DialogTitle>
              <DialogDescription>
                Configure uma nova conexão com a Evolution API
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="instanceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Instância</FormLabel>
                      <FormControl>
                        <Input placeholder="minha-instancia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="apiUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da API</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.evolution.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="sua-api-key" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createConnection.isPending}
                >
                  {createConnection.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Criar Conexão
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {connections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma conexão configurada</h3>
              <p className="text-muted-foreground text-center mb-4">
                Configure uma conexão com a Evolution API para habilitar a integração WhatsApp
              </p>
            </CardContent>
          </Card>
        ) : (
          connections.map((connection: any) => (
            <Card key={connection.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(connection.status)}
                  <div>
                    <CardTitle className="text-lg">{connection.instanceName}</CardTitle>
                    <CardDescription>{connection.apiUrl}</CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusBadge(connection.status)}
                  
                  {connection.status === "disconnected" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQrCodeRequest(connection)}
                      disabled={requestQrCode.isPending}
                    >
                      {requestQrCode.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <QrCode className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/evolution-connections"] })}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteConnection.mutate(connection.id)}
                    disabled={deleteConnection.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              {(connection.qrCode || connection.errorMessage) && (
                <CardContent>
                  {connection.qrCode && (
                    <div className="flex flex-col items-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Escaneie o QR Code para conectar o WhatsApp:
                      </p>
                      <img 
                        src={connection.qrCode} 
                        alt="QR Code WhatsApp" 
                        className="w-48 h-48 border rounded-lg"
                      />
                      {connection.qrCodeExpiration && (
                        <p className="text-xs text-muted-foreground">
                          Expira em: {new Date(connection.qrCodeExpiration).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {connection.errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">{connection.errorMessage}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}