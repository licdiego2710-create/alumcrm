// =====================================================
//  AlumCRM — Supabase Client
//  Lee credenciales de window.SUPABASE_URL / SUPABASE_KEY
//  (inyectadas por config.js en local o por Netlify en prod)
// =====================================================

// Importar Supabase desde CDN (cargado en index.html)
// Las credenciales vienen de config.js

let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.error('⚠️ Supabase credentials not found. Add config.js with SUPABASE_URL and SUPABASE_ANON_KEY.');
    return null;
  }
  _supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  return _supabase;
}
