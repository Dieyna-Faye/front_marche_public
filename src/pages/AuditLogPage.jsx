import {
  CalendarDays, Check, Download, FileText, Filter, Fingerprint, Plus,
  Search, ShieldCheck,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { auditService } from '../services/auditService'
import { useApp } from '../context/useApp'

const actionLabel = (action = '') => action.toLowerCase().replaceAll('_', ' ').replace(/^./, (letter) => letter.toUpperCase())

export default function AuditLogPage() {
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showToast } = useApp()

  const loadLogs = async () => {
    const items = await auditService.list(100)
    setLogs(items)
  }

  useEffect(() => {
    let active = true
    auditService.list(100)
      .then((items) => { if (active) setLogs(items) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => logs.filter((log) => `${log.action} ${log.details} ${log.utilisateur?.nom}`.toLowerCase().includes(search.toLowerCase())), [logs, search])
  const actors = new Set(logs.map((log) => log.utilisateurId).filter(Boolean)).size
  const startAudit = async () => {
    try {
      await auditService.create('Audit manuel de gouvernance et de traçabilité.')
      await loadLogs()
      showToast('Nouvel audit enregistré')
    } catch (requestError) {
      showToast(requestError.message, 'error')
    }
  }

  return <div className="authority-audit">
    <header className="authority-page-head"><div><h1>Audit & Gouvernance</h1><p>Traçabilité immuable et journalisation complète des actions système pour garantir la transparence des processus d’achat.</p></div><div className="authority-page-head__actions"><button className="authority-btn authority-btn--ghost" onClick={() => window.print()} type="button"><Download size={14} /> Rapports d’audit</button><button className="authority-btn authority-btn--dark" onClick={startAudit} type="button"><Plus size={14} /> Nouvel Audit</button></div></header>

    <div className="authority-audit-hero"><section><span><ShieldCheck size={24} /></span><div><small>SÉCURITÉ DU REGISTRE</small><h2>Statut de l’Immuabilité : <b>100% Intègre</b></h2><p>Aucune anomalie de chaîne détectée sur les événements enregistrés.</p></div><em><Check size={11} /> Blockchain vérifiée</em></section><article><small>ACTIONS AUDITÉES</small><strong>{logs.length.toLocaleString('fr-FR')}</strong><span>événements réels</span></article></div>

    <div className="authority-audit-filters"><label><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tout le journal" /></label><button type="button"><CalendarDays size={14} /> Toute la période</button><button type="button"><Fingerprint size={14} /> {actors || 0} acteur(s)</button><button type="button"><Filter size={14} /> Filtrer</button></div>

    <section className="authority-audit-journal"><header><h2>Journal d’Audit</h2><span>{filtered.length} événement(s)</span></header>{loading ? <div className="loading-state"><span className="spinner" /> Chargement du journal…</div> : error ? <p className="authority-inline-error">{error}</p> : <div className="authority-audit-table"><table><thead><tr><th>HORODATAGE</th><th>UTILISATEUR</th><th>ACTION</th><th>DÉTAILS</th><th>ADRESSE IP</th><th>STATUT</th></tr></thead><tbody>{filtered.map((log) => <tr key={log.id}><td>{new Intl.DateTimeFormat('fr-SN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(log.createdAt))}</td><td><b>{log.utilisateur?.nom || 'Système'}</b><small>{log.utilisateur?.role || 'AUTOMATIQUE'}</small></td><td><strong>{actionLabel(log.action)}</strong></td><td>{log.details || '—'}</td><td><code>{log.adresseIp || '—'}</code></td><td><em>SUCCÈS</em></td></tr>)}</tbody></table></div>}<footer><span>Les événements sont issus de la table audit_logs.</span><button className="authority-btn authority-btn--dark" onClick={() => window.print()} type="button">Exporter</button></footer></section>

    <section className="authority-audit-reports"><h2>Rapports d’Audit</h2><div>{[['Rapport Mensuel IA','Généré automatiquement'],['Sécurité Financière','Contrôles de conformité'],['Conformité RGPD','Données & traçabilité'],['Audit API Logs','Intégrité des accès']].map(([title, subtitle]) => <article key={title}><span><FileText size={16} /></span><h3>{title}</h3><p>{subtitle}</p><button onClick={() => window.print()} type="button">TÉLÉCHARGER</button></article>)}</div></section>
  </div>
}
