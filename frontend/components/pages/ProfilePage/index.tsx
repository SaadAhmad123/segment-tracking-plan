import React, { useContext, useState } from 'react'
import Layout from '../../Layout'
import Navbar from '../../Navbar'
import { useRouter } from 'next/router'
import { AuthContextType } from '../../../AuthContext/types'
import AuthContext from '../../../AuthContext/Context'
import onMount from '../../../hooks/onMount'
import { createUser, getUser } from './api'
import usePromise, { UsePromiseState } from '../../../hooks/usePromise'
import LoadingScreen from '../../LoadingScreen'
import { User } from '../../types'
import RegistrationBox from '../Registration/utils/RegistrationBox'
import Form from '../../utils/Form'
import { FullWidthButton } from '../../Buttons'
import Spinner from '../../Spinner'

const ProfilePage = () => {
  const router = useRouter()
  const { auth, authUser } = useContext<AuthContextType>(AuthContext)
  const [user, setUser] = useState<User>({
    email: authUser?.UserAttributes?.filter(item => item.Name === "email")?.[0]?.Value || "",
    first_name: "",
    last_name: "",
    organisation: ""
  })
  const getUserPromise = usePromise(getUser)
  const createUserPromise = usePromise(createUser)
  onMount(async () => {
    const resp = await getUserPromise.retry(auth?.IdToken || '')
    if (resp) {
      setUser(resp)
    }
  })

  const inputs = [
    { label: 'First Name', type: 'text', key: 'first_name' },
    { label: 'Last Name', type: 'text', key: 'last_name' },
    { label: 'Organization', type: 'text', key: 'organisation' },
    { label: 'Email', type: 'email', key: 'email' },
  ].map((item) => ({ ...item, isRequired: true }))

  if (getUserPromise.state === UsePromiseState.loading) {
    return <LoadingScreen />
  }

  const handleSubmit = async (values: User) => {
    const resp = await createUserPromise.retry(auth?.IdToken || "", values)
    if (resp) {
      setUser(resp)
    }
  }

  return (
    <Layout
      navbar={
        <Navbar
          title={
            <h1
              className="font-bold sm:text-xl m-0 p-0 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <span className="text-servian-orange">Tracking</span> Plans -
              Profile
            </h1>
          }
        />
      }
    >
      <RegistrationBox heading={"Your Profile"} error={""}>
        <Form inputs={inputs} handleSubmit={handleSubmit} SubmitButton={
          () => {
            if (createUserPromise.state === UsePromiseState.loading) {
              return (
                <FullWidthButton
                  icon={<Spinner />}
                  text={'Loading...'}
                  type={'button'}
                />
              )
            }
            return (<FullWidthButton text={"Submit"}/>)
          }
        } formValues={user}/>
      </RegistrationBox>
    </Layout>
  )
}

export default ProfilePage
