import { ArrowLeft, CalendarDays, Clock3, Download, FileText, Landmark, WalletCards } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { tenderService } from '../services/tenderService'
import { formatDate, formatMoney, toTenderView } from '../utils/formatters'

export default function PublicTenderDetailsPage() {
  const { id } = useParams()
  const [tender, setTender] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    tenderService.get(id).then((item) => { if (active) setTender(item) })
      .catch((err) => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])
  if (loading) return <main className="p-section"><div className="p-container">Chargement de l’appel d’offres…</div></main>
  if (error || !tender) return <main className="p-section"><div className="p-container"><p role="alert">{error || 'Appel d’offres introuvable.'}</p><Link to="/appels-offres">Retour aux appels d’offres</Link></div></main>
  const view = toTenderView(tender)
  const download = async (document) => {
    try {
      const blob = await tenderService.downloadDocument(tender.id, document.id)
      const url = URL.createObjectURL(blob)
      const anchor = window.document.createElement('a')
      anchor.href = url; anchor.download = document.originalName || document.nomOriginal || 'document.pdf'; anchor.click()
      URL.revokeObjectURL(url)
    } catch (err) { setError(err.message) }
  }
  return <main>
    <section className="p-detail-hero"><div className="p-container"><Link to="/appels-offres"><ArrowLeft size={13}/> Retour aux appels d’offres</Link><div className="p-detail-hero__title"><div><span>{tender.reference} · {view.type}</span><h1>{tender.title}</h1><p><Landmark size={14}/> {view.authority}</p></div><div><b>Publié</b><Link className="p-button p-button--dark" to="/connexion">Se connecter pour soumissionner</Link></div></div></div></section>
    <section className="p-section p-detail"><div className="p-container">
      <header className="p-detail__heading"><div><span>APPEL D’OFFRES</span><h2>Informations publiées</h2></div><small>Publication : {formatDate(tender.publishedAt)}</small></header>
      <div className="p-detail-facts"><article><span><WalletCards size={16}/></span><small>Budget estimatif</small><b>{formatMoney(tender.estimatedBudget)} {tender.currency}</b></article><article><span><CalendarDays size={16}/></span><small>Publié le</small><b>{formatDate(tender.publishedAt)}</b></article><article><span><Clock3 size={16}/></span><small>Date limite</small><b>{formatDate(tender.submissionDeadline, { dateStyle: 'medium', timeStyle: 'short' })}</b></article><article><span><Landmark size={16}/></span><small>Type</small><b>{view.type}</b></article></div>
      <article className="p-detail-block"><h2>Description</h2><p>{tender.description || 'Aucune description publiée.'}</p></article>
      <article className="p-application"><header><span className="p-kicker">DOCUMENTS DE CONSULTATION</span><h2>Documents associés</h2><p>La présence d’un document dans cette liste ne valide pas son contenu ni son authenticité.</p></header>
        {(tender.documents || []).length ? <div>{tender.documents.map((doc) => <span key={doc.id}><FileText size={18}/><b>{doc.label || doc.originalName || 'Document'}</b><small>{doc.originalName || ''}</small>{localStorage.getItem('marches-token') && <button onClick={() => download(doc)} type="button"><Download size={14}/> Télécharger</button>}</span>)}</div> : <p>Aucun document de consultation n’est associé.</p>}
        <Link className="p-button p-button--dark" to="/connexion">Se connecter pour déposer une offre</Link>
      </article>
    </div></section>
  </main>
}
