import { useTranslation } from "react-i18next";
import { Link, useLocation, useParams } from "react-router-dom";
import { Home, Globe, Languages, Settings, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface NavItem {
  titleKey: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
}

export function ProjectSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { id: projectId } = useParams<{ id: string }>();

  if (!projectId) return null;

  const navItems: NavItem[] = [
    {
      titleKey: "project.overview",
      href: ROUTES.PROJECT_DETAIL(projectId),
      icon: Home,
    },
    {
      titleKey: "project.locales",
      href: ROUTES.PROJECT_LOCALES(projectId),
      icon: Globe,
    },
    {
      titleKey: "project.translations",
      href: ROUTES.PROJECT_TRANSLATIONS(projectId),
      icon: Languages,
    },
    {
      titleKey: "project.settings",
      href: ROUTES.PROJECT_SETTINGS(projectId),
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden md:flex w-60 flex-col fixed left-0 top-0 h-screen border-r bg-muted/30">
      {/* Header */}
      <div className="flex h-14 items-center border-b px-4 gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-muted-foreground">
          {t("project.title")}
        </span>
      </div>

      {/* Nav */}
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

