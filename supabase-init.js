import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ohmwphdeeldmlxuuknny.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DgxnOXel9t7woqYrfInl5Q_YogcW--c';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true // Quan trọng để bắt token trên URL trả về từ Google
    }
});

window.supabaseClient = supabase;
window.supabase = supabase;