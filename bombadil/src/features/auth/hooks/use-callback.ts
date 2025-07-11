import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { API_BASE_URL } from '@/lib/config'
import { useAuth } from '@/lib/auth/providers/auth-provider'

export const useAuthCallback = () => {
  const navigate = useNavigate()
  const { refreshSession } = useAuth()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          navigate('/auth/login?error=auth_failed')
          return
        }

        if (!session?.access_token) {
          console.error('No access token in session')
          navigate('/auth/login?error=no_session')
          return
        }

        console.log('Google session found, calling bridge...')

        const response = await fetch(`${API_BASE_URL}/v1/google-auth-bridge`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
          },
          credentials: 'include',
          body: JSON.stringify({ 
            access_token: session.access_token 
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Bridge function failed:', errorData)
          navigate('/auth/login?error=bridge_failed')
          return
        }

        const data = await response.json()
        console.log('Bridge response:', data)

        if (data.success) {
          await refreshSession()

          if (data.needsRoleSelection) {
            navigate('/auth/role-selection')
          } else {
            switch (data.user.role) {
              case 'client':
                navigate('/client/dashboard')
                break
              case 'trainer':
                navigate('/trainer/dashboard')
                break
              case 'admin':
                navigate('/admin/dashboard')
                break
              default:
                navigate('/auth/role-selection')
            }
          }
        } else {
          console.error('Bridge function returned error:', data)
          navigate('/auth/login?error=bridge_error')
        }

      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/auth/login?error=unexpected_error')
      }
    }

    const timeout = setTimeout(handleAuthCallback, 100)
    
    return () => clearTimeout(timeout)
  }, [navigate, refreshSession])
}