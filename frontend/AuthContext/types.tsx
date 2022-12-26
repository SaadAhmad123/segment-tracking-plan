import { AuthResponse } from '../hooks/useAuth'
import { GetUserResponse } from 'aws-sdk/clients/cognitoidentityserviceprovider'

export type AuthContextType = {
  auth?: AuthResponse
  loading?: boolean
  authUser?: GetUserResponse
}
