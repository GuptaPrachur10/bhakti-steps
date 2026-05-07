import { createClient } from '@supabase/supabase-js';

// We handle missing environment variables gracefully to avoid crashes during development preview
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey);
