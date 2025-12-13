import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tisocbbvzqkxcauutaiw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpc29jYmJ2enFreGNhdXV0YWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzE0NDAsImV4cCI6MjA4MTA0NzQ0MH0.mmVZXUizxqq278wto1wX90da_Xenug04f5uwh4jX74k';

export const supabase = createClient(supabaseUrl, supabaseKey);
