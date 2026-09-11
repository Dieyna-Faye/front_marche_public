import { AlertTriangle, Archive, ArrowUpRight, Bell, BriefcaseBusiness, CalendarDays, CircleDollarSign, Download, Eye, FileStack, Megaphone, Send, Sparkles, TrendingUp, UsersRound, WalletCards } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, EmptyState, LinkAction, SectionCard, StatCard } from '../components/ui'
import { useApp } from '../context/useApp'
import { dashboardService } from '../services/dashboardService'
import { offerService } from '../services/offerService'
import { tenderService } from '../services/tenderService'
import { formatMoney, toTenderView } from '../utils/formatters'

const copyByRole = {
  admin: { title: 'Vue d’ensemble de la plateforme', description: 'Indicateurs fournis par le backend MVP1.' },
  authority: { title: 'Pilotage de vos marchés', description: 'Suivez les appels d’offres et les offres reçues.' },
  supplier: { title: 'Votre espace fournisseur', description: 'Retrouvez les opportunités publiées et vos soumissions.' },
  commission: { title: 'Espace de la commission', description: 'Consultez les appels d’offres et les soumissions accessibles.' },
  auditor: { title: 'Tableau de bord d’audit', description: 'Consultez les indicateurs disponibles dans le MVP1.' },
}

function AdminDashboard({ summary, user, tenders }) {
  const firstName = (user?.name || 'Alexandre').split(' ')[0].toUpperCase()
  const adminStats = [
    [Send, 'Soumissions', summary?.nombreOffresRecues ?? 0, 'Offres enregistrées', 'navy'],
    [BriefcaseBusiness, 'Appels publiés', summary?.appelsOffresPublies ?? 0, 'Procédures ouvertes', 'blue'],
    [UsersRound, 'Fournisseurs', summary?.nombreFournisseursInscrits ?? 0, 'Comptes enregistrés', 'ice'],
    [AlertTriangle, 'Brouillons', summary?.appelsOffresBrouillon ?? 0, 'À finaliser', 'cream'],
  ]
  const activeMarkets = tenders.slice(0, 3).map((tender) => ({
    title: tender.title,
    amount: tender.budget,
    progress: tender.status === 'Archivé' ? 100 : tender.status === 'Publié' ? 65 : 25,
    status: tender.status,
  }))

  return <div className="admin-dashboard">
    <header className="admin-dashboard__welcome"><h1>Bonjour, {firstName}</h1><p>Analysez toutes les offres de la plateforme et les données les plus fiables.</p></header>

    <section className="admin-ai"><span><Sparkles size={20}/></span><div className="admin-ai__intro"><b>Aperçu Intelligent ProcureAI</b><small>Données actualisées</small></div><article><b>ACTIVITÉ</b><p>{summary?.nombreOffresRecues ?? 0} offre(s) reçue(s) sur {summary?.nombreAppelsOffres ?? 0} procédure(s).</p></article><article><b>PARTICIPATION</b><p>Moyenne réelle de {summary?.tauxParticipationMoyen ?? 0} offre(s) par appel publié.</p></article><article><b>SUIVI</b><p>{summary?.appelsOffresBrouillon ?? 0} appel(s) d’offres restent à finaliser.</p></article></section>

    <div className="admin-dashboard__main">
      <div className="admin-stats">{adminStats.map(([Icon,label,value,helper,tone])=><article className={`admin-stat admin-stat--${tone}`} key={label}><header><span>{label}</span><i><Icon size={17}/></i></header><strong>{value}</strong><small>{helper}</small></article>)}</div>
      <section className="admin-chart"><header><div><h2>Participation des Fournisseurs</h2><p>Taux de participation mensuel</p></div><button type="button">Détails à suivre <ArrowUpRight size={13}/></button></header><div className="admin-chart__plot"><div className="admin-chart__y"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><svg viewBox="0 0 700 235" preserveAspectRatio="none" aria-label="Évolution de la participation"><defs><linearGradient id="adminArea" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#567c8d" stopOpacity=".28"/><stop offset="1" stopColor="#567c8d" stopOpacity="0"/></linearGradient></defs><path className="admin-chart__area" d="M0 190 C70 165 96 172 150 142 S260 129 310 119 S405 145 458 98 S560 86 610 67 S670 54 700 38 L700 235 L0 235Z"/><path className="admin-chart__line" d="M0 190 C70 165 96 172 150 142 S260 129 310 119 S405 145 458 98 S560 86 610 67 S670 54 700 38"/></svg><div className="admin-chart__months">{['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'].map((month)=><span key={month}>{month}</span>)}</div></div></section>
    </div>

    <section className="admin-markets"><header><div><h2>Marchés en Cours</h2><p>Suivi des appels d’offres réellement enregistrés</p></div><CircleDollarSign size={19}/></header><div>{activeMarkets.map(({title,amount,progress,status})=><article key={title}><span className="admin-market__tag">{status}</span><div className="admin-market__line"><b>{title}</b><strong>{amount}</strong></div><div className="admin-market__progress"><i style={{width:`${progress}%`}}/></div><small><span>Avancement procédural {progress}%</span><span>{status}</span></small></article>)}{activeMarkets.length === 0 && <p className="empty-copy">Aucun marché enregistré.</p>}</div></section>
  </div>
}

function SupplierDashboard({ summary, user, tenders, offers }) {
  const firstName = user?.name || 'Fournisseur'
  const submitted = summary?.nombreSoumissions ?? offers.length
  const accepted = summary?.soumissionsAcceptees ?? offers.filter((offer) => offer.statut === 'ACCEPTEE').length
  const evaluating = summary?.soumissionsEnEvaluation ?? offers.filter((offer) => offer.statut === 'EN_COURS_EVALUATION').length
  const rejected = summary?.soumissionsRejetees ?? offers.filter((offer) => offer.statut === 'REJETEE').length
  const statusTotal = Math.max(1, submitted)
  const recentOffers = offers.slice(0, 5)
  const monthCounts = Array.from({ length: 6 }, (_, offset) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - offset))
    const count = offers.filter((offer) => {
      const offerDate = new Date(offer.dateSoumission || offer.createdAt)
      return offerDate.getMonth() === date.getMonth() && offerDate.getFullYear() === date.getFullYear()
    }).length
    return { label: new Intl.DateTimeFormat('fr-SN', { month: 'short' }).format(date), count }
  })
  const maxCount = Math.max(1, ...monthCounts.map((item) => item.count))

  return <div className="supplier-dashboard">
    <header className="supplier-dashboard__head"><div><h1>Bonjour, {firstName}</h1><p>Bon retour. Vous avez {tenders.length} opportunité(s) accessible(s) et {evaluating} offre(s) en cours d’évaluation.</p></div><div><button className="authority-btn authority-btn--ghost" type="button"><CalendarDays size={14} /> 30 derniers jours</button><button className="authority-btn authority-btn--dark" onClick={() => window.print()} type="button"><Download size={14} /> Exporter le rapport</button></div></header>

    <div className="supplier-dashboard__stats">
      <article><span>OFFRES DISPONIBLES</span><strong>{summary?.opportunitesPubliees ?? tenders.length}</strong><small>Opportunités ouvertes</small></article>
      <article><span>OFFRES ENVOYÉES</span><strong>{submitted}</strong><small>Soumissions déposées</small></article>
      <article><span>OFFRES ADMISSIBLES</span><strong>{accepted + evaluating}</strong><small>Acceptées ou en analyse</small></article>
      <article><span>OFFRES REJETÉES</span><strong>{rejected}</strong><small>Décisions défavorables</small></article>
    </div>

    <div className="supplier-dashboard__charts">
      <section className="supplier-evolution"><header><h2>Évolution des soumissions</h2><span><i /> Candidatures</span></header><div className="supplier-bars">{monthCounts.map((item) => <div key={item.label}><i style={{ height: `${Math.max(3, item.count / maxCount * 100)}%` }} /><span>{item.label}</span></div>)}</div></section>
      <section className="supplier-status"><h2>Répartition par statut</h2><div className="supplier-donut" style={{ background: `conic-gradient(#2f4156 0 ${evaluating / statusTotal * 100}%, #567c8d ${evaluating / statusTotal * 100}% ${(evaluating + accepted) / statusTotal * 100}%, #dbe6ea ${(evaluating + accepted) / statusTotal * 100}% 100%)` }}><span><b>{submitted}</b><small>TOTAL OFFRES</small></span></div><ul><li><i /> En cours <b>{evaluating}</b></li><li><i /> Acceptées <b>{accepted}</b></li><li><i /> Autres <b>{Math.max(0, submitted - evaluating - accepted)}</b></li></ul></section>
    </div>

    <div className="supplier-dashboard__bottom">
      <section className="supplier-recent"><header><h2>5 dernières candidatures</h2><Link to="/app/soumissions">Voir tout</Link></header><div><table><thead><tr><th>RÉFÉRENCE</th><th>OBJET</th><th>DATE</th><th>STATUT</th><th>ACTION</th></tr></thead><tbody>{recentOffers.map((offer) => <tr key={offer.id}><td><b>OFFRE-{offer.id}</b><small>{offer.accuseReception}</small></td><td>{offer.appelOffres?.titre || `Appel d’offres #${offer.appelOffresId}`}</td><td>{new Intl.DateTimeFormat('fr-SN', { dateStyle: 'medium' }).format(new Date(offer.dateSoumission || offer.createdAt))}</td><td><Badge tone={offer.statut === 'ACCEPTEE' ? 'green' : offer.statut === 'REJETEE' ? 'red' : 'blue'}>{offer.statut?.replaceAll('_', ' ')}</Badge></td><td><Link to={`/app/soumissions/${offer.id}`}><Eye size={14} /></Link></td></tr>)}</tbody></table>{recentOffers.length === 0 && <p className="empty-copy">Aucune candidature déposée.</p>}</div></section>
      <aside className="supplier-notifications"><header><h2>Notifications</h2><Bell size={15} /></header><article className="is-blue"><b>{tenders.length} marché(s) disponible(s)</b><p>Consultez les opportunités ouvertes correspondant à votre activité.</p><Link to="/app/appels-offres">Voir les marchés</Link></article>{evaluating > 0 && <article className="is-orange"><b>Évaluation en cours</b><p>{evaluating} dossier(s) sont actuellement examinés.</p><Link to="/app/soumissions">Suivre mes offres</Link></article>}<article><b>Documents déposés</b><p>{summary?.documentsDeposes ?? offers.reduce((total, offer) => total + (offer.documents?.length || 0), 0)} pièce(s) enregistrée(s).</p><Link to="/app/documents">Voir mes documents</Link></article></aside>
    </div>
  </div>
}

export default function DashboardPage() {
  const { role, user } = useApp()
  const [summary, setSummary] = useState(null)
  const [tenders, setTenders] = useState([])
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const copy = copyByRole[role] || copyByRole.supplier
  const date = new Intl.DateTimeFormat('fr-SN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const tenderItems = await tenderService.list()
        if (!active) return
        setTenders(tenderItems.map(toTenderView))
        if (['admin', 'auditor'].includes(role)) {
          setSummary(await dashboardService.getSummary())
        } else if (role === 'authority') {
          const [dashboard, results] = await Promise.all([
            dashboardService.getSummary(),
            Promise.allSettled(tenderItems.map((tender) => offerService.byTender(tender.id))),
          ])
          setSummary(dashboard)
          setOffers(results.flatMap((result) => result.status === 'fulfilled' ? result.value : []))
        } else if (role === 'supplier') {
          const [dashboard, myOffers] = await Promise.all([dashboardService.getSummary(), offerService.mine()])
          setSummary(dashboard)
          setOffers(myOffers)
        } else if (role === 'commission') {
          const results = await Promise.allSettled(tenderItems.map((tender) => offerService.byTender(tender.id)))
          setOffers(results.flatMap((result) => result.status === 'fulfilled' ? result.value : []))
        }
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [role])

  let stats = []
  if (summary) {
    stats = [
      [Megaphone, "Appels d’offres", summary.nombreAppelsOffres, `${summary.appelsOffresPublies} publiés`, 'navy'],
      [FileStack, 'Offres reçues', summary.nombreOffresRecues, `Participation moyenne : ${summary.tauxParticipationMoyen}`, 'blue'],
      [UsersRound, 'Fournisseurs inscrits', summary.nombreFournisseursInscrits, 'Comptes fournisseur', 'green'],
      [WalletCards, 'Montant publié', formatMoney(summary.montantTotalEstimeAppelsPublies), `${summary.appelsOffresBrouillon} brouillons · ${summary.appelsOffresArchives} archivés`, 'orange'],
    ]
  } else if (role === 'supplier') {
    stats = [
      [Megaphone, 'Opportunités publiées', tenders.length, 'Appels visibles pour ce compte', 'navy'],
      [Send, 'Mes soumissions', offers.length, 'Offres déposées', 'blue'],
      [FileStack, 'Documents déposés', offers.reduce((total, offer) => total + (offer.documents?.length || 0), 0), 'Documents liés à mes offres', 'green'],
      [Archive, 'Offres acceptées', offers.filter((offer) => offer.statut === 'ACCEPTEE').length, 'Statut retourné par l’API', 'orange'],
    ]
  } else {
    stats = [
      [Megaphone, "Appels d’offres", tenders.length, 'Procédures accessibles', 'navy'],
      [FileStack, 'Offres accessibles', offers.length, 'Soumissions reçues', 'blue'],
    ]
  }

  if (role === 'admin') {
    if (loading) return <div className="loading-state"><span className="spinner" /> Chargement du tableau de bord…</div>
    if (error) return <EmptyState icon={FileStack} title="Tableau de bord indisponible" description={error} />
    return <AdminDashboard summary={summary} user={user} tenders={tenders} />
  }
  if (role === 'supplier') {
    if (loading) return <div className="loading-state"><span className="spinner" /> Chargement du tableau de bord…</div>
    if (error) return <EmptyState icon={FileStack} title="Tableau de bord indisponible" description={error} />
    return <SupplierDashboard summary={summary} user={user} tenders={tenders} offers={offers} />
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-welcome"><div><span className="eyebrow">{date.toUpperCase()}</span><h1>{copy.title}</h1><p>{copy.description}</p></div><div className="dashboard-welcome__actions">{(role === 'admin' || role === 'authority') && <Link className="btn btn--primary" to="/app/appels-offres/nouveau">+ Nouvel appel d’offres</Link>}{role === 'supplier' && <Link className="btn btn--primary" to="/app/appels-offres">Voir les opportunités</Link>}</div></header>
      {loading ? <div className="loading-state"><span className="spinner" /> Chargement du tableau de bord…</div> : error ? <EmptyState icon={FileStack} title="Tableau de bord indisponible" description={error} /> : <>
        <div className={`stats-grid ${stats.length < 4 ? 'stats-grid--three' : ''}`}>{stats.map(([Icon, label, value, helper, tone]) => <StatCard key={label} icon={Icon} label={label} value={value} helper={helper} tone={tone} />)}</div>
        <SectionCard title="Appels d’offres récents" subtitle="Données les plus récentes retournées par l’API" action={<LinkAction to="/app/appels-offres" />}>
          <div className="deadline-list">{tenders.slice(0, 5).map((tender) => <Link key={tender.id} to={`/app/appels-offres/${tender.id}`}><span className="deadline-date"><b>AO</b><small>{tender.id}</small></span><div><b>{tender.title}</b><small>{tender.authority} · {tender.deadline}</small></div><Badge tone={tender.status === 'Publié' ? 'green' : tender.status === 'Brouillon' ? 'orange' : 'neutral'}>{tender.status}</Badge></Link>)}</div>
        </SectionCard>
      </>}
    </div>
  )
}
