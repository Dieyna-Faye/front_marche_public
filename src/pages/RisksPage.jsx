import { AlertTriangle, RotateCcw, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { tenderService } from '../services/tenderService'

function parseMetadata(value) {
  try { return typeof value === 'string' ? JSON.parse(value) : value || {} } catch { return {} }
}

export default function RisksPage() {
  const [alerts, setAlerts] = useState([])
  const [tenders, setTenders] = useState([])
  const [selectedTender, setSelectedTender] = useState('')
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const load = async () => {
    const [records, tendersResult] = await Promise.all([api.get('/alerts'), tenderService.list()])
    setAlerts(records.filter((item) => item.type !== 'delay_prediction').map((item) => ({ ...item, metadataObject: parseMetadata(item.metadata) })))
    setTenders(tendersResult)
    setSelectedTender((current) => current || tendersResult[0]?.id || '')
  }
  useEffect(() => { let active = true; load().catch((err) => { if (active) setError(err.message) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [])
  const scan = async () => {
    if (!selectedTender) return
    setScanning(true); setError('')
    try { await api.post(`/alerts/scan/${selectedTender}`, {}); await load() }
    catch (err) { setError(err.message) }
    finally { setScanning(false) }
  }
  const resolve = async (alert) => {
    setError('')
    try { await api.post(`/alerts/${alert.id}/resolve`, { status: 'resolue' }); await load() }
    catch (err) { setError(err.message) }
  }
  return <div className="admin-fraud">
    <header className="authority-page-head"><div><h1>Alertes de risque</h1><p>Signaux enregistrés par l’analyse IA. Une alerte n’est pas une preuve et doit être vérifiée par une personne habilitée.</p></div><div className="authority-page-head__actions"><select value={selectedTender} onChange={(event) => setSelectedTender(event.target.value)}><option value="">Sélectionner un appel d’offres</option>{tenders.map((tender) => <option key={tender.id} value={tender.id}>{tender.reference} · {tender.title}</option>)}</select><button className="authority-btn authority-btn--dark" disabled={!selectedTender || scanning} onClick={scan} type="button"><RotateCcw size={14}/>{scanning ? 'Analyse…' : 'Analyser les offres'}</button></div></header>
    {error && <p className="authority-inline-error" role="alert">{error}</p>}
    {loading ? <div className="loading-state"><span className="spinner"/> Chargement des alertes…</div> : alerts.length === 0 ? <div className="empty-state"><ShieldAlert size={24}/><p>Aucune alerte enregistrée. Lancez une analyse sur un appel d’offres comportant des offres déposées.</p></div> : <section className="authority-score-table"><header><h2>Alertes enregistrées</h2><span>{alerts.length}</span></header><div><table><thead><tr><th>TYPE</th><th>APPEL D’OFFRES</th><th>SIGNAL OBSERVÉ</th><th>NIVEAU</th><th>STATUT</th><th>ACTION</th></tr></thead><tbody>{alerts.map((alert) => <tr key={alert.id}><td><AlertTriangle size={14}/> {alert.type}</td><td>{alert.tender?.reference || alert.metadataObject.tenderId || alert.entityId || '—'}</td><td>{alert.message || 'Signal sans détail'}</td><td>{alert.severity}</td><td>{alert.status}</td><td>{alert.status !== 'resolue' && <button className="authority-btn authority-btn--ghost" onClick={() => resolve(alert)} type="button">Marquer vérifiée</button>}</td></tr>)}</tbody></table></div></section>}
  </div>
}
