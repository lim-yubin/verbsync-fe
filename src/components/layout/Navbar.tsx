import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-6">
        {/* Logo & Brand */}
        <Link
          to={ROUTES.DASHBOARD}
          className="mr-6 flex items-center space-x-2"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background">
            <span className="text-sm font-bold">V</span>
          </div>
          <span className="hidden font-semibold sm:inline-block">
            Verbasync
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none"></div>

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

