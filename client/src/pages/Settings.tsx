import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import * as QRCode from "qrcode";
import { 
  Building2, 
  Clock, 
  MessageSquare, 
  Shield, 
  Upload,
  Save,
  Eye,
  EyeOff,
  Lock,
  Bell,
  BellOff,
  Calendar,
  RefreshCw
} from "lucide-react";
import { EvolutionApiStatus } from "@/components/EvolutionApiStatus";
import { pushManager, PushNotificationManager } from "@/lib/pushNotifications";
import { InstallPWAButton } from "@/components/InstallPWAButton";
import { TimezoneSelector } from "@/components/TimezoneSelector";

export default function Settings() {
  const { user } = useAuth();
  const permissions = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar status das conexões Evolution API
  const { data: evolutionConnections = [] } = useQuery({
    queryKey: ["/api/evolution-connections"],
    // Removed refetchInterval - WebSocket notifications will handle updates
  });

  // Buscar política de agenda liberada
  const { data: agendaPolicy } = useQuery({
    queryKey: ["/api/agenda-release/policy"],
    enabled: user?.role !== 'staff',
  });

  // Histórico removido - sistema simplificado

  // Função para determinar o status geral da Evolution API
  const getEvolutionApiStatus = () => {
    const connections = Array.isArray(evolutionConnections) ? evolutionConnections : [];
    
    if (connections.length === 0) {
      return {
        status: "disconnected",
        message: "Nenhuma conexão configurada",
        color: "gray",
        icon: "●"
      };
    }

    const hasConnected = connections.some((conn: any) => conn.status === "connected");
    const hasConnecting = connections.some((conn: any) => conn.status === "connecting");
    const hasError = connections.some((conn: any) => conn.status === "error");

    if (hasConnected) {
      return {
        status: "connected",
        message: "Conectado",
        color: "green",
        icon: "●"
      };
    } else if (hasConnecting) {
      return {
        status: "connecting",
        message: "Conectando...",
        color: "yellow",
        icon: "●"
      };
    } else if (hasError) {
      return {
        status: "error",
        message: "Erro na conexão",
        color: "red",
        icon: "●"
      };
    } else {
      return {
        status: "disconnected",
        message: "Desconectado",
        color: "gray",
        icon: "●"
      };
    }
  };

  const evolutionStatus = getEvolutionApiStatus();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(user?.role === "staff" ? "security" : "business");

  // Load settings from backend
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Load establishment data
  const { data: establishment, isLoading: establishmentLoading } = useQuery({
    queryKey: ["/api/establishment"],
  });

  // Load business hours
  const { data: businessHours, isLoading: hoursLoading } = useQuery({
    queryKey: ["/api/business-hours"],
  });

  // Load Evolution API connection status
  const { data: evolutionConnectionStatus, isLoading: connectionStatusLoading, refetch: refetchEvolutionConnectionStatus } = useQuery({
    queryKey: ["/api/evolution/connection-status"],
    // Removed refetchInterval - WebSocket notifications will handle updates
  });

  const weekDays = [
    { key: "monday", name: "Segunda-feira" },
    { key: "tuesday", name: "Terça-feira" },
    { key: "wednesday", name: "Quarta-feira" },
    { key: "thursday", name: "Quinta-feira" },
    { key: "friday", name: "Sexta-feira" },
    { key: "saturday", name: "Sábado" },
    { key: "sunday", name: "Domingo" }
  ];

  // Push Notifications State
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);

  // Business Information State
  const [businessInfo, setBusinessInfo] = useState({
    name: "",
    address: "",
    segment: "",
    phone: "",
    email: "",
    logo: null as File | null
  });

  // Working Hours State
  const [workingHours, setWorkingHours] = useState<{[key: string]: any}>({
    monday: { openTime: "08:00", closeTime: "18:00", isOpen: true },
    tuesday: { openTime: "08:00", closeTime: "18:00", isOpen: true },
    wednesday: { openTime: "08:00", closeTime: "18:00", isOpen: true },
    thursday: { openTime: "08:00", closeTime: "18:00", isOpen: true },
    friday: { openTime: "08:00", closeTime: "18:00", isOpen: true },
    saturday: { openTime: "08:00", closeTime: "16:00", isOpen: true },
    sunday: { openTime: "08:00", closeTime: "16:00", isOpen: false }
  });

  // WhatsApp Integration State
  const [whatsappConfig, setWhatsappConfig] = useState({
    connectionType: "official", // "official" or "qrcode"
    officialNumber: "",
    qrCodeUrl: "",
    establishmentName: "",
    serviceNumber: "",
    webhookResponse: "",
    apiKey: "",
    instanceId: ""
  });

  // QR Code countdown state
  const [countdown, setCountdown] = useState(0);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  
  // Evolution API polling state
  const [isEvolutionPolling, setIsEvolutionPolling] = useState(false);
  const [evolutionPollingTimeRemaining, setEvolutionPollingTimeRemaining] = useState(0);

  // Evolution API polling REMOVED for compute unit optimization
  // Status now checked only via WebSocket notifications and manual refresh
  useEffect(() => {
    // Removed expensive 15-second polling that was consuming massive compute units
    // Evolution status is now updated via WebSocket real-time notifications
    return;
  }, [isEvolutionPolling, evolutionPollingTimeRemaining]);

  // QR Code countdown REMOVED for compute unit optimization
  // Timer functionality replaced with static display to eliminate polling
  useEffect(() => {
    // Removed expensive 10-second polling that was consuming massive compute units
    // QR codes now have static expiration time display
    return;
  }, [isCountdownActive, countdown]);

  // Cleanup timers when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsCountdownActive(false);
      setIsEvolutionPolling(false);
      setEvolutionPollingTimeRemaining(0);
      localStorage.removeItem('qr-continuous-start');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Also cleanup when component unmounts
    };
  }, []);

  // Initialize Push Notifications
  useEffect(() => {
    const initializePushNotifications = async () => {
      const supported = PushNotificationManager.isSupported();
      setPushSupported(supported);
      
      if (supported) {
        const permission = pushManager.getPermissionStatus();
        setPushPermission(permission);
        
        const isSubscribed = await pushManager.isSubscribed();
        setPushNotificationsEnabled(isSubscribed);
        
        if (isSubscribed) {
          const subscription = await pushManager.getSubscription();
          setPushSubscription(subscription);
        }
      }
    };

    initializePushNotifications();
  }, []);

  // Effect para parar o countdown quando sair da página do WhatsApp
  useEffect(() => {
    const handleTabSwitch = () => {
      if (activeTab !== "whatsapp" && isContinuousMode) {
        // WhatsApp page exit log removed for compute optimization
        setIsContinuousMode(false);
        setIsCountdownActive(false);
        setCountdown(0);
        toast({
          title: "Countdown parado",
          description: "O countdown automático foi interrompido ao sair da página WhatsApp.",
        });
      }
    };

    handleTabSwitch();
  }, [activeTab, isContinuousMode]);

  // Função para atualizar QR Code no banco de dados
  const updateQRCodeInDatabase = async (newQrCode: string) => {
    try {
      // QR Code update log removed for compute optimization
      
      // Usar endpoint de atualização que preserva apiKey e instanceId
      const updateResponse = await fetch('/webhook/n8n-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrcode_base64: newQrCode,
          establishment_id: (establishment as any)?.id || null,
          update_type: "countdown_update"
        })
      });

      if (updateResponse.ok) {
        const updateResult = await updateResponse.json();
        // QR Code bank update log removed for compute optimization
        
        // Garantir formato correto do base64 para exibição
        const qrCodeBase64 = newQrCode.startsWith('data:image/') 
          ? newQrCode 
          : `data:image/png;base64,${newQrCode}`;
        
        // Atualizar interface com o novo QR Code
        setQrCodeDataUrl(qrCodeBase64);
        
        toast({
          title: "QR Code substituído!",
          description: "Novo QR Code recebido do webhook e atualizado no banco.",
        });
      } else {
        // QR Code update error log removed for compute optimization
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar o QR Code no banco.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // QR Code database error log removed for compute optimization
      toast({
        title: "Erro interno",
        description: "Falha ao processar novo QR Code.",
        variant: "destructive",
      });
    }
  };

  // Função para enviar POST para atualizar QR Code
  const sendQRCodeUpdateRequest = async () => {
    try {
      // POST QR Code update log removed for compute optimization
      
      // Buscar dados mais recentes do webhook para enviar junto
      const webhookDataResponse = await fetch('/api/evolution/webhook-data');
      let webhookData = {};
      
      if (webhookDataResponse.ok) {
        webhookData = await webhookDataResponse.json();
      }
      
      const response = await fetch('https://n8n-n8n-start.ayp7v6.easypanel.host/webhook/atualizar_qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          establishment_id: (establishment as any)?.id || null,
          establishments_id: (establishment as any)?.id || null, // Formato alternativo
          timestamp: new Date().toISOString(),
          action: 'update_qrcode_status',
          event: 'qrcode_timeout',
          api_key: (webhookData as any)?.apiKey || null,
          instance_id: (webhookData as any)?.instanceId || null,
          establishment_name: whatsappConfig.establishmentName || (establishment as any)?.name || null
        })
      });

      if (response.ok) {
        // POST success log removed for compute optimization
        
        // Processar resposta do webhook
        const responseText = await response.text();
        // Webhook response log removed for compute optimization
        
        // Verificar se a resposta contém um novo QR Code
        if (responseText && responseText.length > 0) {
          try {
            // Tentar fazer parse como JSON primeiro
            const responseData = JSON.parse(responseText);
            
            // Verificar se contém novo QR Code
            if (responseData.qrCodeBase64 || responseData.qrcode_base64) {
              const newQrCode = responseData.qrCodeBase64 || responseData.qrcode_base64;
              // New QR Code received log removed for compute optimization
              
              // Salvar novo QR Code no banco
              await updateQRCodeInDatabase(newQrCode);
            } else if (responseData.qrCodeUrl || responseData.qr_code_url) {
              const newQrCode = responseData.qrCodeUrl || responseData.qr_code_url;
              // New QR Code URL received log removed for compute optimization
              
              // Salvar novo QR Code no banco
              await updateQRCodeInDatabase(newQrCode);
            }
          } catch (parseError) {
            // Se não for JSON, verificar se é base64 direto
            if (responseText.startsWith('data:image/') || responseText.startsWith('iVBORw0KGg')) {
              // New base64 QR Code log removed for compute optimization
              await updateQRCodeInDatabase(responseText);
            }
          }
        }
        
        toast({
          title: "Status atualizado",
          description: "QR Code foi atualizado automaticamente após 30 segundos.",
        });
      } else {
        // POST error log removed for compute optimization
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar o status do QR Code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // POST request error log removed for compute optimization
      toast({
        title: "Erro de conexão",
        description: "Falha ao conectar com o servidor de atualização.",
        variant: "destructive",
      });
    }
  };

  // QR Code State
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);




  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorAuth: false,
    sessionTimeout: "30"
  });

  // Agenda Release Settings State
  const [agendaSettings, setAgendaSettings] = useState({
    releaseInterval: 1,
    releaseDay: 28,
    isActive: true
  });

  // Load agenda policy when received from API
  useEffect(() => {
    if (agendaPolicy) {
      setAgendaSettings({
        releaseInterval: agendaPolicy.releaseInterval || 1,
        releaseDay: agendaPolicy.releaseDay || 28,
        isActive: agendaPolicy.isActive ?? true
      });
    }
  }, [agendaPolicy]);

  // Mutation for updating agenda release policy
  const updateAgendaPolicyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/agenda-release/policy", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agenda-release/policy"] });
      // Toast removed - form submission provides feedback
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar política de agenda.",
        variant: "destructive",
      });
    }
  });

  // Mutation para recalcular meses liberados
  const recalculateMonthsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/agenda-release/recalculate", "POST", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agenda-release/policy"] });
      // Toast removed - action completion provides feedback
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao recalcular meses.",
        variant: "destructive",
      });
    }
  });

  // Load establishment data when received from API
  useEffect(() => {
    if (establishment && typeof establishment === 'object') {
      setBusinessInfo({
        name: (establishment as any).name || "",
        address: (establishment as any).address || "",
        segment: (establishment as any).segment || "",
        phone: (establishment as any).phone || "",
        email: (establishment as any).email || "",
        logo: null
      });
    }
  }, [establishment]);

  // Load business hours when received from API
  useEffect(() => {
    if (businessHours && Array.isArray(businessHours)) {
      const hoursMap: any = {};
      businessHours.forEach((hour: any) => {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[hour.dayOfWeek];
        if (dayName) {
          hoursMap[dayName] = {
            isOpen: hour.isOpen,
            openTime: hour.openTime || "09:00",
            closeTime: hour.closeTime || "18:00"
          };
        }
      });

      // Fill missing days with default values
      weekDays.forEach(day => {
        if (!hoursMap[day.key]) {
          hoursMap[day.key] = {
            isOpen: false,
            openTime: "09:00",
            closeTime: "18:00"
          };
        }
      });

      setWorkingHours(hoursMap);
    }
  }, [businessHours]);

  // Load settings data when received from API
  useEffect(() => {
    if (settings && typeof settings === 'object') {
      setWhatsappConfig({
        connectionType: (settings as any).whatsappConnectionType || "official",
        officialNumber: (settings as any).whatsappOfficialNumber || "",
        qrCodeUrl: "",
        establishmentName: (settings as any).whatsappEstablishmentName || "",
        serviceNumber: (settings as any).whatsappServiceNumber || "",
        webhookResponse: "",
        apiKey: (settings as any).whatsappApiKey || "",
        instanceId: (settings as any).whatsappInstanceId || ""
      });

      setSecuritySettings(prev => ({
        ...prev,
        twoFactorAuth: (settings as any).twoFactorAuth || false,
        sessionTimeout: String((settings as any).sessionTimeout || 30),
        email: user?.email || "",
        password: "",
        newPassword: ""
      }));
    }
  }, [settings, user]);

  // Load establishment data and populate WhatsApp fields
  useEffect(() => {
    if (establishment && typeof establishment === 'object') {
      setWhatsappConfig(prev => ({
        ...prev,
        establishmentName: prev.establishmentName || (establishment as any).name || "",
        serviceNumber: prev.serviceNumber || (establishment as any).phone?.replace(/\D/g, '') || ""
      }));
    }
  }, [establishment]);

  // Function to check for new webhook data
  const checkWebhookData = async () => {
    try {
      const response = await apiRequest('/api/evolution/webhook-data', 'GET', null);
      // Webhook data received log removed for compute optimization
      
      // Always update the state with the response (even if empty)
      setWhatsappConfig(prev => ({
        ...prev,
        apiKey: response.apiKey || "",
        instanceId: response.instanceId || ""
      }));
    } catch (error) {
      // Silently fail - data might not be available yet
      // Webhook data unavailable log removed for compute optimization
    }
  };

  // Check for webhook data once on mount (removed interval polling - WebSocket will handle updates)
  useEffect(() => {
    // Check once immediately
    checkWebhookData();
    
    // Removed interval - WebSocket notifications will handle updates
  }, []);

  // Mutation for updating business info (establishment)
  const updateBusinessInfoMutation = useMutation({
    mutationFn: async (data: any) => {
      // API data sending log removed for compute optimization
      return await apiRequest("/api/establishment", "PUT", data);
    },
    onSuccess: (result) => {
      // Save success log removed for compute optimization
      queryClient.invalidateQueries({ queryKey: ["/api/establishment"] });
      // Toast removed - form submission provides feedback
    },
    onError: (error) => {
      // Save error log removed for compute optimization
      toast({
        title: "Erro",
        description: "Erro ao salvar informações do negócio.",
        variant: "destructive",
      });
    }
  });

  // Mutation for updating business hours
  const updateBusinessHoursMutation = useMutation({
    mutationFn: async (hours: any[]) => {
      // Hours API sending log removed for compute optimization
      return await apiRequest("/api/business-hours", "PUT", { hours });
    },
    onSuccess: (result) => {
      // Hours save success log removed for compute optimization
      queryClient.invalidateQueries({ queryKey: ["/api/business-hours"] });
      // Toast removed - form submission provides feedback
    },
    onError: (error) => {
      // Hours save error log removed for compute optimization
      toast({
        title: "Erro",
        description: "Erro ao salvar horários de funcionamento.",
        variant: "destructive",
      });
    }
  });

  // Mutation for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/settings", "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      // Toast removed - form submission provides feedback
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações.",
        variant: "destructive",
      });
    }
  });

  // Mutation for updating user email
  const updateEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest("/api/user/email", "PUT", { email });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Email atualizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar email.",
        variant: "destructive",
      });
    }
  });

  // Mutation for updating user password
  const updatePasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      return await apiRequest("/api/user/password", "PUT", { password });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Senha atualizada com sucesso!",
      });
      setSecuritySettings(prev => ({ ...prev, password: "", newPassword: "", confirmPassword: "" }));
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar senha.",
        variant: "destructive",
      });
    }
  });

  const handleSaveBusinessInfo = async () => {
    // Business info save log removed for compute optimization
    updateBusinessInfoMutation.mutate({
      name: businessInfo.name,
      address: businessInfo.address,
      segment: businessInfo.segment,
      phone: businessInfo.phone,
      email: businessInfo.email,
    });
  };

  const handleSaveWorkingHours = async () => {
    const hoursArray: any[] = [];
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    weekDays.forEach((day) => {
      const dayIndex = dayNames.indexOf(day.key);
      if (dayIndex !== -1 && workingHours[day.key]) {
        hoursArray.push({
          dayOfWeek: dayIndex,
          openTime: workingHours[day.key].openTime,
          closeTime: workingHours[day.key].closeTime,
          isOpen: workingHours[day.key].isOpen,
          isHoliday: false
        });
      }
    });

    // Working hours save log removed for compute optimization
    updateBusinessHoursMutation.mutate(hoursArray);
  };

  const handleSaveWhatsappConfig = async () => {
    updateSettingsMutation.mutate({
      whatsappConnectionType: whatsappConfig.connectionType,
      whatsappOfficialNumber: whatsappConfig.officialNumber,

      whatsappServiceNumber: whatsappConfig.serviceNumber,
    });
  };



  // Função auxiliar para salvar dados do webhook automaticamente PRIMEIRO
  const saveWebhookDataIfValid = async (responseData: any, establishmentName: string, isTest = false) => {
    // Verificar se os dados estão no formato esperado do N8N (qrcode_base64, api_key, instance_id)
    if (responseData.qrcode_base64 && responseData.api_key && responseData.instance_id) {
      // N8N valid data detection log removed for compute optimization
      
      // PRIMEIRO: Salvar no banco imediatamente
      try {
        // Database save operation log removed for compute optimization
        const webhookResponse = await fetch('/webhook/n8n-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            qrcode_base64: responseData.qrcode_base64,
            api_key: responseData.api_key,
            instance_id: responseData.instance_id,
            establishment_id: (establishment as any)?.id || null,
            establishment_name: establishmentName
          })
        });

        if (webhookResponse.ok) {
          const webhookResult = await webhookResponse.json();
          console.log("📊 Dados salvos no banco PRIMEIRO:", webhookResult);
          
          // SEGUNDO: Agora exibir QR Code na interface
          const qrCodeDataUrl = responseData.qrcode_base64.startsWith('data:image/') 
            ? responseData.qrcode_base64 
            : `data:image/png;base64,${responseData.qrcode_base64}`;
          
          setQrCodeDataUrl(qrCodeDataUrl);

          // TERCEIRO: Toast confirmando salvamento e exibição
          toast({
            title: "Dados salvos e exibidos!",
            description: `QR Code ${isTest ? 'de teste ' : ''}salvo no banco e exibido com sucesso.`,
          });

          // QUARTO: Iniciar countdown de 30 segundos em modo contínuo
          setCountdown(30);
          setIsCountdownActive(true);
          setIsContinuousMode(true);
          console.log("⏰ Countdown de 30 segundos iniciado em modo contínuo...");
        } else {
          console.error("Erro ao salvar no banco:", await webhookResponse.text());
          toast({
            title: "Erro ao salvar",
            description: "Não foi possível salvar os dados no banco.",
            variant: "destructive",
          });
        }
      } catch (saveError) {
        console.error("Erro ao salvar dados do N8N:", saveError);
        toast({
          title: "Erro interno",
          description: "Falha ao processar dados do N8N.",
          variant: "destructive",
        });
      }
      return true;
    }
    return false;
  };

  // Função para gerar nome único adicionando número sequencial
  const generateUniqueInstanceName = (baseName: string, attempt: number = 0): string => {
    if (attempt === 0) {
      return baseName;
    }
    return `${baseName}_${attempt}`;
  };

  // Função para verificar se instância já existe na Evolution API
  const checkInstanceExists = async (instanceName: string): Promise<boolean> => {
    try {
      console.log(`🔍 Verificando se instância "${instanceName}" já existe na Evolution API...`);
      
      const response = await fetch(`https://evolution-evolution-api.ayp7v6.easypanel.host/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': whatsappConfig.apiKey || 'test-key'
        }
      });

      if (response.status === 200) {
        console.log(`✅ Instância "${instanceName}" existe na Evolution API`);
        return true;
      } else if (response.status === 404) {
        console.log(`✅ Instância "${instanceName}" NÃO existe na Evolution API (disponível)`);
        return false;
      } else {
        console.log(`⚠️ Status ${response.status} para instância "${instanceName}" - considerando como existente`);
        return true; // Por segurança, considera que existe se não conseguir confirmar
      }
    } catch (error) {
      console.log(`⚠️ Erro ao verificar instância "${instanceName}":`, error);
      return false; // Se erro de conexão, tenta usar o nome
    }
  };

  // Função para encontrar nome disponível verificando Evolution API
  const findAvailableInstanceName = async (baseName: string, maxAttempts: number = 10): Promise<string> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const instanceName = generateUniqueInstanceName(baseName, attempt);
      const exists = await checkInstanceExists(instanceName);
      
      if (!exists) {
        console.log(`🎯 Nome disponível encontrado: "${instanceName}" (tentativa ${attempt + 1})`);
        return instanceName;
      }
      
      console.log(`❌ Nome "${instanceName}" já existe, tentando próximo...`);
    }
    
    throw new Error(`Não foi possível encontrar nome disponível após ${maxAttempts} tentativas`);
  };

  // Função para gerar QR Code via N8N (Produção) com retry automático
  const generateQRCode = async () => {
    console.log(`🚀 Função generateQRCode executada!`);
    console.log("whatsappConfig atual:", whatsappConfig);
    
    // Buscar nome do estabelecimento do banco de dados
    const establishmentName = (establishment as any)?.name;
    if (!establishmentName) {
      console.log("❌ Nome do estabelecimento não encontrado");
      toast({
        title: "Erro",
        description: "Nome do estabelecimento não encontrado. Recarregue a página.",
        variant: "destructive",
      });
      return;
    }

    // Verificar status da conexão Evolution antes de permitir geração
    try {
      const statusResponse = await apiRequest('/api/evolution/connection-status', 'GET', null);
      console.log("Status da conexão Evolution:", statusResponse);
      
      if (statusResponse.connected === true || statusResponse.status === 'connected') {
        toast({
          title: "Conexão já ativa",
          description: "Já existe uma conexão WhatsApp ativa. Não é possível gerar novo QR Code enquanto conectado.",
          variant: "destructive",
        });
        return;
      }
    } catch (statusError) {
      console.log("Não foi possível verificar status - prosseguindo com geração:", statusError);
    }

    // Encontrar nome disponível verificando Evolution API
    let instanceName: string;
    try {
      instanceName = await findAvailableInstanceName(establishmentName);
      console.log(`✅ Nome disponível encontrado: "${instanceName}"`);
    } catch (error) {
      console.error("❌ Erro ao encontrar nome disponível:", error);
      toast({
        title: "Erro",
        description: "Não foi possível encontrar nome disponível para a instância.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingQr(true);
    try {
      // Enviar dados para o webhook N8N para gerar o QR Code
      const webhookData = {
        establishments_id: (establishment as any)?.id || null,
        establishment_name: instanceName, // Usar o nome disponível encontrado
        event: "generate_qrcode",
        timestamp: new Date().toISOString()
      };

      // Enviar dados para o webhook N8N
      const response = await fetch("https://n8n-n8n-start.ayp7v6.easypanel.host/webhook/gerar_qrcode", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Processar resposta como texto primeiro
      const responseText = await response.text();
      console.log("N8N webhook response (text):", responseText);

      // Verificar se a resposta é uma imagem base64
      if (responseText.startsWith('data:image/') || responseText.startsWith('iVBORw0KGg')) {
        // Se for base64 sem prefixo, adicionar o prefixo
        const qrCodeDataUrl = responseText.startsWith('data:image/') 
          ? responseText 
          : `data:image/png;base64,${responseText}`;
        
        setQrCodeDataUrl(qrCodeDataUrl);
        
        // Start Evolution API polling when QR code is generated
        console.log('🚀 Starting Evolution API polling for 5 minutes...');
        setIsEvolutionPolling(true);
        setEvolutionPollingTimeRemaining(300); // 5 minutes = 300 seconds
        
        // Also start QR code countdown for 5 minutes (not continuous mode)
        setCountdown(300); // 5 minutes = 300 seconds (in 10s intervals = 30 cycles)
        setIsCountdownActive(true);
        setIsContinuousMode(false); // Single 5-minute cycle only
        
        toast({
          title: "QR Code gerado!",
          description: `QR Code criado com sucesso como "${instanceName}". Monitoramento ativo por 5 minutos.`,
        });
        return; // Sucesso, parar aqui
      } else {
        // Tentar fazer parse como JSON se não for base64
        try {
          const responseData = JSON.parse(responseText);
          console.log("N8N webhook response (JSON):", responseData);

          // Verificar formato padrão N8N (qrcode_base64, api_key, instance_id)
          if (responseData.qrcode_base64 && responseData.api_key && responseData.instance_id) {
            const savedSuccessfully = await saveWebhookDataIfValid(responseData, instanceName, false);
            return; // Sucesso, parar aqui
          }
          // Verificar formato alternativo N8N como texto (qrCodeBase64)
          else if (responseData.qrCodeBase64) {
            console.log("🔄 N8N enviou como texto - convertendo formato...");
            
            // Converter para formato padrão e salvar
            const convertedData = {
              qrcode_base64: responseData.qrCodeBase64,
              api_key: responseData.apiKey || responseData.api_key || "N8N-TEXT-API",
              instance_id: responseData.instanceId || responseData.instance_id || "N8N-TEXT-INSTANCE"
            };
            
            const savedSuccessfully = await saveWebhookDataIfValid(convertedData, instanceName, false);
            
            if (!savedSuccessfully) {
              // Exibir QR Code mesmo se não foi salvo
              const qrCodeDataUrl = responseData.qrCodeBase64.startsWith('data:image/') 
                ? responseData.qrCodeBase64 
                : `data:image/png;base64,${responseData.qrCodeBase64}`;
              
              setQrCodeDataUrl(qrCodeDataUrl);
              
              // Start Evolution API polling when QR code is generated
              console.log('🚀 Starting Evolution API polling for 5 minutes...');
              setIsEvolutionPolling(true);
              setEvolutionPollingTimeRemaining(300); // 5 minutes = 300 seconds
              
              // Also start QR code countdown for 5 minutes (not continuous mode)
              setCountdown(300); // 5 minutes = 300 seconds (in 10s intervals = 30 cycles)
              setIsCountdownActive(true);
              setIsContinuousMode(false); // Single 5-minute cycle only
              
              toast({
                title: "QR Code gerado!",
                description: "QR Code criado com sucesso via N8N (formato texto). Monitoramento ativo por 5 minutos.",
              });
            }
            return; // Sucesso, parar aqui
          }
          // Verificar propriedades alternativas se não foi salvo automaticamente
          else if (responseData.qrCodeUrl || responseData.qr_code_url || responseData.qrCode || responseData.qr_code) {
            const qrCodeData = responseData.qrCodeUrl || responseData.qr_code_url || responseData.qrCode || responseData.qr_code;
            
            // Verificar se é base64 e adicionar prefixo se necessário
            const qrCodeDataUrl = qrCodeData.startsWith('data:image/') 
              ? qrCodeData 
              : `data:image/png;base64,${qrCodeData}`;
            
            setQrCodeDataUrl(qrCodeDataUrl);
            
            toast({
              title: "QR Code gerado!",
              description: `QR Code criado como "${instanceName}".`,
            });
            return; // Sucesso, parar aqui
          } else {
            console.warn("N8N não retornou um QR Code válido. Resposta:", responseData);
            toast({
              title: "Erro no formato",
              description: "N8N respondeu mas não retornou QR Code válido.",
              variant: "destructive",
            });
          }
        } catch (jsonError) {
          console.error("Erro ao fazer parse JSON:", jsonError);
          toast({
            title: "Erro de formato",
            description: "Resposta do N8N não está em formato esperado.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao chamar webhook N8N:", error);
      toast({
        title: "Erro de conexão",
        description: "Erro ao conectar com o N8N. Verifique se o workflow está ativo.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQr(false);
    }
  };



  const formatPhoneNumber = (input: string) => {
    // Remove tudo que não é número
    const numbersOnly = input.replace(/\D/g, '');

    // Se o número já tem 13 dígitos e começa com 55, mantém
    if (numbersOnly.length === 13 && numbersOnly.startsWith('55')) {
      return numbersOnly;
    }

    // Se tem 11 dígitos (DDD + 9 + 8 dígitos), adiciona 55 na frente
    if (numbersOnly.length === 11) {
      return '55' + numbersOnly;
    }

    // Para outros casos, retorna apenas os números (até 13 dígitos)
    return numbersOnly.substring(0, 13);
  };

  const handleSaveSecuritySettings = async () => {
    if (securitySettings.newPassword && securitySettings.newPassword !== securitySettings.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    // Update settings (2FA and session timeout)
    updateSettingsMutation.mutate({
      twoFactorAuth: securitySettings.twoFactorAuth,
      sessionTimeout: parseInt(securitySettings.sessionTimeout),
    });

    // Update email if changed
    if (securitySettings.email && securitySettings.email !== user?.email) {
      updateEmailMutation.mutate(securitySettings.email);
    }

    // Update password if provided
    if (securitySettings.newPassword) {
      updatePasswordMutation.mutate(securitySettings.newPassword);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBusinessInfo({ ...businessInfo, logo: file });
    }
  };

  // Push Notifications Functions
  const handleTogglePushNotifications = async (enabled: boolean) => {
    if (!pushSupported) {
      // Verificar detalhes do suporte para dar uma mensagem mais específica
      const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasPushManager = 'PushManager' in window;
      const hasNotification = 'Notification' in window;
      
      let errorMessage = "Seu navegador não suporta notificações push.";
      
      if (!isHttps) {
        errorMessage = "Notificações push requerem uma conexão HTTPS segura.";
      } else if (!hasServiceWorker) {
        errorMessage = "Seu navegador não suporta Service Workers.";
      } else if (!hasPushManager) {
        errorMessage = "Seu navegador não suporta Push Manager API.";
      } else if (!hasNotification) {
        errorMessage = "Seu navegador não suporta Notification API.";
      }
      
      toast({
        title: "Notificações não disponíveis",
        description: errorMessage + " Considere atualizar para a versão mais recente.",
        variant: "destructive",
      });
      return;
    }

    if (enabled) {
      // Verificar o status atual da permissão antes de tentar ativar
      const currentPermission = pushManager.getPermissionStatus();
      
      if (currentPermission === 'denied') {
        toast({
          title: "Permissão negada",
          description: "As notificações foram bloqueadas. Acesse as configurações do navegador para habilitar.",
          variant: "destructive",
        });
        return;
      }

      // Ativar notificações
      const subscription = await pushManager.subscribe();
      if (subscription) {
        setPushNotificationsEnabled(true);
        setPushSubscription(subscription);
        setPushPermission('granted');
        
        // Salvar subscription no backend
        try {
          await apiRequest('/api/push-subscription', 'POST', {
            subscription: subscription.toJSON(),
            userId: user?.id
          });
          
          toast({
            title: "Notificações ativadas!",
            description: "Você receberá alertas em tempo real sobre agendamentos.",
          });
        } catch (error) {
          console.error('Erro ao salvar subscription:', error);
          toast({
            title: "Erro de sincronização",
            description: "Notificações ativadas localmente, mas houve erro no servidor.",
            variant: "destructive",
          });
        }
      } else {
        // Verificar novamente o status da permissão após tentativa
        const finalPermission = pushManager.getPermissionStatus();
        
        if (finalPermission === 'denied') {
          toast({
            title: "Permissão negada",
            description: "Você negou a permissão. Acesse as configurações do navegador para habilitar notificações.",
            variant: "destructive",
          });
        } else if (finalPermission === 'default') {
          toast({
            title: "Permissão pendente",
            description: "Clique em 'Permitir' quando o navegador solicitar permissão para notificações.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro técnico",
            description: "Não foi possível configurar as notificações. Tente novamente em alguns instantes.",
            variant: "destructive",
          });
        }
      }
    } else {
      // Desativar notificações
      const success = await pushManager.unsubscribe();
      if (success) {
        setPushNotificationsEnabled(false);
        setPushSubscription(null);
        
        // Remover subscription do backend
        try {
          await apiRequest('/api/push-subscription', 'DELETE', {
            userId: user?.id
          });
          
          toast({
            title: "Notificações desativadas",
            description: "Você não receberá mais alertas push.",
          });
        } catch (error) {
          console.error('Erro ao remover subscription:', error);
          toast({
            title: "Erro de sincronização",
            description: "Notificações desativadas localmente, mas houve erro no servidor.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível desativar as notificações.",
          variant: "destructive",
        });
      }
    }
  };

  const testPushNotification = async () => {
    if (pushPermission !== 'granted') {
      toast({
        title: "Permissão necessária",
        description: "Ative as notificações primeiro para testar.",
        variant: "destructive",
      });
      return;
    }

    await pushManager.showLocalNotification(
      'Teste - Salão Online',
      {
        body: 'Esta é uma notificação de teste do sistema.',
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      }
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie as configurações do seu estabelecimento
          </p>
        </div>
      </div>

      {user?.role === 'staff' && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>Acesso de Colaborador:</strong> Você pode alterar apenas suas informações de segurança (email e senha). 
            As demais configurações são restritas apenas para administradores.
          </p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        {/* Mobile: All tabs visible in 2 rows */}
        <div className="lg:hidden">
          <TabsList className="grid w-full grid-cols-3 mb-2 gap-1 h-auto bg-muted p-1">
            <TabsTrigger 
              value="business" 
              className={`flex flex-col items-center gap-1 py-2 px-1 text-xs h-auto min-h-[60px] ${user?.role === 'staff' ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={user?.role === 'staff'}
              onClick={(e) => user?.role === 'staff' && e.preventDefault()}
            >
              <Building2 className="h-4 w-4" />
              <span className="text-center leading-tight">Negócio</span>
              {user?.role === 'staff' && <Lock className="h-2 w-2" />}
            </TabsTrigger>
            <TabsTrigger 
              value="hours" 
              className={`flex flex-col items-center gap-1 py-2 px-1 text-xs h-auto min-h-[60px] ${user?.role === 'staff' ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={user?.role === 'staff'}
              onClick={(e) => user?.role === 'staff' && e.preventDefault()}
            >
              <Clock className="h-4 w-4" />
              <span className="text-center leading-tight">Horários</span>
              {user?.role === 'staff' && <Lock className="h-2 w-2" />}
            </TabsTrigger>
            <TabsTrigger 
              value="agenda" 
              className={`flex flex-col items-center gap-1 py-2 px-1 text-xs h-auto min-h-[60px] ${user?.role === 'staff' ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={user?.role === 'staff'}
              onClick={(e) => user?.role === 'staff' && e.preventDefault()}
            >
              <Calendar className="h-4 w-4" />
              <span className="text-center leading-tight">Agenda</span>
              {user?.role === 'staff' && <Lock className="h-2 w-2" />}
            </TabsTrigger>
          </TabsList>
          <TabsList className="grid w-full grid-cols-2 gap-1 h-auto bg-muted p-1">
            <TabsTrigger 
              value="whatsapp" 
              className={`flex flex-col items-center gap-1 py-2 px-1 text-xs h-auto min-h-[60px] ${user?.role === 'staff' ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={user?.role === 'staff'}
              onClick={(e) => user?.role === 'staff' && e.preventDefault()}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-center leading-tight">WhatsApp</span>
              {user?.role === 'staff' && <Lock className="h-2 w-2" />}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex flex-col items-center gap-1 py-2 px-1 text-xs h-auto min-h-[60px]">
              <Shield className="h-4 w-4" />
              <span className="text-center leading-tight">Segurança</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Desktop: Single row layout */}
        <div className="hidden lg:block">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger 
              value="business" 
              className={`flex items-center gap-2 ${user?.role === 'staff' ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={user?.role === 'staff'}
              onClick={(e) => user?.role === 'staff' && e.preventDefault()}
            >
              <Building2 className="h-4 w-4" />
              Negócio
              {user?.role === 'staff' && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger 
              value="hours" 
              className={`flex items-center gap-2 ${user?.role === 'staff' ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={user?.role === 'staff'}
              onClick={(e) => user?.role === 'staff' && e.preventDefault()}
            >
              <Clock className="h-4 w-4" />
              Horários
              {user?.role === 'staff' && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger 
              value="agenda" 
              className={`flex items-center gap-2 ${user?.role === 'staff' ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={user?.role === 'staff'}
              onClick={(e) => user?.role === 'staff' && e.preventDefault()}
            >
              <Calendar className="h-4 w-4" />
              Agenda
              {user?.role === 'staff' && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger 
              value="whatsapp" 
              className={`flex items-center gap-2 ${user?.role === 'staff' ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={user?.role === 'staff'}
              onClick={(e) => user?.role === 'staff' && e.preventDefault()}
            >
              <MessageSquare className="h-4 w-4" />
              WhatsApp
              {user?.role === 'staff' && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Business Information Tab */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Negócio</CardTitle>
              <CardDescription>
                Configure as informações básicas do seu estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nome do Estabelecimento</Label>
                  <Input
                    id="businessName"
                    value={businessInfo.name}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                    placeholder="Ex: Salão da Beleza"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessSegment">Segmento</Label>
                  <Select 
                    value={businessInfo.segment} 
                    onValueChange={(value) => setBusinessInfo({ ...businessInfo, segment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salon">Salão de Beleza</SelectItem>
                      <SelectItem value="barbershop">Barbearia</SelectItem>
                      <SelectItem value="studio">Estúdio de Beleza</SelectItem>
                      <SelectItem value="spa">Spa</SelectItem>
                      <SelectItem value="clinic">Clínica de Estética</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Telefone</Label>
                  <Input
                    id="businessPhone"
                    value={businessInfo.phone}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={businessInfo.email}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                    placeholder="contato@seuestablecimento.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAddress">Endereço Completo</Label>
                <Textarea
                  id="businessAddress"
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                  placeholder="Rua, número, bairro, cidade, CEP"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo do Estabelecimento</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Formato recomendado: PNG ou JPG, até 2MB
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveBusinessInfo} disabled={updateBusinessInfoMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Informações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Working Hours Tab */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Horário de Funcionamento</CardTitle>
              <CardDescription>
                Configure os horários de abertura e fechamento do estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 business-hours-mobile">
              <div className="space-y-4">
                {weekDays.map((day) => (
                  <div key={day.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 sm:w-32">
                        <Label className="font-medium">{day.name}</Label>
                      </div>
                      <Switch
                        checked={workingHours[day.key]?.isOpen || false}
                        onCheckedChange={(checked) => 
                          setWorkingHours({
                            ...workingHours,
                            [day.key]: { ...workingHours[day.key], isOpen: checked }
                          })
                        }
                      />
                    </div>
                    {workingHours[day.key]?.isOpen && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Input
                            type="time"
                            value={workingHours[day.key]?.openTime || "09:00"}
                            onChange={(e) => 
                              setWorkingHours({
                                ...workingHours,
                                [day.key]: { ...workingHours[day.key], openTime: e.target.value }
                              })
                            }
                            className="w-full sm:w-32"
                          />
                          <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">às</span>
                          <Input
                            type="time"
                            value={workingHours[day.key]?.closeTime || "18:00"}
                            onChange={(e) => 
                              setWorkingHours({
                                ...workingHours,
                                [day.key]: { ...workingHours[day.key], closeTime: e.target.value }
                              })
                            }
                            className="w-full sm:w-32"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveWorkingHours} disabled={updateBusinessHoursMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Horários
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timezone Configuration */}
          <TimezoneSelector 
            currentTimezone={establishment?.timezone || "America/Sao_Paulo"}
            onUpdate={() => queryClient.invalidateQueries({ queryKey: ['/api/establishment'] })}
          />
        </TabsContent>

        {/* Agenda Release Control Tab */}
        <TabsContent value="agenda">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Controle de Liberação de Agenda</CardTitle>
                <CardDescription>
                  Configure quando os agendamentos ficam disponíveis para as integrações externas (N8N, WhatsApp)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="releaseInterval">Intervalo de Liberação (meses à frente)</Label>
                    <Select 
                      value={String(agendaSettings.releaseInterval)} 
                      onValueChange={(value) => setAgendaSettings({ ...agendaSettings, releaseInterval: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o intervalo" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <SelectItem key={month} value={String(month)}>
                            {month} {month === 1 ? 'mês' : 'meses'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="releaseDay">Dia da Liberação</Label>
                    <Select 
                      value={String(agendaSettings.releaseDay)} 
                      onValueChange={(value) => setAgendaSettings({ ...agendaSettings, releaseDay: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o dia" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <SelectItem key={day} value={String(day)}>
                            Dia {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="agendaActive"
                    checked={agendaSettings.isActive}
                    onCheckedChange={(checked) => setAgendaSettings({ ...agendaSettings, isActive: checked })}
                  />
                  <Label htmlFor="agendaActive">Ativar controle de liberação automática</Label>
                </div>

                <div className={`p-4 border rounded-lg ${
                  agendaSettings.isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                    : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    agendaSettings.isActive 
                      ? 'text-blue-900 dark:text-blue-100' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {agendaSettings.isActive ? 'Controle Ativo - Como funciona:' : 'Controle Desativado - Como funciona:'}
                  </h4>
                  <ul className={`text-sm space-y-1 ${
                    agendaSettings.isActive 
                      ? 'text-blue-800 dark:text-blue-200' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {agendaSettings.isActive ? (
                      <>
                        <li>• A agenda é liberada automaticamente no dia configurado</li>
                        <li>• Exemplo: Se configurado para "2 meses, dia 28", no dia 28 de cada mês será liberado o mês correspondente</li>
                        <li>• Integrações externas só conseguem agendar em meses que já foram liberados</li>
                        <li>• Você pode fazer liberações manuais adicionais quando necessário</li>
                      </>
                    ) : (
                      <>
                        <li>• Todas as integrações externas (N8N, WhatsApp) podem agendar em qualquer mês futuro</li>
                        <li>• Não há restrições de quando os meses ficam disponíveis</li>
                        <li>• Sistema funciona como antes - sem controle de agenda</li>
                        <li>• Liberações manuais não são necessárias</li>
                      </>
                    )}
                  </ul>
                </div>

                <Button 
                  onClick={() => {
                    updateAgendaPolicyMutation.mutate(agendaSettings);
                  }}
                  disabled={updateAgendaPolicyMutation.isPending}
                  className="w-full"
                >
                  {updateAgendaPolicyMutation.isPending && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  Salvar Política de Liberação
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meses Atualmente Liberados</CardTitle>
                <CardDescription>
                  Veja quais meses estão disponíveis para agendamento baseado na sua política
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(agendaPolicy?.currentReleasedMonths || []).map((monthKey: string) => {
                    const [year, month] = monthKey.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                    const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                    
                    return (
                      <div key={monthKey} className="flex flex-col gap-1">
                        <Button
                          variant="default"
                          size="sm"
                          disabled
                          className="text-xs bg-green-600 hover:bg-green-600 cursor-default"
                        >
                          ✓ {monthName}
                        </Button>
                      </div>
                    );
                  })}
                  
                  {(!agendaPolicy?.currentReleasedMonths || agendaPolicy.currentReleasedMonths.length === 0) && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        Nenhum mês liberado no momento. Configure a política acima.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex-1 mr-3">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💡 <strong>Automático:</strong> Os meses são liberados automaticamente baseado no intervalo e dia configurados acima.
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => recalculateMonthsMutation.mutate()}
                    disabled={recalculateMonthsMutation.isPending}
                    variant="outline"
                    size="sm"
                  >
                    {recalculateMonthsMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Atualizar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Histórico removido - sistema simplificado */}
          </div>
        </TabsContent>

        {/* WhatsApp Integration Tab */}
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>Integração com WhatsApp</CardTitle>
              <CardDescription>
                Escolha como conectar o WhatsApp ao seu sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

              

              <Separator />

              {/* Status detalhado da Evolution API */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">
                    Status Evolution API
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => refetchConnectionStatus()}
                    disabled={connectionStatusLoading}
                  >
                    {connectionStatusLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                        Verificando...
                      </>
                    ) : (
                      "Atualizar Status"
                    )}
                  </Button>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {evolutionConnectionStatus ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            evolutionConnectionStatus.connected ? 'bg-green-500' : 
                            evolutionConnectionStatus.status === 'connecting' ? 'bg-yellow-500' :
                            evolutionConnectionStatus.status === 'unknown' ? 'bg-orange-500' : 'bg-red-500'
                          }`}></div>
                          <span className="font-medium">
                            {evolutionConnectionStatus.connected ? 'Conectado' : 
                             evolutionConnectionStatus.status === 'connecting' ? 'Conectando' :
                             evolutionConnectionStatus.status === 'unknown' ? 'Status Desconhecido' : 'Desconectado'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(evolutionConnectionStatus.lastCheck).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {evolutionConnectionStatus.message}
                      </p>

                      {evolutionConnectionStatus.localData && (
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Nome da Instância:</span>
                            <span className="font-mono">{evolutionConnectionStatus.localData.instanceName}</span>
                          </div>
                          {evolutionConnectionStatus.localData.lastUpdated && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Última Atualização:</span>
                              <span>{new Date(evolutionConnectionStatus.localData.lastUpdated).toLocaleString('pt-BR')}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {evolutionConnectionStatus.error && (
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs">
                          <span className="text-red-600 dark:text-red-400 font-medium">Erro: </span>
                          <span className="text-red-700 dark:text-red-300">{evolutionConnectionStatus.error}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      <span>Carregando status...</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* QR Code WhatsApp Web */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Label className="text-base font-medium">
                    Conectar via QR Code do WhatsApp Web
                  </Label>
                </div>

                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use seu WhatsApp pessoal conectando via QR Code do WhatsApp Web
                    </p>




                    <div className="space-y-4">
                      <div className="text-center space-y-4">
                        {/* Botão de gerar QR Code */}
                        <div className="flex justify-center">
                          <Button
                            type="button"
                            onClick={() => generateQRCode()}
                            className="px-6 py-3"
                            disabled={isGeneratingQr}
                          >
                            {isGeneratingQr ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Gerando...
                              </>
                            ) : (
                              "Gerar QR Code"
                            )}
                          </Button>
                        </div>
                      </div>

                      {qrCodeDataUrl && (
                        <div className="text-center space-y-4">
                          <div className="inline-block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border">
                            <img 
                              src={qrCodeDataUrl} 
                              alt="QR Code WhatsApp" 
                              className="w-64 h-64 mx-auto"
                            />
                          </div>

                          {/* Countdown */}
                          {isCountdownActive && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                              <div className="text-center space-y-2">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                                </div>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  tempo restante do QR Code (máximo 5 minutos)
                                </p>
                                <div className="w-full bg-blue-100 dark:bg-blue-800 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                                    style={{
                                      width: `${((300 - countdown) / 300) * 100}%`
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Evolution API Polling Status */}
                          {isEvolutionPolling && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                              <div className="text-center space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="animate-pulse w-2 h-2 bg-green-600 rounded-full"></div>
                                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                    Monitoramento Evolution ativo
                                  </span>
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400">
                                  {Math.floor(evolutionPollingTimeRemaining / 60)}:{(evolutionPollingTimeRemaining % 60).toString().padStart(2, '0')} restantes
                                </div>
                                <p className="text-xs text-green-700 dark:text-green-300">
                                  Verificando conexão a cada 15 segundos
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                            <p className="font-medium">Como conectar:</p>
                            <div className="text-left space-y-1 max-w-md mx-auto">
                              <p>1. Abra o WhatsApp no seu celular</p>
                              <p>2. Toque em "Mais opções" (⋮) e depois "WhatsApp Web"</p>
                              <p>3. Aponte a câmera para este QR Code</p>
                              <p>4. Aguarde a conexão ser estabelecida</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveWhatsappConfig} disabled={updateSettingsMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configuração
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Email</CardTitle>
                <CardDescription>
                  Altere seu email de acesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={securitySettings.email}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, email: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize sua senha de acesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={securitySettings.password}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, password: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={securitySettings.newPassword}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={securitySettings.confirmPassword}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Aplicativo Web Progressivo (PWA)
                </CardTitle>
                <CardDescription>
                  Instale o Salão Online como um aplicativo nativo no seu dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Instalar Aplicativo</h4>
                    <p className="text-xs text-muted-foreground">
                      Acesso rápido sem navegador, ícone na tela inicial, experiência nativa
                    </p>
                  </div>
                  <InstallPWAButton />
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Desktop:</strong> Clique no ícone para instalação automática</p>
                  <p><strong>iOS:</strong> Use "Adicionar à Tela Inicial" no Safari</p>
                  <p><strong>Android:</strong> Use "Adicionar à tela inicial" no Chrome</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveSecuritySettings} disabled={updateSettingsMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}