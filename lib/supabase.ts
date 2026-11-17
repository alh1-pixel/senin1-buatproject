import { createClient } from "@supabase/supabase-js";

// Klien dengan  kunci public (publishable). Aman diaca orang lain
// dan hanya bisa melakukan apa yang bisa diizinkan oleh aturan di database

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_KEY!,
);
