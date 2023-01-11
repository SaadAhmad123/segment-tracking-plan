import React from 'react'
import { useRouter } from 'next/router'
import useCheckUserLoginStatus, {
  LoginCheckState,
} from '../hooks/useCheckUserLoginStatus'
import LoadingScreen from '../components/LoadingScreen'
import ProfilePage from '../components/pages/ProfilePage'
import AuthProvider from '../AuthContext'

// eslint-disable-next-line react/display-name
export default function () {
  const router = useRouter()
  const status = useCheckUserLoginStatus()
  if (status === LoginCheckState.loading) return <LoadingScreen />
  if (status === LoginCheckState.notLoggedIn) {
    router.push('/login')
    return <></>
  }

  return (
    <AuthProvider>
      <ProfilePage />
    </AuthProvider>
  )
}
