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
  needsRoleSelection: boolean
  message: string
}