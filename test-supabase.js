import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConnection() {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) {
        console.error('Error connecting to Supabase:', error.message);
    } else {
        console.log('Successfully connected to Supabase!', data);
    }
}

checkConnection();
