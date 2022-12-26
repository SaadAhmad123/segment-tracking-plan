import React from 'react'
import RegistrationBox from '../utils/RegistrationBox'
import { FullWidthButton, RegistrationSecondaryButton } from '../../../Buttons'
import Spinner from '../../../Spinner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserPlus } from '@fortawesome/free-solid-svg-icons'
import Form from '../../../utils/Form'
import Separator from '../../../Separator'
import { useRouter } from 'next/router'
import useKeyboardControl from '../../../../hooks/useKeyboardControl'

interface ISignupBox {
  show: boolean
  error: any
  handleSubmit: (value: { [p: string]: any }) => Promise<void>
  loading?: boolean
}

const SignupBox = ({ show, error, handleSubmit, loading }: ISignupBox) => {
  const router = useRouter()
  const inputs = [
    { label: 'Email', type: 'email', key: 'email' },
    { label: 'Password', type: 'password', key: 'password' },
    { label: 'Confirm Password', type: 'password', key: 'confirmPassword' },
  ].map((item) => ({ ...item, isRequired: true }))

  useKeyboardControl('Enter', () => router.push('/login'))
  if (!show) return <></>
  return (
    <RegistrationBox heading={'Sign Up'} error={error}>
      <>
        <Form
          inputs={inputs}
          handleSubmit={handleSubmit}
          SubmitButton={() => {
            if (loading) {
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
                icon={<FontAwesomeIcon icon={faUserPlus} />}
                text={'Sign up'}
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
            text={'Already have account'}
            className={
              'rounded-full px-4 mb-3 sm:my-0 bg-gray-100 dark:bg-servian-black'
            }
            onClick={() => router.push('/login')}
          />
        </div>
      </>
    </RegistrationBox>
  )
}

export default SignupBox
