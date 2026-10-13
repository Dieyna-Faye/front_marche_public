import { api } from '../api/client'

const statusMap = { BROUILLON: 'brouillon', PUBLIE: 'publie', ARCHIVE: 'archive', CLOTURE: 'cloture', ATTRIBUE: 'attribue' }
const typeMap = { FOURNITURES: 'fournitures', SERVICES: 'services', TRAVAUX: 'travaux', PRESTATIONS_INTELLECTUELLES: 'prestations_intellectuelles', MAINTENANCE: 'maintenance', INFORMATIQUE: 'informatique', EQUIPEMENTS: 'equipements' }

function toApi(data = {}) {
  return {
    title: data.title ?? data.titre,
    description: data.description,
    estimatedBudget: Number(data.estimatedBudget ?? data.budgetEstimatif),
    type: typeMap[data.type ?? data.typeMarche] || String((data.type ?? data.typeMarche) || '').toLowerCase(),
    submissionDeadline: data.submissionDeadline ?? data.dateLimiteSoumission,
    currency: data.currency || 'XOF',
  }
}

export function mapTender(tender) {
  if (!tender) return tender
  const documents = (tender.documents || []).map((doc) => ({ ...doc, nomOriginal: doc.originalName, nom: doc.label }))
  const mappedStatus = { brouillon: 'BROUILLON', publie: 'PUBLIE', archive: 'ARCHIVE', cloture: 'CLOTURE', attribue: 'ATTRIBUE' }[tender.status] || tender.status
  return {
    ...tender,
    id: String(tender.id),
    titre: tender.title,
    budgetEstimatif: tender.estimatedBudget,
    typeMarche: String(tender.type || '').toUpperCase(),
    dateLimiteSoumission: tender.submissionDeadline,
    statut: mappedStatus,
    auteur: tender.creator ? { nom: `${tender.creator.firstName || ''} ${tender.creator.lastName || ''}`.trim() } : null,
    documents,
  }
}

export const tenderService = {
  publicList: async () => (await api.get('/tenders/public')).map(mapTender),
  list: async (filters = {}) => {
    const params = new URLSearchParams()
    const status = filters.status || filters.statut
    const type = filters.type || filters.typeMarche
    if (status) params.set('status', statusMap[status] || status.toLowerCase())
    if (type) params.set('type', typeMap[type] || type.toLowerCase())
    const suffix = params.size ? `?${params}` : ''
    const route = localStorage.getItem('marches-token') ? `/tenders${suffix}` : `/tenders/public${suffix}`
    return (await api.get(route)).map(mapTender)
  },
  get: async (id) => mapTender(await api.get(localStorage.getItem('marches-token') ? `/tenders/${id}` : `/tenders/public/${id}`)),
  create: async (data) => mapTender(await api.post('/tenders', toApi(data))),
  update: async (id, data) => mapTender(await api.put(`/tenders/${id}`, toApi(data))),
  publish: async (id) => mapTender((await api.post(`/tenders/${id}/publish`, {})).tender),
  archive: (id) => api.post(`/tenders/${id}/archive`, {}),
  criteria: (id) => api.get(`/tenders/${id}/criteria`),
  createCriteria: (id, data) => api.post(`/tenders/${id}/criteria`, data),
  uploadSpecifications: (id, file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/tenders/${id}/documents`, form)
  },
  downloadDocument: async (tenderId, documentId) => {
    return api.get(`/tenders/${tenderId}/documents/${documentId}/download`)
  },
}
