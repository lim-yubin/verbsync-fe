import { useMemberPermissions } from "@/hooks/useMembers";
import type { MemberPermissions } from "@/types/api";

export function usePermission() {
  const { data: permissions, isLoading } = useMemberPermissions();

  const hasPermission = (
    permission: keyof MemberPermissions["permissions"]
  ): boolean => {
    return permissions?.permissions[permission] ?? false;
  };

  return {
    role: permissions?.role,
    permissions: permissions?.permissions,
    isLoading,
    hasPermission,
  };
}

