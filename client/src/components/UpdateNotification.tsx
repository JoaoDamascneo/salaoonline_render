import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, X } from "lucide-react";
import { useServiceWorker } from "@/hooks/useServiceWorker";

export function UpdateNotification() {
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset dismissed state when new update is available
  useEffect(() => {
    if (isUpdateAvailable) {
      setIsDismissed(false);
    }
  }, [isUpdateAvailable]);

  if (!isUpdateAvailable || isDismissed) {
    return null;
  }

  const handleUpdate = () => {
    updateServiceWorker();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <Card className="w-96 shadow-lg border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Nova versão disponível
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-200 mb-3">
                  Uma nova versão está disponível. Clique aqui para atualizar.
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleUpdate}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Atualizar Agora
                  </Button>
                  <Button 
                    onClick={handleDismiss}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-800"
                  >
                    Depois
                  </Button>
                </div>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}