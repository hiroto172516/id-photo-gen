import { AuthScreen } from "@/components/AuthScreen";

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_45%,#f8fafc_100%)] px-4 py-12 text-slate-950 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <AuthScreen />
      </div>
    </main>
  );
}
