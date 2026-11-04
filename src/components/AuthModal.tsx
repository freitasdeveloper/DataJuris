import { useState } from 'react'
import { signIn, signUp } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'

type Props = { mode: 'login' | 'signup'; onClose: () => void }

export default function AuthModal({ mode: initialMode, onClose }: Props) {
  const [mode, setMode] = useState(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      if (mode === 'signup') {
        const result = await signUp(email, password, name)
        setMessage(result.session ? 'Conta criada e conectada.' : 'Cadastro recebido. Verifique seu e-mail para confirmar a conta.')
      } else {
        await signIn(email, password)
        onClose()
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível concluir a operação.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="modal-backdrop" onClick={onClose}>
    <section className="detail-modal auth-modal" onClick={(event) => event.stopPropagation()}>
      <button className="modal-close" onClick={onClose} aria-label="Fechar">×</button>
      <span className="file-type">ÁREA DO USUÁRIO</span>
      <h2>{mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}</h2>
      <p>{mode === 'login' ? 'Entre para acessar seus recursos pessoais.' : 'Cadastre-se para salvar materiais e acompanhar suas contribuições.'}</p>
      {!isSupabaseConfigured && <div className="notice">Autenticação indisponível no modo demonstração. Configure as variáveis do Supabase para ativar este recurso.</div>}
      <form onSubmit={submit} className="auth-form">
        {mode === 'signup' && <label>Nome completo<input required minLength={3} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>}
        <label>E-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
        <label>Senha<input required type="password" minLength={mode === 'signup' ? 12 : 1} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />{mode === 'signup' && <small>Use pelo menos 12 caracteres.</small>}</label>
        {message && <div className="notice" role="status">{message}</div>}
        <button className="primary-button" type="submit" disabled={busy || !isSupabaseConfigured}>{busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
      </form>
      <button className="text-button auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage('') }}>{mode === 'login' ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}</button>
    </section>
  </div>
}
