import {
  AlertTriangle, ArrowRight, BarChart3, Bot, BrainCircuit, Check, ClipboardCheck,
  CloudUpload, FileText, Gauge, Landmark, LayoutGrid, ListChecks, Network,
  Shield, Signature, Sparkles, Target, TrendingUp, UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PublicTenderCard from '../components/PublicTenderCard'
import tenderImage from '../assets/tender-handshake.png'
import { publicTenders } from '../data/publicContent'

const benefits = [
  [Network, 'Gestion centralisée', "Un tableau de bord unique pour piloter l’ensemble de vos marchés et documents."],
  [CloudUpload, 'Soumission 100% en ligne', 'Processus totalement dématérialisé avec signature électronique sécurisée.'],
  [BrainCircuit, 'Analyse intelligente', 'Des algorithmes qui extraient les points clés des offres automatiquement.'],
  [AlertTriangle, "Détection d’anomalies", 'Identification proactive des incohérences ou risques de fraude.'],
  [ClipboardCheck, 'Suivi des contrats', 'Gestion post-attribution avec alertes sur les échéances et livrables.'],
]

const tools = [
  [FileText, 'Gestion AO', "Créer vos dossiers d’appels d’offres en quelques clics avec des modèles pré-approuvés."],
  [Signature, 'Soumission numérique', "Coffre-fort numérique scellé pour garantir l’intégrité des offres jusqu’à l’ouverture."],
  [ListChecks, 'Évaluation', "Grilles de notation personnalisables pour les commissions d’évaluation."],
  [TrendingUp, 'Scoring fournisseurs', "Historique de performance et santé financière analysée en temps réel."],
  [Shield, 'Détection de fraude', "Contrôle anti-corruption et détection de collusion par analyse comportementale."],
  [LayoutGrid, 'Dashboard', "Reporting analytique complet pour les directions achat et ministères."],
]

export default function LandingPage() {
  return (
    <main>
      <section className="p-home-hero" style={{ '--p-hero-image': `url(${tenderImage})` }}>
        <div className="p-home-hero__backdrop" />
        <div className="p-container p-home-hero__content">
          <span className="p-kicker p-kicker--light"><Sparkles size={13} /> L’IA au service de la commande publique</span>
          <h1>Simplifiez et sécurisez la gestion<br />des marchés publics grâce à<br />l’intelligence artificielle</h1>
          <p>Une plateforme intelligente, transparente et performante pour moderniser chaque étape de la commande publique.</p>
          <div className="p-actions"><Link className="p-button p-button--light" to="/appels-offres">Découvrir les appels d’offres <ArrowRight size={14} /></Link><Link className="p-button p-button--glass" to="/a-propos">En savoir plus</Link></div>
        </div>
      </section>

      <section className="p-stats"><div className="p-container"><span><strong>12k+</strong><small>Marchés publiés</small></span><span><strong>45k+</strong><small>Fournisseurs inscrits</small></span><span><strong>8.5B€</strong><small>Montant des marchés</small></span><span><strong>100%</strong><small>Procédures traçables</small></span></div></section>

      <section className="p-section p-why"><div className="p-container">
        <header className="p-section-title p-section-title--left"><span>EXCELLENCE ET TRANSPARENCE</span><h2>Pourquoi choisir ProcureAI ?</h2><p>L’alliance de la rigueur institutionnelle et de l’innovation technologique pour une gestion sans faille.</p></header>
        <div className="p-benefit-grid">{benefits.map(([Icon, title, text]) => <article key={title}><span><Icon size={18} /></span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
      </div></section>

      <section className="p-process"><div className="p-container">
        <header className="p-section-title p-section-title--light"><h2>Un processus fluide et sécurisé</h2><p>De la définition du besoin à la signature, chaque étape est optimisée.</p></header>
        <div className="p-process__steps">{[
          ['1', 'Publication', 'Annonce et mise en ligne des documents de consultation.'],
          ['2', 'Consultation', 'Les entreprises accèdent aux détails et posent leurs questions.'],
          ['3', 'Dépôt', 'Soumission sécurisée des offres techniques et financières.'],
          ['4', 'Analyse IA', 'Évaluation comparative automatisée des dossiers.'],
          ['5', 'Attribution', 'Choix finale et contractualisation immédiate.'],
        ].map(([number, title, text]) => <article key={number}><b>{number}</b><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
      </div></section>

      <section className="p-section p-tools" id="fonctionnalites"><div className="p-container">
        <header className="p-section-title p-section-title--left"><span>Gestion</span><h2>Outils métiers intégrés</h2><p>L’alliance de la rigueur institutionnelle et de l’innovation technologique pour une gestion sans faille.</p></header>
        <div className="p-tool-grid">{tools.map(([Icon, title, text]) => <article key={title}><span><Icon /></span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
      </div></section>

      <section className="p-section p-ai"><div className="p-container p-ai__panel">
        <div className="p-ai__visual"><div className="p-ai__orb"><BrainCircuit size={64} /></div><span>PROCURE AI</span></div>
        <div className="p-ai__copy"><span className="p-kicker">INTELLIGENCE ARTIFICIELLE</span><h2>Le cerveau derrière chaque décision</h2><p>ProcureAI analyse, compare et sécurise les informations pour permettre aux équipes de prendre des décisions plus rapides et mieux documentées.</p><ul><li><Check size={15} /> Détection des incohérences et des risques</li><li><Check size={15} /> Comparaison objective des offres reçues</li><li><Check size={15} /> Recommandations explicables et traçables</li></ul><Link className="p-text-link" to="/a-propos">Comprendre notre approche <ArrowRight size={14} /></Link></div>
      </div></section>

      <section className="p-section p-latest"><div className="p-container">
        <header className="p-section-title p-section-title--row"><div><span>APPEL D’OFFRES</span><h2>Derniers appels d’offres</h2><p>Consulter les opportunités les plus récentes publiées sur la plateforme</p></div><Link className="p-text-link" to="/appels-offres">Voir tout <ArrowRight size={14} /></Link></header>
        <div className="p-tender-grid">{publicTenders.slice(0, 3).map((tender) => <PublicTenderCard tender={tender} key={tender.id} />)}</div>
      </div></section>

      <section className="p-section p-final-cta"><div className="p-container"><div><h2>Rejoignez une plateforme moderne pour vos marchés publics</h2><p>Centralisez vos procédures, collaborez efficacement et prenez de meilleures décisions.</p><div className="p-actions"><Link className="p-button p-button--light" to="/connexion">Accéder à la plateforme</Link><Link className="p-button p-button--glass" to="/contact">Nous contacter</Link></div></div></div></section>
    </main>
  )
}
