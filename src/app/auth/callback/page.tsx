import { Suspense } from "react";
import { AuthCallbackStatus } from "@/components/AuthCallbackStatus";

export default function AuthCallbackPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef2ff_0%,#ffffff_40%,#f8fafc_100%)] px-4 py-12 sm:px-6 sm:py-16">
      <Suspense fallback={null}>
        <AuthCallbackStatus />
      </Suspense>
    </main>
  );
}
