import { api } from '../api/client'

export const supplierService = {
  list: () => api.get('/fournisseurs'),
}
