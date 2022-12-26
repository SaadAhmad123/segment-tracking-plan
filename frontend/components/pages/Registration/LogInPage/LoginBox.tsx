import { FullWidthButton, RegistrationSecondaryButton } from '../../../Buttons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLockOpen } from '@fortawesome/free-solid-svg-icons'
import Form from '../../../utils/Form'
import Spinner from '../../../Spinner'
import React from 'react'
import { useRouter } from 'next/router'
import RegistrationBox from '../utils/RegistrationBox'

interface ILoginBox {
  show: boolean
  error: any
  handleSubmit: (value: { [p: string]: any }) => Promise<void>
  onClickForgotPassword: () => void
  loading?: boolean
}

export function LoginBox(props: ILoginBox) {
  const router = useRouter()
  if (!props.show) return <></>
  const inputs = [
    { label: 'Email', type: 'email', key: 'email' },
    { label: 'Password', type: 'password', key: 'password' },
  ].map((item) => ({ ...item, isRequired: true }))

  return (
    <RegistrationBox heading={'Log In'} error={props.error}>
      <>
        <Form
          inputs={inputs}
          handleSubmit={props.handleSubmit}
          SubmitButton={() => {
            if (props.loading) {
              return (
                <FullWidthButton
                  icon={<Spinner />}
                  text={'Loading...'}
                  type={'button'}
                />
              )
            }
            return (
              <FullWidthButton
                icon={<FontAwesomeIcon icon={faLockOpen} />}
                text={'Log In'}
                type={'submit'}
              />
            )
          }}
        />
        <div
          className={
            'flex flex-col sm:flex-row items-center justify-between flew-wrap mt-6 sm:mt-4'
          }
        >
          <RegistrationSecondaryButton
            text={"Don't have account"}
            className={
              'rounded-full px-4 mb-3 sm:my-0 bg-gray-100 dark:bg-servian-black'
            }
            onClick={() => router.push('/signup')}
          />
          <RegistrationSecondaryButton
            text={'Forgot password?'}
            className={'px-2'}
            onClick={props.onClickForgotPassword}
          />
        </div>
      </>
    </RegistrationBox>
  )
}
