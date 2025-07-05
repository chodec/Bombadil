import { SetRoleData, SetRoleResponse } from './types';
import { API_BASE_URL } from '@/lib/config';

export const setUserRole = async (data: SetRoleData): Promise<SetRoleResponse> => {
  console.log('Setting user role:', data.role)
  console.log('All cookies:', document.cookie)
  
  const response = await fetch(`${API_BASE_URL}/v1/user-role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
    },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  // Error handling
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('API Error:', errorData)
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}