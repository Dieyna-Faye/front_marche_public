import { LockKeyhole, Save, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { EmptyState } from '../components/ui'
import { useApp } from '../context/useApp'
import { userService } from '../services/userService'

const permissionLabels = {
  'users:manage': 'Gérer les utilisateurs',
  'roles:manage': 'Gérer les rôles et permissions',
  'tenders:manage': 'Créer et modifier les appels d’offres',
  'tenders:publish': 'Publier les appels d’offres',
  'tenders:view': 'Consulter les appels d’offres',
  'bids:submit': 'Déposer des offres',
  'bids:view': 'Consulter les offres',
  'bids:analyze': 'Analyser les offres et recalculer le score',
  'evaluations:manage': 'Examiner les pièces et noter les offres',
  'scores:view': 'Consulter les scores',
  'contracts:manage': 'Attribuer et suivre les contrats',
  'contracts:view': 'Consulter ses contrats accessibles',
  'dashboard:view': 'Consulter le tableau de bord',
  'alerts:manage': 'Analyser et traiter les alertes de risque',
  'audit:view': 'Consulter le journal d’audit',
}
const roleLabels = { admin: 'Administrateur', authority: 'Autorité contractante', supplier: 'Fournisseur', commission: 'Commission d’évaluation', auditor: 'Auditeur' }

export default function RolesPage() {
  const { showToast } = useApp()
  const [roles, setRoles] = useState([])
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    userService.listRoles().then((items) => {
      if (!active) return
      setRoles(items)
      setDrafts(Object.fromEntries(items.map((role) => [role.id, role.permissions])))
    }).catch((requestError) => { if (active) setError(requestError.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const toggle = (role, permission) => setDrafts((current) => {
    const existing = current[role.id] || []
    return { ...current, [role.id]: existing.includes(permission) ? existing.filter((item) => item !== permission) : [...existing, permission] }
  })
  const save = async (role) => {
    setSaving(role.id); setError('')
    try {
      const updated = await userService.updatePermissions(role.id, drafts[role.id] || [])
      setRoles((current) => current.map((item) => item.id === role.id ? updated : item))
      setDrafts((current) => ({ ...current, [role.id]: updated.permissions }))
      showToast(`Permissions du rôle « ${roleLabels[role.name] || role.label} » enregistrées`)
    } catch (requestError) { setError(requestError.message) }
    finally { setSaving('') }
  }

  return <div className="admin-users-page">
    <header className="admin-users-head"><div><h1>Rôles et permissions</h1><p>Contrôlez les actions accessibles à chaque profil de la plateforme.</p></div><ShieldCheck size={25} /></header>
    {error && <p className="authority-inline-error" role="alert">{error}</p>}
    {loading ? <div className="loading-state"><span className="spinner" /> Chargement des permissions…</div> : roles.length === 0 ? <EmptyState icon={ShieldCheck} title="Aucun rôle disponible" description="La configuration des rôles n’a pas été retournée par l’API." /> : <div className="admin-role-permission-grid">{roles.map((role) => {
      const current = drafts[role.id] || []
      const locked = role.name === 'admin'
      const changed = JSON.stringify([...current].sort()) !== JSON.stringify([...role.permissions].sort())
      return <article className="admin-role-permission-card" key={role.id}>
        <header><div><span><ShieldCheck size={17} /></span><p><b>{roleLabels[role.name] || role.label}</b><small>{role.name}</small></p></div>{locked && <LockKeyhole size={15} aria-label="Rôle protégé" />}</header>
        <div>{Object.entries(permissionLabels).map(([permission, label]) => { const requiredRole = permission === 'evaluations:manage' ? 'commission' : ['tenders:publish', 'contracts:manage'].includes(permission) ? 'authority' : null; const policyLocked = Boolean(requiredRole && role.name !== requiredRole); const policyText = permission === 'evaluations:manage' ? 'Réservée à la commission' : 'Réservée à l’autorité contractante'; return <label key={permission} title={policyLocked ? policyText : undefined}><input type="checkbox" checked={current.includes('*') || current.includes(permission)} disabled={locked || policyLocked} onChange={() => toggle(role, permission)} /><span>{label}{policyLocked ? ` · ${policyText.toLowerCase()}` : ''}</span></label> })}</div>
        <footer><small>{locked ? 'Permissions globales protégées' : `${current.length} permission(s)`}</small><button className="authority-btn authority-btn--dark" disabled={locked || !changed || saving === role.id} onClick={() => save(role)} type="button"><Save size={13} />{saving === role.id ? 'Enregistrement…' : 'Enregistrer'}</button></footer>
      </article>
    })}</div>}
  </div>
}
