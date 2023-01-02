import { useCallback, useEffect, useRef } from 'react'

/**
 * Custom hook for creating a reactive reference in a functional component.
 *
 * Reactive Reference is a custom React hook that allows you to create a reactive reference in
 * a functional component. A reactive reference is essentially a piece of state that can be read
 * and updated, similar to a "ref" in React, but with the added ability to specify a callback
 * function that will be called whenever the value of the reactive reference changes. The hook provides
 * functions for getting and setting the value of the reactive reference, as well as setting and
 * triggering the onChange callback. It also returns the reference itself, which can be used to
 * access the current value of the reactive reference.
 *
 * @param {T} [initialValue] - The initial value for the reactive reference.
 * @param {function} [onChange] - A callback function to be called whenever the value of the reactive reference changes.
 *
 * @returns {Object} An object containing functions for getting, setting, and setting the onChange callback for the reactive reference.
 */
const useReactiveRef = <T>(
  initialValue?: T,
  onChange?: (newValue?: T, oldValue?: T) => void,
  onInit?: (initValue?: T) => void,
) => {
  const ref = useRef<T | undefined>(initialValue)
  const onChangeCallback = useRef<
    ((newValue?: T, oldValue?: T) => void) | undefined
  >(onChange)

  useEffect(() => {
    onInit?.(initialValue)
  }, [initialValue])

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

  const triggerChange = useCallback(() => {
    onChangeCallback.current?.(ref.current, ref.current)
  }, [onChangeCallback])

  return { get, set, onChange: setOnChange, triggerChange, ref }
}

export default useReactiveRef
