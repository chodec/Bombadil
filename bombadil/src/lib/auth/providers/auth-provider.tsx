import React, { createContext, useContext, useState, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/config'

interface User {
  id: string
  email: string
  name: string
  role: 'trainer' | 'client' | 'pending'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  setUserRole: (role: 'client' | 'trainer') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkSession = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/v1/verify-session`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
        },
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)  
        localStorage.setItem('user', JSON.stringify(data.user)) 
      } else {
        setUser(null)
        localStorage.removeItem('user')
      }
      
    } catch (error) {
      console.error('Session check failed:', error)
      setUser(null)
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/v1/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
        },
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('user')
    }
  }

  const setUserRole = async (role: 'client' | 'trainer') => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/user-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
        },
        credentials: 'include',
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (user) {
        const updatedUser = { ...user, role }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }

      return data
    } catch (error) {
      console.error('Set role failed:', error)
      throw error
    }
  }

  const refreshSession = async () => {
    await checkSession()
  }

  useEffect(() => {
    checkSession()
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    refreshSession,
    setUserRole
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}