import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";

export function AuthFooter() {
  return (
    <footer className="border-t bg-muted/30 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to={ROUTES.TERMS}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              이용약관
            </Link>
            <Link
              to={ROUTES.PRIVACY}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              개인정보처리방침
            </Link>
            <Link
              to={ROUTES.REFUND}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              환불정책
            </Link>
            <Link
              to={ROUTES.SUBSCRIPTION}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              가격
            </Link>
          </div>
          <div className="text-center sm:text-right">
            <p>© {new Date().getFullYear()} Verbsync. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

