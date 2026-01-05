import { createClient } from '@supabase/supabase-js';

// В Vite переменные лежат в import.meta.env и должны начинаться с VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
