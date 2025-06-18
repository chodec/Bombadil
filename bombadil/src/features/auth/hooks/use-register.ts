import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../api/register'
import { RegisterData } from '../api/types'  
import { VALIDATION_PATTERNS, VALIDATION_MESSAGES } from '@/lib/validation'

export const useRegister = () => {
  const navigate = useNavigate()
  
  // Form data state
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    name: '',
    password: '',
    passwordRepeat: ''
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
    
    if (formData.name.trim().length < 2) {
      newErrors.name = VALIDATION_MESSAGES.nameRequired
    }
    
    if (!VALIDATION_PATTERNS.password.test(formData.password)) {
      newErrors.password = VALIDATION_MESSAGES.password
    }
    
    if (formData.password !== formData.passwordRepeat) {
      newErrors.passwordRepeat = VALIDATION_MESSAGES.passwordMatch
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
      const response = await registerUser(formData)
      console.log('Registration successful:', response)
      
      // Reset form on success
      setFormData({
        email: '',
        name: '',
        password: '',
        passwordRepeat: ''
      })
      
      // Redirect to dashboard or wherever
      navigate('/dashboard')
      
    } catch (err: any) {
      if (err.message && err.message.includes('already exists')) {
    setErrors(prev => ({
        ...prev,
        email: err.message
      }))
    } else if (err.field === 'email') {
      setErrors(prev => ({
        ...prev,
        email: err.message
      }))
    } else {
      setError(err.message || 'Something went wrong')
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