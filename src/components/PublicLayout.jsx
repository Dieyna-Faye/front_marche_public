import { ArrowRight, Landmark, Mail, MapPin, Menu, Phone, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

function PublicLogo({ light = false }) {
  return <Link className={`p-brand ${light ? 'p-brand--light' : ''}`} to="/"><span><Landmark size={16} /></span><b>Procure</b>AI</Link>
}

export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  return (
    <div className="public-shell p-site">
      <header className="p-header">
        <PublicLogo />
        <nav className={open ? 'is-open' : ''}>
          <NavLink onClick={() => setOpen(false)} to="/" end>Accueil</NavLink>
          <NavLink onClick={() => setOpen(false)} to="/appels-offres">Appels d’offres</NavLink>
          <Link onClick={() => setOpen(false)} to="/#fonctionnalites">Fonctionnalités</Link>
          <NavLink onClick={() => setOpen(false)} to="/a-propos">À propos</NavLink>
          <NavLink onClick={() => setOpen(false)} to="/contact">Contact</NavLink>
          <Link className="p-button p-button--dark p-header__login" onClick={() => setOpen(false)} to="/connexion">Se connecter</Link>
        </nav>
        <button className="p-header__menu" aria-label="Ouvrir la navigation" onClick={() => setOpen(!open)} type="button">{open ? <X /> : <Menu />}</button>
      </header>
      <Outlet />
      <footer className="p-footer">
        <div className="p-container p-footer__grid">
          <div className="p-footer__about"><PublicLogo light /><p>La plateforme intelligente qui simplifie, sécurise et modernise la commande publique.</p></div>
          <div><b>Navigation</b><Link to="/">Accueil</Link><Link to="/a-propos">À propos</Link><Link to="/appels-offres">Appels d’offres</Link></div>
          <div><b>Liens utiles</b><a href="#confidentialite">Confidentialité</a><a href="#mentions">Mentions légales</a><a href="#conditions">Conditions d’utilisation</a></div>
          <div><b>Contactez-nous</b><span><MapPin size={13} /> Dakar, Sénégal</span><span><Phone size={13} /> +221 33 000 00 00</span><span><Mail size={13} /> contact@procureai.sn</span></div>
          <form className="p-footer__newsletter" onSubmit={(event) => event.preventDefault()}><label htmlFor="newsletter">Restez informé</label><div><input id="newsletter" type="email" placeholder="Votre adresse e-mail" /><button aria-label="S’inscrire" type="submit"><ArrowRight size={15} /></button></div></form>
        </div>
        <div className="p-footer__bottom"><span>© 2025 ProcureAI. Tous droits réservés.</span><span>Propulsé par l’intelligence artificielle</span></div>
      </footer>
    </div>
  )
}
