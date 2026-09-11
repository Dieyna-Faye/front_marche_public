import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { userService } from '../services/userService'
import { roleLabels } from '../utils/formatters'

const initialForm = { nom: '', prenom: '', email: '', role: 'FOURNISSEUR', motDePasse: '', confirmation: '' }

export default function CreateUserPage() {
  const [form, setForm] = useState(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { showToast } = useApp()
  const navigate = useNavigate()
  const set = (key) => (event) => setForm((current)=>({ ...current, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (form.motDePasse !== form.confirmation) { setError('Les mots de passe ne correspondent pas.'); return }
    setSaving(true)
    try {
      await userService.create({ nom: `${form.prenom.trim()} ${form.nom.trim()}`.trim(), email: form.email.trim(), role: form.role, motDePasse: form.motDePasse })
      showToast('Utilisateur créé')
      navigate('/app/utilisateurs')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return <div className="admin-create-user">
    <Link className="admin-breadcrumb" to="/app/utilisateurs"><ArrowLeft size={14}/> Utilisateurs / <b>Nouvel utilisateur</b></Link>
    <header><h1>Créer un nouvel utilisateur</h1></header>
    <form onSubmit={submit}>
      <section><h2>Informations Personnelles</h2><div className="admin-user-fields">
        <label>Nom<div><UserRound size={15}/><input onChange={set('nom')} placeholder="Votre nom" required value={form.nom}/></div></label>
        <label>Prénom<div><UserRound size={15}/><input onChange={set('prenom')} placeholder="Votre prénom" required value={form.prenom}/></div></label>
        <label>Adresse E-mail<div><Mail size={15}/><input onChange={set('email')} placeholder="exemple@gmail.com" required type="email" value={form.email}/></div></label>
        <label>Rôle<select onChange={set('role')} value={form.role}>{Object.entries(roleLabels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
      </div></section>
      <section><h2>Créer un mot de passe</h2><div className="admin-user-fields">
        <label>Mot de passe<div><LockKeyhole size={15}/><input minLength="6" onChange={set('motDePasse')} placeholder="••••••••" required type={showPassword?'text':'password'} value={form.motDePasse}/><button onClick={()=>setShowPassword(!showPassword)} type="button">{showPassword?<EyeOff size={15}/>:<Eye size={15}/>}</button></div></label>
        <label>Confirmer le mot de passe<div><LockKeyhole size={15}/><input minLength="6" onChange={set('confirmation')} placeholder="••••••••" required type={showPassword?'text':'password'} value={form.confirmation}/></div></label>
      </div></section>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="admin-create-user__submit" disabled={saving} type="submit">{saving?<span className="spinner"/>:"Inviter l’utilisateur"}</button>
    </form>
  </div>
}
