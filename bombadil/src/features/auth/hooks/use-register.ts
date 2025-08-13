import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { registerUser } from '../api/register'
import { RegisterData } from '../api/types'  
import { VALIDATION_PATTERNS, VALIDATION_MESSAGES } from '@/lib/validation'

export const useRegister = () => {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    name: '',
    password: '',
    passwordRepeat: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (response) => {
      console.log('Registration successful, check email for confirmation', response)
      navigate('/auth/login')
    },
    onError: (err: any) => {
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
      }
    }
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!VALIDATION_PATTERNS.email.test(formData.email)) {
      newErrors.email = VALIDATION_MESSAGES.email;
    }

    if (formData.name.trim().length < 2) {
      newErrors.name = VALIDATION_MESSAGES.nameRequired;
    }

    if (!VALIDATION_PATTERNS.password.test(formData.password)) {
      newErrors.password = VALIDATION_MESSAGES.password;
    }

    if (formData.password !== formData.passwordRepeat) {
      newErrors.passwordRepeat = VALIDATION_MESSAGES.passwordMatch;
    }

    console.log('Validation finished. Errors:', newErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('handleSubmit called with data:', formData);

    if (!validateForm()) {
      console.log('Validation failed, not calling API.');
      return
    }
    console.log('Validation successful, calling API with data:', formData);
    
    registerMutation.mutate(formData)
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
    loading: registerMutation.isPending,
    error: registerMutation.error?.message || null,
    errors,
    handleSubmit,
    updateFormData
  }
}