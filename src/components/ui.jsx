import { ArrowLeft, ArrowRight, ChevronRight, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Badge({ children, tone = 'neutral', dot = false }) {
  return <span className={`badge badge--${tone}`}>{dot && <i />}{children}</span>
}

export function PageHeader({ eyebrow, title, description, actions, backTo }) {
  return (
    <header className="page-header">
      <div className="page-header__copy">
        {backTo && <Link className="back-link" to={backTo}><ArrowLeft size={17} /> Retour</Link>}
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  )
}

export function StatCard({ icon: Icon, label, value, helper, trend, tone = 'navy' }) {
  return (
    <article className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${tone}`}><Icon size={20} /></div>
      <div className="stat-card__content">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{trend && <b>{trend}</b>}{helper}</small>
      </div>
    </article>
  )
}

export function SectionCard({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`section-card ${className}`}>
      {(title || action) && (
        <div className="section-card__header">
          <div>{title && <h2>{title}</h2>}{subtitle && <p>{subtitle}</p>}</div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function SearchFilter({ value, onChange, placeholder = 'Rechercher...', children }) {
  return (
    <div className="filters">
      <label className="search-field">
        <Search size={18} />
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      </label>
      {children}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div><Icon size={28} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}

export function ProgressBar({ value, tone = 'green', label }) {
  return (
    <div className="progress-wrap">
      {label && <div className="progress-label"><span>{label}</span><b>{value}%</b></div>}
      <div className="progress"><span className={`progress__bar progress__bar--${tone}`} style={{ width: `${value}%` }} /></div>
    </div>
  )
}

export function Pagination({ current = 1, total = 4 }) {
  return (
    <div className="pagination">
      <button type="button" disabled={current === 1}><ArrowLeft size={16} /></button>
      {Array.from({ length: total }, (_, index) => index + 1).map((page) => (
        <button className={current === page ? 'active' : ''} key={page} type="button">{page}</button>
      ))}
      <button type="button" disabled={current === total}><ArrowRight size={16} /></button>
    </div>
  )
}

export function LinkAction({ to, children = 'Voir tout' }) {
  return <Link className="link-action" to={to}>{children}<ChevronRight size={16} /></Link>
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal__header"><h2>{title}</h2><button className="icon-button" onClick={onClose} type="button">×</button></div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  )
}
