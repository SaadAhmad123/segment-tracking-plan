import React, { useCallback, useContext, useEffect, useState } from 'react'
import Separator from '../../../../Separator'
import NewTrackingPlanButton from './NewTrackingPlanButton'
import NewTrackingPlanModal from './NewTrackingPlanModal'
import useKeyboardControl from '../../../../../hooks/useKeyboardControl'
import { AuthContextType } from '../../../../../AuthContext/types'
import AuthContext from '../../../../../AuthContext/Context'
import { createTrackingPlan, getTrackingPlans } from './api'
import { TrackingPlan } from '../../../../types'
import { AxiosError } from 'axios'
import TrackingPlanTileContainer from '../../utils/TrackingPlanTile/Container'
import Spinner from '../../../../Spinner'
import { useRouter } from 'next/router'
import moment from 'moment'

const TrackingPlanCreatedByMe = () => {
  const rounter = useRouter()
  const { auth } = useContext<AuthContextType>(AuthContext)
  const [showNewTrackingPlanModal, setShowNewTrackingPlanModal] =
    useState(false)
  const [creatingNewTrackingPlan, setCreatingNewTrackingPlan] = useState(false)
  const toggleNewTrackingPlanModal = useCallback(() => {
    if (creatingNewTrackingPlan) return
    setShowNewTrackingPlanModal(!showNewTrackingPlanModal)
  }, [
    showNewTrackingPlanModal,
    setShowNewTrackingPlanModal,
    creatingNewTrackingPlan,
  ])

  const [personalTrackingPlansError, setPersonalTrackingPlansError] =
    useState('')
  const [personalTrackingPlansNext, setPersonalTrackingPlansNext] = useState('')
  const [personalTrackingPlansLoading, setPersonalTrackingPlansLoading] =
    useState(false)
  const [personalTrackingPlans, setPersonalTrackingPlans] = useState<
    Array<TrackingPlan>
  >([])
  useKeyboardControl('KeyN', toggleNewTrackingPlanModal)

  const getPersonalTrackingPlans = async (refresh = false) => {
    try {
      setPersonalTrackingPlansLoading(true)
      setPersonalTrackingPlansError('')
      const resp = await getTrackingPlans(
        auth?.IdToken || '',
        10,
        personalTrackingPlansNext,
      )
      if (!refresh) {
        setPersonalTrackingPlansNext(resp?.pagination?.token || '')
        setPersonalTrackingPlans([
          ...personalTrackingPlans,
          ...(resp?.items || []),
        ])
      } else {
        setPersonalTrackingPlansNext(resp?.pagination?.token || '')
        setPersonalTrackingPlans(resp?.items || [])
      }
    } catch (e) {
      const error = (e as AxiosError)?.message || 'Error occurred'
      setPersonalTrackingPlansError(error)
    } finally {
      setPersonalTrackingPlansLoading(false)
    }
  }

  useEffect(() => {
    getPersonalTrackingPlans(true)
  }, [])

  const handleSubmit = async (values: { [key: string]: any }) => {
    setCreatingNewTrackingPlan(true)
    try {
      await createTrackingPlan(auth?.IdToken || '', values)
      setShowNewTrackingPlanModal(!showNewTrackingPlanModal)
    } catch (e) {
      throw e
    } finally {
      setCreatingNewTrackingPlan(false)
      await getPersonalTrackingPlans(true)
    }
  }

  return (
    <>
      <div className="">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-4xl font-bold">My Tracking Plans</h1>
          {personalTrackingPlansLoading && (
            <Spinner
              tailwindBorderColor={
                'border-servian-black dark:border-servian-white'
              }
            />
          )}
        </div>
        <Separator padding={16} />
        <div className="flex items-center space-x-4 overflow-x-scroll pb-6">
          <NewTrackingPlanButton onClick={toggleNewTrackingPlanModal} />
          {[...personalTrackingPlans].map((item, index) => (
            <TrackingPlanTileContainer
              key={index}
              onClick={() =>
                rounter.push(
                  `/tracking-plan/${item.tracking_plan_uuid}/version/latest`,
                )
              }
            >
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  {moment(item.create_at_iso).format('DD.MM.YYYY')}
                </p>
                <h3 className="font-medium text-xl">{item.name}</h3>
                <Separator padding={8} />

                <h3 className="text-gray-500 hidden sm:block">
                  {(item.description || '').slice(0, 150)}
                  {(item.description || '').length > 150 && '...'}
                </h3>
                <h3 className="text-gray-500 block sm:hidden">
                  {(item.description || '').slice(0, 50)}
                  {(item.description || '').length > 50 && '...'}
                </h3>
              </div>
            </TrackingPlanTileContainer>
          ))}
        </div>
      </div>
      {
        <NewTrackingPlanModal
          show={showNewTrackingPlanModal}
          onClose={toggleNewTrackingPlanModal}
          onSubmit={handleSubmit}
        />
      }
    </>
  )
}

export default TrackingPlanCreatedByMe
