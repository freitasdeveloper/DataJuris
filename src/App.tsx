import { useMemo, useState } from 'react'
import { categories, documents } from './data'

const icons = ['▤', '⚖', '⌂', '§', '◇', '▧', '⌘', '◈', '▦', '◉', '▥', '✳']

export default function App() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todas as áreas')
  const [activeTab, setActiveTab] = useState('Explorar')
  const [favorites, setFavorites] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('datajuris:favorites') || '[]') as number[] } catch { return [] }
  })
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const visibleDocuments = useMemo(() => documents.filter((doc) => {
    const matchesCategory = activeCategory === 'Todas as áreas' || doc.area === activeCategory
    const matchesQuery = (doc.title + ' ' + doc.area + ' ' + doc.kind + ' ' + doc.description).toLowerCase().includes(query.toLowerCase())
    const matchesTab = activeTab !== 'Favoritos' || favorites.includes(doc.id)
    return matchesCategory && matchesQuery && matchesTab
  }), [activeCategory, activeTab, favorites, query])

  const selected = documents.find((doc) => doc.id === selectedId)

  function toggleFavorite(id: number) {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id]
    setFavorites(next)
    localStorage.setItem('datajuris:favorites', JSON.stringify(next))
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={() => { setActiveTab('Explorar'); setActiveCategory('Todas as áreas') }}>
          <span className="brand-mark">D</span>
          <span>data<span>juris</span><small>CONHECIMENTO JURÍDICO</small></span>
        </a>
        <nav className="main-nav">
          {['Explorar', 'Biblioteca', 'Comunidade', 'Conteúdos'].map((item) => <button key={item} className={activeTab === item ? 'nav-link active' : 'nav-link'} onClick={() => setActiveTab(item)}>{item}</button>)}
        </nav>
        <div className="top-actions"><button className="login-button" onClick={() => alert('A autenticação será conectada na próxima etapa.')}>Entrar</button><button className="primary-button small" onClick={() => alert('O cadastro será implementado junto ao backend.')}>Criar conta <span>↗</span></button></div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span /> CENTRAL DE CONHECIMENTO JURÍDICO</div>
            <h1>Seu conhecimento.<br /><em>Mais estratégico.</em></h1>
            <p>Encontre referências, organize documentos e ganhe tempo na sua rotina jurídica com uma biblioteca feita para profissionais do Direito.</p>
            <div className="search-box"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busque por documento, assunto ou palavra-chave..." /><kbd>⌘ K</kbd><button onClick={() => setActiveTab('Explorar')}>Buscar</button></div>
            <div className="hero-meta"><span>✓ Pesquisa por assunto</span><span>✓ Modelos organizados</span><span>✓ Acesso simplificado</span></div>
          </div>
          <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="art-card back-card"><span className="mini-label">DOCUMENTO</span><div className="fake-lines"><i /><i /><i /><i /></div></div><div className="art-card front-card"><div className="doc-icon">§</div><span className="mini-label">BIBLIOTECA JURÍDICA</span><strong>Conhecimento<br />em movimento.</strong><div className="fake-lines"><i /><i /><i /></div><div className="card-foot"><span>DATAJURIS</span><b>2026</b></div></div><div className="floating-stamp">DJ<span>+</span></div></div>
        </section>

        <section className="stats-row"><div><strong>12</strong><span>Áreas do Direito</span></div><div><strong>10<span>+</span></strong><span>Modelos demonstrativos</span></div><div><strong>01</strong><span>Biblioteca integrada</span></div><div className="stats-note">Uma base organizada para<br />o trabalho jurídico diário.</div></section>

        <section className="library-section">
          <div className="section-heading"><div><div className="eyebrow dark">BIBLIOTECA DATAJURIS</div><h2>Explore a biblioteca</h2><p>Pesquise por área, tipo de documento ou tema.</p></div><button className="text-button" onClick={() => { setActiveCategory('Todas as áreas'); setActiveTab('Explorar'); setQuery('') }}>Ver todos os documentos <span>→</span></button></div>
          <div className="category-strip"><button className={activeCategory === 'Todas as áreas' ? 'category-chip selected' : 'category-chip'} onClick={() => setActiveCategory('Todas as áreas')}>Todas as áreas</button>{categories.map((category, index) => <button key={category} className={activeCategory === category ? 'category-chip selected' : 'category-chip'} onClick={() => setActiveCategory(category)}><span>{icons[index]}</span>{category.replace('Direito ', '')}</button>)}</div>
          <div className="results-toolbar"><div className="tabs"><button className={activeTab !== 'Favoritos' ? 'tab active' : 'tab'} onClick={() => setActiveTab('Explorar')}>Recentes</button><button className={activeTab === 'Favoritos' ? 'tab active' : 'tab'} onClick={() => setActiveTab('Favoritos')}>Meus favoritos <span>{favorites.length}</span></button></div><span className="result-count">{visibleDocuments.length} resultados</span></div>
          <div className="document-grid">{visibleDocuments.map((doc) => <article className="document-card" key={doc.id}><div className="doc-card-top"><span className="file-type">{doc.format}</span><button className={favorites.includes(doc.id) ? 'favorite active' : 'favorite'} aria-label="Favoritar documento" onClick={() => toggleFavorite(doc.id)}>{favorites.includes(doc.id) ? '♥' : '♡'}</button></div><div className="doc-category">{doc.area}</div><h3>{doc.title}</h3><p>{doc.description}</p><div className="doc-card-bottom"><span>{doc.kind} · {doc.updatedAt}</span><button onClick={() => setSelectedId(doc.id)}>Ver detalhes <span>↗</span></button></div></article>)}</div>
          {visibleDocuments.length === 0 && <div className="empty-state"><span>⌕</span><h3>Nenhum documento encontrado</h3><p>Tente outra palavra-chave ou selecione uma área diferente.</p><button className="text-button" onClick={() => { setQuery(''); setActiveCategory('Todas as áreas'); setActiveTab('Explorar') }}>Limpar filtros</button></div>}
        </section>

        <section className="contribute"><div><div className="eyebrow">CONSTRUÇÃO COLABORATIVA</div><h2>Conhecimento cresce<br />quando é compartilhado.</h2><p>Em breve, você poderá enviar materiais, colaborar com a comunidade e acompanhar suas contribuições em um só lugar.</p></div><button className="light-button" onClick={() => alert('O fluxo de contribuições será ativado após a implementação de login e moderação.')}>Conheça a área de contribuição <span>→</span></button></section>
      </main>

      <footer><a className="brand footer-brand" href="#"><span className="brand-mark">D</span><span>data<span>juris</span><small>CONHECIMENTO JURÍDICO</small></span></a><p>Plataforma independente de organização e pesquisa jurídica.</p><span>© 2026 DataJuris · Protótipo em desenvolvimento</span></footer>

      {selected && <div className="modal-backdrop" onClick={() => setSelectedId(null)}><section className="detail-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelectedId(null)}>×</button><span className="file-type">{selected.format}</span><div className="doc-category">{selected.area}</div><h2>{selected.title}</h2><p>{selected.description}</p><div className="detail-meta"><span>Tipo: {selected.kind}</span><span>Atualizado: {selected.updatedAt}</span><span>{selected.downloads.toLocaleString('pt-BR')} acessos demonstrativos</span></div><div className="notice">Este é um registro demonstrativo. O arquivo original, download e revisão jurídica serão conectados ao backend após a implementação do repositório de documentos.</div><button className="primary-button" onClick={() => toggleFavorite(selected.id)}>{favorites.includes(selected.id) ? 'Remover dos favoritos' : 'Salvar nos favoritos'}</button></section></div>}
    </div>
  )
}
