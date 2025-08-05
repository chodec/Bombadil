import { API_BASE_URL } from '@/lib/config';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string; 
}

export const createUserProfileApi = async (user: any, registrationMethod: string): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/v1/user-create-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split('@')[0],
      registration_method: registrationMethod,
      role: 'pending'
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  return response.json();
};