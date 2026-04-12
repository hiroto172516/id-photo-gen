import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

declare global {
  var __supabaseBrowserClient__: SupabaseClient | undefined;
  interface Window {
    __mockSupabaseSession?: Pick<Session, "access_token" | "token_type"> | null;
  }
}

export function isSupabaseBrowserConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getSupabaseBrowserClient() {
  if (!isSupabaseBrowserConfigured()) {
    return null;
  }

  if (globalThis.__supabaseBrowserClient__) {
    return globalThis.__supabaseBrowserClient__;
  }

  globalThis.__supabaseBrowserClient__ = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    },
  );

  const originalGetSession =
    globalThis.__supabaseBrowserClient__.auth.getSession.bind(globalThis.__supabaseBrowserClient__.auth);

  globalThis.__supabaseBrowserClient__.auth.getSession = (async () => {
    if (typeof window !== "undefined" && "__mockSupabaseSession" in window) {
      if (window.__mockSupabaseSession) {
        return {
          data: {
            session: {
              access_token: window.__mockSupabaseSession.access_token,
              token_type: window.__mockSupabaseSession.token_type ?? "bearer",
            } as Session,
          },
          error: null,
        };
      }

      return {
        data: {
          session: null,
        },
        error: null,
      };
    }

    return originalGetSession();
  }) as typeof globalThis.__supabaseBrowserClient__.auth.getSession;

  return globalThis.__supabaseBrowserClient__;
}
