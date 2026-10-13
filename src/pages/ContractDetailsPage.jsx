import { ArrowLeft, Check, CircleDollarSign, FilePlus2, Flag, Plus, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useApp } from '../context/useApp'
import { formatDate, formatMoney } from '../utils/formatters'

export default function ContractDetailsPage() {
  const { id } = useParams()
  const { role, showToast } = useApp()
  const manager = role === 'authority'
  const canSubmitDeliverable = ['authority', 'supplier'].includes(role)
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState(0)
  const [payment, setPayment] = useState({ amount: '', dueDate: '' })
  const [penalty, setPenalty] = useState('')
  const [rating, setRating] = useState('')
  const [milestone, setMilestone] = useState({ title: '', dueDate: '' })
  const [deliverable, setDeliverable] = useState({ title: '', description: '', file: null })

  const load = async () => {
    const result = await api.get(`/contracts/${id}`)
    setContract(result)
    setProgress(result.progress ?? 0)
    setRating(result.finalSupplierRating ?? '')
  }
  useEffect(() => {
    let active = true
    api.get(`/contracts/${id}`).then((result) => { if (active) { setContract(result); setProgress(result.progress ?? 0); setRating(result.finalSupplierRating ?? '') } })
      .catch((requestError) => { if (active) setError(requestError.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  const act = async (task, success) => {
    setSaving(true); setError('')
    try { await task(); await load(); showToast(success) }
    catch (requestError) { setError(requestError.message) }
    finally { setSaving(false) }
  }
  const submitDeliverable = async (event) => {
    event.preventDefault()
    const form = new FormData()
    form.append('title', deliverable.title)
    form.append('description', deliverable.description)
    if (deliverable.file) form.append('file', deliverable.file)
    await act(async () => { await api.post(`/contracts/${id}/deliverables`, form); setDeliverable({ title: '', description: '', file: null }) }, 'Livrable transmis pour validation')
  }
  const submitMilestone = async (event) => {
    event.preventDefault()
    await act(async () => { await api.post(`/contracts/${id}/milestones`, milestone); setMilestone({ title: '', dueDate: '' }) }, 'Jalon ajouté')
  }

  if (loading) return <div className="loading-state"><span className="spinner" /> Chargement du contrat…</div>
  if (error && !contract) return <p className="authority-inline-error">{error}</p>
  if (!contract) return null

  return <div className="contract-detail">
    <Link className="contract-detail__back" to="/app/contrats"><ArrowLeft size={15} /> Retour aux contrats</Link>
    <header className="authority-page-head"><div><span className="eyebrow">SUIVI D’EXÉCUTION</span><h1>{contract.reference || 'Contrat'}</h1><p>{contract.tender?.title || 'Marché attribué'} · {contract.supplier?.companyName || 'Fournisseur'}</p></div><strong>{contract.status?.replaceAll('_', ' ')}</strong></header>
    {error && <p className="authority-inline-error" role="alert">{error}</p>}
    <section className="contract-detail__stats"><article><small>MONTANT DU MARCHÉ</small><b>{formatMoney(contract.amount, contract.currency)}</b></article><article><small>AVANCEMENT</small><b>{contract.progress ?? 0}%</b></article><article><small>PÉNALITÉS APPLIQUÉES</small><b>{formatMoney(contract.penaltyApplied, contract.currency)}</b></article><article><small>ÉVALUATION FINALE</small><b>{contract.finalSupplierRating == null ? '—' : `${contract.finalSupplierRating}/5`}</b></article></section>

    <div className="contract-detail__grid">
      <main>
        <section className="admin-contract-panel"><header><h2><Flag size={16}/> Jalons et avancement</h2></header>
          {manager && <form className="contract-detail__inline-form" onSubmit={submitMilestone}><input value={milestone.title} onChange={(event) => setMilestone((current) => ({ ...current, title: event.target.value }))} placeholder="Nom du jalon" required /><input type="date" value={milestone.dueDate} onChange={(event) => setMilestone((current) => ({ ...current, dueDate: event.target.value }))} /><button className="authority-btn authority-btn--dark" disabled={saving} type="submit"><Plus size={13}/> Ajouter</button></form>}
          <div className="contract-detail__list">{(contract.milestones || []).map((item) => <article key={item.id}><div><b>{item.title}</b><small>Échéance : {formatDate(item.dueDate)} · {item.status?.replaceAll('_', ' ')}</small></div>{manager && <select value={item.status} onChange={(event) => act(() => api.post(`/contracts/milestones/${item.id}/status`, { status: event.target.value }), 'Jalon mis à jour')}><option value="a_faire">À faire</option><option value="en_cours">En cours</option><option value="valide">Validé</option><option value="en_retard">En retard</option></select>}</article>)}{!contract.milestones?.length && <p className="empty-copy">Aucun jalon enregistré.</p>}</div>
          {manager && <form className="contract-detail__inline-form" onSubmit={(event) => { event.preventDefault(); act(() => api.post(`/contracts/${id}/progress`, { progress: Number(progress) }), 'Avancement enregistré') }}><label>Avancement (%)<input type="number" min="0" max="100" value={progress} onChange={(event) => setProgress(event.target.value)} /></label><button className="authority-btn authority-btn--dark" disabled={saving} type="submit"><Save size={13}/> Enregistrer</button></form>}
        </section>

        <section className="admin-contract-panel"><header><h2><FilePlus2 size={16}/> Livrables</h2><span>{contract.deliverables?.length || 0} élément(s)</span></header>
          <div className="contract-detail__list">{(contract.deliverables || []).map((item) => <article key={item.id}><div><b>{item.title}</b><small>{item.originalName || item.description || 'Sans pièce jointe'} · transmis le {formatDate(item.submissionDate)}</small>{item.validationComment && <small>Retour : {item.validationComment}</small>}</div><span>{item.status?.replaceAll('_', ' ')}</span>{manager && <select value={item.status} onChange={(event) => act(() => api.post(`/contracts/deliverables/${item.id}/validate`, { status: event.target.value, validationComment: '' }), 'Validation du livrable enregistrée')}><option value="en_attente">À examiner</option><option value="valide">Valider</option><option value="rejete">Rejeter</option></select>}</article>)}{!contract.deliverables?.length && <p className="empty-copy">Aucun livrable déposé.</p>}</div>
          {canSubmitDeliverable && <form className="contract-detail__form" onSubmit={submitDeliverable}><h3>Transmettre un livrable</h3><label>Titre<input value={deliverable.title} onChange={(event) => setDeliverable((current) => ({ ...current, title: event.target.value }))} required maxLength={200} /></label><label>Description<textarea value={deliverable.description} onChange={(event) => setDeliverable((current) => ({ ...current, description: event.target.value }))} maxLength={2000} rows={2} /></label><label>Pièce PDF<input type="file" accept="application/pdf,.pdf" onChange={(event) => setDeliverable((current) => ({ ...current, file: event.target.files?.[0] || null }))} /></label><button className="authority-btn authority-btn--dark" disabled={saving} type="submit"><FilePlus2 size={13}/> Envoyer pour examen</button></form>}
        </section>
      </main>

      <aside>
        {manager && <>
          <section className="admin-contract-panel"><header><h2><CircleDollarSign size={16}/> Paiements</h2></header><div className="contract-detail__list">{(contract.payments || []).map((item) => <article key={item.id}><div><b>{formatMoney(item.amount, item.currency)}</b><small>Échéance : {formatDate(item.dueDate)}</small></div><span>{item.status}</span></article>)}{!contract.payments?.length && <p className="empty-copy">Aucun paiement enregistré.</p>}</div><form className="contract-detail__form" onSubmit={(event) => { event.preventDefault(); act(() => api.post(`/contracts/${id}/payments`, payment), 'Paiement enregistré'); setPayment({ amount: '', dueDate: '' }) }}><label>Montant<input type="number" min="1" step="0.01" value={payment.amount} onChange={(event) => setPayment((current) => ({ ...current, amount: event.target.value }))} required /></label><label>Date d’échéance<input type="date" value={payment.dueDate} onChange={(event) => setPayment((current) => ({ ...current, dueDate: event.target.value }))} /></label><button className="authority-btn authority-btn--dark" disabled={saving} type="submit"><Plus size={13}/> Ajouter un paiement</button></form></section>
          <section className="admin-contract-panel"><header><h2>Clôture du marché</h2></header><form className="contract-detail__form" onSubmit={(event) => { event.preventDefault(); act(() => api.post(`/contracts/${id}/penalty`, { amount: Number(penalty) }), 'Pénalité enregistrée'); setPenalty('') }}><label>Ajouter une pénalité ({contract.currency})<input type="number" min="0.01" step="0.01" value={penalty} onChange={(event) => setPenalty(event.target.value)} required /></label><button className="authority-btn authority-btn--ghost" disabled={saving} type="submit">Appliquer</button></form><form className="contract-detail__form" onSubmit={(event) => { event.preventDefault(); act(() => api.post(`/contracts/${id}/rating`, { rating: Number(rating) }), 'Évaluation finale enregistrée') }}><label>Note finale du fournisseur / 5<input type="number" min="0" max="5" step="0.1" value={rating} onChange={(event) => setRating(event.target.value)} required /></label><button className="authority-btn authority-btn--dark" disabled={saving || contract.status !== 'termine'} type="submit"><Check size={13}/> Enregistrer la note</button>{contract.status !== 'termine' && <small>La note finale est disponible après clôture du contrat.</small>}</form></section>
        </>}
        {!manager && <section className="admin-contract-panel"><header><h2>Dates contractuelles</h2></header><p>Début : {formatDate(contract.startDate)}</p><p>Fin prévue : {formatDate(contract.endDate)}</p><p>Progression enregistrée : {contract.progress ?? 0}%</p></section>}
      </aside>
    </div>
  </div>
}
