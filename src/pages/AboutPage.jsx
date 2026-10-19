import { Check, Eye, Lightbulb, Scale, ShieldCheck, Target } from 'lucide-react'
import tenderImage from '../assets/tender-handshake.png'

export default function AboutPage() {
  return (
    <main>
      <section className="p-inner-hero p-inner-hero--about" style={{ '--p-hero-image': `url(${tenderImage})` }}><div><span className="p-kicker p-kicker--light">NOTRE VISION</span><h1>À propos de la plateforme ProcureAI</h1><p>Une plateforme au service d’une commande publique plus transparente, plus simple et plus performante.</p></div></section>

      <section className="p-section p-evolution"><div className="p-container">
        <header className="p-section-title"><span>NOTRE HISTOIRE</span><h2>L’évolution de la Commande Publique</h2><p>Une plateforme née de la volonté de moderniser les pratiques et de replacer la confiance au cœur des marchés publics.</p></header>
        <div className="p-evolution__grid">
          <div className="p-timeline">
            <article><span>01</span><div><b>Un constat partagé</b><p>Des procédures complexes, dispersées et difficiles à suivre pour les différents acteurs.</p></div></article>
            <article><span>02</span><div><b>Une vision nouvelle</b><p>Mettre la technologie et la donnée au service de la simplicité, de l’équité et de la transparence.</p></div></article>
            <article><span>03</span><div><b>Une plateforme commune</b><p>ProcureAI réunit administrations, commissions et fournisseurs au sein d’un même environnement sécurisé.</p></div></article>
          </div>
          <article className="p-objectives"><span><Target size={20} /></span><h3>Objectifs de la plateforme</h3><ul><li><Check size={14} /> Simplifier les procédures de passation</li><li><Check size={14} /> Sécuriser les échanges et les documents</li><li><Check size={14} /> Garantir la transparence des décisions</li><li><Check size={14} /> Favoriser l’accès des fournisseurs</li><li><Check size={14} /> Améliorer le pilotage de la performance</li></ul></article>
        </div>
      </div></section>

      <section className="p-section p-values"><div className="p-container"><header className="p-section-title p-section-title--left"><span>CE QUI NOUS GUIDE</span><h2>Avantages clés</h2></header><div className="p-values__grid">
        {[[Eye,'Transparence intégrale','Chaque étape et chaque décision reste lisible et traçable.'],[ShieldCheck,'Sécurité renforcée','Les accès et les données sont protégés selon les rôles.'],[Scale,'Décisions plus équitables','Les mêmes critères sont appliqués à l’ensemble des offres.'],[Lightbulb,'Innovation utile','Des outils numériques adaptés aux besoins des acteurs publics.']].map(([Icon,title,text])=><article key={title}><span><Icon size={21}/></span><div><h3>{title}</h3><p>{text}</p></div></article>)}
      </div></div></section>
    </main>
  )
}
