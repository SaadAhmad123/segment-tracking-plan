import { useCallback } from 'react'

/**
 * Custom hook for interacting with the local storage of the browser.
 *
 * @param {string} [key] - The key of the value which the hook will be responsible to manage. If no key is provided, the functions returned will be expecting a key to retrieve the value.
 *
 * @returns {Object} An object containing functions for getting and setting values in local storage.
 */
const useLocalStorage = <T>(key?: string) => {
  /**
   * Retrieves the value stored in local storage with the specified key.
   *
   * @param {string} [_key] - The key of the value to retrieve. If no key is provided, the key defined when the hook was initialized will be used.
   *
   * @returns {T | undefined} The value stored in local storage, or undefined if the key is not found or local storage is not available.
   */
  const get = useCallback(
    (_key?: string) => {
      if (!window?.localStorage) return undefined
      const storageKey = key || _key || undefined
      if (!storageKey) return undefined
      try {
        return JSON.parse(window?.localStorage?.getItem(storageKey) || '{}')
          .value as T
      } catch {
        return undefined
      }
    },
    [key],
  )
  /**
   * Stores the provided value in local storage with the specified key.
   *
   * @param {T} value - The value to store
   * @param {string} [_key] - The key to use for storing the value. If no key is provided, the key defined when the hook was initialized will be used.
   *
   * @returns {boolean} A boolean indicating whether the value was successfully stored in local storage.
   */
  const set = useCallback(
    (value: T, _key?: string) => {
      if (!window?.localStorage) return false
      const storageKey = key || _key || undefined
      if (!storageKey) return false
      window.localStorage.setItem(storageKey, JSON.stringify({ value }))
      return true
    },
    [key],
  )
  return { get, set } as {
    get: (_key?: string) => undefined | T
    set: (value: T, _key?: string) => boolean
  }
}

export default useLocalStorage
