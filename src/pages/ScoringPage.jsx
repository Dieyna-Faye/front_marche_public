import { Download, Eye, FileCheck2, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { offerService } from '../services/offerService'
import { tenderService } from '../services/tenderService'
import { formatMoney } from '../utils/formatters'

function scoreOffer(offer, tenders) {
  const tender = tenders.find((item) => item.id === offer.appelOffresId) || offer.appelOffres || {}
  const score = offer.score || {}
  return {
    ...offer, tender,
    administrative: score.adminScore ?? null,
    technique: score.technicalScore ?? null,
    financier: score.financialScore ?? null,
    experience: score.experienceScore ?? null,
    delai: score.delayScore ?? null,
    global: score.globalScore ?? null,
    riskLevel: score.riskLevel,
    recommendation: score.recommendation,
  }
}

export default function ScoringPage() {
  const [searchParams] = useSearchParams()
  const [tenders, setTenders] = useState([])
  const [offers, setOffers] = useState([])
  const [selectedId, setSelectedId] = useState(searchParams.get('offre') || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const tenderItems = await tenderService.list()
        const results = await Promise.allSettled(tenderItems.map((tender) => offerService.byTender(tender.id)))
        if (!active) return
        setTenders(tenderItems)
        setOffers(results.flatMap((result) => result.status === 'fulfilled' ? result.value : []))
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const scored = useMemo(() => offers.map((offer) => scoreOffer(offer, tenders)).sort((a, b) => (b.global ?? -1) - (a.global ?? -1)), [offers, tenders])
  const selected = scored.find((offer) => String(offer.id) === String(selectedId)) || scored[0]
  const radar = selected ? [selected.administrative, selected.technique, selected.financier, selected.delai, selected.experience].map((value) => value ?? 0) : [0, 0, 0, 0, 0]
  const analyzeSelected = async () => {
    if (!selected) return
    setAnalyzing(true); setError('')
    try {
      const result = await offerService.analyze(selected.id)
      const updated = { ...selected, score: result.scores }
      setOffers((current) => current.map((offer) => offer.id === selected.id ? updated : offer))
    } catch (requestError) { setError(requestError.message) }
    finally { setAnalyzing(false) }
  }
  const points = radar.map((value, index) => {
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / radar.length)
    const radius = value * .78
    return `${100 + Math.cos(angle) * radius},${100 + Math.sin(angle) * radius}`
  }).join(' ')

  return <div className="authority-scoring">
    <header className="authority-page-head"><div><h1>Scoring & Évaluation</h1><p>Les valeurs affichées proviennent des résultats calculés et enregistrés par l’API. Une donnée absente n’est pas notée zéro.</p></div><div className="authority-page-head__actions"><button className="authority-btn authority-btn--ghost" onClick={() => window.print()} type="button"><Download size={14} /> Export Rapport</button>{selected && <button className="authority-btn authority-btn--dark" disabled={analyzing} onClick={analyzeSelected} type="button">{analyzing ? 'Analyse…' : 'Calculer / actualiser'}</button>}</div></header>

    {loading ? <div className="loading-state"><span className="spinner" /> Calcul des scores…</div> : error ? <p className="authority-inline-error">{error}</p> : scored.length === 0 ? <p className="authority-inline-error">Aucune soumission n’est encore disponible pour vos appels d’offres.</p> : <>
      <div className="authority-scoring-grid">
        <section className="authority-radar"><header><div><h2>Performance Comparative</h2><p>{selected.global == null ? 'Aucun score global disponible pour cette offre.' : 'Scores calculés par le backend et conservés en base.'}</p></div><span><i /> Offre sélectionnée</span></header><div className="radar-chart"><svg viewBox="0 0 200 200" role="img" aria-label="Comparaison des scores persistés"><polygon points="100,22 174,76 146,163 54,163 26,76" /><polygon points="100,48 149,84 130,141 70,141 51,84" /><polygon points="100,74 124,92 115,120 85,120 76,92" /><line x1="100" y1="100" x2="100" y2="22" /><line x1="100" y1="100" x2="174" y2="76" /><line x1="100" y1="100" x2="146" y2="163" /><line x1="100" y1="100" x2="54" y2="163" /><line x1="100" y1="100" x2="26" y2="76" /><polygon className="radar-chart__value" points={points} /></svg><span className="radar-label radar-label--one">Administratif</span><span className="radar-label radar-label--two">Technique</span><span className="radar-label radar-label--three">Financier</span><span className="radar-label radar-label--four">Délai</span><span className="radar-label radar-label--five">Expérience</span></div></section>
        <aside className="authority-ai-summary"><header><Sparkles size={16} /><h2>Résultat enregistré</h2></header><p><b>{selected.fournisseur?.nom || 'Fournisseur'}</b> : <strong>{selected.global == null ? 'score non calculé' : `${selected.global}/100`}</strong>.</p><p>Couverture des critères : <strong>{selected.score?.scoreCoveragePercent ?? 0}%</strong> {selected.score?.scoreComplete ? '· score complet' : '· score provisoire, pondération renormalisée sur les critères renseignés'}</p><h3>DONNÉES DE L’OFFRE</h3><ul><li>Montant proposé : {formatMoney(selected.montantPropose)}</li><li>Délai annoncé : {selected.delaiExecutionJours ?? '—'} jours</li><li>{selected.documents?.length || 0} document(s) associé(s)</li></ul><h3>RECOMMANDATION</h3><p>{selected.recommendation || 'Non disponible; lancez le calcul et complétez les évaluations requises.'}</p><p>Niveau de risque : {selected.riskLevel || 'à vérifier'}. La décision finale revient aux personnes autorisées.</p><Link to={`/app/soumissions/${selected.id}`}>Voir les détails</Link></aside>
      </div>

      <section className="authority-score-table"><header><h2>Résultats des évaluations enregistrées</h2><span>{scored.length} candidature(s)</span></header><div><table><thead><tr><th>FOURNISSEUR</th><th>ADMIN. · 20%</th><th>TECH. · 30%</th><th>FINANCE · 25%</th><th>EXPÉRIENCE · 15%</th><th>DÉLAI · 10%</th><th>COUVERTURE</th><th>SCORE GLOBAL</th><th>ÉTAT</th></tr></thead><tbody>{scored.map((offer, index) => <tr className={selected?.id === offer.id ? 'is-selected' : ''} onClick={() => setSelectedId(String(offer.id))} key={offer.id}><td><div className="authority-company"><span>{index + 1}</span><p><b>{offer.fournisseur?.nom || 'Fournisseur'}</b><small>Offre #{offer.reference || offer.id}</small></p></div></td><td>{offer.administrative == null ? '—' : `${offer.administrative}/100`}</td><td>{offer.technique == null ? '—' : `${offer.technique}/100`}</td><td>{offer.financier == null ? '—' : `${offer.financier}/100`}</td><td>{offer.experience == null ? '—' : `${offer.experience}/100`}</td><td>{offer.delai == null ? '—' : `${offer.delai}/100`}</td><td>{offer.score?.scoreCoveragePercent ?? 0}%{offer.score?.scoreComplete ? ' ✓' : ' · provisoire'}</td><td><strong>{offer.global == null ? '—' : `${offer.global}/100`}</strong></td><td><em>{offer.global == null ? 'À analyser' : offer.riskLevel || 'À vérifier'}</em><Link to={`/app/soumissions/${offer.id}`}><Eye size={13} /></Link></td></tr>)}</tbody></table></div></section>
    </>}
  </div>
}
