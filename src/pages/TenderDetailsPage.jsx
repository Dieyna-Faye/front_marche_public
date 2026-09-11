import { Archive, Building2, CalendarDays, Download, FileText, Send, UploadCloud, WalletCards } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, EmptyState, PageHeader, SectionCard } from '../components/ui'
import { useApp } from '../context/useApp'
import { tenderService } from '../services/tenderService'
import { formatDate, toTenderView } from '../utils/formatters'

export default function TenderDetailsPage({ publicView = false }) {
  const { id } = useParams()
  const { role, showToast } = useApp()
  const [tender, setTender] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await tenderService.get(id)
      setTender(toTenderView(result))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const changeStatus = async (action) => {
    setBusy(true)
    try {
      const result = await tenderService[action](id)
      setTender((current) => ({ ...current, ...toTenderView(result) }))
      showToast(action === 'publish' ? "L’appel d’offres est publié" : "L’appel d’offres est archivé")
    } catch (requestError) {
      showToast(requestError.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const uploadSpecifications = async () => {
    if (!file) return
    setBusy(true)
    try {
      await tenderService.uploadSpecifications(id, file)
      setFile(null)
      showToast('Cahier des charges ajouté')
      await load()
    } catch (requestError) {
      showToast(requestError.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const download = async (document) => {
    try {
      const blob = await tenderService.downloadDocument(id, document.id)
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

  if (loading) return <div className="loading-state"><span className="spinner" /> Chargement de l’appel d’offres…</div>
  if (error || !tender) return <EmptyState icon={FileText} title="Appel d’offres indisponible" description={error || 'Ressource introuvable.'} action={publicView ? <Link className="btn btn--primary" to="/connexion">Se connecter</Link> : null} />

  const canManage = role === 'admin' || role === 'authority'
  const actions = (
    <>
      {canManage && tender.statut === 'BROUILLON' && <button className="btn btn--primary" disabled={busy} onClick={() => changeStatus('publish')} type="button">Publier</button>}
      {canManage && tender.statut !== 'ARCHIVE' && <button className="btn btn--ghost" disabled={busy} onClick={() => changeStatus('archive')} type="button"><Archive size={17} /> Archiver</button>}
    </>
  )

  const content = (
    <>
      <PageHeader backTo={publicView ? '/appels-offres' : '/app/appels-offres'} eyebrow={`AO-${tender.id} · ${tender.type}`} title={tender.title} description={tender.authority} actions={actions} />
      <div className="detail-status"><Badge tone={tender.status === 'Publié' ? 'green' : tender.status === 'Brouillon' ? 'orange' : 'neutral'} dot>{tender.status}</Badge><span>Créé le {formatDate(tender.createdAt)}</span></div>
      <div className="detail-grid">
        <div className="detail-main">
          <SectionCard title="Objet du marché">
            <p className="detail-text">{tender.description}</p>
            <div className="detail-facts"><span><Building2 size={20} /><small>Autorité contractante</small><b>{tender.authority}</b></span><span><WalletCards size={20} /><small>Budget estimatif</small><b>{tender.budget}</b></span><span><CalendarDays size={20} /><small>Date limite</small><b>{tender.deadline}</b></span></div>
          </SectionCard>
          <SectionCard title="Documents de consultation" subtitle="Documents réellement associés à cet appel d’offres.">
            <div className="document-list">
              {(tender.documents || []).map((document) => <button key={document.id} onClick={() => download(document)} type="button"><span><FileText size={19} /></span><p><b>{document.nomOriginal}</b><small>{Math.ceil(document.tailleOctets / 1024)} Ko · {formatDate(document.createdAt)}</small></p><Download size={18} /></button>)}
              {(tender.documents || []).length === 0 && <p className="empty-copy">Aucun document n’a encore été déposé.</p>}
            </div>
            {canManage && <div className="inline-upload"><label className="btn btn--outline"><UploadCloud size={17} /> Choisir un PDF<input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label>{file && <span>{file.name}</span>}<button className="btn btn--primary" disabled={!file || busy} onClick={uploadSpecifications} type="button">Ajouter</button></div>}
          </SectionCard>
        </div>
        <aside className="detail-sidebar">
          {role === 'supplier' && tender.statut === 'PUBLIE' && <div className="apply-card"><span className="apply-card__icon"><Send size={22} /></span><h3>Déposer une offre</h3><p>Renseignez le montant, le délai proposé et joignez vos documents PDF.</p><Link className="btn btn--danger btn--block btn--large" to={`/app/soumissions/nouvelle?appel=${tender.id}`}>Déposer une offre</Link></div>}
          {!role && <div className="apply-card"><span className="apply-card__icon"><Send size={22} /></span><h3>Accès authentifié</h3><p>Le backend exige une connexion pour consulter et candidater.</p><Link className="btn btn--primary btn--block" to="/connexion">Se connecter</Link></div>}
          <SectionCard title="Référence"><div className="key-numbers"><span><b>AO-{tender.id}</b><small>{tender.type}</small></span><span><b>{tender.status}</b><small>Statut actuel</small></span></div></SectionCard>
        </aside>
      </div>
    </>
  )

  return publicView ? <main className="public-detail-page">{content}</main> : content
}
