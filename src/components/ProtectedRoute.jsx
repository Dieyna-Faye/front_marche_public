import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/useApp'

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, isInitializing, role } = useApp()
  const location = useLocation()

  if (isInitializing) return <main className="route-status"><span className="spinner" /><p>Chargement de votre espace…</p></main>
  if (!isAuthenticated) return <Navigate to="/connexion" replace state={{ from: location }} />
  if (roles && !roles.includes(role)) return <Navigate to="/app/appels-offres" replace />

  return <Outlet />
}
