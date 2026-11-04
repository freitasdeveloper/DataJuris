import { useMemo, useState } from 'react'

type StudyNote = {
  id: number
  title: string
  area: string
  content: string
  updatedAt: string
}

const STORAGE_KEY = 'datajuris:study-notes'
const areas = [
  'Direito Civil', 'Direito Trabalhista', 'Direito Penal', 'Direito de Família',
  'Direito do Consumidor', 'Direito Contratual', 'Direito Empresarial',
  'Direito Previdenciário', 'Direito Imobiliário', 'Direito Tributário',
  'Direito Administrativo', 'Direito Ambiental', 'Outros',
]

function loadNotes(): StudyNote[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value ? JSON.parse(value) as StudyNote[] : []
  } catch {
    return []
  }
}

export default function StudyNotebook() {
  const [notes, setNotes] = useState<StudyNote[]>(loadNotes)
  const [search, setSearch] = useState('')
  const [title, setTitle] = useState('')
  const [area, setArea] = useState(areas[0])
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  const filteredNotes = useMemo(() => notes.filter((note) =>
    (note.title + ' ' + note.area + ' ' + note.content).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))
  ), [notes, search])

  function persist(next: StudyNote[]) {
    setNotes(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      window.alert('Não foi possível salvar. Verifique o espaço disponível no navegador.')
    }
  }

  function resetForm() {
    setTitle('')
    setArea(areas[0])
    setContent('')
    setEditingId(null)
  }

  function saveNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanTitle = title.trim()
    const cleanContent = content.trim()
    if (!cleanTitle || !cleanContent) return

    if (editingId !== null) {
      persist(notes.map((note) => note.id === editingId
        ? { ...note, title: cleanTitle, area, content: cleanContent, updatedAt: new Date().toLocaleString('pt-BR') }
        : note))
    } else {
      persist([{ id: Date.now(), title: cleanTitle, area, content: cleanContent, updatedAt: new Date().toLocaleString('pt-BR') }, ...notes])
    }
    resetForm()
  }

  function editNote(note: StudyNote) {
    setEditingId(note.id)
    setTitle(note.title)
    setArea(note.area)
    setContent(note.content)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function deleteNote(id: number) {
    if (window.confirm('Excluir esta anotação? Esta ação não pode ser desfeita.')) {
      persist(notes.filter((note) => note.id !== id))
      if (editingId === id) resetForm()
    }
  }

  return (
    <section className="notebook-section">
      <div className="notebook-heading">
        <div>
          <div className="eyebrow dark">ÁREA PESSOAL DE ESTUDOS</div>
          <h2>Meu caderno</h2>
          <p>Organize resumos, ideias, referências e pontos importantes da sua rotina jurídica.</p>
        </div>
        <span className="local-pill">● Salvo neste navegador</span>
      </div>

      <div className="notebook-layout">
        <form className="note-editor" onSubmit={saveNote}>
          <div className="note-editor-heading">
            <strong>{editingId === null ? 'Nova anotação' : 'Editar anotação'}</strong>
            <span>{editingId === null ? 'Registre o que merece ser lembrado.' : 'Altere os campos e salve.'}</span>
          </div>
          <label htmlFor="note-title">Título</label>
          <input id="note-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Requisitos da responsabilidade civil" maxLength={120} required />
          <label htmlFor="note-area">Área do Direito</label>
          <select id="note-area" value={area} onChange={(event) => setArea(event.target.value)}>
            {areas.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <label htmlFor="note-content">Anotação</label>
          <textarea id="note-content" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Escreva seu resumo, dúvidas, referências ou tópicos para revisar..." rows={8} maxLength={12000} required />
          <div className="note-editor-actions">
            {editingId !== null && <button type="button" className="note-cancel" onClick={resetForm}>Cancelar</button>}
            <button className="primary-button" type="submit">{editingId === null ? 'Salvar anotação' : 'Atualizar anotação'}</button>
          </div>
        </form>

        <div className="notes-list">
          <div className="notes-list-heading">
            <div><strong>Suas anotações</strong><span>{notes.length} {notes.length === 1 ? 'registro' : 'registros'}</span></div>
            <input aria-label="Pesquisar anotações" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar no caderno..." />
          </div>
          {filteredNotes.length === 0 ? (
            <div className="notes-empty">
              <span>✎</span>
              <strong>{notes.length === 0 ? 'Seu caderno está vazio' : 'Nenhuma anotação encontrada'}</strong>
              <p>{notes.length === 0 ? 'Crie sua primeira anotação usando o formulário ao lado.' : 'Tente outra palavra ou expressão.'}</p>
            </div>
          ) : filteredNotes.map((note) => (
            <article className="note-card" key={note.id}>
              <div className="note-card-meta"><span>{note.area}</span><time>{note.updatedAt}</time></div>
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <div className="note-card-actions">
                <button type="button" onClick={() => editNote(note)}>Editar</button>
                <button type="button" onClick={() => deleteNote(note.id)}>Excluir</button>
              </div>
            </article>
          ))}
        </div>
      </div>
      <p className="notebook-disclaimer">As anotações são armazenadas somente no armazenamento local deste navegador. Limpar os dados do navegador pode apagá-las. Não inclua dados pessoais ou informações sigilosas de clientes ou processos.</p>
    </section>
  )
}
