import { useEffect } from 'react'
import useReactiveRef from './useReactiveRef'

/**
 * This hook runs only when the component is mounted
 */
const onMount = (callback: () => void) => {
  const { get, set } = useReactiveRef(false)
  useEffect(() => {
    if (get()) return
    set(true)
    callback()
  }, [get, set])
}

export default onMount
