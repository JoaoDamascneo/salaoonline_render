// Gerenciador de notificações push
export class PushNotificationManager {
  private vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HcCWLRM3-7YkGw2zJJ_GQFfOzqJq2BTBHWuBfUF6pjNEsz5C7jBZKT0UKo'; // Chave pública VAPID

  // Verificar se o navegador suporta notificações
  static isSupported(): boolean {
    try {
      // Verificar se estamos no contexto do navegador
      if (typeof navigator === 'undefined' || typeof window === 'undefined') {
        // Browser context log removed for compute optimization
        return false;
      }

      // Verificar APIs necessárias
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasPushManager = 'PushManager' in window;
      const hasNotification = 'Notification' in window;
      
      // Support verification log removed for compute optimization

      // Verificar se é HTTPS (obrigatório para notificações push)
      const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      
      if (!isHttps) {
        // HTTPS requirement warning removed for compute optimization
        return false;
      }

      return hasServiceWorker && hasPushManager && hasNotification;
    } catch (error) {
      // Notification support error log removed for compute optimization
      return false;
    }
  }

  // Registrar Service Worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!PushNotificationManager.isSupported()) {
      // Push notification support warning removed for compute optimization
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      // Service Worker registration log removed for compute optimization
      return registration;
    } catch (error) {
      // Service Worker registration error log removed for compute optimization
      return null;
    }
  }

  // Solicitar permissão para notificações
  async requestPermission(): Promise<NotificationPermission> {
    if (!PushNotificationManager.isSupported()) {
      return 'denied';
    }

    // Se já foi concedida, retornar imediatamente
    if (Notification.permission === 'granted') {
      return 'granted';
    }

    // Se foi negada, não insistir
    if (Notification.permission === 'denied') {
      return 'denied';
    }

    // Solicitar permissão apenas se ainda não foi decidido
    try {
      const permission = await Notification.requestPermission();
      // Permission request log removed for compute optimization
      return permission;
    } catch (error) {
      // Permission request error log removed for compute optimization
      return 'denied';
    }
  }

  // Verificar e solicitar permissão automaticamente (para chamada no login)
  async checkAndRequestPermissionIfNeeded(): Promise<NotificationPermission> {
    if (!PushNotificationManager.isSupported()) {
      // Push notification support log removed for compute optimization
      return 'denied';
    }

    const current = Notification.permission;
    
    // Se ainda não foi decidido, solicitar automaticamente
    if (current === 'default') {
      // Automatic permission request log removed for compute optimization
      return await this.requestPermission();
    }

    return current;
  }

  // Verificar status da permissão
  getPermissionStatus(): NotificationPermission {
    if (!PushNotificationManager.isSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  // Converter chave VAPID para Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Inscrever-se para receber push notifications
  async subscribe(): Promise<PushSubscription | null> {
    const registration = await this.registerServiceWorker();
    if (!registration) return null;

    // Primeiro, verificar se já existe uma subscription ativa
    try {
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        // Existing subscription log removed for compute optimization
        return existingSubscription;
      }
    } catch (error) {
      // Subscription check error log removed for compute optimization
    }

    // Solicitar permissão explicitamente
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      // Permission denied warning log removed for compute optimization
      return null;
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // New subscription log removed for compute optimization
      return subscription;
    } catch (error) {
      // Subscription creation error log removed for compute optimization
      
      // Verificar se é erro de permissão
      if (error instanceof Error && error.message.includes('permission')) {
        // Permission configuration error log removed for compute optimization
      }
      
      return null;
    }
  }

  // Cancelar inscrição
  async unsubscribe(): Promise<boolean> {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return true;

    try {
      const result = await subscription.unsubscribe();
      console.log('Inscrição push cancelada:', result);
      return result;
    } catch (error) {
      console.error('Erro ao cancelar inscrição push:', error);
      return false;
    }
  }

  // Verificar se já está inscrito
  async isSubscribed(): Promise<boolean> {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  }

  // Obter inscrição atual
  async getSubscription(): Promise<PushSubscription | null> {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return null;

    return await registration.pushManager.getSubscription();
  }

  // Enviar notificação local (para teste)
  async showLocalNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (this.getPermissionStatus() !== 'granted') {
      console.warn('Permissão para notificações não concedida');
      return;
    }

    const defaultOptions: NotificationOptions = {
      body: 'Nova notificação do Salão Online',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      ...options
    };

    new Notification(title, defaultOptions);
  }
}

// Instância global do gerenciador
export const pushManager = new PushNotificationManager();