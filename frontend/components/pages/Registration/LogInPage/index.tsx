import React, { useEffect } from 'react'
import Layout from '../../../Layout'
import { useRouter } from 'next/router'
import { useMachine } from '@xstate/react'
import loginStateMachine from './login.statemachine'
import safeConsole from '../../../../helpers/safeConsole'
import useLocalStorage from '../../../../hooks/useLocalStorage'
import useAuth from '../../../../hooks/useAuth'
import { LoginBox } from './LoginBox'
import ForgotPasswordEmailBox from './ForgotPasswordEmailBox'
import ConfirmUserEmailBox from './ConfirmUserEmailBox'
import ConfirmUserCodeBox from '../utils/ConfirmUserCodeBox'
import WaitingBox from '../utils/WaitingBox'
import ForgotPasswordNewPasswordBox from './ForgotPasswordNewPasswordBox'
import useKeyboardControl from '../../../../hooks/useKeyboardControl'

const LogInPage = () => {
  const {} = useLocalStorage<{
    cognitoId: string
    accessToken: string
    idToken: string
  }>()
  const router = useRouter()
  const {
    logIn,
    save,
    requestForgetPasswordConfirmationCode,
    requestVerificationCode,
    verifyAccount,
    confirmForgotPassword,
    validatePasswordStrength,
  } = useAuth({})

  const [current, send] = useMachine(loginStateMachine, {
    services: {
      onLoggingIn: async (context) => {
        const { email, password } = context
        return await logIn(email, password)
      },
      onRequestingCode: async (context) => {
        const { email } = context
        const resp = await requestForgetPasswordConfirmationCode(email)
        console.log({ resp })
        return resp
      },
      onConfirmUserRequestingCode: async (context) => {
        const { email } = context
        const resp = await requestVerificationCode(email)
        console.log({ resp })
        return resp
      },
      onConfirmUserVerifyingCode: async (context) => {
        const { verificationCode, email } = context
        const resp = await verifyAccount(email, verificationCode)
        console.log({ resp })
        return resp
      },
      onValidatePassword: async (context) => {
        const { confirmPassword, password } = context
        if (!validatePasswordStrength(password)) {
          throw new Error(
            'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          )
        }
        if (confirmPassword !== password) {
          throw new Error('Passwords do not match')
        }
      },
      onUpdatingPassword: async (context) => {
        const { verificationCode, password, email } = context
        const resp = await confirmForgotPassword(
          email,
          password,
          verificationCode,
        )
        console.log({ resp })
        return resp
      },
    },
    actions: {
      onError: (context, event) => safeConsole()?.error(event?.data?.message),
      onLoginSuccessful: (context, event) => {
        const { data } = event
        save(data)
        send('REDIRECT')
      },
      onRedirect: () => {
        router.push('/dashboard')
      },
    },
  })

  useKeyboardControl('Slash', () => send('FORGOT_PASSWORD'))
  useKeyboardControl('Equal', () => router.push('/signup'))
  const error = current.context.error

  return (
    <Layout>
      <LoginBox
        show={current.matches('Idle') || current.matches('Logging In')}
        error={error}
        handleSubmit={async (value: { [key: string]: any }) => {
          send('LOGIN', {
            email: value.email || '',
            password: value.password || '',
          })
        }}
        onClickForgotPassword={() => send('FORGOT_PASSWORD')}
        loading={current.matches('Logging In')}
      />
      <ConfirmUserEmailBox
        show={
          current.matches({ 'Confirm User': 'Idle' }) ||
          current.matches({ 'Confirm User': 'Requesting Code' })
        }
        error={error}
        handleSubmit={async (value: { [key: string]: any }) => {
          send('REQUEST_CODE', {
            email: value.email || '',
          })
        }}
        onClickReset={() => send('RESET')}
        loading={current.matches({ 'Confirm User': 'Requesting Code' })}
      />
      <ConfirmUserCodeBox
        show={
          current.matches({ 'Confirm User': 'Enter Verification Code' }) ||
          current.matches({ 'Confirm User': 'Verifying Code' })
        }
        error={error}
        handleSubmit={async (value: { [key: string]: any }) => {
          send('VERIFY_CODE', {
            verificationCode: value.verificationCode || '',
          })
        }}
        onClickReset={() => send('RESET_VERIFICATION')}
        loading={current.matches({ 'Confirm User': 'Verifying Code' })}
      />
      <WaitingBox
        show={current.matches({ 'Confirm User': 'Verification Success' })}
        heading={'Confirmed'}
        content={
          'Your account have been confirmed. Please wait, while you are taken to the login screen.'
        }
      />
      <ForgotPasswordEmailBox
        show={
          current.matches({ 'Forgot Password': 'Idle' }) ||
          current.matches({ 'Forgot Password': 'Requesting Code' })
        }
        error={error}
        handleSubmit={async (value: { [key: string]: any }) => {
          send('REQUEST_CODE', {
            email: value.email || '',
          })
        }}
        onClickReset={() => send('RESET')}
        loading={current.matches({ 'Forgot Password': 'Requesting Code' })}
      />
      <ForgotPasswordNewPasswordBox
        show={
          current.matches({ 'Forgot Password': 'Enter New Password' }) ||
          current.matches({ 'Forgot Password': 'Updating Password' }) ||
          current.matches({ 'Forgot Password': 'Validate Password' })
        }
        error={error}
        handleSubmit={async (value: { [key: string]: any }) => {
          const { verificationCode, password, confirmPassword } = value
          send('UPDATE_PASSWORD', {
            verificationCode: verificationCode || '',
            password: password || '',
            confirmPassword: confirmPassword || '',
          })
        }}
        onClickReset={() => send('RESET_FORGOT_PASSWORD')}
        loading={
          current.matches({ 'Forgot Password': 'Updating Password' }) ||
          current.matches({ 'Forgot Password': 'Validate Password' })
        }
      />
      <WaitingBox
        show={current.matches({ 'Forgot Password': 'Password Update Success' })}
        heading={'Password Updated'}
        content={
          'Your password has been updated. Please wait, while you are taken to the login screen.'
        }
      />
      <WaitingBox
        show={
          current.matches('Login Successful') || current.matches('Redirect')
        }
        heading={'Success'}
        content={'Please wait, while you are taken to the dashboard.'}
      />
    </Layout>
  )
}

export default LogInPage
