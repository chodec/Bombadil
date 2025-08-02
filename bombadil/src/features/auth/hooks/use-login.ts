import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../api/login';
import { googleLogin } from '../api/loginGoogle';
import { LoginData } from '../api/types';
import { VALIDATION_PATTERNS, VALIDATION_MESSAGES } from '@/lib/validation';
import { useAuth } from '@/lib/auth/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { createUserRecord } from '@/lib/auth/user-profile';

export const useLogin = () => {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const redirectByRole = (role: string) => {
    switch (role) {
      case 'client':
        navigate('/client/dashboard');
        break;
      case 'trainer':
        navigate('/trainer/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/');
        break;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!VALIDATION_PATTERNS.email.test(formData.email)) {
      newErrors.email = VALIDATION_MESSAGES.email;
    }
    
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const { 
    mutate: loginWithEmail, 
    isPending: isEmailLoginPending 
  } = useMutation({
    mutationFn: loginUser,
    onSuccess: async (response) => {
      if (response.needsRoleSelection) {
        navigate('/auth/role-selection');
      } else {
        const userRecord = await createUserRecord(response.user, 'email');
        
        localStorage.setItem('user', JSON.stringify({
          ...response.user,
          role: userRecord.role,
          name: userRecord.name
        }));
        
        await refreshSession();
        redirectByRole(userRecord.role);
      }
    },
    onError: (err: any) => {
      if (err.message && err.message.includes('Invalid email or password')) {
        setErrors(prev => ({ ...prev, password: err.message }));
      } else if (err.message && err.message.includes('email')) {
        setErrors(prev => ({ ...prev, email: err.message }));
      } else if (err.message && err.message.includes('password')) {
        setErrors(prev => ({ ...prev, password: err.message }));
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    },
  });

  const { 
    mutate: loginWithGoogle, 
    isPending: isGoogleLoginPending,
    error: googleLoginError 
  } = useMutation({
    mutationFn: googleLogin,
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (err) => {
      setError(`Google login failed: ${err.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    loginWithEmail(formData);
  };

  const signInWithGoogle = () => {
    setError(null);
    loginWithGoogle();
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const loading = isEmailLoginPending || isGoogleLoginPending;

  return {
    formData,
    loading,
    error: error || (googleLoginError as Error)?.message || null,
    errors,
    signInWithGoogle,
    handleSubmit,
    updateFormData,
    redirectByRole
  };
};