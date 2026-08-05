// supabase-init.js - Khởi tạo Supabase Client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ohmwphdeeldmlxuuknny.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DgxnOXel9t7woqYrfInl5Q_YogcW--c';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Quan trọng nhất: Gán ra window để db.js nhận diện được
window.supabaseClient = supabase;
window.supabase = supabase;