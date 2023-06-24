export interface ApiToken {
  type: 'bearer'
  token: string
  expires_at?: string
  expires_in?: number
}

export interface RegisterData {
  first_name: string,
  last_name:string,
  user_name:string,
  email: string
  password: string
  passwordConfirmation: string
}

export interface LoginCredentials {
  email: string
  password: string
  remember: boolean
}

export interface User {
  id: number
  email: string,
  userName: string,
  createdAt: string,
  updatedAt: string,
  status: string
  userStatusId: number
}
