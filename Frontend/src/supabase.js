import { createClient } from "@supabase/supabase-js";

// Load from Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Error check to help you debug if variables are missing
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or Key. Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);