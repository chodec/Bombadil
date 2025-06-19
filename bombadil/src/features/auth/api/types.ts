//auth definitions

export interface RegisterData {
  email: string
  name: string
  password: string
  passwordRepeat: string
}

export interface RegisterResponse {
    message: string
}

export interface LoginData {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user: {
    id: string
    email: string
    name: string
    role: 'pending' | 'client' | 'trainer' | 'admin'
  }
  session: {
    access_token: string
    refresh_token: string
  }
  needsRoleSelection: boolean
  message: string
}

export interface SetRoleData {
  role: 'client' | 'trainer'
}

export interface SetRoleResponse {
  success: boolean
  role: 'client' | 'trainer'
  message: string
}