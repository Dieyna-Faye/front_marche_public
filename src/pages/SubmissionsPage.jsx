import {
  ArrowUpRight, Download, Eye, FileDown, FilePlus2, FileStack, Filter,
  Plus, TriangleAlert,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, EmptyState, PageHeader, SearchFilter } from '../components/ui'
import { useApp } from '../context/useApp'
import { offerService } from '../services/offerService'
import { tenderService } from '../services/tenderService'
import { formatDate, formatMoney, offerStatusLabels } from '../utils/formatters'

function presentOffer(offer, fallbackUser) {
  return {
    ...offer,
    supplier: offer.fournisseur?.nom || fallbackUser?.name || 'Fournisseur',
    tenderId: String(offer.appelOffresId || offer.appelOffres?.id || ''),
    tenderTitle: offer.appelOffres?.titre || '',
    amount: formatMoney(offer.montantPropose),
    date: formatDate(offer.dateSoumission, { hour: '2-digit', minute: '2-digit' }),
    status: offerStatusLabels[offer.statut] || offer.statut,
    documentCount: offer.documents?.length || 0,
  }
}

function AdminSubmissions({ rows }) {
  const cards = rows.slice(0, 3)
  const analyzed = rows.filter((item) => item.statut !== 'BROUILLON' && item.statut !== 'SOUMISE').length
  const totalBudget = rows.reduce((sum, item) => sum + Number(item.montantPropose || 0), 0)
  const nonCompliant = rows.filter((item) => item.statut === 'REJETEE').length
  return <div className="admin-submissions">
    <div className="admin-breadcrumb">Appels d’Offres / <b>Toutes les procédures</b></div>
    <header><h1>Liste des Soumissions</h1><p>Visualisez les offres reçues et accédez rapidement aux dossiers à examiner.</p></header>
    <div className="admin-submission-stats"><article><span>SOUMISSIONS</span><strong>{rows.length}</strong><small>Total réel</small></article><article><span>ANALYSÉES</span><strong>{analyzed}</strong><small>{rows.length ? Math.round(analyzed / rows.length * 100) : 0}%</small></article><article><span>MONTANT TOTAL</span><strong>{formatMoney(totalBudget)}</strong><small>Proposé</small></article><article><span>NON CONFORMES</span><strong>{nonCompliant}</strong><small>Offres</small></article></div>
    <div className="admin-offer-grid">{cards.map((item)=>{
      const supplier=item.supplier||'Fournisseur'; const amount=item.amount||formatMoney(item.montantPropose); const score=Math.min(100, 55 + (item.documentCount || 0) * 8);
      return <article className="admin-offer" key={item.id}><header><div><span>{supplier.split(' ').map((word)=>word[0]).slice(0,2).join('')}</span><p><b>{supplier}</b><small>{item.id} · AO-{item.tenderId||item.tender}</small></p></div><em>{item.status || 'Soumise'}</em></header><div className="admin-offer__facts"><span><small>MONTANT</small><b>{amount}</b></span><span><small>DÉLAI</small><b>{item.delaiExecutionJours ? `${item.delaiExecutionJours} jours` : '—'}</b></span><span><small>APPEL D’OFFRES</small><b>{item.tenderTitle || `AO-${item.tenderId}`}</b></span></div><div className="admin-offer__score"><span>Score documentaire <b>{score}/100</b></span><i><em style={{width:`${score}%`}}/></i></div><Link to={`/app/soumissions/${item.id}`}>Consulter le dossier <ArrowUpRight size={13}/></Link></article>
    })}{cards.length === 0 && <p className="empty-copy">Aucune soumission enregistrée.</p>}</div>
  </div>
}

function AuthoritySubmissions({ rows, loading, error }) {
  const cards = rows.slice(0, 4)
  const total = rows.length
  const compliant = rows.filter((item) => ['SOUMISE', 'ACCEPTEE'].includes(item.statut)).length
  const averageAmount = rows.length ? rows.reduce((sum, item) => sum + Number(item.montantPropose || 0), 0) / rows.length : 0
  const riskCount = rows.filter((item) => item.statut === 'REJETEE').length

  return <div className="authority-submissions">
    <div className="authority-breadcrumb"><span>Appels d’Offres</span><b>/</b><strong>{rows[0]?.tenderTitle || 'Toutes les procédures'}</strong></div>
    <header className="authority-page-head">
      <div><h1>Suivi des Soumissions</h1><p>Visualisez et évaluez les propositions reçues pour ce marché spécifique.</p></div>
      <div className="authority-page-head__actions">
        <button className="authority-btn authority-btn--ghost" type="button"><Filter size={14} /> Filtrer</button>
        <button className="authority-btn authority-btn--dark" onClick={() => window.print()} type="button"><FileDown size={14} /> Exporter PDF</button>
      </div>
    </header>

    <div className="authority-submission-stats">
      <article><span>TOTAL REVILLE</span><strong>{total}</strong><small>↗ +12,5%</small></article>
      <article><span>CONFORMES</span><strong>{compliant}</strong><small>{total ? Math.round((compliant / total) * 100) : 0}%</small></article>
      <article><span>MONTANT MOYEN</span><strong>{formatMoney(averageAmount)}</strong></article>
      <article><span>OFFRES REJETÉES</span><strong>{riskCount}</strong><small>Décisions</small></article>
    </div>

    {loading && <div className="authority-inline-status"><span className="spinner" /> Chargement des soumissions…</div>}
    {error && <p className="authority-inline-error">Impossible de charger les données : {error}</p>}

    <div className="authority-submission-grid">
      {cards.map((item) => {
        const supplier = item.supplier || item.fournisseur?.nom || 'Fournisseur'
        const amount = item.amount || formatMoney(item.montantPropose)
        const reference = item.tenderId ? `AO-${item.tenderId}` : item.tender || 'AO-2024-0021'
        const score = Math.min(100, 55 + (item.documentCount || 0) * 8 + (item.montantPropose ? 10 : 0))
        const warning = ['REJETEE', 'EN_COURS_EVALUATION'].includes(item.statut)
        return <article className="authority-submission-card" key={item.id}>
          <header>
            <div className="authority-company"><span>{supplier.split(' ').map((word) => word[0]).slice(0, 2).join('')}</span><p><b>{supplier}</b><small>{reference} · {item.id}</small></p></div>
            <em className={warning ? 'is-warning' : ''}>{warning ? 'EN COURS' : 'CONFORME'}</em>
          </header>
          <div className="authority-submission-facts">
            <span><small>MONTANT</small><b>{amount}</b><em>Travaux Publics</em></span>
            <span><small>DÉLAI</small><b>{item.delaiExecutionJours ? `${item.delaiExecutionJours} jours` : '—'}</b><em className={warning ? 'is-red' : ''}>{item.status}</em></span>
          </div>
          <div className={`authority-submission-score ${warning ? 'is-warning' : ''}`}><span>Score IA <b>{score}</b></span><i><em style={{ width: `${score}%` }} /></i></div>
          <footer>
            <div><Link title="Voir le détail" to={`/app/soumissions/${item.id}`}><Eye size={14} /></Link><button title="Télécharger" onClick={() => window.print()} type="button"><Download size={14} /></button>{warning && <TriangleAlert size={14} />}</div>
            <div><Link className="authority-card-btn" to={`/app/soumissions/${item.id}`}>Examiner</Link><Link className="authority-card-btn authority-card-btn--dark" to={`/app/scoring?offre=${item.id}`}>Analyser</Link></div>
          </footer>
        </article>
      })}{!loading && !error && cards.length === 0 && <p className="empty-copy">Aucune soumission reçue pour vos appels d’offres.</p>}
    </div>
  </div>
}

export default function SubmissionsPage() {
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { role, user } = useApp()

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        let offers
        if (role === 'supplier') {
          offers = await offerService.mine()
        } else {
          let tenders = await tenderService.list()
          if (role === 'authority') tenders = tenders.filter((tender) => tender.createdById === user.id)
          const results = await Promise.allSettled(tenders.map((tender) => offerService.byTender(tender.id)))
          offers = results.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
        }
        if (active) setRows(offers.map((offer) => presentOffer(offer, user)))
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [role, user?.id])

  const filtered = useMemo(() => rows.filter((item) =>
    `${item.supplier} ${item.id} ${item.tenderId} ${item.tenderTitle}`.toLowerCase().includes(search.toLowerCase()),
  ), [rows, search])

  const submittedCount = rows.filter((item) => item.statut === 'SOUMISE').length
  const evaluatingCount = rows.filter((item) => item.statut === 'EN_COURS_EVALUATION').length

  if (role === 'admin') return <AdminSubmissions rows={filtered} />
  if (role === 'authority') return <AuthoritySubmissions rows={filtered} loading={loading} error={error} />

  return (
    <>
      <PageHeader eyebrow="DOSSIERS NUMÉRIQUES" title={role === 'supplier' ? 'Mes soumissions' : 'Soumissions reçues'} description={role === 'supplier' ? 'Déposez et suivez l’état réel de vos offres.' : 'Consultez les offres disponibles pour les appels d’offres autorisés.'} actions={role === 'supplier' && <Link className="btn btn--primary" to="/app/soumissions/nouvelle"><Plus size={18} /> Nouvelle soumission</Link>} />
      <div className="stats-strip"><div><FileStack size={20} /><span><b>{rows.length}</b><small>Total</small></span></div><div><FilePlus2 size={20} /><span><b>{submittedCount}</b><small>Soumises</small></span></div><div><FileStack size={20} /><span><b>{evaluatingCount}</b><small>En cours d’évaluation</small></span></div></div>
      <div className="list-toolbar"><SearchFilter value={search} onChange={setSearch} placeholder="Rechercher une soumission…" /></div>
      {loading ? <div className="loading-state"><span className="spinner" /> Chargement des soumissions…</div> : error ? <EmptyState icon={FileStack} title="Soumissions indisponibles" description={error} /> : filtered.length === 0 ? <EmptyState icon={FileStack} title="Aucune soumission" description="Aucune offre n’est disponible pour ce compte." /> : <div className="table-card submissions-table"><table><thead><tr><th>Soumissionnaire</th><th>Appel d’offres</th><th>Montant proposé</th><th>Délai</th><th>Documents</th><th>Statut</th><th>Accusé de réception</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><div className="identity-cell"><span>{item.supplier.split(' ').map((word) => word[0]).slice(0, 2).join('')}</span><p><b>{item.supplier}</b><small>Offre #{item.id} · {item.date}</small></p></div></td><td><Link to={`/app/appels-offres/${item.tenderId}`}>AO-{item.tenderId}<small className="table-subcopy">{item.tenderTitle}</small></Link></td><td><b>{item.amount}</b></td><td>{item.delaiExecutionJours} jours</td><td>{item.documentCount}</td><td><Badge tone={item.statut === 'ACCEPTEE' ? 'green' : item.statut === 'REJETEE' ? 'red' : item.statut === 'EN_COURS_EVALUATION' ? 'orange' : 'blue'}>{item.status}</Badge></td><td><code>{item.accuseReception}</code></td></tr>)}</tbody></table></div>}
    </>
  )
}
