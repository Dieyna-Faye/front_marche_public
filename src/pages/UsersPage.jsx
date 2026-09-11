import { Pencil, Plus, Trash2, UsersRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, Modal } from '../components/ui'
import { useApp } from '../context/useApp'
import { userService } from '../services/userService'
import { formatDate, roleLabels } from '../utils/formatters'

const roleFilters = [
  ['ALL', 'Tous'],
  ['FOURNISSEUR', 'Fournisseurs'],
  ['AUTORITE_CONTRACTANTE', 'Autorité Contractante'],
  ['COMMISSION_EVALUATION', "Commission d’évaluation"],
  ['AUDITEUR', 'Auditeur'],
  ['ADMIN', 'Administrateur'],
]

const initials = (name = '') => name.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase()

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [editing, setEditing] = useState(null)
  const [editRole, setEditRole] = useState('FOURNISSEUR')
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

  const filtered = useMemo(() => users.filter((user) => roleFilter === 'ALL' || user.role === roleFilter), [roleFilter, users])

  const openEdit = (user) => {
    setEditing(user)
    setEditRole(user.role)
  }

  const updateRole = async () => {
    setSaving(true)
    try {
      const updated = await userService.updateRole(editing.id, editRole)
      setUsers((current) => current.map((item) => item.id === editing.id ? updated : item))
      setEditing(null)
      showToast('Rôle mis à jour')
    } catch (requestError) {
      showToast(requestError.message, 'error')
    } finally {
      setSaving(false)
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

  return <div className="admin-users-page">
    <header className="admin-users-head"><div><h1>Gestion des utilisateurs</h1><p>Supervisez et gérez l’ensemble des utilisateurs.</p></div><Link to="/app/utilisateurs/nouveau"><Plus size={13} /> Nouvel utilisateur</Link></header>

    <article className="admin-users-total"><header><span>Utilisateurs</span><UsersRound size={41} /></header><strong>{users.length}</strong><small>Total compté de tous les utilisateurs</small></article>

    <nav className="admin-role-tabs" aria-label="Filtrer les utilisateurs par rôle">{roleFilters.map(([value, label]) => <button className={roleFilter === value ? 'active' : ''} onClick={() => setRoleFilter(value)} type="button" key={value}>{label}<small>{value === 'ALL' ? users.length : users.filter((user) => user.role === value).length}</small></button>)}</nav>

    {loading ? <div className="loading-state"><span className="spinner" /> Chargement des utilisateurs…</div> : error ? <EmptyState icon={UsersRound} title="Utilisateurs indisponibles" description={error} /> : filtered.length === 0 ? <EmptyState icon={UsersRound} title="Aucun utilisateur" description="Aucun compte ne correspond au rôle sélectionné." /> : <div className="admin-user-grid">{filtered.map((user) => <article className="admin-user-card" key={user.id}>
      <header><span>{initials(user.nom)}</span><div><button onClick={() => deactivate(user)} title="Désactiver" type="button"><Trash2 size={15} /></button><button onClick={() => openEdit(user)} title="Modifier le rôle" type="button"><Pencil size={14} /></button></div></header>
      <h2>{user.nom}</h2><p>{user.email}</p><small>{roleLabels[user.role] || user.role}</small><time>Enregistré le {formatDate(user.createdAt)}</time>
    </article>)}</div>}

    <footer className="admin-users-footer">Affichage de 1 à {filtered.length} sur {filtered.length} résultat(s)</footer>

    <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Modifier le rôle" footer={<><button className="btn btn--ghost" onClick={() => setEditing(null)} type="button">Annuler</button><button className="btn btn--primary" disabled={saving} onClick={updateRole} type="button">{saving ? <span className="spinner" /> : 'Enregistrer'}</button></>}>
      {editing && <div className="form"><p><b>{editing.nom}</b><br /><small>{editing.email}</small></p><label>Rôle<select value={editRole} onChange={(event) => setEditRole(event.target.value)}>{roleFilters.filter(([value]) => value !== 'ALL').map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></div>}
    </Modal>
  </div>
}
