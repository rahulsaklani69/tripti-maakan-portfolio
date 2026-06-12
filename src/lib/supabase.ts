import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials are missing from environment variables.");
}

declare global {
  var supabase: SupabaseClient | undefined;
}

// Implement standard Next.js singleton pattern using createBrowserClient
export const supabase =
  globalThis.supabase || createBrowserClient(supabaseUrl, supabaseAnonKey);

if (process.env.NODE_ENV !== "production") {
  globalThis.supabase = supabase;
}
