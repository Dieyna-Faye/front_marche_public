import {
  Bot, Check, ChevronRight, CircleCheck, ClipboardCheck, FileSearch, FileText,
  Gavel, MapPin, Save, Send, UploadCloud,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { tenderService } from '../services/tenderService'

const initialForm = {
  titre: '',
  description: '',
  budgetEstimatif: '',
  typeMarche: '',
  dateLimiteSoumission: '',
  reference: 'REF-2024-001',
  nombreLots: '03',
  localisation: 'Paris, FR',
}

const steps = [
  { label: 'Dépôt des besoins', icon: ClipboardCheck, done: true },
  { label: 'Analyse IA', icon: Bot, done: true },
  { label: 'Évaluation technique', icon: FileSearch },
  { label: 'Évaluation financière', icon: FileText },
  { label: 'Publication résultats', icon: Send },
  { label: 'Décision finale', icon: Gavel },
]

export default function CreateTenderPage() {
  const [form, setForm] = useState(initialForm)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const { showToast } = useApp()

  useEffect(() => {
    if (!id) return
    tenderService.get(id).then((tender) => setForm((current) => ({
      ...current,
      titre: tender.titre,
      description: tender.description,
      budgetEstimatif: tender.budgetEstimatif,
      typeMarche: tender.typeMarche,
      dateLimiteSoumission: new Date(tender.dateLimiteSoumission).toISOString().slice(0, 16),
      reference: `AO-${tender.id}`,
    }))).catch((requestError) => setError(requestError.message))
  }, [id])

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        titre: form.titre,
        description: form.description,
        budgetEstimatif: Number(form.budgetEstimatif),
        typeMarche: form.typeMarche,
        dateLimiteSoumission: new Date(form.dateLimiteSoumission).toISOString(),
      }
      const tender = isEditing ? await tenderService.update(id, payload) : await tenderService.create(payload)
      if (file) await tenderService.uploadSpecifications(tender.id, file)
      showToast(isEditing ? 'Le marché a été mis à jour' : 'Le marché a été enregistré en brouillon')
      navigate(`/app/appels-offres/${tender.id}`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="authority-create">
      <div className="authority-breadcrumb"><span>Marchés</span><ChevronRight size={12} /><b>{isEditing ? 'Modifier' : 'Nouveau'}</b></div>

      <header className="authority-page-head">
        <div>
          <h1>{isEditing ? 'Modifier le Marché Public' : 'Nouveau Marché Public'}</h1>
          <p>Configurez les paramètres de votre appel d’offre. Notre IA vous assistera dans la rédaction et la validation des clauses critiques.</p>
        </div>
        <div className="authority-page-head__actions">
          <button className="authority-btn authority-btn--ghost" form="authority-tender-form" disabled={loading} type="submit"><Save size={14} /> Brouillon</button>
          <button className="authority-btn authority-btn--dark" form="authority-tender-form" disabled={loading} type="submit">
            {loading ? <span className="spinner" /> : <>Suivant <ChevronRight size={15} /></>}
          </button>
        </div>
      </header>

      <section className="authority-workflow">
        <h2>Workflow de Suivi</h2>
        <div>
          {steps.map(({ label, icon: Icon, done }, index) => (
            <div className={`authority-workflow__step ${done ? 'is-done' : ''}`} key={label}>
              <span>{done ? <Check size={13} /> : <Icon size={13} />}</span>
              <small>{label}</small>
              {index < steps.length - 1 && <i />}
            </div>
          ))}
        </div>
      </section>

      <form className="authority-tender-form" id="authority-tender-form" onSubmit={submit}>
        <section className="authority-form-card">
          <h2><CircleCheck size={16} /> Détails du Marché</h2>
          <label className="authority-field authority-field--full">Titre de l’appel d’offres
            <input name="titre" value={form.titre} onChange={update} placeholder="Ex. Rénovation énergétique du centre administratif" required />
          </label>
          <label className="authority-field">Secteur d’activité
            <select name="typeMarche" value={form.typeMarche} onChange={update} required>
              <option value="">Sélectionner un secteur</option>
              <option value="TRAVAUX">Infrastructures & Travaux</option>
              <option value="FOURNITURES">Fournitures</option>
              <option value="SERVICES">Services</option>
              <option value="PRESTATIONS_INTELLECTUELLES">Prestations intellectuelles</option>
            </select>
          </label>
          <label className="authority-field">Référence interne
            <input name="reference" value={form.reference} onChange={update} />
          </label>
          <label className="authority-field authority-field--full">Description du besoin
            <textarea name="description" value={form.description} onChange={update} rows="6" placeholder="Décrivez les objectifs principaux du marché..." required />
          </label>
          {error && <p className="form-error authority-field--full" role="alert">{error}</p>}
        </section>

        <section className="authority-upload-card">
          <div className="authority-upload-card__icon"><FileText size={24} /></div>
          <h2>Cahier des Charges</h2>
          <p>Glissez-déposez votre document PDF (DOCX) pour une analyse automatique de l’IA.</p>
          <label className="authority-upload-button">
            <UploadCloud size={15} /> {file?.name || 'Parcourir les fichiers'}
            <input type="file" accept="application/pdf,.doc,.docx" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </label>
        </section>

        <section className="authority-critical">
          <header><h2>Paramètres Critiques</h2><button onClick={() => document.querySelector('[name="budgetEstimatif"]')?.focus()} type="button">Modifier</button></header>
          <div>
            <label>Budget estimé<input name="budgetEstimatif" type="number" min="1" value={form.budgetEstimatif} onChange={update} placeholder="450 000 €" required /></label>
            <label>Date de clôture<input name="dateLimiteSoumission" type="datetime-local" value={form.dateLimiteSoumission} onChange={update} required /></label>
            <label>Nb. de lots<input name="nombreLots" value={form.nombreLots} onChange={update} /></label>
            <label>Localisation<span><MapPin size={13} /><input name="localisation" value={form.localisation} onChange={update} /></span></label>
          </div>
        </section>
      </form>
    </div>
  )
}
