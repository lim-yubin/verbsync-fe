import { RegisterForm } from "@/components/auth/RegisterForm";

export function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Verbasync
            </h1>
          </a>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}

