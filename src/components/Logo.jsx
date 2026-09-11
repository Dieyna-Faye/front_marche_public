import { Landmark } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Logo({ compact = false, light = false }) {
  return (
    <Link className={`brand ${light ? 'brand--light' : ''}`} to="/">
      <span className="brand__mark"><Landmark size={22} strokeWidth={2.2} /></span>
      {!compact && <span className="brand__text">Sunu<span>Marchés</span></span>}
    </Link>
  )
}
