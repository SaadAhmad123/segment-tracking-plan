import React from 'react'
import { useRouter } from 'next/router'
import useCheckUserLoginStatus, {
  LoginCheckState,
} from '../../hooks/useCheckUserLoginStatus'
import LoadingScreen from '../../components/LoadingScreen'
import DashboardPage from '../../components/pages/DashboardPage'

// eslint-disable-next-line react/display-name
export default function () {
  const router = useRouter()
  const status = useCheckUserLoginStatus()
  console.log(status)
  if (status === LoginCheckState.loading) return <LoadingScreen />
  if (status === LoginCheckState.notLoggedIn) {
    router.push('/login')
    return
  }

  return <DashboardPage />
}
