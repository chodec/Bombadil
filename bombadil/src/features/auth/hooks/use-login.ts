import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../api/login'
import { LoginData } from '../api/types'  
import { VALIDATION_PATTERNS, VALIDATION_MESSAGES } from '@/lib/validation'
import { useAuth } from '@/lib/auth/providers/auth-provider' 

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
      console.log('LOGIN RESPONSE:', response)
      console.log('USER ROLE:', response.user.role)
      console.log('NEEDS ROLE SELECTION:', response.needsRoleSelection)
      
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
    handleSubmit,
    updateFormData
  }
}