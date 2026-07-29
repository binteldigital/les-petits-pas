import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// On vérifie si les variables d'environnement sont configurées avec de vraies valeurs
const isValidUrl = supabaseUrl && supabaseUrl !== 'https://votre-projet.supabase.co' && supabaseUrl.startsWith('https://');
const isValidKey = supabaseAnonKey && supabaseAnonKey !== 'votre-cle-anon';

export const isSupabaseConfigured = !!(isValidUrl && isValidKey);

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️ Supabase n'est pas configuré ou utilise des valeurs fictives. L'application tourne en mode simulation (mock)."
  );
}

// Initialise le client uniquement si configuré, pour éviter des plantages au démarrage
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null as any;
