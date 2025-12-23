import { RegisterForm } from "@/components/auth/RegisterForm";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { AuthHero } from "@/components/auth/AuthHero";
import { Logo } from "@/components/ui/Logo";
import { AuthFooter } from "@/components/layout/AuthFooter";

export function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        {/* Left Side - Service Introduction */}
        <div className="hidden lg:flex lg:w-1/2 border-r bg-muted/30">
          <AuthHero />
        </div>

        {/* Right Side - Register Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center">
              <a
                href="/"
                className="inline-flex items-center gap-2 justify-center"
              >
                <Logo width={32} height={32} />
                <h1 className="text-2xl font-bold text-foreground">Verbsync</h1>
              </a>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                회원가입
              </h2>
              <p className="text-muted-foreground">
                새로운 계정을 만들어 시작하세요
              </p>
            </div>

            <RegisterForm />
          </div>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}
