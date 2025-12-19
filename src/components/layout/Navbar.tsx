import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { MobileNav } from "./MobileNav";
import { Logo } from "@/components/ui/Logo";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-6 gap-4">
        {/* Mobile Menu */}
        <MobileNav />

        {/* Logo & Brand */}
        <Link
          to={ROUTES.DASHBOARD}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <Logo width={24} height={24} className="shrink-0" />
          <span className="hidden font-semibold sm:inline-block">
            Verbasync
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex flex-1 items-center justify-end">
          {/* Right Side Actions */}
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
  );
}

