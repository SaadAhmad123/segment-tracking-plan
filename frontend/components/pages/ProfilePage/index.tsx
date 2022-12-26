import React, { useContext, useMemo, useState } from 'react'
import Layout from '../../Layout'
import Navbar from '../../Navbar'
import { AuthContextType } from '../../../AuthContext/types'
import AuthContext from '../../../AuthContext/Context'
import onMount from '../../../hooks/onMount'
import { createUser, getUser, updateUser } from './api'
import usePromise, { UsePromiseState } from '../../../hooks/usePromise'
import { User } from '../../types'
import RegistrationBox from '../Registration/utils/RegistrationBox'
import Form from '../../utils/Form'
import { FullWidthButton } from '../../Buttons'
import Spinner from '../../Spinner'
import { AxiosError } from 'axios'

const ProfilePage = () => {
  const { auth, authUser } = useContext<AuthContextType>(AuthContext)
  const [user, setUser] = useState<User | undefined>()
  const [userExists, setUserExists] = useState(false)
  const getUserPromise = usePromise(getUser)
  const createUserPromise = usePromise(createUser)
  const updateUserPromise = usePromise(updateUser)

  const submitting = useMemo(
    () =>
      createUserPromise.state === UsePromiseState.loading ||
      updateUserPromise.state === UsePromiseState.loading ||
      getUserPromise.state === UsePromiseState.loading,
    [updateUserPromise, createUserPromise, getUserPromise],
  )

  const error = useMemo<string>(() => {
    if (submitting) return ''
    if (
      updateUserPromise.state === UsePromiseState.error ||
      getUserPromise.state === UsePromiseState.error ||
      createUserPromise.state === UsePromiseState.error
    ) {
      const _error =
        getUserPromise.error ||
        createUserPromise.error ||
        updateUserPromise.error
      // @ts-ignore
      return (_error as AxiosError)?.response?.data?.error || 'Error occurred'
    }
    return ''
  }, [updateUserPromise, createUserPromise, getUserPromise, submitting])

  onMount(async () => {
    const resp = await getUserPromise.retry(auth?.IdToken || '')
    setUser(resp)
    setUserExists(Boolean(resp))
  })

  const inputs = [
    { label: 'First Name', type: 'text', key: 'first_name' },
    { label: 'Last Name', type: 'text', key: 'last_name' },
    { label: 'Organization', type: 'text', key: 'organisation' },
    { label: 'Email', type: 'email', key: 'email' },
  ]

  const handleSubmit = async (values: { [key: string]: any }) => {
    createUserPromise.reset()
    getUserPromise.reset()
    updateUserPromise.reset()
    if (userExists) {
      setUser(values as User)
      const resp = await updateUserPromise.retry(
        auth?.IdToken || '',
        values as User,
      )
      setUser(resp)
      return
    }
    setUser(values as User)
    const resp = await createUserPromise.retry(
      auth?.IdToken || '',
      values as User,
    )
    if (resp) setUser(resp)
    setUserExists(Boolean(resp))
  }

  return (
    <Layout navbar={<Navbar />}>
      <RegistrationBox
        heading={'Your Profile'}
        error={error || (userExists ? error : 'User profile does not exists.')}
      >
        <Form
          inputs={inputs}
          handleSubmit={handleSubmit}
          formValues={
            user || {
              email:
                authUser?.UserAttributes?.filter(
                  (item) => item.Name === 'email',
                )?.[0]?.Value || '',
              first_name: '',
              last_name: '',
              organisation: '',
            }
          }
          SubmitButton={() => {
            if (submitting) {
              return (
                <FullWidthButton
                  icon={<Spinner />}
                  text={'Saving...'}
                  type={'button'}
                />
              )
            }
            return <FullWidthButton text={'Submit'} />
          }}
        />
      </RegistrationBox>
    </Layout>
  )
}

export default ProfilePage
