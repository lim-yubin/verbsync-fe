import { Badge } from "@/components/ui/badge";
import { PLAN_LABELS } from "@/lib/plans";
import type { Plan } from "@/types/api";

interface PlanBadgeProps {
  plan: Plan;
  className?: string;
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const variant =
    plan === "FREE" ? "secondary" : plan === "STARTER" ? "default" : "outline";

  return (
    <Badge variant={variant} className={className}>
      {PLAN_LABELS[plan]}
    </Badge>
  );
}

