// Initialize Service Worker for push notifications
export const initServiceWorker = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado com sucesso:', registration);
      return true;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      return false;
    }
  } else {
    console.warn('Service Worker não é suportado neste navegador');
    return false;
  }
};

// Initialize on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    initServiceWorker();
  });
}