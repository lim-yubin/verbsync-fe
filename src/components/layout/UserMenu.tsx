import { LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate(ROUTES.LOGIN);
      },
    });
  };

  // 유저 이름의 첫 글자 (Avatar Fallback)
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full cursor-pointer">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-muted text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(ROUTES.SETTINGS)} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>{t("nav.settings")}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={isPending} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isPending ? t("auth.loggingOut") : t("auth.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

