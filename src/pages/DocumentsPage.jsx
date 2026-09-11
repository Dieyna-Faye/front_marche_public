import { Download, FileArchive, FileCheck2, FileText, Folder, Grid2X2, List, MoreHorizontal, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Badge, PageHeader } from '../components/ui'
import { offerService } from '../services/offerService'
import { useApp } from '../context/useApp'

export default function DocumentsPage() {
  const [view, setView] = useState('list')
  const [offers, setOffers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showToast } = useApp()

  useEffect(() => {
    let active = true
    offerService.mine()
      .then((items) => { if (active) setOffers(items) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const files = useMemo(() => offers.flatMap((offer) => (offer.documents || []).map((document) => ({ ...document, offerId: offer.id, tenderTitle: offer.appelOffres?.titre }))).filter((file) => `${file.nomOriginal} ${file.type}`.toLowerCase().includes(search.toLowerCase())), [offers, search])
  const download = async (file) => {
    try {
      const blob = await offerService.downloadDocument(file.offerId, file.id)
      const url = URL.createObjectURL(blob)
      const anchor = window.document.createElement('a')
      anchor.href = url
      anchor.download = file.nomOriginal
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (requestError) {
      showToast(requestError.message, 'error')
    }
  }
  return (
    <>
      <PageHeader eyebrow="ESPACE DOCUMENTAIRE" title="Mes documents" description="Pièces réellement déposées avec vos soumissions." />
      <div className="storage-card"><span><FileArchive size={21} /></span><div><b>{files.length} fichier(s)</b><div><i style={{ width: `${Math.min(100, files.length * 5)}%` }} /></div><small>stockés avec vos offres</small></div></div>
      <div className="folder-grid">{[['Soumissions',offers.length,'navy'],['Documents',files.length,'blue'],['Offres acceptées',offers.filter((offer)=>offer.statut==='ACCEPTEE').length,'green']].map(([name,count,tone]) => <button key={name} type="button"><span className={`folder-icon folder-icon--${tone}`}><Folder size={25} fill="currentColor" /></span><div><b>{name}</b><small>{count} élément(s)</small></div><MoreHorizontal size={18} /></button>)}</div>
      <div className="document-toolbar"><label><Search size={17} /><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Rechercher un document..." /></label><div className="view-switch"><button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} type="button"><Grid2X2 size={17} /></button><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} type="button"><List size={18} /></button></div></div>
      {loading ? <div className="loading-state"><span className="spinner" /> Chargement des documents…</div> : error ? <p className="authority-inline-error">{error}</p> : files.length === 0 ? <p className="empty-copy">Aucun document n’a encore été déposé.</p> : view === 'list' ? <div className="table-card"><table><thead><tr><th>Nom du fichier</th><th>Catégorie</th><th>Taille</th><th>Appel d’offres</th><th>Statut</th><th /></tr></thead><tbody>{files.map((file) => <tr key={file.id}><td><div className="file-cell"><span><FileText size={20} /></span><b>{file.nomOriginal}</b></div></td><td>{file.type?.replaceAll('_',' ')}</td><td>{Math.ceil(file.tailleOctets / 1024)} Ko</td><td>{file.tenderTitle || '—'}</td><td><Badge tone="green"><FileCheck2 size={13} /> Déposé</Badge></td><td><button className="icon-button" onClick={()=>download(file)} type="button"><Download size={17} /></button></td></tr>)}</tbody></table></div> : <div className="file-grid">{files.map((file) => <article key={file.id}><span><FileText size={28} /></span><h3>{file.nomOriginal}</h3><p>{file.type?.replaceAll('_',' ')} · {Math.ceil(file.tailleOctets / 1024)} Ko</p><small>{file.tenderTitle}</small><button className="icon-button" onClick={()=>download(file)} type="button"><Download size={17} /></button></article>)}</div>}
    </>
  )
}
