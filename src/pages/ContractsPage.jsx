import { FileSignature } from 'lucide-react'
import { useEffect, useState } from 'react'
import { offerService } from '../services/offerService'
import { tenderService } from '../services/tenderService'
import { formatDate } from '../utils/formatters'

export default function ContractsPage() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const tenders = await tenderService.list()
        const results = await Promise.allSettled(tenders.map((tender) => offerService.byTender(tender.id)))
        const accepted = results.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
          .filter((offer) => offer.statut === 'ACCEPTEE')
          .map((offer) => ({ ...offer, tender: tenders.find((item) => item.id === offer.appelOffresId) }))
        if (active) setContracts(accepted)
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  return <div className="admin-contracts">
    <header><h1>Liste des contrats</h1><p>Marchés attribués à partir des offres acceptées dans la base de données.</p></header>
    {loading ? <div className="loading-state"><span className="spinner" /> Chargement des contrats…</div> : error ? <p className="authority-inline-error">{error}</p> : <div className="admin-contract-table"><table><thead><tr><th>ID</th><th>Fournisseur</th><th>Date début</th><th>Date fin</th><th>Statut</th></tr></thead><tbody>{contracts.map((contract)=><tr key={contract.id}><td>CTR-{contract.id}</td><td><span><FileSignature size={13}/>{contract.fournisseur?.nom || 'Fournisseur'}</span></td><td>{formatDate(contract.dateSoumission)}</td><td>{formatDate(contract.tender?.dateLimiteSoumission)}</td><td><em className={contract.tender?.statut === 'ARCHIVE' ? 'is-complete' : ''}>{contract.tender?.statut === 'ARCHIVE' ? 'Complet' : 'En cours'}</em></td></tr>)}</tbody></table>{contracts.length === 0 && <p className="empty-copy">Aucun contrat : aucune offre n’a encore été acceptée.</p>}</div>}
  </div>
}
