import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../api/login'
import { LoginData } from '../api/types'  
import { VALIDATION_PATTERNS, VALIDATION_MESSAGES } from '@/lib/validation'
import { useAuth } from '@/lib/auth/providers/auth-provider'
import { supabase } from '@/lib/supabase'

export const useLogin = () => {
  const navigate = useNavigate()
  const { refreshSession } = useAuth()
  
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auth state listener pro Google OAuth
  useEffect(() => { 
    console.log('=== AUTH LISTENER SETUP ===')
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔥 AUTH EVENT:', event)
      console.log('🔥 SESSION:', session)
      console.log('🔥 USER EMAIL:', session?.user?.email)
      console.log('Auth state change:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session) {
        setLoading(true)
        try {
          // Zkontrolovat profil uživatele
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('id, email, name, role')
            .eq('id', session.user.id)
            .single()

          if (profileError && profileError.code === 'PGRST116') {
            // Uživatel neexistuje v tabulce users, potřebuje výběr role
            console.log("User profile not found, redirecting to role selection")
            navigate('/auth/role-selection')
          } else if (profileError) {
            console.error('Error fetching user profile:', profileError)
            setError('Failed to load user profile. Please try again.')
          } else if (userProfile && userProfile.role && userProfile.role !== 'pending') {
            // Uživatel má roli, přesměrovat podle role
            localStorage.setItem('user', JSON.stringify({ 
              ...session.user, 
              role: userProfile.role,
              name: userProfile.name 
            }))
            
            await refreshSession()
            
            switch (userProfile.role) {
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
                navigate('/') 
                break
            }
          } else {
            // Uživatel přihlášen, ale nemá roli nebo má pending
            console.log("User signed in but no role found, redirecting to role selection")
            navigate('/auth/role-selection')
          }
        } catch (err: any) {
          console.error('Error during post-login processing:', err)
          setError('An error occurred after login. Please try again.')
        } finally {
          setLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('user')
      }
    })

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [navigate, refreshSession])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!VALIDATION_PATTERNS.email.test(formData.email)) {
      newErrors.email = VALIDATION_MESSAGES.email
    }
    
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Email/password login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setError(null)
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const response = await loginUser(formData)
      console.log('Login successful:', response)
      
      localStorage.setItem('user', JSON.stringify(response.user)) 
      await refreshSession()
      
      if (response.needsRoleSelection) {
        navigate('/auth/role-selection')
      } else {
        switch (response.user.role) {
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
            navigate('/') 
            break
        }
      }
      
    } catch (err: any) {
      if (err.message && err.message.includes('Invalid email or password')) {
        setErrors(prev => ({
          ...prev,
          password: err.message
        }))
      } else if (err.message && err.message.includes('email')) {
        setErrors(prev => ({
          ...prev,
          email: err.message
        }))
      } else if (err.message && err.message.includes('password')) {
        setErrors(prev => ({
          ...prev,
          password: err.message
        }))
      } else {
        setError(err.message || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    const origin = window.location.origin;
    
    console.log('🔍 Origin:', origin)
    console.log('🔍 Redirect to:', `${origin}/auth/callback`)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google"
    })
    
    console.log('🔍 OAuth data:', data)
    console.log('🔍 OAuth URL:', data.url)
    
    if (data.url) {
      console.log('🚀 Redirecting to:', data.url)
      window.location.href = data.url;
    }
  }

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return {
    formData,
    loading,
    error,
    errors,
    signInWithGoogle,
    handleSubmit,
    updateFormData
  }
}