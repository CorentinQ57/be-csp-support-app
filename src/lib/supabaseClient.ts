import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jylujjeapocdpvzulamm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bHVqamVhcG9jZHB2enVsYW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NzY3OTEsImV4cCI6MjA2MTQ1Mjc5MX0.8jWUC3lJU-rQIHiR9L_SwCypnIjBzWOBqQuvJS6IUSg';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
