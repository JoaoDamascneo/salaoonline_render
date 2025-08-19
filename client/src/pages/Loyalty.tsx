import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Star, 
  Gift, 
  Users, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Award,
  UserPlus,
  TrendingUp
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Loyalty() {
  const { toast } = useToast();
  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [isEditProgramOpen, setIsEditProgramOpen] = useState(false);
  const [isAddPointsOpen, setIsAddPointsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Queries
  const { data: loyaltyPrograms, isLoading: programsLoading } = useQuery({
    queryKey: ["/api/loyalty/programs"]
  });

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services"]
  });

  const { data: clientsWithRewards, isLoading: rewardsLoading } = useQuery({
    queryKey: ["/api/loyalty/clients-with-rewards"]
  });

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"]
  });

  // Form states
  const [programForm, setProgramForm] = useState({
    name: "Programa Fidelidade",
    pointsPerService: 1,
    pointsToReward: 10,
    rewardDescription: "Serviço gratuito",
    selectedServices: [] as number[]
  });

  const [addPointsForm, setAddPointsForm] = useState({
    clientId: "",
    programId: "",
    points: 1,
    description: "Pontos adicionados manualmente"
  });

  // Mutations
  const createProgramMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/loyalty/programs", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty/programs"] });
      setIsCreateProgramOpen(false);
      setProgramForm({
        name: "Programa Fidelidade",
        pointsPerService: 1,
        pointsToReward: 10,
        rewardDescription: "Serviço gratuito",
        selectedServices: []
      });
      toast({
        title: "Programa criado",
        description: "Programa de fidelidade criado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o programa de fidelidade.",
        variant: "destructive",
      });
    }
  });

  const updateProgramMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/loyalty/programs/${selectedProgram.id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty/programs"] });
      setIsEditProgramOpen(false);
      setSelectedProgram(null);
      toast({
        title: "Programa atualizado",
        description: "Programa de fidelidade atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o programa de fidelidade.",
        variant: "destructive",
      });
    }
  });

  const deleteProgramMutation = useMutation({
    mutationFn: async (programId: number) => {
      return await apiRequest(`/api/loyalty/programs/${programId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty/programs"] });
      toast({
        title: "Programa excluído",
        description: "Programa de fidelidade excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o programa de fidelidade.",
        variant: "destructive",
      });
    }
  });

  const addPointsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/loyalty/clients/${data.clientId}/add-points`, "POST", {
        programId: data.programId,
        points: data.points,
        appointmentId: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty/clients-with-rewards"] });
      setIsAddPointsOpen(false);
      setAddPointsForm({
        clientId: "",
        programId: "",
        points: 1,
        description: "Pontos adicionados manualmente"
      });
      toast({
        title: "Pontos adicionados",
        description: "Pontos de fidelidade adicionados com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar os pontos.",
        variant: "destructive",
      });
    }
  });

  const redeemPointsMutation = useMutation({
    mutationFn: async (data: { clientId: number; points: number }) => {
      return await apiRequest(`/api/loyalty/clients/${data.clientId}/use-points`, "POST", {
        programId: 1, // Assuming first program for now
        points: data.points
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty/clients-with-rewards"] });
      toast({
        title: "Pontos resgatados",
        description: "Recompensa resgatada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível resgatar os pontos.",
        variant: "destructive",
      });
    }
  });

  const handleCreateProgram = () => {
    const programData = {
      name: programForm.name,
      pointsPerService: programForm.pointsPerService,
      pointsToReward: programForm.pointsToReward,
      rewardDescription: programForm.rewardDescription,
      services: programForm.selectedServices
    };
    
    createProgramMutation.mutate(programData);
  };

  const handleEditProgram = (program: any) => {
    setSelectedProgram(program);
    setProgramForm({
      name: program.name,
      pointsPerService: program.pointsPerService,
      pointsToReward: program.pointsToReward,
      rewardDescription: program.rewardDescription,
      selectedServices: program.services?.map((s: any) => s.serviceId) || []
    });
    setIsEditProgramOpen(true);
  };

  const handleUpdateProgram = () => {
    const programData = {
      name: programForm.name,
      pointsPerService: programForm.pointsPerService,
      pointsToReward: programForm.pointsToReward,
      rewardDescription: programForm.rewardDescription,
      services: programForm.selectedServices
    };
    
    updateProgramMutation.mutate(programData);
  };

  const handleServiceToggle = (serviceId: number) => {
    setProgramForm(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  const handleSelectAllServices = () => {
    if (services && services.length > 0) {
      const allServiceIds = services.map((service: any) => service.id);
      setProgramForm(prev => ({
        ...prev,
        selectedServices: prev.selectedServices.length === allServiceIds.length 
          ? [] 
          : allServiceIds
      }));
    }
  };

  const handleAddPoints = () => {
    if (!addPointsForm.clientId || !addPointsForm.programId || addPointsForm.points <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos corretamente.",
        variant: "destructive",
      });
      return;
    }

    addPointsMutation.mutate({
      clientId: parseInt(addPointsForm.clientId),
      programId: parseInt(addPointsForm.programId),
      points: addPointsForm.points
    });
  };

  const handleRedeemPoints = (clientId: number, pointsToRedeem: number) => {
    redeemPointsMutation.mutate({ clientId, points: pointsToRedeem });
  };

  if (programsLoading || servicesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sistema de Fidelidade</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsAddPointsOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Pontos
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsCreateProgramOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Programa
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programas Ativos</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loyaltyPrograms?.filter((p: any) => p.isActive).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes com Recompensas</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientsWithRewards?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty Programs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Programas de Fidelidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loyaltyPrograms && loyaltyPrograms.length > 0 ? (
            <div className="space-y-4">
              {loyaltyPrograms.map((program: any) => (
                <div key={program.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{program.name}</h3>
                        <Badge variant={program.isActive ? "default" : "secondary"}>
                          {program.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {program.rewardDescription}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>Pontos por serviço: <strong>{program.pointsPerService}</strong></span>
                        <span>Pontos para recompensa: <strong>{program.pointsToReward}</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProgram(program)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteProgramMutation.mutate(program.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum programa de fidelidade criado</p>
              <p className="text-sm">Crie seu primeiro programa para começar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clients with Loyalty Points */}
      {clientsWithRewards && clientsWithRewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Clientes com Pontos de Fidelidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientsWithRewards.map((client: any) => (
                <div key={client.clientId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{client.clientName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {client.totalPoints} pontos • Meta: {client.pointsToReward} pontos para {client.rewardDescription}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                      {client.totalPoints}/{client.pointsToReward}
                    </Badge>
                    {client.canRedeem ? (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleRedeemPoints(client.clientId, client.pointsToReward)}
                        disabled={redeemPointsMutation.isPending}
                      >
                        {redeemPointsMutation.isPending ? "Resgatando..." : "Resgatar"}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="opacity-50"
                      >
                        Resgatar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Program Dialog */}
      <Dialog open={isCreateProgramOpen} onOpenChange={setIsCreateProgramOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Criar Programa de Fidelidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Programa</Label>
              <Input
                id="name"
                value={programForm.name}
                onChange={(e) => setProgramForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Programa Fidelidade"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pointsPerService">Pontos por Serviço</Label>
                <Input
                  id="pointsPerService"
                  type="number"
                  min="1"
                  value={programForm.pointsPerService}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, pointsPerService: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="pointsToReward">Pontos para Recompensa</Label>
                <Input
                  id="pointsToReward"
                  type="number"
                  min="1"
                  value={programForm.pointsToReward}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, pointsToReward: parseInt(e.target.value) || 10 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="rewardDescription">Descrição da Recompensa</Label>
              <Input
                id="rewardDescription"
                value={programForm.rewardDescription}
                onChange={(e) => setProgramForm(prev => ({ ...prev, rewardDescription: e.target.value }))}
                placeholder="Serviço gratuito"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Serviços Participantes</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllServices}
                >
                  {programForm.selectedServices.length === services?.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </Button>
              </div>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                {services?.map((service: any) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={programForm.selectedServices.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                    <Label
                      htmlFor={`service-${service.id}`}
                      className="text-sm flex-1 cursor-pointer"
                    >
                      {service.name} - R$ {service.price}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateProgramOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateProgram}
                disabled={createProgramMutation.isPending}
              >
                {createProgramMutation.isPending ? "Criando..." : "Criar Programa"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Program Dialog */}
      <Dialog open={isEditProgramOpen} onOpenChange={setIsEditProgramOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Programa de Fidelidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome do Programa</Label>
              <Input
                id="edit-name"
                value={programForm.name}
                onChange={(e) => setProgramForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Programa Fidelidade"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-pointsPerService">Pontos por Serviço</Label>
                <Input
                  id="edit-pointsPerService"
                  type="number"
                  min="1"
                  value={programForm.pointsPerService}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, pointsPerService: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-pointsToReward">Pontos para Recompensa</Label>
                <Input
                  id="edit-pointsToReward"
                  type="number"
                  min="1"
                  value={programForm.pointsToReward}
                  onChange={(e) => setProgramForm(prev => ({ ...prev, pointsToReward: parseInt(e.target.value) || 10 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-rewardDescription">Descrição da Recompensa</Label>
              <Input
                id="edit-rewardDescription"
                value={programForm.rewardDescription}
                onChange={(e) => setProgramForm(prev => ({ ...prev, rewardDescription: e.target.value }))}
                placeholder="Serviço gratuito"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Serviços Participantes</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllServices}
                >
                  {programForm.selectedServices.length === services?.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </Button>
              </div>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                {services?.map((service: any) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-service-${service.id}`}
                      checked={programForm.selectedServices.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                    <Label
                      htmlFor={`edit-service-${service.id}`}
                      className="text-sm flex-1 cursor-pointer"
                    >
                      {service.name} - R$ {service.price}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditProgramOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateProgram}
                disabled={updateProgramMutation.isPending}
              >
                {updateProgramMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Points Dialog */}
      <Dialog open={isAddPointsOpen} onOpenChange={setIsAddPointsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Pontos de Fidelidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="client-select">Cliente</Label>
              <Select 
                value={addPointsForm.clientId} 
                onValueChange={(value) => setAddPointsForm(prev => ({ ...prev, clientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client: any) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="program-select">Programa de Fidelidade</Label>
              <Select 
                value={addPointsForm.programId} 
                onValueChange={(value) => setAddPointsForm(prev => ({ ...prev, programId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um programa" />
                </SelectTrigger>
                <SelectContent>
                  {loyaltyPrograms?.filter((p: any) => p.isActive).map((program: any) => (
                    <SelectItem key={program.id} value={program.id.toString()}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="points">Quantidade de Pontos</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={addPointsForm.points}
                onChange={(e) => setAddPointsForm(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                placeholder="1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddPointsOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddPoints}
                disabled={addPointsMutation.isPending}
              >
                {addPointsMutation.isPending ? "Adicionando..." : "Adicionar Pontos"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}