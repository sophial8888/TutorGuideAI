import { createClient } from "@supabase/supabase-js";

// Same Supabase project as the chatbot app (frontend/), so accounts created here
// are the same accounts people sign in with on the chatbot.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
