import { createMachine, assign } from 'xstate'
import safeConsole from '../../../../helpers/safeConsole'

type SignupStateMachineContextType = {
  email: string
  password: string
  confirmPassword: string
  error: string
  verificationCode: string
}

const signupStateMachine = createMachine<SignupStateMachineContextType>(
  {
    id: 'SignUpMachine',
    initial: 'Idle',
    states: {
      Idle: {
        on: {
          SIGN_UP: {
            target: 'Validate SignUp Input',
            actions: [
              'assignEmailToContext',
              'assignPasswordToContext',
              'clearErrorFromContext',
              'assignConfirmPasswordToContext',
            ],
          },
        },
      },
      'Signing Up': {
        invoke: {
          src: 'onSigningUp',
          onDone: [
            {
              target: 'Verification Code Sent',
            },
          ],
          onError: [
            {
              target: 'Error',
            },
          ],
        },
      },
      'Verification Code Sent': {
        on: {
          RESEND_CODE: {
            target: 'Resending Code',
            actions: 'onResendCode',
          },
          RESET: {
            target: 'Idle',
          },
          SUBMIT_CODE: {
            target: 'Submitting Code',
            actions: [
              'assignVerificationCodeToContext',
              'clearErrorFromContext',
            ],
          },
        },
      },
      'Submitting Code': {
        invoke: {
          src: 'onSubmittingCode',
          onDone: [
            {
              target: 'Verified',
            },
          ],
          onError: [
            {
              target: 'Verification Code Sent',
            },
          ],
        },
      },
      Verified: {
        after: {
          '500': {
            target: '#SignUpMachine.Redirect',
            actions: [],
            internal: false,
          },
        },
      },
      Redirect: {
        entry: 'onRedirect',
        type: 'final',
      },
      'Resending Code': {
        invoke: {
          src: 'onResendingCode',
          onDone: [
            {
              target: 'Verification Code Sent',
            },
          ],
          onError: [
            {
              target: 'Verification Code Sent',
            },
          ],
        },
      },
      Error: {
        entry: ['assignErrorToContext', 'onError'],
        after: {
          '100': {
            target: '#SignUpMachine.Idle',
            actions: [],
            internal: false,
          },
        },
      },
      'Validate SignUp Input': {
        invoke: {
          src: 'onValidateSignUpInput',
          onDone: [
            {
              target: 'Signing Up',
            },
          ],
          onError: [
            {
              target: 'Idle',
              actions: 'assignErrorToContext',
            },
          ],
        },
      },
    },
    schema: {
      context: {} as {
        email: string
        password: string
        confirmPassword: string
        error: string
        verificationCode: string
      },
      events: {} as
        | { type: 'SIGN_UP' }
        | { type: 'RESEND_CODE' }
        | { type: 'RESET' }
        | { type: 'SUBMIT_CODE' },
    },
    context: {
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
      verificationCode: '',
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
  },
  {
    actions: {
      assignEmailToContext: assign({ email: (context, event) => event.email }),
      assignPasswordToContext: assign({
        password: (context, event) => event.password,
      }),
      assignErrorToContext: assign({
        error: (context, event) => event?.data?.message || '',
      }),
      clearErrorFromContext: assign({ error: (_, __) => '' }),
      onError: (context, event) => safeConsole()?.error({ context, event }),
      assignConfirmPasswordToContext: assign({
        confirmPassword: (context, event) => event.confirmPassword,
      }),
      assignVerificationCodeToContext: assign({
        verificationCode: (context, event) => event.verificationCode,
      }),
    },
  },
)

export default signupStateMachine
