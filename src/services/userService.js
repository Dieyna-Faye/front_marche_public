import { api } from '../api/client'

export const userService = {
  list: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  deactivate: (id) => api.delete(`/users/${id}`),
}
