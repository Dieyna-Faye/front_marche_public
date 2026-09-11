import { api } from '../api/client'

export const dashboardService = {
  getSummary: () => api.get('/dashboard'),
}
