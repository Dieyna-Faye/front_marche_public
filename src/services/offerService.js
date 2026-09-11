import { api } from '../api/client'

export const offerService = {
  mine: () => api.get('/offres/mes-offres'),
  byTender: (tenderId) => api.get(`/appels-offres/${tenderId}/offres`),
  get: (id) => api.get(`/offres/${id}`),
  updateStatus: (id, statut) => api.put(`/offres/${id}/statut`, { statut }),
  submit: (tenderId, data) => api.post(`/appels-offres/${tenderId}/offres`, data),
  saveDraft: (tenderId, data) => api.put(`/appels-offres/${tenderId}/offres/brouillon`, data),
  uploadDocument: (offerId, type, file) => {
    const form = new FormData()
    form.append('type', type)
    form.append('fichier', file)
    return api.post(`/offres/${offerId}/documents`, form)
  },
  downloadDocument: (offerId, documentId) => api.get(`/offres/${offerId}/documents/${documentId}/telecharger`),
}
