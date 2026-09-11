import { KeyRound, Plus, ShieldCheck, UserX, UsersRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, EmptyState, Modal, PageHeader, SearchFilter, StatCard } from '../components/ui'
import { useApp } from '../context/useApp'
import { userService } from '../services/userService'
import { roleLabels } from '../utils/formatters'

const roles = Object.entries(roleLabels)
const initialForm = { nom: '', email: '', motDePasse: '', role: 'FOURNISSEUR' }

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { showToast } = useApp()

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setUsers(await userService.list())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => users.filter((user) =>
    `${user.nom} ${user.email}`.toLowerCase().includes(search.toLowerCase()),
  ), [search, users])

  const createUser = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const created = await userService.create(form)
      setUsers((current) => [created, ...current])
      setForm(initialForm)
      setModalOpen(false)
      showToast('Utilisateur créé')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const updateRole = async (user, role) => {
    try {
      const updated = await userService.updateRole(user.id, role)
      setUsers((current) => current.map((item) => item.id === user.id ? updated : item))
      showToast('Rôle mis à jour')
    } catch (requestError) {
      showToast(requestError.message, 'error')
    }
  }

  const deactivate = async (user) => {
    if (!window.confirm(`Désactiver le compte de ${user.nom} ?`)) return
    try {
      await userService.deactivate(user.id)
      setUsers((current) => current.filter((item) => item.id !== user.id))
      showToast('Utilisateur désactivé')
    } catch (requestError) {
      showToast(requestError.message, 'error')
    }
  }

  return (
    <>
      <PageHeader eyebrow="ADMINISTRATION" title="Utilisateurs & rôles" description="Gérez les comptes et les cinq rôles définis par le backend." actions={<Link className="btn btn--primary" to="/app/utilisateurs/nouveau"><Plus size={17} /> Créer un utilisateur</Link>} />
      <div className="stats-grid stats-grid--three"><StatCard icon={UsersRound} label="Utilisateurs" value={users.length} helper="comptes retournés par l’API" tone="navy" /><StatCard icon={KeyRound} label="Rôles configurés" value={roles.length} helper="rôles backend" tone="orange" /><StatCard icon={ShieldCheck} label="Accès" value="JWT" helper="routes protégées" tone="green" /></div>
      <div className="list-toolbar"><SearchFilter value={search} onChange={setSearch} placeholder="Rechercher par nom ou adresse e-mail…" /></div>
      {loading ? <div className="loading-state"><span className="spinner" /> Chargement des utilisateurs…</div> : error && !modalOpen ? <EmptyState icon={UsersRound} title="Utilisateurs indisponibles" description={error} /> : <div className="table-card"><table><thead><tr><th>Utilisateur</th><th>Rôle</th><th>Statut</th><th>Modifier le rôle</th><th /></tr></thead><tbody>{filtered.map((user) => <tr key={user.id}><td><div className="identity-cell"><span>{user.nom.split(' ').map((word) => word[0]).slice(0, 2).join('')}</span><p><b>{user.nom}</b><small>{user.email}</small></p></div></td><td><Badge tone="blue">{roleLabels[user.role] || user.role}</Badge></td><td><Badge tone="green" dot>Actif</Badge></td><td><select className="small-select" value={user.role} onChange={(event) => updateRole(user, event.target.value)}>{roles.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></td><td><button className="icon-button" onClick={() => deactivate(user)} type="button" aria-label={`Désactiver ${user.nom}`}><UserX size={17} /></button></td></tr>)}</tbody></table></div>}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Créer un utilisateur" footer={<><button className="btn btn--ghost" onClick={() => setModalOpen(false)} type="button">Annuler</button><button className="btn btn--primary" disabled={saving} form="create-user-form" type="submit">{saving ? <span className="spinner" /> : 'Créer le compte'}</button></>}>
        <form className="form" id="create-user-form" onSubmit={createUser}>
          <label>Nom complet<input value={form.nom} onChange={(event) => setForm({ ...form, nom: event.target.value })} required /></label>
          <label>Adresse e-mail<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
          <label>Mot de passe initial<input type="password" minLength="6" value={form.motDePasse} onChange={(event) => setForm({ ...form, motDePasse: event.target.value })} required /></label>
          <label>Rôle<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>{roles.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          {error && <p className="form-error" role="alert">{error}</p>}
        </form>
      </Modal>
    </>
  )
}
