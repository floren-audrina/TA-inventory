// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(url, key);

// Export the Supabase client
export default supabase;