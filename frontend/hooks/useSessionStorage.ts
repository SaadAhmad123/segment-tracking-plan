import { useCallback } from 'react'

/**
 * This hook is used to interact with the session storage of the
 * browser.
 * @param {string} [key] - (default undefined) - Set this key to define the key of the value which
 * the hook will be responsible to manage. If no value is provided the functions returned will be
 * expecting a key to retrieve value
 */
const useSessionStorage = <T>(key?: string) => {
  /**
   * Retrieves the value stored in session storage with the specified key.
   *
   * @param {string} [_key] - The key of the value to retrieve. If no key is provided, the key defined when the hook was initialized will be used.
   *
   * @returns {T | undefined} The value stored in session storage, or undefined if the key is not found or session storage is not available.
   */
  const get = useCallback(
    (_key?: string) => {
      if (!window?.sessionStorage) return undefined
      const storageKey = key || _key || undefined
      if (!storageKey) return undefined
      try {
        return JSON.parse(window?.sessionStorage?.getItem(storageKey) || '{}')
          .value as T
      } catch {
        return undefined
      }
    },
    [key],
  )

  /**
   * Stores the provided value in session storage with the specified key.
   *
   * @param {T} value - The value to store
   * @param {string} [_key] - The key to use for storing the value. If no key is provided, the key defined when the hook was initialized will be used.
   *
   * @returns {boolean} A boolean indicating whether the value was successfully stored in session storage.
   */
  const set = useCallback(
    (value: T, _key?: string) => {
      if (!window?.sessionStorage) return false
      const storageKey = key || _key || undefined
      if (!storageKey) return false
      window.sessionStorage.setItem(storageKey, JSON.stringify({ value }))
      return true
    },
    [key],
  )
  return { get, set } as {
    get: (_key?: string) => undefined | T
    set: (value: T, _key?: string) => boolean
  }
}

export default useSessionStorage
