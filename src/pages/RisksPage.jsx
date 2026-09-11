import { AlertTriangle, Clock3, FileSearch, Network, ShieldAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { auditService } from '../services/auditService'
import { offerService } from '../services/offerService'
import { tenderService } from '../services/tenderService'

export default function RisksPage() {
  const [offers, setOffers] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const tenders = await tenderService.list()
        const [results, auditLogs] = await Promise.all([
          Promise.allSettled(tenders.map((tender) => offerService.byTender(tender.id))),
          auditService.list(20),
        ])
        if (!active) return
        setOffers(results.flatMap((result) => result.status === 'fulfilled' ? result.value : []).map((offer) => ({ ...offer, tender: tenders.find((item) => item.id === offer.appelOffresId) })))
        setLogs(auditLogs)
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const risks = useMemo(() => offers.map((offer) => {
    const budget = Number(offer.tender?.budgetEstimatif || 0)
    const amount = Number(offer.montantPropose || 0)
    const deviation = budget > 0 && amount > 0 ? Math.abs(1 - amount / budget) : 0
    const missingDocuments = Math.max(0, 3 - (offer.documents?.length || 0))
    const confidence = Math.min(99, Math.round(45 + deviation * 100 + missingDocuments * 8))
    return {
      ...offer,
      severity: offer.statut === 'REJETEE' || deviation > .3 ? 'Élevé' : missingDocuments > 1 ? 'Moyen' : 'Faible',
      title: deviation > .3 ? 'Écart financier important' : missingDocuments ? 'Dossier documentaire incomplet' : 'Contrôle standard',
      confidence,
    }
  }).filter((risk) => risk.severity !== 'Faible').sort((a, b) => b.confidence - a.confidence), [offers])
  const suppliers = [...new Set(offers.map((offer) => offer.fournisseur?.nom).filter(Boolean))].slice(0, 3)
  const lead = risks[0]

  if (loading) return <div className="loading-state"><span className="spinner" /> Analyse des risques…</div>
  if (error) return <p className="authority-inline-error">{error}</p>

  return <div className="admin-fraud">
    {lead && <section className="admin-fraud-alert"><span><AlertTriangle size={20}/></span><div><b>Alerte : {lead.title}</b><p>L’offre #{lead.id} de {lead.fournisseur?.nom || 'ce fournisseur'} présente un indice de vigilance de {lead.confidence}%.</p></div><Link to={`/app/soumissions/${lead.id}`}>Examiner le dossier</Link></section>}
    <div className="admin-fraud__top">
      <section className="admin-risk-map"><header><div><h1>Cartographie des Risques Relationnels</h1><p>Fournisseurs présents dans les soumissions réelles.</p></div><div><span>Risque calculé</span><span>Données persistées</span></div></header><div className="admin-risk-network">
        <svg viewBox="0 0 650 330" preserveAspectRatio="none" aria-hidden="true"><path d="M195 85 L430 102 L330 270 Z"/><path d="M195 85 L330 270"/><path d="M430 102 L330 270"/></svg>
        {suppliers.map((supplier, index) => <span className={`admin-risk-node admin-risk-node--${['one','two','three'][index]}`} key={supplier}>{index < 2 ? <ShieldAlert size={19}/> : <Network size={19}/>}<b>{supplier}</b></span>)}
      </div></section>
      <aside className="admin-risk-aside"><section><header><h2>Incidents potentiels</h2><span>{risks.length} détecté(s)</span></header>{risks.slice(0,3).map((risk)=><article key={risk.id}><div><b>{risk.fournisseur?.nom || 'Fournisseur'}</b><small>{risk.title}</small></div><em>{risk.severity}</em></article>)}{risks.length === 0 && <p className="empty-copy">Aucun risque élevé détecté.</p>}</section><section className="admin-risk-indicators"><h2>Indicateurs de vigilance</h2><span>Risque maximal <b>{lead?.confidence || 0}%</b></span><i><em style={{width:`${lead?.confidence || 0}%`}}/></i><span>Dossiers contrôlés <b>{offers.length}</b></span><i><em style={{width:`${offers.length ? 100 : 0}%`}}/></i></section></aside>
    </div>
    <section className="admin-security-logs"><header><h2>Logs de Sécurité & Activités</h2><p>Historique réel des événements récents.</p></header><div>{logs.slice(0,3).map((log)=><article key={log.id}><header><span><Clock3 size={13}/> {new Intl.DateTimeFormat('fr-SN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(log.createdAt))}</span><em>Journalisé</em></header><h3>{log.action?.replaceAll('_', ' ')}</h3><p><FileSearch size={14}/>{log.utilisateur?.nom || 'Système'}</p></article>)}{logs.length === 0 && <p className="empty-copy">Aucune activité journalisée.</p>}</div></section>
  </div>
}
