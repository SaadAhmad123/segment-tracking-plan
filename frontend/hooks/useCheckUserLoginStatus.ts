import React, { useEffect, useState } from 'react'
import useAuth from './useAuth'
import onMount from './onMount'

export enum LoginCheckState {
  loading = 'loading',
  loggedIn = 'loggedIn',
  notLoggedIn = 'notLoggedIn',
}

const useCheckUserLoginStatus = () => {
  const { getUser } = useAuth({})
  const [state, setState] = useState<LoginCheckState>(LoginCheckState.loading)
  useEffect(() => {
    getUser()
      .then((e) => setState(LoginCheckState.loggedIn))
      .catch(() => setState(LoginCheckState.notLoggedIn))
  }, [])
  return state
}

export default useCheckUserLoginStatus
