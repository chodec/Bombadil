import { RegisterData, RegisterResponse } from './types';
import { API_BASE_URL } from '@/lib/config';

export const registerUser = async (data: RegisterData): Promise<RegisterResponse> => {
    console.log('hi' + process.env.REACT_APP_SUPABASE_ANON_KEY)
  const response = await fetch(`${API_BASE_URL}/v1/user-registration`, {
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