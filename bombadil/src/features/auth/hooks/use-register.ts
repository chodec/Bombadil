import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/register';
import { googleLogin } from '../api/loginGoogle';
import { RegisterData } from '../api/types';

const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<,>.?/~`])[A-Za-z\d!@#$%^&*()_+={}\[\]|\\:;"'<,>.?/~`]{8,}$/,
};

const VALIDATION_MESSAGES = {
  email: 'Invalid email format',
  password: 'Password must have at least 8 characters, uppercase, lowercase, number and special character',
  nameRequired: 'Name must have at least 4 characters',
  passwordMatch: 'Passwords do not match',
};

export const useRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    name: '',
    password: '',
    passwordRepeat: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      console.log('Registration successful, check email for confirmation', data);
      navigate('/auth/login');
    },
    onError: (err: any) => {
      if (err.field === 'email' && err.message === 'User with this email already exists') {
        setErrors(prevErrors => ({ ...prevErrors, email: err.message }));
      } else {
        setGlobalError(err.message || 'Registration failed. Please try again.');
      }
    },
  });

  const googleMutation = useMutation({
    mutationFn: googleLogin,
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (err: any) => {
      setGlobalError(`Google registration failed: ${err.message}`);
    }
  });

  const updateFormData = (field: keyof RegisterData, value: string) => {
    setFormData(prevData => ({ ...prevData, [field]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!VALIDATION_PATTERNS.email.test(formData.email)) {
      newErrors.email = VALIDATION_MESSAGES.email;
    }

    if (formData.name.trim().length < 4) {
      newErrors.name = VALIDATION_MESSAGES.nameRequired;
    }

    if (!VALIDATION_PATTERNS.password.test(formData.password)) {
      newErrors.password = VALIDATION_MESSAGES.password;
    }

    if (formData.password !== formData.passwordRepeat) {
      newErrors.passwordRepeat = VALIDATION_MESSAGES.passwordMatch;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setErrors({});
    
    if (registerMutation.isPending || googleMutation.isPending) {
        return;
    }

    if (!validateForm()) {
      return;
    }

    registerMutation.mutate(formData);
  };
  
  const handleGoogleSignIn = () => {
    setGlobalError(null);
    setErrors({});
    if (registerMutation.isPending || googleMutation.isPending) {
        return;
    }
    googleMutation.mutate();
  };

  const loading = registerMutation.isPending || googleMutation.isPending;

  return {
    formData,
    errors,
    loading,
    error: globalError,
    onSubmit: handleSubmit,
    onGoogleSignIn: handleGoogleSignIn,
    onChange: updateFormData,
  };
};