import { useCallback, useRef } from 'react'

/**
 * Custom hook for creating a reactive reference in a functional component.
 *
 * @param {T} [initialValue] - The initial value for the reactive reference.
 * @param {function} [onChange] - A callback function to be called whenever the value of the reactive reference changes.
 *
 * @returns {Object} An object containing functions for getting, setting, and setting the onChange callback for the reactive reference.
 */
const useReactiveRef = <T>(
  initialValue?: T,
  onChange?: (newValue?: T, oldValue?: T) => void,
) => {
  const ref = useRef<T | undefined>(initialValue)
  const onChangeCallback = useRef<
    ((newValue?: T, oldValue?: T) => void) | undefined
  >(onChange)

  /**
   * Returns the current value of the reactive reference.
   *
   * @returns {T | undefined} The current value of the reactive reference.
   */
  const get = useCallback(() => {
    return ref.current
  }, [ref])

  /**
   * Sets the value of the reactive reference and calls the onChange callback if it exists.
   *
   * @param {T} value - The new value to set for the reactive reference.
   */
  const set = useCallback(
    (value: T) => {
      const oldValue = ref.current
      ref.current = value
      onChangeCallback.current?.(value, oldValue)
    },
    [ref],
  )

  /**
   * Sets the onChange callback for the reactive reference.
   *
   * @param {function} cb - The callback function to be called whenever the value of the reactive reference changes.
   */
  const setOnChange = useCallback(
    (cb: (newValue?: T, oldValue?: T) => void) => {
      onChangeCallback.current = cb
    },
    [],
  )

  return { get, set, onChange: setOnChange }
}

export default useReactiveRef
