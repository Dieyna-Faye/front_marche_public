import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import tenderImage from '../assets/tender-handshake.png'

export default function PublicTenderCard({ tender }) {
  return (
    <article className="p-tender-card">
      <div className="p-tender-card__image">
        <img src={tenderImage} alt="Réunion consacrée à un appel d’offres" />
        <div className="p-tender-card__body">
          <h3>{tender.title}</h3>
          <p>Découvrez les informations, les conditions de participation et les documents nécessaires pour répondre à cet appel d’offres.</p>
          <div className="p-tender-card__meta">
            <span>{tender.deadline}</span>
            <span>{tender.budget}</span>
            <span>{tender.type}</span>
          </div>
          <div className="p-tender-card__actions">
            <Link to="/connexion">Faire une soumission</Link>
            <Link to={`/appels-offres/${tender.id}`}>Voir détails <ArrowUpRight size={12}/></Link>
          </div>
        </div>
      </div>
    </article>
  )
}
