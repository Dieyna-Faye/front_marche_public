import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import tenderImage from '../assets/tender-handshake.png'

export default function TenderCard({ tender, publicView = false, role }) {
  const detailsTo = publicView ? `/appels-offres/${tender.id}` : `/app/appels-offres/${tender.id}`
  let primaryTo = detailsTo
  let primaryLabel = 'Consulter le marché'

  if (role === 'supplier' && tender.statut === 'PUBLIE') {
    primaryTo = `/app/soumissions/nouvelle?appel=${tender.id}`
    primaryLabel = 'Faire une soumission'
  } else if (['admin', 'authority'].includes(role) && tender.statut === 'BROUILLON') {
    primaryTo = `/app/appels-offres/${tender.id}/modifier`
    primaryLabel = 'Modifier le marché'
  } else if (role === 'authority') {
    primaryTo = `/app/analyse/${tender.id}`
    primaryLabel = 'Analyser les offres'
  }

  return <article className="dashboard-tender-card">
    <img src={tenderImage} alt="Réunion consacrée à un appel d’offres" />
    <div className="dashboard-tender-card__overlay" />
    <div className="dashboard-tender-card__body">
      <small>AO-{tender.id} · {tender.authority}</small>
      <h2>{tender.title}</h2>
      <p>{tender.description}</p>
      <div className="dashboard-tender-card__meta"><span>{tender.deadline}</span><span>{tender.budget}</span><span>{tender.type}</span></div>
      <div className="dashboard-tender-card__actions"><Link to={primaryTo}>{primaryLabel}</Link><Link to={detailsTo}>Voir détails <ArrowUpRight size={11} /></Link></div>
    </div>
  </article>
}
