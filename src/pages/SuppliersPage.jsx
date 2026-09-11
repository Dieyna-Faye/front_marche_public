import {
  ArrowUpRight, Download, Eye, FileText, Filter, Grid2X2, Headphones,
  List, ShieldCheck, Star, UsersRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../components/ui'
import { supplierService } from '../services/supplierService'

export default function SuppliersPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('list')
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    supplierService.list()
      .then((items) => { if (active) setSuppliers(items) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const directoryRows = useMemo(() => suppliers.map((supplier) => ({
    ...supplier,
    name: supplier.nom,
    city: supplier.email,
    category: `${supplier.nombreDocuments} document(s) déposé(s)`,
    status: supplier.actif ? (supplier.risque === 'ELEVE' ? 'NON CONFORME' : 'VALIDÉ') : 'INACTIF',
    tendersLabel: supplier.nombreOffres,
    won: supplier.offresAcceptees,
    lot: 'Fournisseur enregistré',
  })), [suppliers])
  const rows = useMemo(() => directoryRows.filter((item) => `${item.name} ${item.city}`.toLowerCase().includes(search.toLowerCase())), [directoryRows, search])
  const averageScore = suppliers.length ? Math.round(suppliers.reduce((total, supplier) => total + supplier.score, 0) / suppliers.length) : 0
  const activeCount = suppliers.filter((supplier) => supplier.actif).length
  const conformity = suppliers.length ? Math.round((activeCount / suppliers.length) * 100) : 0
  const criticalCount = suppliers.filter((supplier) => supplier.risque === 'ELEVE').length

  return <div className="authority-directory">
    <div className="authority-breadcrumb"><span>RÉPERTOIRE CENTRAL</span><b>/</b><strong>BASE FOURNISSEURS</strong></div>
    <header className="authority-page-head">
      <div><h1>Répertoire des Fournisseurs</h1></div>
      <div className="authority-page-head__actions"><button className="authority-btn authority-btn--ghost" type="button"><Filter size={14} /> Filtrer</button><button className="authority-btn authority-btn--ghost" onClick={() => window.print()} type="button"><Download size={14} /> Exporter</button></div>
    </header>

    <div className="authority-directory-stats">
      <article><span>FOURNISSEURS ACTIFS</span><strong>{activeCount} <small>unités</small></strong><em>{suppliers.length} enregistrés</em></article>
      <article><span>CONFORMITÉ GLOBALE</span><strong>{conformity}% <small>Conforme</small></strong><em>D’après les comptes actifs</em></article>
      <article><span>SCORE MOYEN</span><strong>{averageScore}/100</strong><small>Calculé depuis les offres et documents</small></article>
      <article><span>ALERTES CRITIQUES</span><strong>{criticalCount}</strong><small>Fournisseurs à risque élevé</small></article>
    </div>

    <div className="authority-directory-toolbar">
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un fournisseur..." />
      <select><option>Région / Province</option><option>Dakar</option><option>Thiès</option></select>
      <select><option>Secteur d’activité</option><option>Travaux publics</option><option>Informatique</option></select>
      <button type="button">Affichage par <b>20 lignes</b></button>
      <span><button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} type="button"><Grid2X2 size={14} /></button><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} type="button"><List size={15} /></button></span>
    </div>

    {loading ? <div className="loading-state"><span className="spinner" /> Chargement des fournisseurs…</div> : error ? <p className="authority-inline-error">{error}</p> : view === 'list' ? <div className="authority-directory-table"><table><thead><tr><th>FOURNISSEUR</th><th>DONNÉES DISPONIBLES</th><th>SCORE IA</th><th>APPELS D’OFFRES</th><th>STATUT</th><th /></tr></thead><tbody>{rows.map((supplier) => <tr key={supplier.id}><td><div className="authority-company"><span>{supplier.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</span><p><b>{supplier.name}</b><small>{supplier.city}</small></p></div></td><td><b>{supplier.lot}</b><small>{supplier.category}</small></td><td><strong>★ {supplier.score}</strong><small>/100</small></td><td><b>{supplier.tendersLabel}</b><small>{supplier.won} acceptée(s)</small></td><td><em className={`directory-status directory-status--${supplier.status.toLowerCase().replaceAll(' ', '-').replace('à-', '')}`}>{supplier.status}</em></td><td><button onClick={() => setSelected(supplier)} type="button"><Eye size={14} /></button></td></tr>)}</tbody></table></div> : <div className="authority-directory-grid">{rows.map((supplier) => <article key={supplier.id}><div className="authority-company"><span>{supplier.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</span><p><b>{supplier.name}</b><small>{supplier.city}</small></p></div><strong>★ {supplier.score}<small>/100</small></strong><p>{supplier.tendersLabel} offre(s) · {supplier.category}</p><button onClick={() => setSelected(supplier)} type="button">Voir la fiche <ArrowUpRight size={13} /></button></article>)}</div>}

    <div className="authority-directory-footer">
      <section><span>PROCUREAI INTELLIGENCE</span><h2>Analyse Prédictive des Risques</h2><p>Notre moteur d’intelligence artificielle analyse en continu les signaux faibles financiers et opérationnels. Lancez dès maintenant l’audit complet d’un fournisseur potentiel.</p><div><button className="authority-btn authority-btn--dark" type="button"><ShieldCheck size={14} /> Lancer un Audit Global</button><button className="authority-btn authority-btn--ghost" type="button">Comparer le dernier rapport</button></div></section>
      <aside><h3>Support & Documentation</h3><a href="#expert"><span><Headphones size={16} /></span><b>Expert Dédié<small>Prendre rendez-vous</small></b></a><a href="#guide"><span><FileText size={16} /></span><b>Guide de Conformité<small>Consulter la documentation</small></b></a></aside>
    </div>

    <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Fiche Fournisseur" footer={<button className="btn btn--primary" onClick={() => setSelected(null)} type="button">Fermer</button>}>{selected && <div className="directory-modal"><div className="authority-company"><span>{selected.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</span><p><b>{selected.name}</b><small>{selected.city}</small></p></div><div><span><UsersRound size={17} /> {selected.tendersLabel} participations</span><span><Star size={17} /> Score IA {selected.score}/100</span></div></div>}</Modal>
  </div>
}
