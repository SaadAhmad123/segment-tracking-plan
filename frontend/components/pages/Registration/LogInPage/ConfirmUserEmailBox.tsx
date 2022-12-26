import React from 'react'
import RegistrationBox from '../utils/RegistrationBox'
import Form from '../../../utils/Form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FullWidthButton } from '../../../Buttons'
import Separator from '../../../Separator'
import Spinner from '../../../Spinner'

interface IConfirmUserEmailBox {
  error: string
  handleSubmit: (value: { [p: string]: any }) => Promise<void>
  onClickReset: () => void
  loading?: boolean
  show: boolean
}

const ConfirmUserEmailBox = ({
  error,
  handleSubmit,
  onClickReset,
  loading,
  show,
}: IConfirmUserEmailBox) => {
  if (!show) return <></>
  const inputs = [{ label: 'Email', type: 'email', key: 'email' }].map(
    (item) => ({ ...item, isRequired: true }),
  )

  return (
    <RegistrationBox heading={'Confirm Account'} error={error}>
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
                text={'Send Confirmation Code'}
                type={'submit'}
              />
            )
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

export default ConfirmUserEmailBox
