import React from 'react'
import RegistrationBox from '../utils/RegistrationBox'
import Form from '../../../utils/Form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FullWidthButton } from '../../../Buttons'
import Separator from '../../../Separator'
import Spinner from '../../../Spinner'

interface IForgotPasswordNewPasswordBox {
  error: string
  handleSubmit: (value: { [p: string]: any }) => Promise<void>
  onClickReset: () => void
  loading?: boolean
  show: boolean
}

const ForgotPasswordNewPasswordBox = ({
  error,
  handleSubmit,
  onClickReset,
  loading,
  show,
}: IForgotPasswordNewPasswordBox) => {
  if (!show) return <></>
  const inputs = [
    { label: 'Verification Code', type: 'text', key: 'verificationCode' },
    { label: 'Password', type: 'password', key: 'password' },
    { label: 'Confirm Password', type: 'password', key: 'confirmPassword' },
  ].map((item) => ({ ...item, isRequired: true }))

  return (
    <RegistrationBox heading={'Forgot Password'} error={error}>
      <>
        <p className={'text-gray-400'}>
          A verification code has been sent to the email address provided.
          Please enter the code when it is received to complete the process.
        </p>
        <Separator />
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
            return <FullWidthButton text={'Update Password'} type={'submit'} />
          }}
        />
        <Separator padding={6} />
        <FullWidthButton
          className={
            'text-lg bg-gray-100 dark:bg-servian-black text-servian-black dark:text-servian-white hover:bg-gray-200 dark:hover:bg-black'
          }
          text={'Back'}
          type={'submit'}
          icon={<FontAwesomeIcon icon={faArrowLeft} />}
          onClick={onClickReset}
        />
      </>
    </RegistrationBox>
  )
}

export default ForgotPasswordNewPasswordBox
