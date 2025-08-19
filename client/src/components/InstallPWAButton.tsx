import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Monitor, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(true); // Sempre mostrar inicialmente
  const [showInstallDialog, setShowInstallDialog] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir que o mini-infobar apareça automaticamente
      e.preventDefault();
      // Salvar o evento para usar depois
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
      console.log('beforeinstallprompt event fired');
    };

    const handleAppInstalled = () => {
      console.log('PWA foi instalado');
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    // Verificar se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInStandaloneMode = (window.navigator as any).standalone || isStandalone;
    
    console.log('PWA Status:', { isStandalone, isInStandaloneMode });
    
    if (isInStandaloneMode) {
      setShowInstallButton(false);
    } else {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback para dispositivos iOS ou quando o prompt não está disponível
      showInstallInstructions();
      return;
    }

    // Mostrar o prompt de instalação
    deferredPrompt.prompt();
    
    // Aguardar a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuário aceitou instalar o PWA');
    } else {
      console.log('Usuário rejeitou instalar o PWA');
    }
    
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const showInstallInstructions = () => {
    setShowInstallDialog(true);
  };

  // Não mostrar o botão se já estiver instalado
  if (!showInstallButton) {
    return null;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleInstallClick}
        className="hover:bg-gradient-to-r hover:from-[#3db3ff] hover:to-[#004dde] hover:text-white transition-all"
        title="Instalar App"
      >
        {isMobile ? (
          <Smartphone className="h-5 w-5" />
        ) : (
          <Download className="h-5 w-5" />
        )}
      </Button>

      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isMobile ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
              Instalar Salão Online
            </DialogTitle>
            <DialogDescription>
              Adicione o aplicativo à sua tela inicial para acesso rápido e experiência nativa
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {isIOS && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">iPhone/iPad (Safari)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600">1</div>
                    <span>Toque no botão de compartilhar <strong>⬆️</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600">2</div>
                    <span>Selecione <strong>"Adicionar à Tela Inicial"</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600">3</div>
                    <span>Toque em <strong>"Adicionar"</strong></span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {isAndroid && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Android (Chrome)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-semibold text-green-600">1</div>
                    <span>Toque no menu <strong>⋮</strong> do navegador</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-semibold text-green-600">2</div>
                    <span>Selecione <strong>"Adicionar à tela inicial"</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-semibold text-green-600">3</div>
                    <span>Toque em <strong>"Adicionar"</strong></span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {!isMobile && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Desktop (Chrome/Edge)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-600">1</div>
                    <span>Clique no ícone de instalação na barra de endereços</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-600">2</div>
                    <span>Ou use o menu <strong>⋮</strong> &gt; "Instalar Salão Online"</span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 dark:text-blue-400 text-sm">💡</div>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Após instalado, o aplicativo funcionará como um app nativo com notificações push e acesso offline.
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowInstallDialog(false)}
              className="w-full"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}