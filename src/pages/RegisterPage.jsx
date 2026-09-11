import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthVisual from '../components/AuthVisual'
import { authService } from '../services/authService'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (key) => (event) => setForm((current)=>({ ...current, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    setLoading(true)
    try {
      await authService.register({ nom: `${form.prenom.trim()} ${form.nom.trim()}`.trim(), email: form.email.trim(), motDePasse: form.password })
      navigate('/connexion', { replace: true, state: { email: form.email.trim(), registered: true } })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return <main className="auth-screen">
    <AuthVisual />
    <section className="auth-card-wrap"><div className="auth-card auth-card--register">
      <header><h2>Bienvenue</h2><p>Inscrivez-vous pour avoir accès à votre espace utilisateur</p></header>
      <form onSubmit={submit}>
        <div className="auth-name-row"><label>Nom<div className="auth-input"><UserRound size={15}/><input autoComplete="family-name" onChange={set('nom')} placeholder="Votre nom" required value={form.nom}/></div></label><label>Prénom<div className="auth-input"><UserRound size={15}/><input autoComplete="given-name" onChange={set('prenom')} placeholder="Votre prénom" required value={form.prenom}/></div></label></div>
        <label>Adresse E-mail<div className="auth-input"><Mail size={15}/><input autoComplete="email" onChange={set('email')} placeholder="exemple@gmail.com" required type="email" value={form.email}/></div></label>
        <label>Mot de passe<div className="auth-input"><LockKeyhole size={15}/><input autoComplete="new-password" minLength="6" onChange={set('password')} placeholder="••••••••" required type={showPassword?'text':'password'} value={form.password}/><button aria-label={showPassword?'Masquer le mot de passe':'Afficher le mot de passe'} onClick={()=>setShowPassword(!showPassword)} type="button">{showPassword?<EyeOff size={15}/>:<Eye size={15}/>}</button></div></label>
        <label>Confirmer le mot de passe<div className="auth-input"><LockKeyhole size={15}/><input autoComplete="new-password" minLength="6" onChange={set('confirm')} placeholder="••••••••" required type={showPassword?'text':'password'} value={form.confirm}/></div></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" disabled={loading} type="submit">{loading?<span className="spinner"/>:"S’inscrire"}</button>
      </form>
      <p className="auth-switch">Vous avez un compte ? <Link to="/connexion">Connectez-vous</Link></p>
    </div></section>
  </main>
}
