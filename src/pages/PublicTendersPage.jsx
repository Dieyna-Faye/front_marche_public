import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicTenderCard from '../components/PublicTenderCard'
import tenderImage from '../assets/tender-handshake.png'
import { publicTenders } from '../data/publicContent'

export default function PublicTendersPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const filtered = useMemo(() => publicTenders.filter((tender) => (!type || tender.type === type) && `${tender.title} ${tender.authority} ${tender.id}`.toLowerCase().includes(search.toLowerCase())), [search, type])
  return <main>
    <section className="p-tenders-hero" style={{ '--p-hero-image': `url(${tenderImage})` }}><div><span className="p-kicker p-kicker--light">OPPORTUNITÉS PUBLIQUES</span><h1>Appels d’offres</h1><p>Découvrez les consultations ouvertes et trouvez les opportunités adaptées à votre expertise.</p><strong>TENDER</strong></div></section>
    <section className="p-section p-tenders"><div className="p-container">
      <div className="p-tender-filters"><label><Search size={15}/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Rechercher un appel d’offres…" /></label><select value={type} onChange={(event)=>setType(event.target.value)}><option value="">Toutes les catégories</option><option>Travaux</option><option>Fournitures</option><option>Services</option><option>Études</option><option>Maintenance</option><option>Conseil</option></select><select><option>Toutes les localisations</option><option>Dakar</option></select><button type="button"><SlidersHorizontal size={15}/> Plus de filtres</button></div>
      <div className="p-results"><span><b>{filtered.length}</b> appels d’offres disponibles</span><select><option>Les plus récents</option><option>Date limite</option></select></div>
      <div className="p-tender-grid">{filtered.map((tender)=><PublicTenderCard tender={tender} key={tender.id}/>)}</div>
      <nav className="p-pagination" aria-label="Pagination"><button type="button"><ChevronLeft size={14}/></button><button className="is-active" type="button">1</button><button type="button">2</button><button type="button">3</button><button type="button"><ChevronRight size={14}/></button></nav>
    </div></section>
    <section className="p-supplier-cta"><div><h2>Vous êtes fournisseur ?</h2><p>Créez votre compte pour répondre aux appels d’offres et suivre vos candidatures.</p><div className="p-actions"><Link className="p-button p-button--light" to="/connexion">Créer un compte</Link><Link className="p-button p-button--glass" to="/a-propos">En savoir plus</Link></div></div></section>
  </main>
}
