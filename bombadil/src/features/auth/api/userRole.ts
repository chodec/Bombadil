import { SetRoleData, SetRoleResponse } from './types';
import { API_BASE_URL } from '@/lib/config';

export const setUserRole = async (data: SetRoleData): Promise<SetRoleResponse> => {
  console.log('Setting user role:', data.role)
  
  // Debug localStorage
  console.log('All localStorage keys:', Object.keys(localStorage))
  console.log('Raw session data:', localStorage.getItem('session'))
  
  // Get JWT token from localStorage
  const sessionData = localStorage.getItem('session')
  if (!sessionData) {
    console.error('No session found in localStorage')
    throw new Error('No session found. Please log in again.')
  }
  
  let session
  try {
    session = JSON.parse(sessionData)
    console.log('Parsed session:', session)
  } catch (error) {
    console.error('Failed to parse session data:', error)
    throw new Error('Invalid session data. Please log in again.')
  }
  
  const accessToken = session.access_token
  
  if (!accessToken) {
    console.error('No access token in session:', session)
    throw new Error('No access token found. Please log in again.')
  }
  
  console.log('Using access token:', accessToken.substring(0, 20) + '...')
  
  const response = await fetch(`${API_BASE_URL}/v1/user-role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
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