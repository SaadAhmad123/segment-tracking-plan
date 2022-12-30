import { AppEnvironment } from '../../../../../helpers/AppEnvironmentManager'
import axios from 'axios'
import { TrackingPlan } from '../../../../types'

export const createTrackingPlan = async (
  idToken: string,
  values: { [p: string]: any },
) => {
  const resp = await axios.post(
    AppEnvironment.makeRestUrl('/manage/tracking-plan'),
    values,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: idToken,
      },
    },
  )
  return resp?.data as TrackingPlan
}

export const getTrackingPlans = async (
  idToken: string,
  itemCount: number,
  paginationToken?: string,
) => {
  const query = new URLSearchParams({})
  query.set('itemCount', itemCount.toString())
  if (paginationToken) query.set('paginationToken', paginationToken)
  const resp = await axios.get(
    `${AppEnvironment.makeRestUrl(
      '/manage/tracking-plan',
    )}?${query.toString()}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: idToken,
      },
    },
  )
  return resp?.data as {
    items: Array<TrackingPlan>
    pagination: {
      token: string | null
      count: number
    }
  }
}
