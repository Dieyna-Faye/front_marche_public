import {
  ArrowRight, CalendarDays, CheckCircle2, Eye, Grid2X2, List,
  Megaphone, Pencil, Plus, ShieldCheck, UsersRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TenderCard from '../components/TenderCard'
import { Badge, EmptyState, PageHeader, SearchFilter } from '../components/ui'
import { useApp } from '../context/useApp'
import { tenderService } from '../services/tenderService'
import { formatMoney, toTenderView } from '../utils/formatters'
import tenderImage from '../assets/tender-handshake.png'

const statusOptions = [
  ['', 'Tous les statuts'],
  ['BROUILLON', 'Brouillon'],
  ['PUBLIE', 'Publié'],
  ['ARCHIVE', 'Archivé'],
]

function AuthorityTenders({ rows, search, setSearch, status, setStatus, type, setType, loading, error }) {
  const displayRows = rows
  const totalBudget = rows.reduce((total, tender) => total + Number(tender.budgetEstimatif || tender.budgetValue || 0), 0)
  return <div className="authority-tenders">
    <header className="authority-page-head">
      <div><h1>Gestion des Appels d’Offres</h1><p>Supervisez et gérez l’ensemble des opportunités de passation de marchés publics.</p></div>
      <div className="authority-page-head__actions"><Link className="authority-btn authority-btn--dark" to="/app/appels-offres/nouveau"><Plus size={14} /> Nouvel appel d’offre</Link></div>
    </header>

    <section className="authority-tender-filters">
      <label>CATÉGORIE<select value={type} onChange={(event) => setType(event.target.value)}><option value="">Toutes les catégories</option><option value="TRAVAUX">Travaux</option><option value="FOURNITURES">Fournitures</option><option value="SERVICES">Services</option></select></label>
      <label>STATUT<select value={status} onChange={(event) => setStatus(event.target.value)}>{statusOptions.map(([value, label]) => <option value={value} key={label}>{label}</option>)}</select></label>
      <label>BUDGET<select><option>Tous les budgets</option><option>Moins de 100 M</option><option>100 M et plus</option></select></label>
      <label>ÉCHÉANCE<span><CalendarDays size={13} /><input placeholder="jj/mm/aaaa" /></span></label>
      <button onClick={() => setSearch('')} type="button">Rechercher</button>
    </section>

    {loading && <div className="authority-inline-status"><span className="spinner" /> Chargement des appels d’offres…</div>}
    {error && <p className="authority-inline-error">Les données de démonstration sont affichées : {error}</p>}

    <div className="authority-tender-grid">
      {displayRows.filter((tender) => `${tender.title} ${tender.id}`.toLowerCase().includes(search.toLowerCase())).map((tender) => {
        const code = String(tender.id).startsWith('AO-') ? tender.id : `AO-${tender.id}`
        return <article className="authority-tender-card" key={tender.id}>
          <div className="authority-tender-card__image"><img src={tenderImage} alt="Réunion autour d’un appel d’offres" /><span>{tender.status?.toUpperCase()}</span><div><Link title="Consulter" to={`/app/appels-offres/${tender.id}`}><Eye size={13} /></Link><Link title="Modifier" to={`/app/appels-offres/${tender.id}/modifier`}><Pencil size={13} /></Link></div></div>
          <div className="authority-tender-card__body"><small>{code} · {tender.type}</small><h2>{tender.title}</h2><p>{tender.description}</p><div><em>{tender.deadline}</em><em>{tender.budget}</em><em>{tender.type}</em></div></div>
        </article>
      })}{!loading && !error && displayRows.length === 0 && <p className="empty-copy">Aucun appel d’offres enregistré.</p>}
    </div>

    <div className="authority-tender-pagination"><span>Affichage de {displayRows.length} résultat(s)</span><div><button type="button">‹</button><button className="active" type="button">1</button><button type="button">›</button></div></div>

    <div className="authority-tender-insights">
      <article className="is-blue"><span><ShieldCheck size={17} /></span><p><small>ANALYSE IA</small><b>Analyse de Conformité</b><em>L’IA détecte les anomalies potentielles dans les clauses et les documents.</em><a href="#alerts">Examiner les alertes <ArrowRight size={12} /></a></p></article>
      <article><span><CheckCircle2 size={17} /></span><p><small>VOLUME GLOBAL</small><b>{formatMoney(totalBudget)} engagés</b><em>Somme des budgets des appels d’offres affichés.</em><i><strong style={{ width: displayRows.length ? '74%' : '0%' }} /></i></p></article>
      <article><span><UsersRound size={17} /></span><p><small>PROCÉDURES</small><b>{displayRows.length} appel(s) d’offres</b><em>Données appartenant au compte Autorité connecté.</em><span className="insight-avatars"><i>AO</i></span></p></article>
    </div>
  </div>
}

export default function TendersPage({ publicView = false }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [view, setView] = useState('grid')
  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { role } = useApp()

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    tenderService.list({ statut: status, typeMarche: type })
      .then((items) => { if (active) setTenders(items.map(toTenderView)) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [status, type])

  const filtered = useMemo(() => tenders.filter((item) =>
    `${item.title} ${item.id} ${item.authority}`.toLowerCase().includes(search.toLowerCase()),
  ), [search, tenders])

  const results = loading
    ? <div className="loading-state"><span className="spinner" /> Chargement des appels d’offres…</div>
    : error
      ? <EmptyState icon={Megaphone} title="Appels d’offres indisponibles" description={error} action={publicView ? <Link className="btn btn--primary" to="/connexion">Se connecter</Link> : null} />
      : filtered.length === 0
        ? <EmptyState icon={Megaphone} title="Aucun appel d’offres" description="Aucun résultat ne correspond aux critères sélectionnés." />
        : view === 'grid'
          ? <div className={`tender-grid ${publicView ? 'tender-grid--public' : ''}`}>{filtered.map((tender) => <TenderCard tender={tender} publicView={publicView} key={tender.id} />)}</div>
          : <div className="table-card"><table><thead><tr><th>Référence & objet</th><th>Autorité</th><th>Budget</th><th>Échéance</th><th>Statut</th><th /></tr></thead><tbody>{filtered.map((tender) => <tr key={tender.id}><td><Link className="table-title" to={`${publicView ? '/appels-offres' : '/app/appels-offres'}/${tender.id}`}><b>{tender.title}</b><span>AO-{tender.id} · {tender.type}</span></Link></td><td>{tender.authority}</td><td><b>{tender.budget}</b></td><td>{tender.deadline}</td><td><Badge tone={tender.status === 'Publié' ? 'green' : tender.status === 'Brouillon' ? 'orange' : 'neutral'} dot>{tender.status}</Badge></td><td><Link className="icon-button" to={`${publicView ? '/appels-offres' : '/app/appels-offres'}/${tender.id}`}>→</Link></td></tr>)}</tbody></table></div>

  if (role === 'authority' && !publicView) return <AuthorityTenders rows={filtered} search={search} setSearch={setSearch} status={status} setStatus={setStatus} type={type} setType={setType} loading={loading} error={error} />

  if (publicView) return (
    <main className="public-list-page">
      <section className="public-page-hero"><span className="eyebrow">COMMANDE PUBLIQUE</span><h1>Trouvez votre prochaine opportunité</h1><p>Consultez les appels d’offres disponibles dans la plateforme.</p></section>
      <section className="public-section public-section--list">
        <SearchFilter value={search} onChange={setSearch} placeholder="Rechercher par titre, référence ou autorité…">
          <select value={status} onChange={(event) => setStatus(event.target.value)}>{statusOptions.map(([value, label]) => <option value={value} key={label}>{label}</option>)}</select>
          <select value={type} onChange={(event) => setType(event.target.value)}><option value="">Tous les types</option><option value="TRAVAUX">Travaux</option><option value="FOURNITURES">Fournitures</option><option value="SERVICES">Services</option><option value="PRESTATIONS_INTELLECTUELLES">Prestations intellectuelles</option><option value="MAINTENANCE">Maintenance</option><option value="INFORMATIQUE">Informatique</option><option value="EQUIPEMENTS">Équipements</option></select>
        </SearchFilter>
        <div className="result-count"><b>{filtered.length} appels d’offres</b><span>Données fournies par l’API</span></div>
        {results}
      </section>
    </main>
  )

  return (
    <>
      <PageHeader eyebrow="MARCHÉS PUBLICS" title="Appels d’offres" description="Créez, publiez et suivez les procédures disponibles." actions={(role === 'admin' || role === 'authority') && <Link className="btn btn--primary" to="/app/appels-offres/nouveau"><Plus size={18} /> Nouvel appel d’offres</Link>} />
      <div className="list-toolbar">
        <SearchFilter value={search} onChange={setSearch} placeholder="Rechercher un appel d’offres…">
          <select value={status} onChange={(event) => setStatus(event.target.value)}>{statusOptions.map(([value, label]) => <option value={value} key={label}>{label}</option>)}</select>
          <select value={type} onChange={(event) => setType(event.target.value)}><option value="">Toutes les catégories</option><option value="TRAVAUX">Travaux</option><option value="FOURNITURES">Fournitures</option><option value="SERVICES">Services</option><option value="PRESTATIONS_INTELLECTUELLES">Prestations intellectuelles</option><option value="MAINTENANCE">Maintenance</option><option value="INFORMATIQUE">Informatique</option><option value="EQUIPEMENTS">Équipements</option></select>
        </SearchFilter>
        <div className="view-switch"><button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} type="button" aria-label="Affichage en cartes"><Grid2X2 size={17} /></button><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} type="button" aria-label="Affichage en liste"><List size={18} /></button></div>
      </div>
      <div className="result-count"><b>{filtered.length} résultats</b><span>Triés par date de création</span></div>
      {results}
    </>
  )
}
