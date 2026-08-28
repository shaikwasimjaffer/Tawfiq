import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing VITE_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      // Keep the Supabase session in browser storage
      persistSession: true,

      // Automatically refresh the access token
      autoRefreshToken: true,

      // Important for Google OAuth redirects
      detectSessionInUrl: true,

      // Explicit browser storage
      storage: window.localStorage,
    },
  }
);