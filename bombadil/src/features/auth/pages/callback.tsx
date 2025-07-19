import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export const AuthCallbackPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      console.log('=== CALLBACK: Checking for session ===')
      
      // Počkejte chvilku, pak zkontrolujte session
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('Callback session:', session)
      console.log('Callback error:', error)
      
      if (session && session.user) {
        console.log('Session found in callback, checking user profile...')
        
        // Zkontrolovat profil
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('id, email, name, role')
          .eq('id', session.user.id)
          .single()

        console.log('User profile:', userProfile)
        console.log('Profile error:', profileError)

        if (profileError && profileError.code === 'PGRST116') {
          console.log('No profile found, redirecting to role selection')
          navigate('/auth/role-selection')
        } else if (userProfile && (!userProfile.role || userProfile.role === 'pending')) {
          console.log('Profile found but no role, redirecting to role selection')
          navigate('/auth/role-selection')
        } else if (userProfile && userProfile.role) {
          console.log('Profile with role found, redirecting to dashboard')
          switch (userProfile.role) {
            case 'trainer':
              navigate('/trainer/dashboard')
              break
            case 'client':
              navigate('/client/dashboard')
              break
            case 'admin':
              navigate('/admin/dashboard')
              break
            default:
              navigate('/')
          }
        } else {
          navigate('/auth/role-selection')
        }
      } else {
        console.log('No session in callback, redirecting to login')
        navigate('/auth/login')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Processing login...</p>
      </div>
    </div>
  )
}

export default AuthCallbackPage