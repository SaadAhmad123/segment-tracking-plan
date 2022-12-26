import React, { useCallback, useState } from 'react'
import retryPromise from '../helpers/retryPromise'
import onMount from './onMount'

export enum UsePromiseState {
  idle = 'idle',
  error = 'error',
  loading = 'loading',
  success = 'success',
}

/**
 * A hook that returns an object containing the state, error, and a retry function for a promise.
 * @param promiseFn - A promise-returning function to be retried.
 * @param retryCount - The number of times to retry the promise function. Default is 3.
 * @param retryDelay - The delay in milliseconds between each retry. Default is 1000.
 * @returns An object containing the state, error, and a retry function for the promise.
 */
function usePromise<T extends any[], R>(
  promiseFn: (...args: T) => Promise<R>,
  retryCount: number = 3,
  retryDelay: number = 1000,
) {
  const [state, setState] = useState<UsePromiseState>(UsePromiseState.idle)
  const [error, setError] = useState<Error | undefined>()
  const [data, setData] = useState<R | undefined>()

  const reset = useCallback(() => {
    setState(UsePromiseState.idle)
    setError(undefined)
    setData(undefined)
  }, [setState, setError, setData])

  const retry = useCallback(
    async (...arg: T) => {
      setState(UsePromiseState.loading)
      setError(undefined)
      let resp = undefined as R | undefined
      try {
        resp = await retryPromise(promiseFn, retryCount, retryDelay)(...arg)
        setState(UsePromiseState.success)
        setData(resp)
      } catch (e) {
        setError(e as Error)
        setState(UsePromiseState.error)
      }
      return resp as R | undefined
    },
    [setState],
  )

  return {
    state,
    error,
    retry,
    data,
    reset,
  }
}

export default usePromise
