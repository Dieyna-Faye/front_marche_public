import { api } from '../api/client'

const toBackendRole = { ADMIN: 'admin', AUTORITE_CONTRACTANTE: 'authority', FOURNISSEUR: 'supplier', COMMISSION_EVALUATION: 'commission', AUDITEUR: 'auditor' }
const toFrontendRole = Object.fromEntries(Object.entries(toBackendRole).map(([key, value]) => [value, key]))
const mapUser = (user) => ({
  ...user,
  nom: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
  role: toFrontendRole[user.role?.name || user.role] || user.role?.name || user.role,
})

export const userService = {
  list: async () => (await api.get('/users')).map(mapUser),
  listRoles: async () => (await api.get('/users/roles')).map((role) => ({ ...role, permissions: typeof role.permissions === 'string' ? JSON.parse(role.permissions || '[]') : role.permissions || [] })),
  updatePermissions: async (id, permissions) => {
    const role = await api.put(`/users/roles/${id}/permissions`, { permissions })
    return { ...role, permissions: typeof role.permissions === 'string' ? JSON.parse(role.permissions || '[]') : role.permissions || [] }
  },
  create: (data) => {
    const names = String(data.nom || '').trim().split(/\s+/)
    return api.post('/users', {
      firstName: data.firstName || names[0] || '',
      lastName: data.lastName || names.slice(1).join(' ') || names[0] || '',
      email: data.email,
      password: data.password || data.motDePasse,
      role: toBackendRole[data.role] || data.role || 'supplier',
    })
  },
  updateRole: async (id, role) => {
    const result = await api.put(`/users/${id}/role`, { role: toBackendRole[role] || role })
    return { ...result, role }
  },
  deactivate: (id) => api.delete(`/users/${id}`),
}
