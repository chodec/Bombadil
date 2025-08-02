// use-callback.ts
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/providers/auth-provider';
import { createUserProfileApi } from '../api/userProfile';

export const useAuthCallback = () => {
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const handleCallback = async () => {
      try {
        if (!authUser) {
          setError('User not authenticated. Redirecting to login.');
          setTimeout(() => navigate('/auth/login'), 2000);
          return;
        }

        const profileData = await createUserProfileApi(authUser, 'oauth');
        
        if (!profileData?.role || profileData.role === 'pending') {
          navigate('/auth/role-selection');
        } else {
          switch (profileData.role) {
            case 'trainer': 
              navigate('/trainer/dashboard');
              break;
            case 'client': 
              navigate('/client/dashboard');
              break;
            case 'admin': 
              navigate('/admin/dashboard');
              break;
            default: 
              navigate('/');
          }
        }
      } catch (err) {
        console.error("Error during authentication callback:", err);
        setError('An unexpected error occurred during authentication.');
        setTimeout(() => navigate('/auth/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, authUser, authLoading]);

  return {
    loading,
    error
  };
};