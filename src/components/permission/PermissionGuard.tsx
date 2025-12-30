import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { usePermission } from "./usePermission";
import type { MemberPermissions } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";

interface PermissionGuardProps {
  requiredPermission: keyof MemberPermissions["permissions"];
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  requiredPermission,
  fallback,
  children,
}: PermissionGuardProps) {
  const { t } = useTranslation();
  const { hasPermission, isLoading } = usePermission();

  if (isLoading) {
    return <Skeleton className="h-8 w-full" />;
  }

  if (!hasPermission(requiredPermission)) {
    return (
      fallback || (
        <div className="rounded-md border p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t("permission.noPermission")}
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}

