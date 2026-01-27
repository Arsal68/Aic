import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ykitnocbijsdxxydnjwh.supabase.co"; // from Supabase project settings
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraXRub2NiaWpzZHh4eWRuandoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTMzNDcsImV4cCI6MjA4NTA4OTM0N30.9zQ7wLfHggRt5YWUETMpjnwvj_9y0mro4zQTMvv1dPg"; // from Supabase project settings

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
