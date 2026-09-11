import { ArrowLeft, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return <main className="not-found"><span><SearchX size={38} /></span><b>404</b><h1>Cette page reste introuvable</h1><p>Le lien est peut-être expiré ou la page a été déplacée.</p><Link className="btn btn--primary" to="/"><ArrowLeft size={17} /> Revenir à l’accueil</Link></main>
}
