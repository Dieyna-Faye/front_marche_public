import { ArrowUpRight, FileSignature, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useApp } from '../context/useApp'
import { formatDate } from '../utils/formatters'

export default function ContractsPage() {
  const { role } = useApp()
  const [contracts, setContracts] = useState([])
  const [predictions, setPredictions] = useState({})
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    api.get('/contracts').then(async (items) => {
      const entries = role !== 'authority' ? [] : await Promise.all(items.map(async (item) => {
        try { return [item.id, await api.get(`/contracts/${item.id}/predict-delay`)] }
        catch { return [item.id, null] }
      }))
      if (active) { setContracts(items); setPredictions(Object.fromEntries(entries)) }
    }).catch((err) => { if (active) setError(err.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [role])
  const predict = async (contract) => {
    setRunning(contract.id); setError('')
    try {
      const result = await api.post(`/contracts/${contract.id}/predict-delay`, {})
      setPredictions((current) => ({ ...current, [contract.id]: result }))
    } catch (err) { setError(err.message) }
    finally { setRunning('') }
  }
  return <div className="admin-contracts">
    <header><h1>Suivi des contrats</h1><p>Contrats réellement créés après attribution, et prédictions enregistrées sur les données de suivi disponibles.</p></header>
    {loading ? <div className="loading-state"><span className="spinner" /> Chargement des contrats…</div> : error && contracts.length === 0 ? <p className="authority-inline-error">{error}</p> : <div className="admin-contract-table"><table><thead><tr><th>CONTRAT</th><th>FOURNISSEUR</th><th>DATES</th><th>AVANCEMENT</th><th>RISQUE DE RETARD</th><th>ACTION</th></tr></thead><tbody>{contracts.map((contract) => {
      const prediction = predictions[contract.id]
      return <tr key={contract.id}><td><Link to={`/app/contrats/${contract.id}`}><FileSignature size={13}/>{contract.reference || contract.id} <ArrowUpRight size={12}/></Link></td><td>{contract.supplier?.companyName || '—'}</td><td>{formatDate(contract.startDate)} — {formatDate(contract.endDate)}</td><td>{contract.progress ?? '—'}%</td><td><b>{prediction?.riskLevel || (role === 'supplier' ? 'Suivi du contrat' : role === 'authority' ? 'Non évalué' : 'Indicateur en lecture seule')}</b>{prediction?.riskFactors?.length > 0 && <small>{prediction.riskFactors.join(' · ')}</small>}{prediction?.recommendations?.length > 0 && <small>{prediction.recommendations.join(' · ')}</small>}</td><td>{role === 'authority' && <><button className="authority-btn authority-btn--ghost" disabled={running === contract.id} onClick={() => predict(contract)} type="button"><Sparkles size={13}/>{running === contract.id ? 'Calcul…' : 'Prédire'}</button>{prediction?.predictedAt && <small>{formatDate(prediction.predictedAt)}</small>}</>}</td></tr>
    })}</tbody></table>{contracts.length === 0 && <p className="empty-copy">Aucun contrat enregistré.</p>}</div>}
    {error && contracts.length > 0 && <p className="authority-inline-error" role="alert">{error}</p>}
    {role === 'authority' && <p>La prédiction applique des règles explicites, sans probabilité entraînée. Les résultats sont indicatifs et doivent être vérifiés.</p>}
  </div>
}
