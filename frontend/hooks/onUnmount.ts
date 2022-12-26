import { useEffect } from 'react'
import useReactiveRef from './useReactiveRef'

/**
 * This hook runs only when the component is mounted
 */
const onUnmount = (callback: () => void) => {
  useEffect(() => {
    return callback
  }, [])
}

export default onUnmount
