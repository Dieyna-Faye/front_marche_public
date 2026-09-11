import { ArrowLeft, CalendarDays, Check, CircleCheck, Clock3, Download, FileCheck2, FileText, Landmark, Mail, MapPin, Send, ShieldCheck, UploadCloud, WalletCards } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { publicTenderDetail, publicTenders } from '../data/publicContent'

const objectives = ['Renouveler les équipements critiques', 'Améliorer la disponibilité des services', 'Renforcer la sécurité du système d’information']
const results = ['Une infrastructure moderne et évolutive', 'Un niveau de service mesurable', 'Des équipes formées et autonomes']

export default function PublicTenderDetailsPage() {
  const { id } = useParams()
  const found = publicTenders.find((item) => item.id === id)
  const tender = found ? { ...publicTenderDetail, ...found } : publicTenderDetail
  return <main>
    <section className="p-detail-hero"><div className="p-container"><Link to="/appels-offres"><ArrowLeft size={13}/> Retour aux appels d’offres</Link><div className="p-detail-hero__title"><div><span>{tender.id} · {tender.type}</span><h1>{tender.title}</h1><p><Landmark size={14}/> {tender.authority}</p></div><div><b>Appel d’offres ouvert</b><Link className="p-button p-button--dark" to="/connexion">Soumissionner <Send size={14}/></Link></div></div></div></section>

    <section className="p-section p-detail"><div className="p-container">
      <header className="p-detail__heading"><div><span>APERÇU DU MARCHÉ</span><h2>Informations générales</h2></div><small>Mis à jour le 02 juin 2025</small></header>
      <div className="p-detail-facts"><article><span><WalletCards size={16}/></span><small>Budget estimé</small><b>{tender.budget}</b></article><article><span><CalendarDays size={16}/></span><small>Date de publication</small><b>{tender.publication}</b></article><article><span><Clock3 size={16}/></span><small>Date limite</small><b>{tender.deadline}</b></article><article><span><MapPin size={16}/></span><small>Lieu d’exécution</small><b>{tender.location}</b></article></div>

      <article className="p-detail-block"><h2>Description du projet</h2><p>{tender.description}</p></article>
      <div className="p-detail-columns"><article><h3>Objectifs principaux</h3><ul>{objectives.map((item)=><li key={item}><CircleCheck size={15}/>{item}</li>)}</ul></article><article><h3>Résultats attendus</h3><ul>{results.map((item)=><li key={item}><CircleCheck size={15}/>{item}</li>)}</ul></article></div>

      <article className="p-detail-block"><span className="p-kicker">CONDITIONS DE PARTICIPATION</span><h2>Critères d’éligibilité</h2><div className="p-criteria-grid"><div><span><Landmark size={17}/></span><h3>Capacité administrative</h3><ul><li><Check size={13}/> Être légalement constitué</li><li><Check size={13}/> Être à jour de ses obligations fiscales</li><li><Check size={13}/> Ne pas faire l’objet d’une exclusion</li></ul></div><div><span><ShieldCheck size={17}/></span><h3>Capacité technique</h3><ul><li><Check size={13}/> Références sur des projets similaires</li><li><Check size={13}/> Équipe qualifiée et disponible</li><li><Check size={13}/> Moyens techniques suffisants</li></ul></div></div></article>

      <div className="p-evaluation-grid"><article><span className="p-kicker p-kicker--light">MÉTHODE D’ÉVALUATION</span><h2>Grille d’évaluation</h2><div><span>Valeur technique <b>45 points</b></span><i><em style={{width:'75%'}}/></i><span>Proposition financière <b>35 points</b></span><i><em style={{width:'58%'}}/></i><span>Délais et organisation <b>20 points</b></span><i><em style={{width:'34%'}}/></i></div></article><article><span className="p-kicker">CONTACT DU MARCHÉ</span><h2>Contact & précisions</h2><p>Pour toute demande d’information relative à cette consultation :</p><span><Mail size={15}/><b>Cellule des marchés publics</b><small>marches@institution.sn</small></span><span><Clock3 size={15}/><b>Questions avant le</b><small>20 juin 2025 à 17h00</small></span></article></div>

      <article className="p-application"><header><span className="p-kicker">VOTRE CANDIDATURE</span><h2>Dossier de candidature</h2><p>Préparez les pièces suivantes avant de transmettre votre offre.</p></header><div><span><FileText size={18}/><b>Dossier administratif</b><small>PDF · 10 Mo maximum</small></span><span><FileCheck2 size={18}/><b>Offre technique</b><small>PDF · 25 Mo maximum</small></span><span><WalletCards size={18}/><b>Offre financière</b><small>PDF · 10 Mo maximum</small></span></div><Link className="p-button p-button--dark" to="/connexion"><UploadCloud size={15}/> Déposer ma candidature</Link></article>
    </div></section>

    <section className="p-transform"><div><h2>Prêt à transformer l’avenir ?</h2><p>Participez à cette consultation et contribuez à la modernisation des services publics.</p><Link className="p-button p-button--dark" to="/connexion">Soumissionner maintenant</Link></div></section>
  </main>
}
