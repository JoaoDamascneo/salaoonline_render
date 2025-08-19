import { useQuery } from "@tanstack/react-query";

interface PlanPermissions {
  plan: {
    id: number;
    name: string;
    price: string;
    maxStaff: number;
    hasFinancialModule: boolean;
    hasInventoryModule: boolean;
    hasWhatsappIntegration: boolean;
  } | null;
  staffLimit: {
    isWithinLimit: boolean;
    currentCount: number;
    maxAllowed: number;
  };
  hasFinancialAccess: boolean;
  hasInventoryAccess: boolean;
  hasWhatsappAccess: boolean;
  hasLoyaltyAccess: boolean;
}

export function usePlanPermissions() {
  const { data: permissions, isLoading } = useQuery<PlanPermissions>({
    queryKey: ["/api/establishment/permissions"],
    retry: false,
  });

  const checkFinancialAccess = () => {
    return permissions?.hasFinancialAccess ?? false;
  };

  const checkInventoryAccess = () => {
    return permissions?.hasInventoryAccess ?? false;
  };

  const checkLoyaltyAccess = () => {
    return permissions?.hasLoyaltyAccess ?? false;
  };

  const checkStaffLimit = () => {
    return permissions?.staffLimit?.isWithinLimit ?? true;
  };

  const getRequiredPlanForFinancial = () => {
    return "Core";
  };

  const getRequiredPlanForInventory = () => {
    return "Expert";
  };

  const getRequiredPlanForLoyalty = () => {
    return "Core";
  };

  const getCurrentPlan = () => {
    return permissions?.plan?.name ?? "Base";
  };

  const getStaffLimitInfo = () => {
    return {
      current: permissions?.staffLimit?.currentCount ?? 0,
      max: permissions?.staffLimit?.maxAllowed ?? 2,
      isWithinLimit: permissions?.staffLimit?.isWithinLimit ?? true,
    };
  };

  return {
    permissions,
    isLoading,
    checkFinancialAccess,
    checkInventoryAccess,
    checkLoyaltyAccess,
    checkStaffLimit,
    getRequiredPlanForFinancial,
    getRequiredPlanForInventory,
    getRequiredPlanForLoyalty,
    getCurrentPlan,
    getStaffLimitInfo,
  };
}