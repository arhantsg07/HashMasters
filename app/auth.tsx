import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://jzufaedxpawkaggwonkr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6dWZhZWR4cGF3a2FnZ3dvbmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMDg0NjcsImV4cCI6MjA2OTY4NDQ2N30.6fm0tMyRk8yx68h40zgY0usu7QDNtIgcyz-nQBMTQhI';
export const supabase = createClient(supabaseUrl, supabaseKey)