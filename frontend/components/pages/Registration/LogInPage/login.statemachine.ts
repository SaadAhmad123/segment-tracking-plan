import { createMachine, assign } from 'xstate'
import safeConsole from '../../../../helpers/safeConsole'

type LoginStateMachineContextType = {
  email: string
  password: string
  error: string
  confirmPassword: string
  verificationCode: string
  auth: any
}

const loginStateMachine = createMachine<LoginStateMachineContextType>(
  {
    id: 'LoginMachine',
    initial: 'Idle',
    states: {
      Idle: {
        on: {
          LOGIN: {
            target: 'Logging In',
            actions: [
              'assignPasswordToContext',
              'assignEmailToContext',
              'clearErrorFromContext',
            ],
          },
          FORGOT_PASSWORD: {
            target: 'Forgot Password',
          },
        },
      },
      'Logging In': {
        invoke: {
          src: 'onLoggingIn',
          onDone: [
            {
              target: 'Show Force Change Password Prompt',
              cond: 'isNewPasswordRequired',
            },
            {
              target: 'Login Successful',
              actions: 'assignAuthToContext',
            },
          ],
          onError: [
            {
              target: 'Confirm User',
              cond: 'isUserNotConfirmed',
            },
            {
              target: 'Error',
            },
          ],
        },
      },
      Error: {
        entry: ['onError', 'assignErrorToContext'],
        after: {
          '100': {
            target: '#LoginMachine.Idle',
            actions: [],
            internal: false,
          },
        },
      },
      'Forgot Password': {
        initial: 'Idle',
        states: {
          Idle: {
            on: {
              REQUEST_CODE: {
                target: 'Requesting Code',
                actions: 'assignEmailToContext',
              },
            },
          },
          'Requesting Code': {
            invoke: {
              src: 'onRequestingCode',
              onDone: [
                {
                  target: 'Enter New Password',
                },
              ],
              onError: [
                {
                  target: 'Error',
                },
              ],
            },
          },
          'Enter New Password': {
            on: {
              UPDATE_PASSWORD: {
                target: 'Validate Password',
                actions: [
                  'assignPasswordToContext',
                  'assignConfirmPasswordToContext',
                  'assignVerificationCodeToContext',
                ],
              },
              RESET_FORGOT_PASSWORD: {
                target: 'Idle',
              },
            },
          },
          Error: {
            entry: ['assignErrorToContext', 'onError'],
            after: {
              '100': {
                target: '#LoginMachine.Forgot Password.Idle',
                actions: [],
                internal: false,
              },
            },
          },
          'Updating Password': {
            invoke: {
              src: 'onUpdatingPassword',
              onDone: [
                {
                  target: 'Password Update Success',
                },
              ],
              onError: [
                {
                  target: 'Error',
                },
              ],
            },
          },
          'Password Update Success': {
            after: {
              '1000': {
                target: '#LoginMachine.Idle',
                actions: [],
                internal: false,
              },
            },
          },
          'Validate Password': {
            invoke: {
              src: 'onValidatePassword',
              onDone: [
                {
                  target: 'Updating Password',
                },
              ],
              onError: [
                {
                  target: 'Enter New Password',
                  actions: 'assignErrorToContext',
                },
              ],
            },
          },
        },
        on: {
          RESET: {
            target: 'Idle',
            actions: 'clearErrorFromContext',
          },
        },
      },
      'Login Successful': {
        entry: 'onLoginSuccessful',
        on: {
          REDIRECT: {
            target: 'Redirect',
          },
        },
      },
      Redirect: {
        entry: 'onRedirect',
        type: 'final',
      },
      'Show Force Change Password Prompt': {
        on: {
          FORGOT_PASSWORD: {
            target: 'Forgot Password',
          },
          RESET: {
            target: 'Idle',
            actions: 'clearErrorFromContext',
          },
        },
      },
      'Confirm User': {
        initial: 'Idle',
        states: {
          Idle: {
            on: {
              REQUEST_CODE: {
                target: 'Requesting Code',
                actions: 'assignEmailToContext',
              },
            },
          },
          'Requesting Code': {
            invoke: {
              src: 'onConfirmUserRequestingCode',
              onDone: [
                {
                  target: 'Enter Verification Code',
                },
              ],
              onError: [
                {
                  target: 'Error',
                },
              ],
            },
          },
          'Enter Verification Code': {
            on: {
              VERIFY_CODE: {
                target: 'Verifying Code',
                actions: 'assignVerificationCodeToContext',
              },
              RESET_VERIFICATION: {
                target: 'Idle',
              },
            },
          },
          Error: {
            entry: ['assignErrorToContext', 'onError'],
            after: {
              '100': {
                target: '#LoginMachine.Confirm User.Idle',
                actions: [],
                internal: false,
              },
            },
          },
          'Verifying Code': {
            invoke: {
              src: 'onConfirmUserVerifyingCode',
              onError: [
                {
                  target: 'Error',
                },
              ],
              onDone: [
                {
                  target: 'Verification Success',
                },
              ],
            },
          },
          'Verification Success': {
            after: {
              '1000': {
                target: '#LoginMachine.Idle',
                actions: [],
                internal: false,
              },
            },
          },
        },
        on: {
          RESET: {
            target: 'Idle',
            actions: 'clearErrorFromContext',
          },
        },
      },
    },
    schema: {
      context: {} as {
        email: string
        password: string
        error: string
        confirmPassword: string
        verificationCode: string
        auth: Record<string, any>
      },
      events: {} as
        | { type: 'LOGIN' }
        | { type: 'FORGOT_PASSWORD' }
        | { type: 'RESET' }
        | { type: 'REDIRECT' }
        | { type: 'REQUEST_CODE' }
        | { type: 'VERIFY_CODE' }
        | { type: 'RESET_VERIFICATION' }
        | { type: 'UPDATE_PASSWORD' }
        | { type: 'RESET_FORGOT_PASSWORD' },
    },
    context: {
      email: '',
      password: '',
      error: '',
      confirmPassword: '',
      verificationCode: '',
      auth: null,
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
      assignAuthToContext: assign({ auth: (context, event) => event.data }),
    },
    guards: {
      isUserNotConfirmed: (context, event) => {
        console.log(event)
        return event?.data?.code === 'UserNotConfirmedException'
      },
      isNewPasswordRequired: (context, event) =>
        event?.data?.ChallengeName === 'NEW_PASSWORD_REQUIRED',
    },
  },
)

export default loginStateMachine
