import { api } from '../api/client'

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  profile: () => api.get('/auth/moi'),
}
