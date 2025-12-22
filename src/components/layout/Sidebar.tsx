import { Link, useLocation } from "react-router-dom";
import { Home, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { useMemberPermissions } from "@/hooks/useMembers";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
}

const allNavItems: NavItem[] = [
  {
    title: "대시보드",
    href: ROUTES.DASHBOARD,
    icon: Home,
  },
  {
    title: "멤버",
    href: ROUTES.MEMBERS,
    icon: Users,
  },
  {
    title: "설정",
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
];

export function Sidebar() {
  const location = useLocation();
  const { data: permissions } = useMemberPermissions();
  
  // 소유자만 멤버 메뉴 표시
  const isOwner = permissions?.role === "OWNER";
  const navItems = allNavItems.filter(
    (item) => item.title !== "멤버" || isOwner
  );

  return (
    <aside className="hidden md:flex w-60 flex-col fixed left-0 top-0 h-screen border-r bg-muted/30">
      <div className="flex h-14 items-center border-b px-6">
        <span className="text-sm font-semibold text-muted-foreground">
          메뉴
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
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

