import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3, BrainCircuit, Building2, ChevronDown, FileSignature, Files, FileStack,
  LayoutDashboard, LogOut, Menu, Megaphone, ScrollText, Search, ShieldAlert, UsersRound, X,
} from 'lucide-react'
import Logo from './Logo'
import { useApp } from '../context/useApp'

const navigation = [
  { to: '/app', label: 'Vue d’ensemble', icon: LayoutDashboard, end: true, roles: ['admin', 'authority', 'supplier', 'commission', 'auditor'] },
  { to: '/app/appels-offres', label: "Appels d’offres", icon: Megaphone, roles: ['admin', 'authority', 'supplier', 'commission', 'auditor'] },
  { to: '/app/soumissions', label: 'Soumissions', icon: FileStack, roles: ['admin', 'authority', 'supplier', 'commission', 'auditor'] },
  { to: '/app/fournisseurs', label: 'Fournisseurs', icon: Building2, roles: ['authority'] },
  { to: '/app/analyse', label: 'Analyse', icon: BrainCircuit, roles: ['authority'] },
  { to: '/app/scoring', label: 'Scoring', icon: BarChart3, roles: ['authority'] },
  { to: '/app/audit', label: 'Audit', icon: ScrollText, roles: ['authority'] },
  { to: '/app/documents', label: 'Documents', icon: Files, roles: ['supplier'] },
  { to: '/app/utilisateurs', label: 'Utilisateurs', icon: UsersRound, roles: ['admin'] },
  { to: '/app/fraudes', label: 'Fraudes', icon: ShieldAlert, roles: ['admin'] },
  { to: '/app/contrats', label: 'Contrats', icon: FileSignature, roles: ['admin'] },
]

export default function AppLayout() {
  const { role, user, logout, toast } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const profileRef = useRef(null)
  const items = navigation.filter((item) => item.roles.includes(role))
  const usesDashboardShell = ['admin', 'authority', 'supplier', 'commission', 'auditor'].includes(role)

  useEffect(() => {
    setSidebarOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const close = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div className={`app-shell ${usesDashboardShell ? 'app-shell--admin' : ''}`}>
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__top">
          <Logo compact={usesDashboardShell} light={false} />
          <button className="sidebar__close" onClick={() => setSidebarOpen(false)} type="button"><X size={22} /></button>
        </div>
        <nav className="sidebar__nav" aria-label="Navigation principale">
          <span className="sidebar__label">ESPACE DE TRAVAIL</span>
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
              <Icon size={19} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__bottom">
          <span className="sidebar__version">Marchés publics · MVP1</span>
        </div>
      </aside>
      {sidebarOpen && <button className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu" type="button" />}

      <div className="app-main">
        <header className="topbar">
          <div className="topbar__left">
            <button className="menu-button" onClick={() => setSidebarOpen(true)} type="button"><Menu size={23} /></button>
            <button className="global-search" onClick={() => setSearchOpen(true)} type="button"><Search size={18} /><span>Rechercher un appel d’offres, une soumission...</span><kbd>⌘ K</kbd></button>
          </div>
          <div className="topbar__right">
            <div className="profile-menu" ref={profileRef}>
              <button className="profile-button" onClick={() => setProfileOpen(!profileOpen)} type="button">
                <span className="avatar">{user.initials}</span>
                <span className="profile-button__copy"><b>{user.name}</b><small>{user.roleLabel}</small></span>
                <ChevronDown size={16} />
              </button>
              {profileOpen && (
                <div className="profile-popover">
                  <div><span className="avatar avatar--large">{user.initials}</span><p><b>{user.name}</b><small>{user.organization}</small></p></div>
                  <button type="button" onClick={() => { logout(); navigate('/connexion') }}><LogOut size={17} /> Se déconnecter</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>

      {searchOpen && (
        <div className="command-backdrop" onMouseDown={() => setSearchOpen(false)}>
          <div className="command" onMouseDown={(event) => event.stopPropagation()}>
            <div className="command__input"><Search size={20} /><input autoFocus placeholder="Que recherchez-vous ?" /><button onClick={() => setSearchOpen(false)} type="button">ESC</button></div>
            <div className="command__body"><span>Accès rapide</span>{items.slice(0, 6).map(({ to, label, icon: Icon }) => <button key={to} onClick={() => { navigate(to); setSearchOpen(false) }} type="button"><Icon size={18} />{label}</button>)}</div>
          </div>
        </div>
      )}
      {toast && <div className={`toast toast--${toast.tone}`} key={toast.key}><span>✓</span>{toast.message}</div>}
    </div>
  )
}
