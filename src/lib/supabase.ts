import { createClient } from '@supabase/supabase-js'

// A URL e a publishable key são públicas. A segurança dos dados depende
// das políticas RLS e dos privilégios configurados no Supabase.
// A chave deve ser a publishable key do projeto atualmente selecionado.
const publicProjectUrl = 'https://tlpbmatbkdphpvnkprxn.supabase.co'

const url = import.meta.env.VITE_SUPABASE_URL || publicProjectUrl
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_AgFMerfqNtbucpqQBCZBYg_z8WewqKI'

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
