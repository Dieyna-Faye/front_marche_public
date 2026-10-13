import {
  CalendarDays, Download, FileText, Filter, Fingerprint, Plus,
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
  const [manualReview, setManualReview] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [savingReview, setSavingReview] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)
  const [dateFilter, setDateFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [exporting, setExporting] = useState(false)
  const { showToast } = useApp()

  const loadLogs = async () => {
    const items = await auditService.list(100)
    setLogs(items)
    setHasMore(items.length === 100)
  }

  useEffect(() => {
    let active = true
    auditService.list(100)
      .then((items) => { if (active) { setLogs(items); setHasMore(items.length === 100) } })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const actionOptions = useMemo(() => [...new Set(logs.map((log) => log.action).filter(Boolean))].sort(), [logs])
  const filtered = useMemo(() => logs.filter((log) => {
    const matchesSearch = `${log.action} ${log.details} ${log.utilisateur?.nom}`.toLowerCase().includes(search.toLowerCase())
    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    const age = Date.now() - new Date(log.createdAt).getTime()
    const today = new Date()
    const matchesDate = dateFilter === 'all' || (dateFilter === 'month' ? (() => { const date = new Date(log.createdAt); return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() })() : age <= 7 * 24 * 60 * 60 * 1000)
    return matchesSearch && matchesAction && matchesDate
  }), [logs, search, actionFilter, dateFilter])
  const actors = new Set(logs.map((log) => log.utilisateurId).filter(Boolean)).size
  const saveManualAudit = async (event) => {
    event.preventDefault()
    if (reviewText.trim().length < 10) return
    setSavingReview(true)
    try {
      const created = await auditService.create(reviewText.trim())
      await loadLogs()
      setSelectedLog(created)
      setReviewText('')
      setManualReview(false)
      showToast('Revue enregistrée. Cliquez sur son événement pour la consulter.')
    } catch (requestError) {
      showToast(requestError.message, 'error')
    } finally { setSavingReview(false) }
  }
  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const items = await auditService.list(100, logs.length)
      setLogs((current) => [...current, ...items])
      setHasMore(items.length === 100)
    } catch (requestError) {
      showToast(requestError.message, 'error')
    } finally { setLoadingMore(false) }
  }
  const startAudit = () => {
    setManualReview(true)
    setError('')
  }
  const openLog = (log) => {
    setSelectedLog(log)
  }
  const closeLog = () => {
    setSelectedLog(null)
    setManualReview(false)
  }
  const onLogKeyDown = (event, log) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openLog(log)
    }
  }
  const exportReport = async (kind = 'all') => {
    setExporting(true)
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    try {
    const allLogs = []
    for (let offset = 0; offset < 50000; offset += 500) {
      const batch = await auditService.list(500, offset)
      allLogs.push(...batch)
      if (batch.length < 500) break
    }
    const rows = allLogs.filter((log) => {
      if (kind === 'month') return String(log.createdAt || '').slice(0, 7) === month
      if (kind === 'evaluation') return /EVALUATION|ANALYZE|COMMITTEE_DECISION|REVIEW_BID_DOCUMENT|RECOMPUTE_SCORE/i.test(log.action)
      if (kind === 'risk') return /FRAUD|ALERT|RISK|DELAY/i.test(log.action)
      return true
    })
    const csvCell = (value) => {
      let text = String(value ?? '').replace(/[\r\n]+/g, ' ')
      if (/^[\u0000-\u0020]*[=+\-@]/.test(text)) text = `'${text}`
      return `"${text.replaceAll('"', '""')}"`
    }
    const columns = ['Horodatage', 'Utilisateur', 'Rôle', 'Action', 'Entité', 'Identifiant', 'Détails', 'Adresse IP']
    const content = [columns, ...rows.map((log) => [log.createdAt, log.utilisateur?.nom, log.utilisateur?.role, log.action, log.entity, log.entityId, log.details, log.adresseIp])]
      .map((line) => line.map(csvCell).join(';')).join('\r\n')
    const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = window.document.createElement('a')
    link.href = url
    link.download = `rapport-audit-${kind}-${now.toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    } catch (requestError) {
      showToast(requestError.message, 'error')
    } finally { setExporting(false) }
  }

  return <div className="authority-audit">
    <header className="authority-page-head"><div><h1>Historique des actions</h1><p>Consultez les événements détaillés de la plateforme et enregistrez une revue d’audit motivée.</p></div><div className="authority-page-head__actions"><button className="authority-btn authority-btn--ghost" onClick={() => window.print()} type="button"><Download size={14} /> Imprimer</button><button className="authority-btn authority-btn--dark" onClick={startAudit} type="button"><Plus size={14} /> Enregistrer une revue</button></div></header>

    {manualReview && <form className="authority-audit-compose" onSubmit={saveManualAudit}><header><div><h2>Nouvelle revue d’audit</h2><p>Décrivez le contrôle effectué, la période ou le dossier examiné et vos conclusions.</p></div><button type="button" aria-label="Fermer" onClick={closeLog}>×</button></header><textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} minLength={10} maxLength={2000} required rows={4} placeholder="Ex. Contrôle du dossier AO-… : vérification de la chronologie, des pièces et de la décision enregistrée…" /><footer><small>{reviewText.trim().length}/2000 caractères</small><button className="authority-btn authority-btn--dark" disabled={savingReview || reviewText.trim().length < 10} type="submit">{savingReview ? 'Enregistrement…' : 'Enregistrer la revue'}</button></footer></form>}

    <div className="authority-audit-hero"><section><span><ShieldCheck size={24} /></span><div><small>JOURNAL APPLICATIF</small><h2>Actions enregistrées</h2><p>Les entrées affichées proviennent du journal de l’application; aucune vérification blockchain n’est effectuée.</p></div></section><article><small>ACTIONS AUDITÉES</small><strong>{logs.length.toLocaleString('fr-FR')}</strong><span>événements disponibles pour ce compte</span></article></div>

    <div className="authority-audit-filters"><label><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une action, un utilisateur ou un détail" /></label><label className="authority-audit-select"><CalendarDays size={14} /><select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}><option value="all">Toute période</option><option value="month">Ce mois</option><option value="week">7 derniers jours</option></select></label><span><Fingerprint size={14} /> {actors || 0} acteur(s) chargé(s)</span><label className="authority-audit-select"><Filter size={14} /><select value={actionFilter} onChange={(event) => setActionFilter(event.target.value)}><option value="all">Toutes les actions</option>{actionOptions.map((action) => <option value={action} key={action}>{actionLabel(action)}</option>)}</select></label></div>

    <section className="authority-audit-journal"><header><h2>Journal d’Audit</h2><span>{filtered.length} événement(s) affiché(s)</span></header>{loading ? <div className="loading-state"><span className="spinner" /> Chargement du journal…</div> : error ? <p className="authority-inline-error">{error}</p> : <div className="authority-audit-table"><table><thead><tr><th>HORODATAGE</th><th>UTILISATEUR</th><th>ACTION</th><th>DÉTAILS</th><th>ADRESSE IP</th><th>STATUT</th></tr></thead><tbody>{filtered.map((log) => <tr key={log.id} onClick={() => openLog(log)} onKeyDown={(event) => onLogKeyDown(event, log)} tabIndex={0} role="button" aria-label={`Consulter ${actionLabel(log.action)}`}><td>{new Intl.DateTimeFormat('fr-SN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(log.createdAt))}</td><td><b>{log.utilisateur?.nom || 'Système'}</b><small>{log.utilisateur?.role || 'AUTOMATIQUE'}</small></td><td><strong>{actionLabel(log.action)}</strong></td><td><button className="authority-audit-open" onClick={(event) => { event.stopPropagation(); openLog(log) }} type="button">{log.details || 'Voir la revue enregistrée'}</button></td><td><code>{log.adresseIp || '—'}</code></td><td><em>SUCCÈS</em></td></tr>)}</tbody></table>{hasMore && <div className="authority-audit-more"><button className="authority-btn authority-btn--ghost" disabled={loadingMore} onClick={loadMore} type="button">{loadingMore ? 'Chargement…' : 'Charger les événements suivants'}</button></div>}</div>}<footer><span>Les événements proviennent du journal applicatif et sont consultables en détail.</span><button className="authority-btn authority-btn--dark" disabled={exporting} onClick={() => exportReport('all')} type="button">{exporting ? 'Préparation…' : 'Exporter CSV'}</button></footer></section>

    <section className="authority-audit-reports"><h2>Rapports à partir du journal enregistré</h2><div>{[['Journal complet','Toutes les actions visibles','all'],['Activité du mois','Événements du mois en cours','month'],['Évaluations','Notes, analyses et décisions','evaluation'],['Risques','Scans, alertes et retards','risk']].map(([title, subtitle, kind]) => <article key={kind}><span><FileText size={16} /></span><h3>{title}</h3><p>{subtitle}</p><button disabled={exporting} onClick={() => exportReport(kind)} type="button">{exporting ? 'PRÉPARATION…' : 'TÉLÉCHARGER CSV'}</button></article>)}</div></section>
    {selectedLog && <div className="authority-audit-modal" role="presentation" onClick={closeLog}><section role="dialog" aria-modal="true" aria-labelledby="audit-detail-title" onClick={(event) => event.stopPropagation()}><header><div><small>DÉTAIL DE L’ÉVÉNEMENT</small><h2 id="audit-detail-title">{actionLabel(selectedLog.action)}</h2></div><button type="button" aria-label="Fermer" onClick={closeLog}>×</button></header><dl><div><dt>Utilisateur</dt><dd>{selectedLog.utilisateur?.nom || 'Système'} · {selectedLog.utilisateur?.role || 'Automatique'}</dd></div><div><dt>Date</dt><dd>{new Intl.DateTimeFormat('fr-SN', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(selectedLog.createdAt))}</dd></div><div><dt>Élément concerné</dt><dd>{selectedLog.entity || '—'} · {selectedLog.entityId || '—'}</dd></div><div><dt>Adresse IP</dt><dd>{selectedLog.adresseIp || '—'}</dd></div></dl><h3>Compte rendu / données enregistrées</h3><pre>{JSON.stringify(selectedLog.detailsData || { description: selectedLog.details }, null, 2)}</pre><footer><button className="authority-btn authority-btn--dark" onClick={closeLog} type="button">Fermer</button></footer></section></div>}
  </div>
}
