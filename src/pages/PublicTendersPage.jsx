import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicTenderCard from '../components/PublicTenderCard'
import tenderImage from '../assets/tender-handshake.png'
import { tenderService } from '../services/tenderService'
import { toTenderView } from '../utils/formatters'

const types = [['', 'Toutes les catégories'], ['travaux', 'Travaux'], ['fournitures', 'Fournitures'], ['services', 'Services'], ['prestations_intellectuelles', 'Prestations intellectuelles'], ['maintenance', 'Maintenance'], ['informatique', 'Informatique'], ['equipements', 'Équipements']]

export default function PublicTendersPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    tenderService.publicList().then((items) => { if (active) setTenders(items.map(toTenderView)) })
      .catch((err) => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const filtered = useMemo(() => tenders.filter((tender) => (!type || tender.typeMarche?.toLowerCase() === type) && `${tender.title} ${tender.authority} ${tender.reference}`.toLowerCase().includes(search.toLowerCase())), [search, type, tenders])
  return <main>
    <section className="p-tenders-hero" style={{ '--p-hero-image': `url(${tenderImage})` }}><div><span className="p-kicker p-kicker--light">OPPORTUNITÉS PUBLIQUES</span><h1>Appels d’offres</h1><p>Consultez les appels d’offres publiés dans la plateforme.</p><strong>MARCHÉS PUBLICS</strong></div></section>
    <section className="p-section p-tenders"><div className="p-container">
      <div className="p-tender-filters"><label><Search size={15}/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Rechercher un appel d’offres…" /></label><select value={type} onChange={(event)=>setType(event.target.value)}>{types.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><span>Les résultats proviennent des appels d’offres publiés.</span></div>
      <div className="p-results"><span><b>{filtered.length}</b> appels d’offres</span></div>
      {loading && <p role="status">Chargement des appels d’offres…</p>}
      {error && <p role="alert" className="authority-inline-error">{error}</p>}
      {!loading && !error && filtered.length === 0 && <p>Aucun appel d’offres publié ne correspond à votre recherche.</p>}
      {!error && <div className="p-tender-grid">{filtered.map((tender)=><PublicTenderCard tender={tender} key={tender.id}/>)}</div>}
    </div></section>
    <section className="p-supplier-cta"><div><h2>Vous êtes fournisseur ?</h2><p>Créez votre compte pour répondre aux appels d’offres et suivre vos candidatures.</p><div className="p-actions"><Link className="p-button p-button--light" to="/inscription">Créer un compte</Link><Link className="p-button p-button--glass" to="/a-propos">En savoir plus</Link></div></div></section>
  </main>
}
