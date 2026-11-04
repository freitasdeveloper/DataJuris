import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

type Area = { id: string; name: string }
type FileRow = { id: string; storage_path: string; original_filename: string; mime_type: string; size_bytes: number }
type Doc = {
  id: string; title: string; slug: string; summary: string; source_name: string | null
  source_url: string | null; license: string | null; version: number; published_at: string | null
  area: { id: string; name: string } | null; type: { name: string } | null; files: FileRow[]
}

export default function LegalLibrary() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [query, setQuery] = useState('')
  const [areaId, setAreaId] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  useEffect(() => {
    let alive = true
    async function load() {
      if (!supabase) { setError('Supabase não está configurado.'); setLoading(false); return }
      setLoading(true); setError('')
      const [areaResult, docResult] = await Promise.all([
        supabase.from('legal_areas').select('id,name').eq('is_active', true).order('sort_order'),
        supabase.from('documents').select('id,title,slug,summary,source_name,source_url,license,version,published_at,area:legal_areas(id,name),type:document_types(name),files:document_files(id,storage_path,original_filename,mime_type,size_bytes)').eq('status','published').order('published_at',{ascending:false})
      ])
      if (!alive) return
      if (areaResult.error) setError(areaResult.error.message)
      else setAreas((areaResult.data ?? []) as Area[])
      if (docResult.error) setError(docResult.error.message)
      else setDocs((docResult.data ?? []) as unknown as Doc[])
      setLoading(false)
    }
    void load()
    return () => { alive = false }
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-BR')
    return docs.filter(doc => (areaId === 'all' || doc.area?.id === areaId) &&
      (!term || [doc.title, doc.summary, doc.area?.name, doc.type?.name, doc.source_name].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR').includes(term)))
  }, [docs, query, areaId])

  async function download(doc: Doc) {
    if (!supabase) return
    const file = doc.files?.[0]
    if (file) {
      setBusyId(doc.id)
      const { data, error: storageError } = await supabase.storage.from('legal-documents').createSignedUrl(file.storage_path, 90)
      setBusyId('')
      if (storageError || !data?.signedUrl) { setError(storageError?.message || 'Não foi possível gerar o link seguro.'); return }
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
      return
    }
    if (doc.source_url) window.open(doc.source_url, '_blank', 'noopener,noreferrer')
    else setError('Este registro ainda não possui arquivo ou fonte externa vinculada.')
  }

  return <section className="live-library">
    <div className="live-library-heading">
      <div><div className="eyebrow dark">ACERVO PUBLICADO</div><h1>Biblioteca jurídica</h1><p>Documentos publicados no DataJuris, organizados por área e tipo.</p></div>
      <div className="live-library-count"><strong>{docs.length}</strong><span>documentos publicados</span></div>
    </div>
    <div className="live-library-filters">
      <input aria-label="Pesquisar documentos" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por título, assunto, fonte ou tipo..." />
      <select aria-label="Filtrar por área" value={areaId} onChange={e=>setAreaId(e.target.value)}>
        <option value="all">Todas as áreas</option>
        {areas.map(area=><option key={area.id} value={area.id}>{area.name}</option>)}
      </select>
    </div>
    {error && <div className="live-library-alert" role="alert">{error}</div>}
    {loading ? <div className="empty-state">Carregando documentos publicados…</div> :
      filtered.length ? <div className="document-grid">{filtered.map(doc=><article className="document-card" key={doc.id}>
        <div className="doc-card-top"><span className="file-type">{doc.files?.[0]?.original_filename.split('.').pop()?.toUpperCase() || 'FONTE'}</span><span className="live-version">v{doc.version}</span></div>
        <div className="doc-category">{doc.area?.name || 'Área não classificada'}</div>
        <h3>{doc.title}</h3><p>{doc.summary || 'Documento disponibilizado na biblioteca DataJuris.'}</p>
        <div className="live-source">{doc.type?.name || 'Documento'}{doc.source_name ? ' · '+doc.source_name : ''}</div>
        <div className="doc-card-bottom"><span>{doc.published_at ? new Date(doc.published_at).toLocaleDateString('pt-BR') : 'Publicado'}</span>
          <button disabled={busyId===doc.id} onClick={()=>void download(doc)}>{busyId===doc.id ? 'Preparando…' : doc.files?.length ? 'Baixar arquivo ↗' : 'Abrir fonte ↗'}</button></div>
      </article>)}</div> :
      <div className="empty-state"><span>⌕</span><h3>{docs.length ? 'Nenhum resultado encontrado' : 'Nenhum documento publicado ainda'}</h3><p>{docs.length ? 'Altere a busca ou o filtro de área.' : 'Os documentos em rascunho e revisão não aparecem nesta biblioteca.'}</p></div>}
    <p className="live-library-disclaimer">Modelos são referências gerais. Confira a legislação, a jurisdição, os prazos e a adequação aos fatos antes de utilizar qualquer documento.</p>
  </section>
}
