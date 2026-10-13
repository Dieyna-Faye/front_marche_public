import { api } from '../api/client'
import { mapTender } from './tenderService'

const categoryMap = {
  registre_de_commerce: 'REGISTRE_COMMERCE', quitus_fiscal: 'QUITUS_FISCAL',
  attestation_sociale: 'ATTESTATION_SOCIALE', references_techniques: 'REFERENCES_TECHNIQUES',
  memoire_technique: 'MEMOIRE_TECHNIQUE', planning_execution: 'PLANNING_EXECUTION',
  offre_financiere_signee: 'OFFRE_FINANCIERE',
}
const uploadCategoryMap = {
  REGISTRE_COMMERCE: 'registre_de_commerce', QUITUS_FISCAL: 'quitus_fiscal',
  ATTESTATION_SOCIALE: 'attestation_sociale', REFERENCES_TECHNIQUES: 'references_techniques',
  MEMOIRE_TECHNIQUE: 'memoire_technique', PLANNING_EXECUTION: 'planning_execution',
  OFFRE_FINANCIERE: 'offre_financiere_signee', OFFRE_TECHNIQUE: 'memoire_technique',
}

export function mapBid(bid) {
  if (!bid) return bid
  const statusMap = { brouillon: 'BROUILLON', deposee: 'SOUMISE', en_evaluation: 'EN_COURS_EVALUATION', conforme: 'ACCEPTEE', attribuee: 'ACCEPTEE', non_conforme: 'REJETEE', rejetee: 'REJETEE', perdue: 'REJETEE' }
  const documents = (bid.documents || []).map((doc) => ({
    ...doc,
    type: categoryMap[doc.category] || String(doc.category || 'AUTRE').toUpperCase(),
    nomOriginal: doc.originalName,
    offerId: bid.id,
  }))
  const supplier = bid.supplier ? { ...bid.supplier, nom: bid.supplier.companyName } : null
  const tender = bid.tender ? mapTender(bid.tender) : null
  const score = bid.score ? {
    ...bid.score,
    administratif: bid.score.adminScore,
    technique: bid.score.technicalScore,
    financier: bid.score.financialScore,
    experience: bid.score.experienceScore,
    delai: bid.score.delayScore,
    global: bid.score.globalScore,
  } : null
  return {
    ...bid,
    id: String(bid.id),
    appelOffresId: bid.tenderId,
    appelOffres: tender,
    fournisseur: supplier,
    montantPropose: bid.financialAmount,
    delaiExecutionJours: bid.executionDelayDays,
    statut: statusMap[bid.status] || bid.status,
    dateSoumission: bid.submittedAt,
    accuseReception: bid.receiptHash,
    documents,
    score,
    resumeAutomatique: bid.automaticSummary,
    grilleConformite: bid.complianceDetails,
  }
}

export const offerService = {
  mine: async () => (await api.get('/bids/my')).map(mapBid),
  byTender: async (tenderId) => (await api.get(`/tenders/${tenderId}/bids`)).map(mapBid),
  get: async (id) => mapBid(await api.get(`/bids/${id}`)),
  submit: async (tenderId, data) => mapBid(await api.post(`/tenders/${tenderId}/bids`, {
    technicalProposal: data.technicalProposal || '',
    financialAmount: Number(data.financialAmount ?? data.montantPropose),
    currency: data.currency || 'XOF',
    executionDelayDays: Number(data.executionDelayDays ?? data.delaiExecutionJours) || undefined,
  })),
  finalize: async (id) => mapBid((await api.post(`/bids/${id}/submit`, {})).bid),
  analyze: (id) => api.post(`/bids/${id}/analyze`, {}),
  decide: (id, decision, comment) => api.post(`/bids/${id}/committee-decision`, { decision, comment }),
  evaluations: (id) => api.get(`/evaluations/bids/${id}`),
  setEvaluation: (bidId, criteriaId, score, comment = '') => api.post('/evaluations', { bidId, criteriaId, score: Number(score), comment }),
  saveDraft: async (tenderId, data) => mapBid(await api.post(`/tenders/${tenderId}/bids`, {
    technicalProposal: data.technicalProposal || '',
    financialAmount: Number(data.financialAmount ?? data.montantPropose),
    currency: data.currency || 'XOF',
    executionDelayDays: Number(data.executionDelayDays ?? data.delaiExecutionJours) || undefined,
  })),
  uploadDocument: (bidId, category, file) => {
    const form = new FormData()
    form.append('category', uploadCategoryMap[category] || String(category).toLowerCase())
    form.append('label', file.name)
    form.append('file', file)
    return api.post(`/bids/${bidId}/documents`, form)
  },
  reviewDocument: (bidId, documentId, status, comment = '') => api.post(`/bids/${bidId}/documents/${documentId}/review`, { status, comment }),
  award: async (id) => api.post(`/bids/${id}/award`, {}),
  downloadDocument: async (bidId, documentId) => {
    const bid = await api.get(`/bids/${bidId}`)
    const document = (bid.documents || []).find((doc) => doc.id === documentId)
    if (!document?.filePath) throw new Error('Fichier indisponible')
    return api.get(`/files?path=${encodeURIComponent(document.filePath)}`)
  },
}
