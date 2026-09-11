import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthVisual from '../components/AuthVisual'
import { useApp } from '../context/useApp'

export default function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, login } = useApp()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (isAuthenticated) navigate('/app', { replace: true }) }, [isAuthenticated, navigate])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email: email.trim(), motDePasse: password })
      navigate(location.state?.from?.pathname || '/app', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return <main className="auth-screen">
    <AuthVisual />
    <section className="auth-card-wrap"><div className="auth-card">
      <header><h2>Ravi de vous revoir !</h2><p>Connectez-vous pour avoir accès à votre espace utilisateur</p></header>
      {location.state?.registered && <p className="auth-success">Votre compte a été créé. Vous pouvez maintenant vous connecter.</p>}
      <form onSubmit={submit}>
        <label>Adresse E-mail<div className="auth-input"><Mail size={15}/><input autoComplete="email" onChange={(event)=>setEmail(event.target.value)} placeholder="exemple@gmail.com" required type="email" value={email}/></div></label>
        <label>Mot de passe<div className="auth-input"><LockKeyhole size={15}/><input autoComplete="current-password" minLength="6" onChange={(event)=>setPassword(event.target.value)} placeholder="••••••••" required type={showPassword?'text':'password'} value={password}/><button aria-label={showPassword?'Masquer le mot de passe':'Afficher le mot de passe'} onClick={()=>setShowPassword(!showPassword)} type="button">{showPassword?<EyeOff size={15}/>:<Eye size={15}/>}</button></div></label>
        <div className="auth-between"><label><input type="checkbox"/> Se souvenir de moi</label><a href="#mot-de-passe-oublie">Mot de passe oublié ?</a></div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" disabled={loading} type="submit">{loading?<span className="spinner"/>:'Se connecter'}</button>
      </form>
      <p className="auth-switch">Vous n’avez pas de compte ? <Link to="/inscription">Inscrivez-vous</Link></p>
    </div></section>
  </main>
}
