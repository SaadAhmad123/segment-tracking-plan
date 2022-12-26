import * as AWS from 'aws-sdk'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import Layout from '../../../Layout'
import useAuth from '../../../../hooks/useAuth'
import { useMachine } from '@xstate/react'
import signupStateMachine from './signup.statemachine'
import SignupBox from './SignupBox'
import ConfirmUserCodeBox from '../utils/ConfirmUserCodeBox'
import WaitingBox from '../utils/WaitingBox'

const SignUpPage = () => {
  const router = useRouter()
  const { signUp, validatePasswordStrength, verifyAccount } = useAuth({})
  const [current, send] = useMachine(signupStateMachine, {
    services: {
      onValidateSignUpInput: async (context) => {
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
      onSigningUp: async (context) => {
        const { email, password } = context
        return await signUp(email, password)
      },
      onSubmittingCode: async (context) => {
        const { email, verificationCode } = context
        return await verifyAccount(email, verificationCode)
      },
    },
    actions: {
      onRedirect: () => router.push('/login'),
    },
  })

  const inputs = [
    { label: 'Email', type: 'email', key: 'email' },
    { label: 'Password', type: 'password', key: 'password' },
    { label: 'Confirm Password', type: 'password', key: 'confirmPassword' },
  ].map((item) => ({ ...item, isRequired: true }))

  const error = current.context.error
  return (
    <Layout>
      <SignupBox
        show={
          current.matches('Idle') ||
          current.matches('Validate SignUp Input') ||
          current.matches('Signing Up')
        }
        error={error}
        handleSubmit={async ({ email, password, confirmPassword }) => {
          send('SIGN_UP', { email, password, confirmPassword })
        }}
        loading={current.matches('Signing Up')}
      />
      <ConfirmUserCodeBox
        error={error}
        handleSubmit={async (value) => {
          send('SUBMIT_CODE', {
            verificationCode: value.verificationCode || '',
          })
        }}
        onClickReset={() => {
          send('RESET')
        }}
        show={
          current.matches('Verification Code Sent') ||
          current.matches('Submitting Code')
        }
        loading={current.matches('Submitting Code')}
      />
      <WaitingBox
        show={current.matches('Verified') || current.matches('Redirect')}
        heading={'Confirmed'}
        content={
          'Your account have been confirmed. Please wait, while you are taken to the login screen.'
        }
      />
    </Layout>
  )
}

export default SignUpPage
