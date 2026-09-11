import { useContext } from 'react'
import { AppContext } from './app-context'

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp doit être utilisé dans AppProvider')
  return context
}
