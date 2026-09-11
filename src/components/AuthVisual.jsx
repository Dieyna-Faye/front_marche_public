import { ArrowLeft, Landmark, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AuthVisual() {
  return (
    <section className="auth-visual">
      <header><Link className="auth-brand" to="/"><span><Landmark size={15}/></span><b>Procure</b>AI</Link><Link to="/"><ArrowLeft size={13}/> Retour à la page d’accueil</Link></header>
      <div className="auth-map" aria-hidden="true">
        <svg viewBox="0 0 760 430" role="img">
          <defs><linearGradient id="land" x1="0" x2="1"><stop stopColor="#31546b"/><stop offset="1" stopColor="#42677d"/></linearGradient></defs>
          <path className="auth-map__land" d="M72 92l45-28 79 2 37 28 53 8 18 38-18 32-42 6-25 31-39-9-27-36-49-8-35-29zm255 27 48-35 57 7 19 29 43 13 8 29-28 22-6 41-31 34-21 70-36-25-5-68-23-36-40-17-11-38zm181-27 61-22 83 19 48 38-23 34-52-6-37 27-39-7-16-28-44-15zm55 165 52-16 42 23 16 38-24 34-43 11-37-18-14-39z" fill="url(#land)" opacity=".52"/>
          <g className="auth-map__routes" fill="none"><path d="M116 132 Q260 10 395 163 T635 277"/><path d="M183 202 Q307 92 455 147 T596 300"/><path d="M262 144 Q380 250 568 115"/><path d="M395 163 Q464 70 596 120"/><path d="M395 163 Q500 216 635 277"/></g>
          {[['116','132'],['183','202'],['262','144'],['395','163'],['455','147'],['568','115'],['596','300'],['635','277']].map(([cx,cy])=><g key={`${cx}-${cy}`} transform={`translate(${cx} ${cy})`}><path d="M0-14c-8 0-14 6-14 14 0 11 14 27 14 27S14 11 14 0C14-8 8-14 0-14Z"/><circle r="5"/></g>)}
        </svg>
        <MapPin className="auth-map__pin" size={31}/>
      </div>
      <div className="auth-visual__copy"><h1>Simplifiez et sécurisez la gestion des marchés publics grâce à l’intelligence artificielle</h1><p>Une plateforme intelligente et transparente qui centralise les besoins, la publication et l’attribution, avec une conformité garantie par l’IA.</p></div>
    </section>
  )
}
