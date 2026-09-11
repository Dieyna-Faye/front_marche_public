import { api } from '../api/client'

function queryString(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}

export const tenderService = {
  list: (filters) => api.get(`/appels-offres${queryString(filters)}`),
  get: (id) => api.get(`/appels-offres/${id}`),
  create: (data) => api.post('/appels-offres', data),
  update: (id, data) => api.put(`/appels-offres/${id}`, data),
  publish: (id) => api.post(`/appels-offres/${id}/publier`, {}),
  archive: (id) => api.post(`/appels-offres/${id}/archiver`, {}),
  uploadSpecifications: (id, file) => {
    const form = new FormData()
    form.append('fichier', file)
    return api.post(`/appels-offres/${id}/cahier-des-charges`, form)
  },
  downloadDocument: (tenderId, documentId) => api.get(`/appels-offres/${tenderId}/documents/${documentId}/telecharger`),
}
