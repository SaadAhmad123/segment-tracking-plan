import { AppEnvironment } from '../../../helpers/AppEnvironmentManager'
import axios from 'axios'
import { User } from '../../types'

export const getUser = async (IdToken: string) => {
  const resp = await axios.get(AppEnvironment.makeRestUrl('/manage/user'), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: IdToken,
    },
  })
  return resp.data as User
}

export const createUser = async (IdToken: string, user: User) => {
  const resp = await axios.post(
    AppEnvironment.makeRestUrl('/manage/user'),
    user,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: IdToken,
      },
    },
  )
  return resp.data as User
}

export const updateUser = async (IdToken: string, user: User) => {
  const resp = await axios.patch(
    AppEnvironment.makeRestUrl('/manage/user'),
    user,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: IdToken,
      },
    },
  )
  return resp.data as User
}
