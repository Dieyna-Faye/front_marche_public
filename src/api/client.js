const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

function getToken() {
  return localStorage.getItem('marches-token')
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers)
  const token = getToken()
  const isFormData = options.body instanceof FormData

  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch (error) {
    throw new ApiError('Le serveur API est indisponible.', 0, error)
  }

  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.blob()

  if (!response.ok) {
    if (response.status === 401 && token) window.dispatchEvent(new Event('auth:expired'))
    throw new ApiError(payload?.msg || 'Une erreur est survenue.', response.status, payload)
  }

  return payload
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body, options = {}) => request(path, {
    ...options,
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  }),
  put: (path, body, options = {}) => request(path, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
}

export { API_BASE_URL }
