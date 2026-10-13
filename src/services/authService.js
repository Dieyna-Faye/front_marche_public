import { api } from '../api/client'

function mapUser(user) {
  if (!user) return user
  const backendRole = typeof user.role === 'object' ? user.role?.name : user.role
  const role = { admin: 'ADMIN', authority: 'AUTORITE_CONTRACTANTE', supplier: 'FOURNISSEUR', commission: 'COMMISSION_EVALUATION', auditor: 'AUDITEUR' }[backendRole] || backendRole
  return { ...user, nom: `${user.firstName || ''} ${user.lastName || ''}`.trim(), role, permissions: user.role?.permissions ? JSON.parse(user.role.permissions) : user.permissions || [] }
}

export const authService = {
  login: async (credentials) => {
    const result = await api.post('/auth/login', { email: credentials.email, password: credentials.password ?? credentials.motDePasse })
    return { ...result, utilisateur: mapUser(result.user) }
  },
  register: (data) => {
    const parts = String(data.nom || '').trim().split(/\s+/)
    return api.post('/auth/register', {
      firstName: data.firstName || parts[0] || '',
      lastName: data.lastName || parts.slice(1).join(' ') || parts[0] || '',
      email: data.email,
      password: data.password ?? data.motDePasse,
      role: 'supplier',
    })
  },
  profile: async () => mapUser(await api.get('/auth/me')),
}
