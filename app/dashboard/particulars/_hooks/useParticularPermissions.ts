// app/dashboard/particulars/_hooks/useParticularPermissions.ts

import { useCurrentUser } from "@/app/hooks/useCurrentUser";

/**
 * Hook to check if user has permissions for Particular CRUD operations
 * Only admin and super_admin can create, update, delete particulars
 */
export function useParticularPermissions() {
  const { user, isLoading } = useCurrentUser();

  const canManageParticulars = 
    user?.role === "admin" || user?.role === "super_admin";

  const canEditParticular = canManageParticulars;
  const canDeleteParticular = canManageParticulars;
  const canCreateParticular = canManageParticulars;

  return {
    canManageParticulars,
    canEditParticular,
    canDeleteParticular,
    canCreateParticular,
    isLoading,
    userRole: user?.role,
  };
}