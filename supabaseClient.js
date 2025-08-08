import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Renseignez ces variables avec vos identifiants Supabase
const SUPABASE_URL = 'https://vgvzgxzhuoyuyuofnvjg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndnpneHpodW95dXl1b2ZudmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTYyNjIsImV4cCI6MjA3MDIzMjI2Mn0.PHeirsiHoyOfhIBn3nHzeKV7flQu5ZXEYNQxrzI0f0I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
