import { api } from '../api/client'

export const auditService = {
  list: (limit = 50) => api.get(`/audit?limite=${limit}`),
  create: (portee) => api.post('/audit', { portee }),
}
