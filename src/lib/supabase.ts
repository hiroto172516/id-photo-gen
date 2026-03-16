import { createClient, type SupabaseClient } from "@supabase/supabase-js";

declare global {
  var __supabaseBrowserClient__: SupabaseClient | undefined;
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

  return globalThis.__supabaseBrowserClient__;
}
