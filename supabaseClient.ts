
import { createClient } from '@supabase/supabase-js';

// Используем переменные окружения для безопасности. 
// Предполагаем, что они передаются в процесс выполнения.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
