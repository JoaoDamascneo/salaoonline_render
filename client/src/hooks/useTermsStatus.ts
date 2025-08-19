import { useState, useEffect } from "react";

interface TermsStatus {
  hasAcceptedTerms: boolean;
  termsAcceptedAt: string | null;
  privacyPolicyAcceptedAt: string | null;
  termsVersion: string;
  privacyPolicyVersion: string;
  currentVersion: string;
}

export function useTermsStatus(establishmentId: number | null) {
  const [termsStatus, setTermsStatus] = useState<TermsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkTermsStatus = async () => {
    if (!establishmentId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/terms-status/${establishmentId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao verificar status dos termos');
      }

      const data = await response.json();
      setTermsStatus(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar status dos termos');
      console.error('Terms status error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkTermsStatus();
  }, [establishmentId]);

  const needsTermsAcceptance = termsStatus && !termsStatus.hasAcceptedTerms;
  
  const acceptTerms = async () => {
    if (!establishmentId) return false;

    try {
      const response = await fetch('/api/accept-terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          establishmentId,
          termsVersion: "1.0",
          privacyPolicyVersion: "1.0"
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao aceitar termos');
      }

      // Recarregar status após aceitação
      await checkTermsStatus();
      return true;
    } catch (err: any) {
      setError(err.message || 'Erro ao aceitar termos');
      return false;
    }
  };

  return {
    termsStatus,
    isLoading,
    error,
    needsTermsAcceptance,
    acceptTerms,
    refetch: checkTermsStatus
  };
}