import { Check, ChevronRight, FileText, LockKeyhole, Trash2, UploadCloud } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { offerService } from '../services/offerService'
import { tenderService } from '../services/tenderService'
import { toTenderView } from '../utils/formatters'

const documentTypes = [
  ['OFFRE_TECHNIQUE', 'Offre technique'],
  ['OFFRE_FINANCIERE', 'Offre financière'],
  ['REGISTRE_COMMERCE', 'Registre de commerce'],
  ['QUITUS_FISCAL', 'Quitus fiscal'],
  ['ATTESTATION_SOCIALE', 'Attestation sociale'],
  ['MEMOIRE_TECHNIQUE', 'Mémoire technique'],
  ['PLANNING_EXECUTION', 'Planning d’exécution'],
  ['AUTRE', 'Autre document'],
]

export default function SubmissionFormPage() {
  const [searchParams] = useSearchParams()
  const [tenders, setTenders] = useState([])
  const [tenderId, setTenderId] = useState(searchParams.get('appel') || '')
  const [amount, setAmount] = useState('')
  const [days, setDays] = useState('')
  const [documents, setDocuments] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { showToast } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    tenderService.list({ statut: 'PUBLIE' })
      .then((items) => setTenders(items.map(toTenderView)))
      .catch((requestError) => setError(requestError.message))
  }, [])

  const selectedTender = useMemo(() => tenders.find((item) => item.id === String(tenderId)), [tenderId, tenders])
  const uploadedEntries = Object.entries(documents).filter(([, file]) => file)

  const addFiles = (fileList) => {
    const files = Array.from(fileList || [])
    setDocuments((current) => {
      const next = { ...current }
      files.forEach((file, index) => {
        const type = documentTypes.find(([candidate]) => !next[candidate])?.[0] || documentTypes[index % documentTypes.length][0]
        next[type] = file
      })
      return next
    })
  }

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const offer = await offerService.submit(tenderId, {
        montantPropose: Number(amount),
        delaiExecutionJours: Number(days),
      })
      const entries = Object.entries(documents).filter(([, file]) => file)
      const results = await Promise.allSettled(entries.map(([type, file]) => offerService.uploadDocument(offer.id, type, file)))
      const failedCount = results.filter((result) => result.status === 'rejected').length
      showToast(failedCount ? `Offre soumise, mais ${failedCount} document(s) n’ont pas été ajouté(s).` : `Offre soumise — accusé ${offer.accuseReception}`, failedCount ? 'error' : 'success')
      navigate('/app/soumissions')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const saveDraft = async () => {
    if (!tenderId) {
      setError("Sélectionnez d’abord un appel d’offres.")
      return
    }
    setLoading(true)
    setError('')
    try {
      const offer = await offerService.saveDraft(tenderId, {
        montantPropose: amount ? Number(amount) : null,
        delaiExecutionJours: days ? Number(days) : null,
      })
      const entries = Object.entries(documents).filter(([, file]) => file)
      const results = await Promise.allSettled(entries.map(([type, file]) => offerService.uploadDocument(offer.id, type, file)))
      const failedCount = results.filter((result) => result.status === 'rejected').length
      showToast(failedCount ? `Brouillon enregistré, mais ${failedCount} document(s) n’ont pas été ajouté(s).` : 'Brouillon enregistré dans la base de données.', failedCount ? 'error' : 'success')
      navigate('/app/soumissions')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return <div className="supplier-submission">
    <header className="authority-page-head"><div><h1>Nouveau dépôt d’offre</h1><p>Analysez et complétez votre dossier précisément pour l’appel d’offres relatif aux infrastructures intelligentes.</p></div></header>

    <section className="supplier-submission-steps">{['Création du projet', 'Documents', 'Évaluation financière', 'Détails finaux'].map((label, index) => <div className={index < 2 ? 'is-active' : ''} key={label}><span>{index < 2 ? <Check size={12} /> : index + 1}</span><small>{label}</small>{index < 3 && <i />}</div>)}</section>

    <form className="supplier-submission-layout" id="submission-form" onSubmit={submit}>
      <main>
        <label className="supplier-upload-zone"><span><UploadCloud size={23} /></span><b>Télécharger le dossier final</b><p>Glissez et déposez vos fichiers PDF ou ZIP, ou cliquez pour parcourir.</p><em>Sélectionner des fichiers</em><input type="file" accept="application/pdf,.zip" multiple onChange={(event) => addFiles(event.target.files)} /></label>
        <section className="supplier-document-list"><header><h2>Documents joints</h2><span>{uploadedEntries.length} fichier(s) sélectionné(s)</span></header>{uploadedEntries.map(([type, file]) => <article key={type}><span><FileText size={15} /></span><p><b>{file.name}</b><small>{documentTypes.find(([candidate]) => candidate === type)?.[1]} · {(file.size / 1024 / 1024).toFixed(2)} Mo</small></p><button onClick={() => setDocuments((current) => ({ ...current, [type]: null }))} type="button"><Trash2 size={14} /></button></article>)}{uploadedEntries.length === 0 && <p className="empty-copy">Aucun document sélectionné.</p>}</section>
      </main>

      <aside>
        <section className="supplier-deposit-summary"><h2>Résumé du dépôt</h2><label>Appel d’offres<select value={tenderId} onChange={(event) => setTenderId(event.target.value)} required><option value="">Sélectionner un marché</option>{tenders.map((tender) => <option value={tender.id} key={tender.id}>AO-{tender.id} — {tender.title}</option>)}</select></label><dl><div><dt>Réf. de l’offre</dt><dd>{selectedTender ? `OFFRE-${selectedTender.id}` : '—'}</dd></div><div><dt>Entreprise</dt><dd>Compte fournisseur connecté</dd></div><div><dt>Type de marché</dt><dd>{selectedTender?.type || '—'}</dd></div><div><dt>Échéance</dt><dd>{selectedTender?.deadline || '—'}</dd></div></dl><div className="supplier-financial-fields"><label>Montant proposé (FCFA)<input type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label><label>Délai d’exécution (jours)<input type="number" min="1" value={days} onChange={(event) => setDays(event.target.value)} required /></label></div><div className="supplier-validation"><b>ÉTAT DE VALIDATION</b><span className={tenderId ? 'done' : ''}><i /> Marché sélectionné</span><span className={amount && days ? 'done' : ''}><i /> Proposition financière saisie</span><span className={uploadedEntries.length ? 'done' : ''}><i /> Documents déposés</span><em>{Math.max(0, 3 - [tenderId, amount && days, uploadedEntries.length].filter(Boolean).length)} étape(s) restante(s)</em></div><button className="supplier-submit-final" disabled={loading} type="submit">{loading ? <span className="spinner" /> : <>Soumission Finale <ChevronRight size={14} /></>}</button><button disabled={loading} onClick={saveDraft} type="button">Enregistrer en brouillon</button></section>
        <section className="supplier-help"><LockKeyhole size={18} /><p><b>Besoin d’aide ?</b><small>Vos fichiers sont transmis de manière sécurisée. Contactez le support en cas de difficulté.</small></p></section>
        {error && <p className="authority-inline-error" role="alert">{error}</p>}
      </aside>
    </form>
  </div>
}
