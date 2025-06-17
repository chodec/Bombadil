export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
}

export const VALIDATION_MESSAGES = {
  email: 'Invalid email format',
  password: 'Password must have at least 8 characters, uppercase, lowercase, number and special character',
  passwordMatch: 'Passwords do not match',
  nameRequired: 'Name must have at least 4 characters'
}