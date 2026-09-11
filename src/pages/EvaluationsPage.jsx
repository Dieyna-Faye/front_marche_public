import { AlertTriangle, Check, Download, RotateCcw, ShieldAlert, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { offerService } from '../services/offerService'
import { tenderService } from '../services/tenderService'
import { formatMoney } from '../utils/formatters'

export default function EvaluationsPage() {
  const { id } = useParams()
  const { showToast } = useApp()
  const [tender, setTender] = useState(null)
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const tenderItems = await tenderService.list()
        const current = id ? tenderItems.find((item) => String(item.id) === String(id)) : tenderItems[0]
        if (!current) throw new Error('Aucun appel d’offres disponible pour l’analyse.')
        const offerItems = await offerService.byTender(current.id)
        if (active) { setTender(current); setOffers(offerItems) }
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [id])

  const selected = useMemo(() => offers.slice().sort((a, b) => Number(b.montantPropose || 0) - Number(a.montantPropose || 0))[0], [offers])
  const documents = selected?.documents || []
  const budget = Number(tender?.budgetEstimatif || 0)
  const amount = Number(selected?.montantPropose || 0)
  const gap = budget ? Math.round(Math.abs(1 - amount / budget) * 100) : 0
  const success = selected ? Math.min(100, Math.round(60 + documents.length * 7 + Math.max(0, 20 - gap))) : 0

  if (loading) return <div className="loading-state"><span className="spinner" /> Chargement de l’analyse…</div>
  if (error) return <p className="authority-inline-error">{error}</p>

  return <div className="authority-analysis">
    <div className="authority-breadcrumb"><span>APPELS D’OFFRES</span><b>/</b><strong>AO-{tender.id}</strong></div>
    <header className="authority-page-head"><div><h1>Analyse approfondie : {tender.titre}</h1></div><div className="authority-page-head__actions"><button className="authority-btn authority-btn--ghost" onClick={() => window.print()} type="button"><Download size={14} /> Exporter PDF</button><button className="authority-btn authority-btn--dark" onClick={() => showToast('Analyse actualisée depuis la base')} type="button"><RotateCcw size={14} /> Actualiser l’analyse</button></div></header>

    {!selected ? <p className="authority-inline-error">Aucune soumission n’a encore été déposée pour cet appel d’offres.</p> : <div className="authority-analysis-grid">
      <main>
        <section className="authority-strategy"><h2><Sparkles size={15} /> RÉSULTAT STRATÉGIQUE <span>ÉCART BUDGÉTAIRE : {gap}%</span></h2><p>La soumission de {selected.fournisseur?.nom} est analysée à partir du montant proposé, du délai d’exécution et des {documents.length} pièce(s) réellement enregistrée(s).</p><div><span><small>OFFRE ANALYSÉE</small><b>{formatMoney(selected.montantPropose)} · {selected.delaiExecutionJours} jours</b><em>{selected.statut?.replaceAll('_', ' ')}</em></span><span><small>RECOMMANDATION</small><b>{documents.length >= 3 ? 'Dossier suffisamment documenté pour une revue humaine.' : 'Demander des pièces complémentaires avant décision.'}</b></span></div></section>
        <section className="authority-verification"><header><h2>Vérification des pièces</h2></header><table><thead><tr><th>DOCUMENT</th><th>FICHIER</th><th>STATUT</th><th>ACTION</th></tr></thead><tbody>{documents.map((document) => <tr key={document.id}><td><b>{document.type?.replaceAll('_', ' ')}</b><small>Document #{document.id}</small></td><td>{document.nomOriginal}</td><td><em><Check size={11} />DÉPOSÉ</em></td><td><button type="button">•••</button></td></tr>)}</tbody></table>{documents.length === 0 && <p className="empty-copy">Aucune pièce déposée.</p>}<footer>Contrôle calculé depuis les documents de la soumission</footer></section>
      </main>
      <aside className="authority-analysis-aside"><section className="authority-success-score"><span>SCORE DOCUMENTAIRE</span><strong>{success}%</strong><em>{success >= 80 ? '↗ SATISFAISANT' : 'À COMPLÉTER'}</em><i><b style={{ width: `${success}%` }} /></i><small>Calcul basé sur les pièces déposées et l’écart avec le budget estimatif.</small></section><section className="authority-analysis-alerts"><h2>ALERTES</h2><article><span><ShieldAlert size={14} /></span><p><b>Budget</b><small>Écart de {gap}% avec l’estimation</small></p></article><article><span><AlertTriangle size={14} /></span><p><b>Documents</b><small>{documents.length} pièce(s) disponible(s)</small></p></article><h3>MATRICE DE RISQUES</h3><div><span>Documentaire <b>{Math.max(0, 100 - documents.length * 14)}%</b></span><i><em style={{ width: `${Math.max(0, 100 - documents.length * 14)}%` }} /></i><span>Financier <b>{gap}%</b></span><i><em style={{ width: `${Math.min(100, gap)}%` }} /></i></div></section></aside>
    </div>}
  </div>
}
