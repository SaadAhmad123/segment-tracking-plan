import * as AWS from 'aws-sdk'
import { useCallback, useRef } from 'react'
import { CognitoIdentityServiceProvider } from 'aws-sdk'
import safeConsole from '../../helpers/safeConsole'
import useReactiveRef from '../useReactiveRef'
import {
  AuthenticationResultType,
  InitiateAuthRequest,
} from 'aws-sdk/clients/cognitoidentityserviceprovider'
import { AppEnvironment } from '../../helpers/AppEnvironmentManager'
import useLocalStorage from '../useLocalStorage'

interface IUseAuth {
  clientId?: string
  region?: string
}

// Define a new type for the authentication response
export type AuthResponse = AuthenticationResultType & {
  created_at_in_sec: number
}

// Initialize the Cognito client with the given options
const initCognito = (
  options?: CognitoIdentityServiceProvider.Types.ClientConfiguration,
) => {
  try {
    return new AWS.CognitoIdentityServiceProvider(options)
  } catch (e) {
    safeConsole()?.error(e)
    return undefined
  }
}

/**
 * Custom hook for managing user authentication with AWS Cognito.
 *
 * @param {IUseAuth} options - The options for the hook
 * @param {string} options.clientId - The client ID of the Cognito user pool
 * @param {string} options.region - The region of the Cognito user pool
 *
 * @returns {Object} An object containing functions for signing up, logging in, saving and deleting the authentication data,
 * refreshing the authentication data, checking if the user is authenticated, and getting the authenticated user's email and access token.
 */
const useAuth = ({
  clientId = AppEnvironment.getCognitoClientId() || '',
  region = AppEnvironment.getAwsRegion() || '',
}: IUseAuth) => {
  // Get the functions to store and retrieve the authentication data from local storage
  const { get: getLocalAuth, set: setLocalAuth } = useLocalStorage<
    AuthResponse | undefined
  >('____segment_tracking_plan_user_auth')

  // Get the Cognito client using a reactive ref
  const { get: cognitoClient } = useReactiveRef<
    CognitoIdentityServiceProvider | undefined
  >(
    initCognito({
      region: region,
      apiVersion: '2016-04-18',
    }),
  )

  // Function to sign up a new user
  const signUp = useCallback(
    async (email: string, password: string) => {
      return await cognitoClient()
        ?.signUp({
          ClientId: clientId,
          Password: password,
          Username: email,
        })
        .promise()
    },
    [cognitoClient],
  )

  /**
   * Logs in an existing user using their email and password.
   *
   * @param {string} email - The email of the user
   * @param {string} password - The password of the user
   *
   * @returns {Promise<AuthResponse | undefined>} A promise that resolves with the authentication data if the login is successful, or undefined if it fails
   */
  const logIn = useCallback(
    async (email: string, password: string) => {
      const authParams = {
        ClientId: clientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      } as InitiateAuthRequest
      const data = await cognitoClient()?.initiateAuth(authParams).promise()
      console.log(data)
      if (data?.AuthenticationResult) {
        return {
          ...data.AuthenticationResult,
          created_at_in_sec: parseInt((new Date().getTime() / 1000).toString()),
        } as AuthResponse
      }
      return data
    },
    [cognitoClient],
  )

  // Function to save the authentication data to local storage
  const save = useCallback(
    (auth?: AuthResponse) => {
      setLocalAuth(auth)
    },
    [setLocalAuth],
  )

  // Function to get the authentication data from local storage
  const get = useCallback(() => {
    return getLocalAuth()
  }, [getLocalAuth])

  // Function to log in and save the authentication data to local storage
  const logInAndSave = useCallback(
    async (email: string, password: string) => {
      try {
        const auth = await logIn(email, password)
        if (!auth || !(auth as AuthResponse).created_at_in_sec) return undefined
        save(auth as AuthResponse)
        return auth
      } catch {
        return undefined
      }
    },
    [logIn, save],
  )

  // Function to refresh the authentication data
  const refreshAuth = useCallback(async () => {
    const auth = getLocalAuth()
    if (!auth?.RefreshToken) return false
    const authParams = {
      ClientId: clientId,
      AuthFlow: 'REFRESH_TOKEN',
      AuthParameters: {
        REFRESH_TOKEN: auth.RefreshToken,
      },
    } as InitiateAuthRequest
    const data = await cognitoClient()?.initiateAuth(authParams).promise()
    if (data?.AuthenticationResult) {
      return {
        ...data.AuthenticationResult,
        created_at_in_sec: parseInt((new Date().getTime() / 1000).toString()),
      } as AuthResponse
    }
    return data
  }, [getLocalAuth, cognitoClient])

  // Function to refresh and save the authentication data
  const refreshAuthAndSave = useCallback(async () => {
    try {
      const auth = await refreshAuth()
      if (!auth || !(auth as AuthResponse).created_at_in_sec) return undefined
      save(auth as AuthResponse)
      return auth
    } catch {
      return undefined
    }
  }, [refreshAuth, save])

  // Function to delete the authentication data from local storage
  const deleteAuth = useCallback(() => {
    setLocalAuth(undefined)
  }, [setLocalAuth])

  /**
   * Retrieves the current authentication data. If the data has expired, it will be refreshed and saved.
   *
   * @returns {Promise<AuthResponse | undefined>} The current authentication data, or undefined if the user is not authenticated
   */
  const getAuth = useCallback(async () => {
    // Retrieve the authentication data from local storage
    const auth = getLocalAuth()

    // Return undefined if the data is not present
    if (!auth?.created_at_in_sec) return undefined

    // Check if the data has expired
    const currentTimeInSec = new Date().getTime() / 1000
    const createdAtInSec = auth.created_at_in_sec
    if (currentTimeInSec - createdAtInSec <= 3400) return auth

    // Refresh and save the data if it has expired
    return await refreshAuthAndSave()
  }, [refreshAuth, getLocalAuth])

  const requestForgetPasswordConfirmationCode = useCallback(
    async (email: string) => {
      return await cognitoClient()
        ?.forgotPassword({
          ClientId: clientId,
          Username: email,
        })
        .promise()
    },
    [cognitoClient],
  )

  const requestVerificationCode = useCallback(
    async (email: string) => {
      return await cognitoClient()
        ?.resendConfirmationCode({
          ClientId: clientId,
          Username: email,
        })
        .promise()
    },
    [cognitoClient],
  )

  const verifyAccount = useCallback(
    async (email: string, code: string) => {
      return await cognitoClient()
        ?.confirmSignUp({
          ClientId: clientId,
          ConfirmationCode: code,
          Username: email,
        })
        .promise()
    },
    [cognitoClient],
  )

  const confirmForgotPassword = useCallback(
    async (email: string, password: string, code: string) => {
      return await cognitoClient()
        ?.confirmForgotPassword({
          ClientId: clientId,
          ConfirmationCode: code,
          Password: password,
          Username: email,
        })
        .promise()
    },
    [cognitoClient],
  )

  const validatePasswordStrength = useCallback((password: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
    return passwordRegex.test(password)
  }, [])

  const signOut = useCallback(async () => {
    save(undefined)
  }, [save])

  const getUser = useCallback(async () => {
    const auth = await getAuth()
    if (!(auth as AuthResponse)?.AccessToken) {
      throw new Error('No Access Token')
    }
    console.log((auth as AuthResponse)?.IdToken)
    return await cognitoClient()
      ?.getUser({
        AccessToken: (auth as AuthResponse).AccessToken || '',
      })
      .promise()
  }, [getAuth, cognitoClient])

  return {
    signOut,
    signUp,
    logIn,
    save,
    get,
    logInAndSave,
    refreshAuth,
    refreshAuthAndSave,
    deleteAuth,
    getAuth,
    getUser,
    requestForgetPasswordConfirmationCode,
    requestVerificationCode,
    verifyAccount,
    confirmForgotPassword,
    validatePasswordStrength,
  }
}

export default useAuth
