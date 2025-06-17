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