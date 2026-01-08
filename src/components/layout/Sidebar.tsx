import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { Home, Settings, Users, CreditCard, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useMemberPermissions } from "@/hooks/useMembers";
import { usePlan } from "@/hooks/usePlan";

interface NavItem {
  titleKey: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
}

const allNavItems: NavItem[] = [
  {
    titleKey: "nav.dashboard",
    href: ROUTES.DASHBOARD,
    icon: Home,
  },
  {
    titleKey: "nav.members",
    href: ROUTES.MEMBERS,
    icon: Users,
  },
  {
    titleKey: "nav.team",
    href: ROUTES.TEAM,
    icon: Building2,
  },
  {
    titleKey: "nav.subscription",
    href: ROUTES.SUBSCRIPTION,
    icon: CreditCard,
  },
  {
    titleKey: "nav.settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
];

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { data: permissions } = useMemberPermissions();
  const { data: planInfo } = usePlan();
  
  // 소유자만 멤버 메뉴 표시
  const isOwner = permissions?.role === "OWNER";
  // Free 플랜이 아니고 소유자인 경우에만 멤버 메뉴 표시
  const canSeeMembers = isOwner && planInfo?.plan !== "FREE";
  
  const navItems = allNavItems.filter(
    (item) => {
      if (item.titleKey === "nav.members") {
        return canSeeMembers;
      }
      // 멤버인 경우 구독 메뉴 숨기고 팀 정보 메뉴 표시
      if (item.titleKey === "nav.subscription") {
        return isOwner; // 소유자만 구독 메뉴 표시
      }
      if (item.titleKey === "nav.team") {
        return !isOwner; // 멤버만 팀 정보 메뉴 표시
      }
      return true;
    }
  );

  return (
    <aside className="hidden md:flex w-60 flex-col fixed left-0 top-0 h-screen border-r bg-muted/30">
      <div className="flex h-14 items-center border-b px-6">
        <span className="text-sm font-semibold text-muted-foreground">
          {t("common.menu")}
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  item.disabled && "pointer-events-none opacity-50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{t(item.titleKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

