import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MemberRole } from "@/types/api";
import { ROLE_LABELS } from "@/lib/permissions";

interface RoleBadgeProps {
  role: MemberRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const variantMap: Record<MemberRole, "default" | "secondary" | "outline"> = {
    OWNER: "default", // primary (blue)
    EDITOR: "secondary", // green (success)
    VIEWER: "outline", // gray
  };

  const colorMap: Record<MemberRole, string> = {
    OWNER: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    EDITOR: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    VIEWER: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700",
  };

  return (
    <Badge
      variant={variantMap[role]}
      className={cn(
        "text-xs font-medium",
        colorMap[role],
        className
      )}
    >
      {ROLE_LABELS[role]}
    </Badge>
  );
}

