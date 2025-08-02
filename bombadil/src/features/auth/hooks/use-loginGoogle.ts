import { useMutation } from '@tanstack/react-query';
import { googleLogin } from '../api/loginGoogle';

export const useGoogleLogin = () => {
  const { mutate, isPending, error, isError } = useMutation({
    mutationFn: googleLogin,
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (err) => {
      console.error('Google login failed:', err);
    }
  });

  return {
    loginWithGoogle: mutate,
    isLoading: isPending, 
    error,
    isError,
  };
};