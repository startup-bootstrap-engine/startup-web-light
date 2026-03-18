import { createClient } from '@supabase/supabase-js';
import { loadEnv } from '../../config/env';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = loadEnv();

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
