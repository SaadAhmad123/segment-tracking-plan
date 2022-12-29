import React, { useContext, useEffect } from 'react'
import Layout from '../../Layout'
import Navbar from '../../Navbar'
import { createUser, getUser, updateUser } from './api'
import RegistrationBox from '../Registration/utils/RegistrationBox'
import Form from '../../utils/Form'
import { FullWidthButton } from '../../Buttons'
import { useMachine } from '@xstate/react'
import userProfileStateMachine from './userProfile.statemachine'
import { AuthContextType } from '../../../AuthContext/types'
import AuthContext from '../../../AuthContext/Context'
import WaitingBox from '../Registration/utils/WaitingBox'

const ProfilePage = () => {
  const { authUser, auth } = useContext<AuthContextType>(AuthContext)
  const [current, send] = useMachine(userProfileStateMachine, {
    services: {
      onFetchingProfile: async () => await getUser(auth?.IdToken || ''),
      onCreateProfile: async (context, event) =>
        await createUser(auth?.IdToken || '', {
          email: event.email || '',
          first_name: event.first_name || '',
          last_name: event.last_name || '',
          organisation: event.organisation || '',
        }),
      onUpdateProfile: async (context, event) =>
        await updateUser(auth?.IdToken || '', {
          email: event.email || '',
          first_name: event.first_name || '',
          last_name: event.last_name || '',
          organisation: event.organisation || '',
        }),
    },
  })

  useEffect(() => {
    send('FETCH_PROFILE')
  }, [])

  const inputs = [
    { label: 'First Name', type: 'text', key: 'first_name' },
    { label: 'Last Name', type: 'text', key: 'last_name' },
    { label: 'Organization', type: 'text', key: 'organisation' },
    { label: 'Email', type: 'email', key: 'email' },
  ].map((item) => ({ ...item, isRequired: true }))

  const handleSubmit = async (values: { [key: string]: any }) => {
    send('UPDATE_PROFILE', values)
  }

  return (
    <Layout navbar={<Navbar />}>
      <WaitingBox
        show={current.matches('Fetching Profile')}
        heading={'Fetching Profile'}
        content={'Fetching your profile'}
      />
      <WaitingBox
        show={
          current.matches('Update Profile') || current.matches('Create Profile')
        }
        heading={'Updating Profile'}
        content={'Updating your profile'}
      />
      <WaitingBox
        show={current.matches('Error')}
        heading={'Error'}
        content={
          'Something went wrong while fetching your profile. Please try later'
        }
      />
      {(current.matches('Show User Profile') ||
        current.matches('Waiting For Profile Data')) && (
        <RegistrationBox
          heading={
            current.matches('Waiting For Profile Data')
              ? 'Create Profile'
              : 'My Profile'
          }
          error={current.context.error}
        >
          <Form
            inputs={inputs}
            handleSubmit={handleSubmit}
            formValues={
              current.context.user || {
                email:
                  authUser?.UserAttributes?.filter(
                    (item) => item.Name === 'email',
                  )?.[0]?.Value || '',
              }
            }
            SubmitButton={() => <FullWidthButton text={'Submit'} />}
          />
        </RegistrationBox>
      )}
    </Layout>
  )
}

export default ProfilePage
