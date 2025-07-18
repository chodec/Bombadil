import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth/providers/auth-provider'

export const useRoleSelection = () => {
  const navigate = useNavigate()
  const { setUserRole, refreshSession } = useAuth()

  const roleSelectionMutation = useMutation({
    mutationFn: async (role: 'client' | 'trainer') => {
      await setUserRole(role)
      await refreshSession()
      return role
    },
    onSuccess: (role) => {
      if (role === 'client') {
        navigate('/client/dashboard')
      } else {
        navigate('/trainer/dashboard')
      }
    },
    onError: (err: any) => {
      console.error('Role selection error:', err)
    }
  })

  const handleRoleSelect = (role: 'client' | 'trainer') => {
    roleSelectionMutation.mutate(role)
  }

  return {
    loading: roleSelectionMutation.isPending,
    error: roleSelectionMutation.error?.message || null,
    handleRoleSelect
  }
}