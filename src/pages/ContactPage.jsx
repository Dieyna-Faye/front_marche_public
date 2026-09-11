import { Building2, ChevronDown, Clock3, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useState } from 'react'
import tenderImage from '../assets/tender-handshake.png'

const faq = [
  ['Comment créer un compte sur ProcureAI ?', 'Utilisez le bouton de connexion puis suivez les étapes d’inscription proposées par votre organisation.'],
  ["Comment consulter un appel d’offres ?", 'La page Appels d’offres réunit toutes les consultations ouvertes avec leurs critères et leurs échéances.'],
  ['Mes documents sont-ils sécurisés ?', 'Oui. Les dépôts sont protégés et accessibles uniquement aux personnes habilitées.'],
  ['Comment contacter le support ?', 'Vous pouvez utiliser le formulaire ci-dessus ou nous écrire directement à support@procureai.sn.'],
]

export default function ContactPage() {
  const [open, setOpen] = useState(0)
  return (
    <main>
      <section className="p-inner-hero p-inner-hero--contact" style={{ '--p-hero-image': `url(${tenderImage})` }}><div><span className="p-kicker p-kicker--light">BESOIN D’AIDE ?</span><h1>Contactez-nous</h1><p>Notre équipe est à votre écoute pour répondre à toutes vos questions.</p></div></section>

      <section className="p-section p-contact"><div className="p-container p-contact__grid">
        <div className="p-contact__info"><span className="p-kicker">RESTONS EN CONTACT</span><h2>Parlons de vos besoins</h2><p>Vous avez une question sur la plateforme, un projet de transformation ou besoin d’accompagnement ? Écrivez-nous.</p>
          <div className="p-contact__list"><span><i><MapPin size={18}/></i><p><b>Adresse</b><small>Plateau, Dakar, Sénégal</small></p></span><span><i><Phone size={18}/></i><p><b>Téléphone</b><small>+221 33 000 00 00</small></p></span><span><i><Mail size={18}/></i><p><b>E-mail</b><small>contact@procureai.sn</small></p></span><span><i><Clock3 size={18}/></i><p><b>Horaires</b><small>Lun – Ven · 8h00 – 18h00</small></p></span></div>
          <div className="p-contact__map"><Building2 size={44}/><b>ProcureAI</b><small>Dakar · Sénégal</small></div>
        </div>
        <form className="p-contact__form" onSubmit={(event)=>event.preventDefault()}><div className="p-form-row"><label>Prénom<input placeholder="Votre prénom" /></label><label>Nom<input placeholder="Votre nom" /></label></div><label>Adresse e-mail<input type="email" placeholder="nom@entreprise.com" /></label><label>Objet<select defaultValue=""><option value="" disabled>Sélectionnez un objet</option><option>Demande d’information</option><option>Accompagnement</option><option>Support technique</option></select></label><label>Votre message<textarea placeholder="Décrivez votre demande…" rows="6" /></label><button className="p-button p-button--dark" type="submit">Envoyer le message <Send size={14}/></button></form>
      </div></section>

      <section className="p-faq"><div className="p-container"><header className="p-section-title p-section-title--light"><span>QUESTIONS FRÉQUENTES</span><h2>Foire Aux Questions</h2><p>Les réponses aux questions les plus souvent posées sur ProcureAI.</p></header><div className="p-faq__grid">{faq.map(([question,answer],index)=><article className={open===index?'is-open':''} key={question}><button onClick={()=>setOpen(open===index?-1:index)} type="button"><span>{question}</span><ChevronDown size={16}/></button>{open===index&&<p>{answer}</p>}</article>)}</div></div></section>
    </main>
  )
}
