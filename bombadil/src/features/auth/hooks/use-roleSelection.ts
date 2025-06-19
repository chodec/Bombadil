import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setUserRole } from '../api/userRole'

export const useRoleSelection = () => {
  const navigate = useNavigate()
  
  // State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle role selection
  const handleRoleSelect = async (role: 'client' | 'trainer') => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await setUserRole({ role })
      console.log('Role set successfully:', response)
      
      // Update user data in localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      userData.role = role
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Navigate to appropriate dashboard
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