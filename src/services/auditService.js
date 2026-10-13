import { api } from '../api/client'

function mapLog(log) {
  let detailText = ''
  let detailData = {}
  try {
    detailData = JSON.parse(log.details || '{}')
    detailText = Object.entries(detailData).map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`).join(' · ')
  } catch {
    detailText = String(log.details || '')
    detailData = { description: detailText }
  }
  const user = log.user
  return {
    ...log,
    utilisateurId: log.userId,
    utilisateur: user ? {
      nom: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      role: user.role?.name || '',
    } : null,
    adresseIp: log.ipAddress,
    details: detailText || '—',
    detailsData: detailData,
  }
}

export const auditService = {
  list: async (limit = 100, offset = 0) => (await api.get(`/audit/logs?limit=${limit}&offset=${offset}`)).map(mapLog),
  create: async (description) => mapLog(await api.post('/audit/logs/manual', { description })),
}
