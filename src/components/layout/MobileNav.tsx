import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Home, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
    href: "/settings",
    icon: Settings,
    disabled: true,
  },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { data: permissions } = useMemberPermissions();
  
  // 소유자만 멤버 메뉴 표시
  const isOwner = permissions?.role === "OWNER";
  const navItems = allNavItems.filter(
    (item) => item.title !== "멤버" || isOwner
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
          <Menu className="h-5 w-5" />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-0">
        <SheetHeader className="flex h-14 items-center border-b px-6">
          <SheetTitle className="text-sm font-semibold text-muted-foreground">
            메뉴
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
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
        </nav>
      </SheetContent>
    </Sheet>
  );
}

