import { LoginData, LoginResponse } from './types';
import { API_BASE_URL } from '@/lib/config';

export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  console.log('Logging in user with API key:', process.env.REACT_APP_SUPABASE_ANON_KEY)
  
  const response = await fetch(`${API_BASE_URL}/v1/user-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(data),
  })

  // Error handling
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}