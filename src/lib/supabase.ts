import { createClient } from '@supabase/supabase-js'

// A URL e a publishable key são identificadores públicos do cliente web.
// A publishable key pode ser distribuída no navegador; a proteção dos dados
// depende das políticas RLS e dos privilégios configurados no Supabase.
// Variáveis de ambiente locais podem substituir estes valores.
const publicProjectUrl = 'https://acqausvydpkvciwmyski.supabase.co'
const publicPublishableKey = 'sb_publishable_EQZEfHhD6J9yD_OB3czuDw_Dtf8ccqD'

const url = import.meta.env.VITE_SUPABASE_URL || publicProjectUrl
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  publicPublishableKey

export const isSupabaseConfigured = Boolean(url && publishableKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, publishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null
