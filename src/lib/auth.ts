import { supabase } from './supabase'

export async function signUp(email: string, password: string, fullName: string) {
  if (!supabase) throw new Error('Configure o Supabase antes de habilitar o cadastro.')
  if (password.length < 12) throw new Error('Use uma senha com pelo menos 12 caracteres.')
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { full_name: fullName.trim() } },
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Configure o Supabase antes de habilitar o login.')
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
