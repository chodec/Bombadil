import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../api/login'
import { LoginData } from '../api/types'  
import { VALIDATION_PATTERNS, VALIDATION_MESSAGES } from '@/lib/validation'

export const useLogin = () => {
  const navigate = useNavigate()
  
  // Form data state
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  })
  
  // Error states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validation function
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset previous errors
    setError(null)
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const response = await loginUser(formData)
      console.log('Login successful:', response)
      
      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(response.user))
      
      // Reset form on success
      setFormData({
        email: '',
        password: ''
      })
      
      // Handle navigation based on role
      if (response.needsRoleSelection) {
        navigate('/setup/select-role')
      } else {
        // Redirect based on user role
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
            navigate('/dashboard')
        }
      }
      
    } catch (err: any) {
      // Handle specific error cases
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

  // Handle input changes
  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field when user starts typing
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