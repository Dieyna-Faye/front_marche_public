import { ArrowUpRight, Building2, CalendarDays, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from './ui'
import tenderImage from '../assets/tender-handshake.png'

const statusTones = { Publié: 'green', Évaluation: 'orange', Clôturé: 'neutral', Attribué: 'blue' }

export default function TenderCard({ tender, publicView = false }) {
  return (
    <article className="tender-card">
      <div className="tender-card__image">
        <img src={tenderImage} alt="Réunion professionnelle autour d’un marché public" />
        <Badge tone={statusTones[tender.status] || 'neutral'} dot>{tender.status}</Badge>
      </div>
      <div className="tender-card__body">
        <span className="tender-card__ref">{tender.id} · {tender.type}</span>
        <h3>{tender.title}</h3>
        <p className="tender-card__authority"><Building2 size={15} />{tender.authority}</p>
        <div className="tender-card__meta">
          <span><WalletCards size={16} /><small>Budget</small><b>{tender.budget}</b></span>
          <span><CalendarDays size={16} /><small>Date limite</small><b>{tender.deadline}</b></span>
        </div>
        <Link className="btn btn--primary btn--block" to={publicView ? `/appels-offres/${tender.id}` : `/app/appels-offres/${tender.id}`}>
          Consulter l’appel d’offres <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  )
}
