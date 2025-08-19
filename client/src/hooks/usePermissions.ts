import { useAuth } from "./useAuth";
import { useQuery } from '@tanstack/react-query';

export interface Permissions {
  // Dashboard access
  canViewDashboard: boolean;

  // Appointments
  canViewAppointments: boolean;
  canCreateAppointments: boolean;
  canEditAppointments: boolean;
  canDeleteAppointments: boolean;

  // Clients
  canViewClients: boolean;
  canCreateClients: boolean;
  canEditClients: boolean;
  canDeleteClients: boolean;

  // Services
  canViewServices: boolean;
  canCreateServices: boolean;
  canEditServices: boolean;
  canDeleteServices: boolean;

  // Staff management
  canViewStaff: boolean;
  canCreateStaff: boolean;
  canEditStaff: boolean;
  canDeleteStaff: boolean;

  // Inventory
  canViewInventory: boolean;
  canCreateProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;

  // Financial
  canViewFinances: boolean;
  canViewAllTransactions: boolean;
  canCreateTransactions: boolean;
  canDeleteTransactions: boolean;
  canViewStaffCommissions: boolean;
  canViewOwnCommission: boolean;

  // Loyalty
  canViewLoyalty: boolean;

  // Settings
  canViewSettings: boolean;
  canEditBusinessSettings: boolean;
  canChangeOwnPassword: boolean;
  canAccessSecuritySettings: boolean;
}

export function usePermissions(): Permissions {
  const { user } = useAuth();

  if (!user) {
    return {
      canViewDashboard: false,
      canViewAppointments: false,
      canCreateAppointments: false,
      canEditAppointments: false,
      canDeleteAppointments: false,
      canViewClients: false,
      canCreateClients: false,
      canEditClients: false,
      canDeleteClients: false,
      canViewServices: false,
      canCreateServices: false,
      canEditServices: false,
      canDeleteServices: false,
      canViewStaff: false,
      canCreateStaff: false,
      canEditStaff: false,
      canDeleteStaff: false,
      canViewInventory: false,
      canCreateProducts: false,
      canEditProducts: false,
      canDeleteProducts: false,
      canViewFinances: false,
      canViewAllTransactions: false,
      canCreateTransactions: false,
      canDeleteTransactions: false,
      canViewStaffCommissions: false,
      canViewOwnCommission: false,
      canViewLoyalty: false,
      canViewSettings: false,
      canEditBusinessSettings: false,
      canChangeOwnPassword: false,
      canAccessSecuritySettings: false,
    };
  }

  const isAdmin = user.role === "admin";
  const isStaff = user.role === "staff";

  return {
    // Dashboard - both admin and staff can view
    canViewDashboard: true,

    // Appointments - both can view and manage
    canViewAppointments: true,
    canCreateAppointments: true,
    canEditAppointments: true,
    canDeleteAppointments: isAdmin, // Only admin can delete

    // Clients - admin only
    canViewClients: isAdmin,
    canCreateClients: isAdmin,
    canEditClients: isAdmin,
    canDeleteClients: isAdmin,

    // Services - admin only
    canViewServices: isAdmin,
    canCreateServices: isAdmin,
    canEditServices: isAdmin,
    canDeleteServices: isAdmin,

    // Staff management - admin only
    canViewStaff: isAdmin,
    canCreateStaff: isAdmin,
    canEditStaff: isAdmin,
    canDeleteStaff: isAdmin,

    // Inventory - admin only
    canViewInventory: isAdmin,
    canCreateProducts: isAdmin,
    canEditProducts: isAdmin,
    canDeleteProducts: isAdmin,

    // Financial
    canViewFinances: isAdmin || isStaff, // Staff can access finances page
    canViewAllTransactions: isAdmin, // Only admin sees all transactions
    canCreateTransactions: isAdmin,
    canDeleteTransactions: isAdmin,
    canViewStaffCommissions: isAdmin, // Admin can view all staff commissions
    canViewOwnCommission: isStaff, // Staff can only view their own commission

    // Loyalty - admin only (plan restrictions will be checked elsewhere)
    canViewLoyalty: isAdmin,

    // Settings
    canViewSettings: isAdmin || isStaff, // Both can access settings
    canEditBusinessSettings: isAdmin, // Only admin can edit business settings
    canChangeOwnPassword: true, // Both can change their own password
    canAccessSecuritySettings: true, // Both can access security settings
  };
}

// Component for protecting routes based on permissions
export function ProtectedRoute({
  children,
  permission,
  fallback = null
}: {
  children: React.ReactNode;
  permission: keyof Permissions;
  fallback?: React.ReactNode;
}) {
  const permissions = usePermissions();

  if (!permissions[permission]) {
    return fallback;
  }

  return children;
}