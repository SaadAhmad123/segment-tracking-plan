import React, { useState } from 'react'
import Modal from '../../../../Modal'
import {
  HomePageActionButton,
  SuppressedHomePageActionButton,
} from '../../../../Buttons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons'
import Separator from '../../../../Separator'
import Form, { FormInputItem } from '../../../../utils/Form'
import Spinner from '../../../../Spinner'
import { AxiosError } from 'axios'

interface INewTrackingPlanModal {
  show: boolean
  onClose: () => void
  onSubmit: (values: { [p: string]: any }) => Promise<void>
}

const NewTrackingPlanModal = ({
  show,
  onClose,
  onSubmit,
}: INewTrackingPlanModal) => {
  const inputs: FormInputItem[] = [
    { label: 'Tracking Plan Name', type: 'text', key: 'name' },
    { label: 'Description', type: 'textarea', key: 'description' },
  ].map((item) => ({ isRequired: false, ...item }))

  const [error, setError] = useState('')
  const handleSubmit = async (values: { [p: string]: any }) => {
    try {
      setError('')
      await onSubmit(values)
    } catch (e) {
      setError(
        // @ts-ignore
        (e as AxiosError)?.response?.data?.error?.error ||
          (e as Error)?.message ||
          'Error occurred',
      )
    }
  }

  return (
    <Modal show={show} onClickBackground={onClose}>
      <SuppressedHomePageActionButton
        className="bg-gray-100 text-servian-black hover:bg-gray-200"
        text={'Back'}
        icon={<FontAwesomeIcon icon={faArrowLeft} />}
        onClick={onClose}
      />
      <Separator padding={16} />
      <h1 className="text-2xl sm:text-4xl font-bold">
        Create New Tracking Plan
      </h1>
      <div className="max-w-[400px] mt-4">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Form
          formValues={{}}
          inputs={inputs}
          handleSubmit={handleSubmit}
          SubmitButton={({ loading }) => (
            <div className="w-full">
              {loading && (
                <HomePageActionButton text="Creating..." icon={<Spinner />} />
              )}
              {!loading && (
                <HomePageActionButton
                  text="Create"
                  icon={<FontAwesomeIcon icon={faPlus} />}
                />
              )}
            </div>
          )}
        />
      </div>
    </Modal>
  )
}

export default NewTrackingPlanModal
