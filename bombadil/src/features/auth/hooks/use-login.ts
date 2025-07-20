import { useState } from 'react'
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

  const createUserRecord = async (authUser: any) => {
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking existing user:', checkError)
        throw checkError
      }

      if (!existingUser) {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
            role: 'pending',
            registration_method: 'email'
          })
          .select()
          .single()

        if (insertError) {
          throw insertError
        }

        return newUser
      } else {
        return existingUser
      }
    } catch (error) {
      console.error('Error creating user record:', error)
      throw error
    }
  }

  const redirectByRole = (role: string) => {
    switch (role) {
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
      
      if (response.needsRoleSelection) {
        navigate('/auth/role-selection')
      } else {
        const userRecord = await createUserRecord(response.user)
        
        localStorage.setItem('user', JSON.stringify({
          ...response.user,
          role: userRecord.role,
          name: userRecord.name
        }))
        
        await refreshSession()
        redirectByRole(userRecord.role)
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
    console.log('Starting Google OAuth flow')
    console.log('Current origin:', window.location.origin)
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      
      console.log('OAuth response data:', data)
      console.log('OAuth response error:', error)
      
      if (error) {
        console.error('Google OAuth error:', error)
        setError(`Google OAuth failed: ${error.message}`)
        return
      }
      
      if (data?.url) {
        console.log('Redirecting to Google:', data.url)
        window.location.href = data.url
      } else {
        console.error('No OAuth URL received')
        setError('Failed to initialize Google login - no URL received')
      }
      
    } catch (err: any) {
      console.error('Exception in Google sign-in:', err)
      setError(`Google sign-in failed: ${err.message}`)
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
    updateFormData,
    redirectByRole
  }
}