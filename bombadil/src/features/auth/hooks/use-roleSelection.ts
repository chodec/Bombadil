import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth/providers/auth-provider'

export const useRoleSelection = () => {
  const navigate = useNavigate()
  const { setUserRole, refreshSession } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRoleSelect = async (role: 'client' | 'trainer') => {
    setLoading(true)
    setError(null)
    
    try {
      await setUserRole(role)
      await refreshSession()
      
      if (role === 'client') {
        navigate('/client/dashboard')
      } else {
        navigate('/trainer/dashboard')
      }
      
    } catch (err: any) {
      console.error('Role selection error:', err)
      setError(err.message || 'Failed to set role. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    handleRoleSelect
  }
}