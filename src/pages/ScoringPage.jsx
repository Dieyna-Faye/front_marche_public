import { Download, Eye, FileCheck2, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { offerService } from '../services/offerService'
import { tenderService } from '../services/tenderService'
import { formatMoney } from '../utils/formatters'

const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)))

function scoreOffer(offer, tenders, allOffers) {
  const tender = tenders.find((item) => item.id === offer.appelOffresId) || offer.appelOffres || {}
  const documents = offer.documents || []
  const documentTypes = new Set(documents.map((document) => document.type))
  const adminTypes = ['REGISTRE_COMMERCE', 'QUITUS_FISCAL', 'ATTESTATION_SOCIALE']
  const techTypes = ['OFFRE_TECHNIQUE', 'MEMOIRE_TECHNIQUE', 'PLANNING_EXECUTION', 'REF_TECHNIQUES']
  const administrative = clamp(45 + adminTypes.filter((type) => documentTypes.has(type)).length * 18)
  const technique = clamp(50 + techTypes.filter((type) => documentTypes.has(type)).length * 12)
  const budget = Number(tender.budgetEstimatif || 0)
  const amount = Number(offer.montantPropose || 0)
  const financier = budget > 0 && amount > 0 ? clamp(100 - Math.abs(1 - amount / budget) * 100) : 50
  const history = allOffers.filter((item) => item.fournisseurId === offer.fournisseurId).length
  const experience = clamp(55 + history * 8)
  const delai = clamp(100 - Math.max(0, Number(offer.delaiExecutionJours || 0) - 120) / 3)
  const global = clamp(administrative * .25 + technique * .3 + financier * .25 + experience * .1 + delai * .1)

  return { ...offer, tender, administrative, technique, financier, experience, delai, global }
}

export default function ScoringPage() {
  const [searchParams] = useSearchParams()
  const [tenders, setTenders] = useState([])
  const [offers, setOffers] = useState([])
  const [selectedId, setSelectedId] = useState(searchParams.get('offre') || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const scored = useMemo(() => offers.map((offer) => scoreOffer(offer, tenders, offers)).sort((a, b) => b.global - a.global), [offers, tenders])
  const selected = scored.find((offer) => String(offer.id) === String(selectedId)) || scored[0]
  const radar = selected ? [selected.administrative, selected.technique, selected.financier, selected.delai, selected.experience] : [0, 0, 0, 0, 0]
  const points = radar.map((value, index) => {
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / radar.length)
    const radius = value * .78
    return `${100 + Math.cos(angle) * radius},${100 + Math.sin(angle) * radius}`
  }).join(' ')

  return <div className="authority-scoring">
    <header className="authority-page-head"><div><h1>Scoring & Évaluation</h1><p>Analyse comparative des candidatures sélectionnées pour l’appel d’offres, calculée à partir des montants, délais et documents réellement déposés.</p></div><div className="authority-page-head__actions"><button className="authority-btn authority-btn--ghost" onClick={() => window.print()} type="button"><Download size={14} /> Export Rapport</button>{selected && <Link className="authority-btn authority-btn--dark" to={`/app/soumissions/${selected.id}`}><FileCheck2 size={14} /> Évaluer la sélection</Link>}</div></header>

    {loading ? <div className="loading-state"><span className="spinner" /> Calcul des scores…</div> : error ? <p className="authority-inline-error">{error}</p> : scored.length === 0 ? <p className="authority-inline-error">Aucune soumission n’est encore disponible pour vos appels d’offres.</p> : <>
      <div className="authority-scoring-grid">
        <section className="authority-radar"><header><div><h2>Performance Comparative</h2><p>Le score est recalculé depuis les données persistées.</p></div><span><i /> Offre sélectionnée</span></header><div className="radar-chart"><svg viewBox="0 0 200 200" role="img" aria-label="Comparaison des critères"><polygon points="100,22 174,76 146,163 54,163 26,76" /><polygon points="100,48 149,84 130,141 70,141 51,84" /><polygon points="100,74 124,92 115,120 85,120 76,92" /><line x1="100" y1="100" x2="100" y2="22" /><line x1="100" y1="100" x2="174" y2="76" /><line x1="100" y1="100" x2="146" y2="163" /><line x1="100" y1="100" x2="54" y2="163" /><line x1="100" y1="100" x2="26" y2="76" /><polygon className="radar-chart__value" points={points} /></svg><span className="radar-label radar-label--one">Administratif</span><span className="radar-label radar-label--two">Technique</span><span className="radar-label radar-label--three">Financier</span><span className="radar-label radar-label--four">Délai</span><span className="radar-label radar-label--five">Expérience</span></div></section>
        <aside className="authority-ai-summary"><header><Sparkles size={16} /><h2>Résumé de l’IA</h2></header><p><b>{selected.fournisseur?.nom}</b> obtient un score global de <strong>{selected.global}/100</strong>.</p><h3>POINTS FORTS</h3><ul><li>Montant proposé : {formatMoney(selected.montantPropose)}</li><li>Délai annoncé : {selected.delaiExecutionJours} jours</li><li>{selected.documents?.length || 0} document(s) analysé(s)</li></ul><h3>POINTS À CONTRÔLER</h3><p>Les scores sont indicatifs et doivent être confirmés par la commission.</p><Link to={`/app/soumissions/${selected.id}`}>Voir les détails</Link></aside>
      </div>

      <section className="authority-score-table"><header><h2>Matrice détaillée des candidats présélectionnés</h2><span>{scored.length} candidature(s)</span></header><div><table><thead><tr><th>FOURNISSEUR</th><th>ADMINISTRATIF</th><th>TECHNIQUE</th><th>FINANCIER</th><th>DÉLAI</th><th>SCORE GLOBAL</th><th>STATUT</th></tr></thead><tbody>{scored.map((offer, index) => <tr className={selected?.id === offer.id ? 'is-selected' : ''} onClick={() => setSelectedId(String(offer.id))} key={offer.id}><td><div className="authority-company"><span>{index + 1}</span><p><b>{offer.fournisseur?.nom || 'Fournisseur'}</b><small>Offre #{offer.id}</small></p></div></td><td>{offer.administrative}/100</td><td>{offer.technique}/100</td><td>{offer.financier}/100</td><td>{offer.delai}/100</td><td><strong>{offer.global}</strong></td><td><em>{index === 0 ? '1er' : `${index + 1}e`}</em><Link to={`/app/soumissions/${offer.id}`}><Eye size={13} /></Link></td></tr>)}</tbody></table></div></section>
    </>}
  </div>
}
