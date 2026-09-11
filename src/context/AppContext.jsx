import { useCallback, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'
import { initials, roleKeys, roleLabels } from '../utils/formatters'
import { AppContext } from './app-context'

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [notifications, setNotifications] = useState(0)
  const [toast, setToast] = useState(null)

  const logout = useCallback(() => {
    localStorage.removeItem('marches-token')
    setUser(null)
  }, [])

  useEffect(() => {
    let active = true
    const token = localStorage.getItem('marches-token')
    if (!token) {
      setIsInitializing(false)
      return undefined
    }

    authService.profile()
      .then((profile) => { if (active) setUser(profile) })
      .catch(() => { if (active) logout() })
      .finally(() => { if (active) setIsInitializing(false) })

    return () => { active = false }
  }, [logout])

  useEffect(() => {
    const handleExpired = () => logout()
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [logout])

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials)
    localStorage.setItem('marches-token', response.token)
    setUser(response.utilisateur)
    return response.utilisateur
  }, [])

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone, key: Date.now() })
    window.setTimeout(() => setToast(null), 3200)
  }, [])

  const presentedUser = user ? {
    ...user,
    name: user.nom,
    initials: initials(user.nom),
    roleLabel: roleLabels[user.role] || user.role,
    organization: user.email,
  } : null

  const value = useMemo(
    () => ({
      role: roleKeys[user?.role] || null,
      backendRole: user?.role || null,
      user: presentedUser,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      logout,
      notifications,
      setNotifications,
      toast,
      showToast,
    }),
    [user, presentedUser, isInitializing, login, logout, notifications, toast, showToast],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
