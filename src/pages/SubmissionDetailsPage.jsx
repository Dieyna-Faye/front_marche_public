import {
  ArrowDownToLine, Bot, Check, CheckCircle2, ChevronRight, Download,
  Eye, FileCheck2, FileText, ShieldCheck, Sparkles, TriangleAlert,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { offerService } from '../services/offerService'
import { formatMoney } from '../utils/formatters'

const documentLabels = {
  OFFRE_TECHNIQUE: 'Mémoire Technique',
  OFFRE_FINANCIERE: 'Acte d’Engagement',
  REGISTRE_COMMERCE: 'Registre du Commerce',
  QUITUS_FISCAL: 'Bordereau des Prix Unitaires',
  ATTESTATION_SOCIALE: 'Attestation sociale',
  REFERENCES_TECHNIQUES: 'Références techniques',
  MEMOIRE_TECHNIQUE: 'Mémoire Technique',
  PLANNING_EXECUTION: 'Planning d’exécution',
  AUTRE: 'Pièce complémentaire',
}

export default function SubmissionDetailsPage() {
  const { id } = useParams()
  const { showToast, role } = useApp()
  const [offer, setOffer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [decisionComment, setDecisionComment] = useState('')
  const [savingDecision, setSavingDecision] = useState(false)
  const [reviewDrafts, setReviewDrafts] = useState({})

  useEffect(() => {
    let active = true
    setLoading(true)
    offerService.get(id)
      .then((result) => { if (active) setOffer(result) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  const documents = offer?.documents || []

  const analyzeOffer = async () => {
    try {
      setAnalyzing(true)
      const result = await offerService.analyze(id)
      const updated = await offerService.get(id)
      setOffer({ ...updated, score: { ...result.scores, global: result.scores.globalScore }, isCompliant: result.compliance.isCompliant, complianceSummary: result.compliance.complianceSummary, complianceDetails: JSON.stringify(result.compliance.checklist), automaticSummary: result.summary })
      showToast('Analyse et score enregistrés')
    } catch (requestError) {
      showToast(requestError.message, 'error')
    } finally { setAnalyzing(false) }
  }

  const decide = async (decision) => {
    setSavingDecision(true)
    try {
      await offerService.decide(id, decision, decisionComment)
      setOffer(await offerService.get(id))
      setDecisionComment('')
      showToast(decision === 'validee' ? 'Décision de la commission enregistrée : offre validée' : 'Décision de la commission enregistrée : offre rejetée')
    } catch (requestError) { showToast(requestError.message, 'error') }
    finally { setSavingDecision(false) }
  }

  const reviewDocument = async (document, status) => {
    const comment = String(reviewDrafts[document.id] ?? '').trim()
    if (comment.length < 10) return showToast('Ajoutez un motif d’au moins 10 caractères pour enregistrer la revue.', 'error')
    try {
      await offerService.reviewDocument(id, document.id, status, comment)
      const result = await offerService.analyze(id)
      const updated = await offerService.get(id)
      setOffer({ ...updated, score: { ...result.scores, global: result.scores.globalScore }, isCompliant: result.compliance.isCompliant, complianceSummary: result.compliance.complianceSummary, complianceDetails: JSON.stringify(result.compliance.checklist), automaticSummary: result.summary })
      showToast('Revue motivée enregistrée; analyse et score actualisés')
    } catch (requestError) { showToast(requestError.message, 'error') }
  }

  const awardOffer = async () => {
    try {
      await offerService.award(id)
      showToast('Marché attribué et contrat créé')
      const updated = await offerService.get(id)
      setOffer(updated)
    } catch (requestError) {
      showToast(requestError.message, 'error')
    }
  }

  const downloadDocument = async (document) => {
    if (!document?.id) return showToast('Aucun fichier disponible pour ce document', 'error')
    try {
      const blob = await offerService.downloadDocument(id, document.id)
      const url = URL.createObjectURL(blob)
      const anchor = window.document.createElement('a')
      anchor.href = url
      anchor.download = document.nomOriginal
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (requestError) {
      showToast(requestError.message, 'error')
    }
  }

  if (loading) return <div className="loading-state"><span className="spinner" /> Chargement de la soumission…</div>
  if (error || !offer) return <p className="authority-inline-error">{error || 'Soumission introuvable.'}</p>

  const supplier = offer.fournisseur?.nom || 'Fournisseur'
  const tenderRef = String(offer.appelOffres?.id || offer.appelOffresId)
  const amount = typeof offer.montantPropose === 'string' && offer.montantPropose.includes('FCFA') ? offer.montantPropose : formatMoney(offer.montantPropose)
  const administrative = offer.score?.adminScore ?? null
  const technique = offer.score?.technicalScore ?? null
  const financial = offer.score?.financialScore ?? null
  const globalScore = offer.score?.global ?? offer.score?.globalScore ?? null
  const complianceDetails = (() => { try { return JSON.parse(offer.complianceDetails || '[]') } catch { return [] } })()
  const aiReport = (() => { try { return JSON.parse(offer.aiAnalysis || '{}') } catch { return {} } })()
  const isComplete = offer.isCompliant === true

  return <div className="authority-submission-detail">
    <div className="authority-breadcrumb"><span>Soumissions reçues</span><ChevronRight size={12} /><b>Détail de la soumission</b></div>

    <header className="authority-page-head">
      <div>
        <h1>Détail de la Soumission #{tenderRef}</h1>
        <p><b>APPEL D’OFFRES :</b> {offer.appelOffres?.titre} <i /> <b>FOURNISSEUR :</b> {supplier}</p>
      </div>
      <div className="authority-page-head__actions">
        <button className="authority-btn authority-btn--ghost" onClick={() => downloadDocument(documents[0])} type="button"><ArrowDownToLine size={14} /> Télécharger l’offre</button>
        {['admin', 'authority', 'commission'].includes(role) && <button className="authority-btn authority-btn--dark" disabled={analyzing} onClick={analyzeOffer} type="button"><Sparkles size={14} /> {analyzing ? 'Analyse…' : 'Analyser et enregistrer'}</button>}
        {role === 'authority' && <button className="authority-btn authority-btn--ghost" disabled={offer.committeeDecision !== 'validee'} title={offer.committeeDecision !== 'validee' ? 'La commission doit d’abord valider l’offre.' : 'Attribuer le marché'} onClick={awardOffer} type="button"><Check size={14} /> Attribuer le marché</button>}
      </div>
    </header>

    <div className="submission-detail-layout">
      <main>
        <section className="ai-analysis-card">
          <header><h2><Bot size={16} /> Analyse enregistrée</h2><span>Score global <b>{globalScore == null ? '—' : `${globalScore}/100`}</b></span></header>
          <div className="ai-score-grid">
            <article><small>ADMINISTRATIF</small><strong>{administrative == null ? '—' : `${administrative}%`}</strong><i><em style={{ width: `${administrative || 0}%` }} /></i></article>
            <article><small>TECHNIQUE</small><strong>{technique == null ? '—' : `${technique}%`}</strong><i><em style={{ width: `${technique || 0}%` }} /></i></article>
            <article><small>FINANCIER</small><strong>{financial == null ? '—' : `${financial}%`}</strong><i><em style={{ width: `${financial || 0}%` }} /></i></article>
          </div>
          <h3>Résultat de conformité et recommandation</h3>
          <div className={`ai-recommendation ${isComplete ? 'is-positive' : 'is-warning'}`}>{isComplete ? <CheckCircle2 size={17} /> : <TriangleAlert size={17} />}<p><b>{offer.complianceSummary || 'Analyse non exécutée'}</b><small>{offer.automaticSummary || 'Lancez l’analyse pour enregistrer le résumé, la conformité et les notes disponibles.'}</small></p></div>
          {complianceDetails.filter((item) => !item.present).length > 0 && <p>Pièces absentes : {complianceDetails.filter((item) => !item.present).map((item) => item.category).join(', ')}</p>}
          <div className="ai-recommendation is-warning"><TriangleAlert size={17} /><p><b>{offer.score?.recommendation || 'Contrôle humain requis'}</b><small>Le score est une aide à la décision et doit être validé par les personnes habilitées.</small></p></div>
          {aiReport.specificationComparison && <div className="ai-recommendation"><FileCheck2 size={17} /><p><b>Comparaison indicative avec le cahier des charges</b><small>{aiReport.specificationComparison.available ? `Similarité lexicale : ${Math.round(aiReport.specificationComparison.termSimilarity * 100)} %.` : aiReport.specificationComparison.method} {aiReport.specificationComparison.limitation}</small></p></div>}
          {aiReport.anomalies?.length > 0 && <div className="submission-analysis-list"><h3>Points à examiner</h3>{aiReport.anomalies.map((item, index) => <p key={`${item.type}-${index}`}><b>{item.type.replaceAll('_', ' ')}</b>{item.items?.length > 0 ? ` : ${item.items.join(', ')}` : ''}</p>)}</div>}
        </section>

        {role === 'commission' && <section className="submission-files-card committee-decision-card">
          <header><h2>Décision de la commission</h2><span>{offer.committeeDecision ? offer.committeeDecision.replaceAll('_', ' ') : 'Aucune décision'}</span></header>
          {offer.committeeDecision ? <p><b>{offer.committeeDecision === 'validee' ? 'Offre validée' : 'Offre rejetée'}</b> · {offer.committeeComment || 'Motif non renseigné'}<small>{offer.committeeReviewer ? ` · ${offer.committeeReviewer.firstName} ${offer.committeeReviewer.lastName}` : ''}{offer.committeeDecidedAt && ` · ${new Intl.DateTimeFormat('fr-SN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(offer.committeeDecidedAt))}`}</small></p> : <>
            <label className="authority-field authority-field--full">Motif et éléments examinés
              <textarea value={decisionComment} onChange={(event) => setDecisionComment(event.target.value)} minLength={10} maxLength={2000} rows={3} placeholder="Expliquez la décision de la commission (10 caractères minimum)…" />
            </label>
            <div className="authority-page-head__actions">
              <button className="authority-btn authority-btn--ghost" disabled={savingDecision || !offer.analyzedAt || decisionComment.trim().length < 10} onClick={() => decide('rejetee')} type="button">{savingDecision ? 'Enregistrement…' : 'Rejeter avec motif'}</button>
              <button className="authority-btn authority-btn--dark" disabled={savingDecision || !offer.analyzedAt || decisionComment.trim().length < 10} onClick={() => decide('validee')} type="button">{savingDecision ? 'Enregistrement…' : 'Valider l’offre'}</button>
            </div>
            {!offer.analyzedAt && <small>Lancez d’abord l’analyse enregistrée du dossier.</small>}
          </>}
        </section>}

        <section className="submission-files-card">
          <header><h2>Dossier de Soumission</h2><span>{documents.length} document(s) associé(s)</span></header>
          <div>
            {documents.map((document, index) => (
              <article key={`${document.id}-${index}`}>
                <span className={`submission-file-icon submission-file-icon--${index}`}><FileText size={15} /></span>
                <p><b>{documentLabels[document.type] || document.nomOriginal || 'Document'}</b><small>{document.nomOriginal || 'Document vérifié'}</small>{document.reviewComment && <small className="submission-review-note"><b>Motif de la dernière revue :</b> {document.reviewComment}{document.reviewer ? ` · ${document.reviewer.firstName} ${document.reviewer.lastName}` : ''}{document.reviewedAt ? ` · ${new Intl.DateTimeFormat('fr-SN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(document.reviewedAt))}` : ''}</small>}</p>
                <em>{document.reviewStatus?.replaceAll('_', ' ') || 'Déposé · à vérifier'}</em>
                <button title="Visualiser" onClick={() => showToast('Aperçu du document')} type="button"><Eye size={14} /></button>
                <button title="Télécharger" onClick={() => downloadDocument(document)} type="button"><Download size={14} /></button>
                {role === 'commission' && <div className="submission-review-actions"><textarea aria-label={`Motif de revue pour ${document.nomOriginal}`} value={reviewDrafts[document.id] ?? document.reviewComment ?? ''} onChange={(event) => setReviewDrafts((current) => ({ ...current, [document.id]: event.target.value }))} maxLength={2000} rows={2} placeholder="Motif obligatoire (10 caractères min.)" /><button title="Enregistrer revue conforme" disabled={String(reviewDrafts[document.id] ?? document.reviewComment ?? '').trim().length < 10} onClick={() => reviewDocument(document, 'conforme')} type="button">✓ Conforme</button><button title="Enregistrer revue non conforme" disabled={String(reviewDrafts[document.id] ?? document.reviewComment ?? '').trim().length < 10} onClick={() => reviewDocument(document, 'non_conforme')} type="button">× Non conforme</button></div>}
              </article>
            ))}
          </div>
          {documents.length === 0 && <p className="empty-copy">Aucun document déposé.</p>}
        </section>
      </main>

      <aside className="submission-journal">
        <h2>Journal d’activité</h2>
        <div className="journal-timeline">
          <article><span><CheckCircle2 size={13} /></span><p><b>Statut actuel</b><small>{offer.statut?.replaceAll('_', ' ')}</small><time>Mis à jour depuis la base</time></p></article>
          <article><span><ShieldCheck size={13} /></span><p><b>Documents associés</b><small>{documents.length} pièce(s); le dépôt ne certifie ni validité ni authenticité.</small><time>Score {globalScore == null ? 'non calculé' : `${globalScore}/100`}</time></p></article>
          <article><span><FileCheck2 size={13} /></span><p><b>Soumission déposée</b><small>Accusé : {offer.accuseReception}</small><time>{new Intl.DateTimeFormat('fr-SN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(offer.dateSoumission || offer.createdAt))}</time></p></article>
        </div>
        <button className="authority-btn authority-btn--ghost" onClick={() => showToast('Tout l’historique disponible est affiché')} type="button">Voir tout l’historique</button>
        <div className="submission-summary"><span>Montant proposé</span><b>{amount}</b><small>Délai : {offer.delaiExecutionJours || '—'} jours</small></div>
      </aside>
    </div>

    <Link className="authority-assistant" to="/app/assistant"><Sparkles size={18} /><span><b>Assistant IA</b><small>Posez une question générale</small></span></Link>
  </div>
}
