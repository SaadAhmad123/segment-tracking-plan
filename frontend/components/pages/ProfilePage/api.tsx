import { AppEnvironment } from '../../../helpers/AppEnvironmentManager'
import axios, { AxiosError } from 'axios'
import { User } from '../../types'

export const getUser = async (IdToken: string) => {
  try {
    const resp = await axios.get(AppEnvironment.makeRestUrl('/manage/user'), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: IdToken,
      },
    })
    return resp.data as User
  } catch (e) {
    if (!e) throw new Error('No response')
    if ((e as AxiosError)?.response?.status === 404) return undefined
    throw e
  }
}

export const createUser = async (IdToken: string, user: User) => {
  const resp = await axios.post(AppEnvironment.makeRestUrl('/manage/user'), user, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: IdToken,
    },
  })
  return resp.data as User
}
