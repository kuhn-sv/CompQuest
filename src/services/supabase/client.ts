import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are provided
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Non-fatal console warning to help local setup
  console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Please set them in your .env.local');
}

export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? ''
);

export default supabase;
