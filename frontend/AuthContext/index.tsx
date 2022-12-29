import React, { useState } from 'react'
import AuthContext from './Context'
import useAuth, { AuthResponse } from '../hooks/useAuth'
import onMount from '../hooks/onMount'
import { GetUserResponse } from 'aws-sdk/clients/cognitoidentityserviceprovider'
import { useRouter } from 'next/router'
import LoadingScreen from '../components/LoadingScreen'
import useSessionStorage from '../hooks/useSessionStorage'

interface IAuthProvider {
  children: React.ReactNode
}

const AuthProvider = ({ children }: IAuthProvider) => {
  const router = useRouter()
  const [auth, setAuth] = useState<AuthResponse | undefined>()
  const [authUser, setAuthUser] = useState<GetUserResponse>()
  const [loading, setLoading] = useState(true)
  const { getUser, getAuth } = useAuth({})

  const goToHome = () => router.push('/')

  onMount(async () => {
    setLoading(true)
    try {
      const _auth = await getAuth()
      if (!_auth) throw new Error('No User')
      setAuth(_auth as AuthResponse)
      const _authUser = await getUser()
      if (!_authUser) throw new Error('No Auth User')
      setAuthUser(_authUser)
    } catch (e) {
      goToHome()
    } finally {
      setLoading(false)
    }
    return
  })

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <AuthContext.Provider
      value={{
        loading,
        auth,
        authUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
