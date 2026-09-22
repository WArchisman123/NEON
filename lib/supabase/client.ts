import { createClient } from "@supabase/supabase-js";

export function createBrowserClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://mzumlzmfjgzvycebqask.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key";

  return createClient(supabaseUrl, supabaseAnonKey);
}
