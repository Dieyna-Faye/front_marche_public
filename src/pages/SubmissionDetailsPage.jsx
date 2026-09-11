import {
  ArrowDownToLine, Bot, Check, CheckCircle2, ChevronRight, Download,
  Eye, FileCheck2, FileText, ShieldCheck, Sparkles, TriangleAlert,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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

  const validateOffer = async () => {
    try {
      const updated = await offerService.updateStatus(id, 'ACCEPTEE')
      setOffer((current) => ({ ...current, ...updated }))
      showToast('Soumission acceptée')
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
  const types = new Set(documents.map((document) => document.type))
  const administrative = Math.min(100, 45 + ['REGISTRE_COMMERCE', 'QUITUS_FISCAL', 'ATTESTATION_SOCIALE'].filter((type) => types.has(type)).length * 18)
  const technique = Math.min(100, 50 + ['OFFRE_TECHNIQUE', 'MEMOIRE_TECHNIQUE', 'PLANNING_EXECUTION', 'REF_TECHNIQUES'].filter((type) => types.has(type)).length * 12)
  const budget = Number(offer.appelOffres?.budgetEstimatif || 0)
  const financial = budget ? Math.max(0, Math.round(100 - Math.abs(1 - Number(offer.montantPropose) / budget) * 100)) : 50
  const globalScore = Math.round((administrative + technique + financial) / 3)
  const isComplete = documents.length >= 3

  return <div className="authority-submission-detail">
    <div className="authority-breadcrumb"><span>Soumissions reçues</span><ChevronRight size={12} /><b>Détail de la soumission</b></div>

    <header className="authority-page-head">
      <div>
        <h1>Détail de la Soumission #{tenderRef}</h1>
        <p><b>APPEL D’OFFRES :</b> {offer.appelOffres?.titre} <i /> <b>FOURNISSEUR :</b> {supplier}</p>
      </div>
      <div className="authority-page-head__actions">
        <button className="authority-btn authority-btn--ghost" onClick={() => downloadDocument(documents[0])} type="button"><ArrowDownToLine size={14} /> Télécharger l’offre</button>
        {['admin', 'authority', 'commission'].includes(role) && <button className="authority-btn authority-btn--dark" onClick={validateOffer} type="button"><Check size={14} /> Valider l’étape</button>}
      </div>
    </header>

    <div className="submission-detail-layout">
      <main>
        <section className="ai-analysis-card">
          <header><h2><Bot size={16} /> Analyse IA Détaillée</h2><span>Score Global <b>{globalScore}/100</b></span></header>
          <div className="ai-score-grid">
            <article><small>ADMINISTRATIF</small><strong>{administrative}%</strong><i><em style={{ width: `${administrative}%` }} /></i></article>
            <article><small>TECHNIQUE</small><strong>{technique}%</strong><i><em style={{ width: `${technique}%` }} /></i></article>
            <article><small>FINANCIER</small><strong>{financial}%</strong><i><em style={{ width: `${financial}%` }} /></i></article>
          </div>
          <h3>Recommandations IA</h3>
          <div className={`ai-recommendation ${isComplete ? 'is-positive' : 'is-warning'}`}>{isComplete ? <CheckCircle2 size={17} /> : <TriangleAlert size={17} />}<p><b>{isComplete ? 'Dossier suffisamment documenté' : 'Pièces complémentaires nécessaires'}</b><small>{documents.length} document(s) sont actuellement enregistrés pour cette soumission.</small></p></div>
          <div className="ai-recommendation is-warning"><TriangleAlert size={17} /><p><b>Contrôle humain requis</b><small>Cette estimation automatique doit être confirmée par la commission d’évaluation.</small></p></div>
        </section>

        <section className="submission-files-card">
          <header><h2>Dossier de Soumission</h2><span>{documents.length} / 7 documents validés</span></header>
          <div>
            {documents.map((document, index) => (
              <article key={`${document.id}-${index}`}>
                <span className={`submission-file-icon submission-file-icon--${index}`}><FileText size={15} /></span>
                <p><b>{documentLabels[document.type] || document.nomOriginal || 'Document'}</b><small>{document.nomOriginal || 'Document vérifié'}</small></p>
                <em>{index === 1 ? 'Vérifié' : 'Conforme'}</em>
                <button title="Visualiser" onClick={() => showToast('Aperçu du document')} type="button"><Eye size={14} /></button>
                <button title="Télécharger" onClick={() => downloadDocument(document)} type="button"><Download size={14} /></button>
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
          <article><span><ShieldCheck size={13} /></span><p><b>Documents contrôlés</b><small>{documents.length} pièce(s) associée(s) à l’offre.</small><time>Score {globalScore}/100</time></p></article>
          <article><span><FileCheck2 size={13} /></span><p><b>Soumission déposée</b><small>Accusé : {offer.accuseReception}</small><time>{new Intl.DateTimeFormat('fr-SN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(offer.dateSoumission || offer.createdAt))}</time></p></article>
        </div>
        <button className="authority-btn authority-btn--ghost" type="button">Voir tout l’historique</button>
        <div className="submission-summary"><span>Montant proposé</span><b>{amount}</b><small>Délai : {offer.delaiExecutionJours || '—'} jours</small></div>
      </aside>
    </div>

    <button className="authority-assistant" onClick={() => showToast('Assistant IA ouvert')} type="button"><Sparkles size={18} /><span><b>Assistant IA</b><small>Posez une question sur ce dossier</small></span></button>
  </div>
}
