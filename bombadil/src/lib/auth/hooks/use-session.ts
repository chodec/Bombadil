import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'trainer' | 'client' | 'pending'
}

interface SessionState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
}

export function useSession() {
  const [state, setState] = useState<SessionState>({
    user: null,
    loading: true,
    isAuthenticated: false
  })

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/verify-session', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setState({
          user: data.user,
          loading: false,
          isAuthenticated: true
        })
      } else {
        setState({
          user: null,
          loading: false,
          isAuthenticated: false
        })
      }
    } catch (error) {
      console.error('Session check failed:', error)
      setState({
        user: null,
        loading: false,
        isAuthenticated: false
      })
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setState({
        user: null,
        loading: false,
        isAuthenticated: false
      })
    }
  }

  const refreshSession = () => {
    setState(prev => ({ ...prev, loading: true }))
    checkSession()
  }

  return {
    ...state,
    logout,
    refreshSession
  }
}