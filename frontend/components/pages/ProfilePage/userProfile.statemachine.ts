import { assign, createMachine } from 'xstate'
import safeConsole from '../../../helpers/safeConsole'
import { AxiosError } from 'axios'

type UserProfileStateMachineContextType = {
  error: string
  user: Record<string, any> | null
}

const userProfileStateMachine =
  createMachine<UserProfileStateMachineContextType>(
    {
      id: 'UserProfile',
      initial: 'Idle',
      states: {
        Idle: {
          on: {
            FETCH_PROFILE: {
              target: 'Fetching Profile',
              actions: 'clearErrorFromContext',
            },
          },
        },
        'Fetching Profile': {
          invoke: {
            src: 'onFetchingProfile',
            onDone: [
              {
                target: 'Show User Profile',
                actions: [
                  'onUserProfile',
                  'logResponse',
                  'assignUserProfileToContext',
                ],
              },
            ],
            onError: [
              {
                target: 'Waiting For Profile Data',
                cond: 'isUserProfileNotExist',
              },
              {
                target: 'Error',
              },
            ],
          },
        },
        'Show User Profile': {
          on: {
            UPDATE_PROFILE: {
              target: 'Update Profile',
              actions: 'clearErrorFromContext',
            },
          },
        },
        Error: {
          entry: ['assignErrorToContext', 'onError'],
          type: 'final',
        },
        'Waiting For Profile Data': {
          on: {
            UPDATE_PROFILE: {
              target: 'Create Profile',
              actions: ['clearErrorFromContext', 'assignUserProfileToContext'],
            },
          },
        },
        'Update Profile': {
          invoke: {
            src: 'onUpdateProfile',
            onDone: [
              {
                target: 'Fetching Profile',
                actions: ['logResponse', 'assignUserProfileToContext'],
              },
            ],
            onError: [
              {
                target: 'Show User Profile',
                actions: ['assignErrorToContext', 'onError'],
              },
            ],
          },
        },
        'Create Profile': {
          invoke: {
            src: 'onCreateProfile',
            onDone: [
              {
                target: 'Fetching Profile',
                actions: ['logResponse', 'assignUserProfileToContext'],
              },
            ],
            onError: [
              {
                target: 'Waiting For Profile Data',
                actions: ['assignErrorToContext', 'onError'],
              },
            ],
          },
        },
      },
      schema: {
        context: {} as {
          error: string
          user: Record<string, any>
        },
        events: {} as { type: 'FETCH_PROFILE' } | { type: 'UPDATE_PROFILE' },
      },
      context: { error: '', user: null },
      predictableActionArguments: true,
      preserveActionOrder: true,
    },
    {
      actions: {
        logResponse: (context, event) => safeConsole()?.log({ context, event }),
        onError: (context, event) => safeConsole()?.error({ context, event }),
        assignErrorToContext: assign({
          error: (context, event) =>
            event?.data?.response?.data?.error || 'Something went wrong',
        }),
        clearErrorFromContext: assign({ error: (_, __) => '' }),
        assignUserProfileToContext: assign({
          user: (context, event) => event?.data || event || null,
        }),
      },
      guards: {
        isUserProfileNotExist: (context, event) =>
          event?.data?.response?.status === 404 &&
          event?.data?.response?.data?.error?.includes('User record not found'),
      },
    },
  )

export default userProfileStateMachine
