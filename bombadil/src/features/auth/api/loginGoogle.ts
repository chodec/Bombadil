import { API_BASE_URL } from '@/lib/config';

interface GoogleLoginResponse {
  url: string;
}

export const googleLogin = async (): Promise<GoogleLoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/v1/user-login-google`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};