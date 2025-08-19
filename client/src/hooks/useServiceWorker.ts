import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isUpdateAvailable: boolean;
  isInstalling: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isUpdateAvailable: false,
    isInstalling: false,
    registration: null
  });

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      // Service Worker registration log removed for compute optimization
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      setState(prev => ({ ...prev, registration }));

      // Escutar mensagens do Service Worker
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

      // Verificar se há uma atualização pendente
      if (registration.waiting) {
        setState(prev => ({ ...prev, isUpdateAvailable: true }));
      }

      // Escutar por novas atualizações
      registration.addEventListener('updatefound', () => {
        // Service Worker update log removed for compute optimization
        setState(prev => ({ ...prev, isInstalling: true }));

        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Service Worker new version log removed for compute optimization
              setState(prev => ({ 
                ...prev, 
                isUpdateAvailable: true, 
                isInstalling: false 
              }));
            }
          });
        }
      });

      // Service Worker success log removed for compute optimization
    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error);
    }
  };

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    const { type, version } = event.data;

    switch (type) {
      case 'SW_ACTIVATED':
        // Service Worker activation log removed for compute optimization
        break;
      
      case 'NEW_VERSION_AVAILABLE':
        // Service Worker version availability log removed for compute optimization
        setState(prev => ({ ...prev, isUpdateAvailable: true }));
        break;
    }
  };

  const updateServiceWorker = () => {
    if (state.registration?.waiting) {
      // Enviar mensagem para o Service Worker ativar imediatamente
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Aguardar a ativação e recarregar
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Service Worker controller change log removed for compute optimization
        window.location.reload();
      });
    } else {
      // Se não há worker waiting, apenas recarregar
      window.location.reload();
    }
  };

  const checkForUpdates = () => {
    if (state.registration) {
      // Service Worker update check log removed for compute optimization
      state.registration.update();
    }
  };

  return {
    isUpdateAvailable: state.isUpdateAvailable,
    isInstalling: state.isInstalling,
    updateServiceWorker,
    checkForUpdates
  };
}