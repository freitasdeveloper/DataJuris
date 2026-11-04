import { supabase, isSupabaseConfigured } from './supabase'

export type LibraryDocument = {
  id: string
  title: string
  slug: string
  summary: string
  status: string
  published_at: string | null
  area: { name: string } | null
  type: { name: string } | null
}

export async function searchPublishedDocuments(search = '', areaId?: string) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Banco de dados não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
  }

  let request = supabase
    .from('documents')
    .select('id,title,slug,summary,status,published_at,area:legal_areas(name),type:document_types(name)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (search.trim()) request = request.textSearch('title', search.trim(), { type: 'websearch', config: 'portuguese' })
  if (areaId) request = request.eq('area_id', areaId)

  const { data, error } = await request
  if (error) throw error
  return (data ?? []) as unknown as LibraryDocument[]
}

export async function toggleFavorite(documentId: string, userId: string) {
  if (!supabase) throw new Error('Banco de dados não configurado.')
  const { data: existing, error: readError } = await supabase
    .from('favorites').select('document_id').eq('user_id', userId).eq('document_id', documentId).maybeSingle()
  if (readError) throw readError

  if (existing) {
    const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('document_id', documentId)
    if (error) throw error
    return false
  }
  const { error } = await supabase.from('favorites').insert({ user_id: userId, document_id: documentId })
  if (error) throw error
  return true
}
