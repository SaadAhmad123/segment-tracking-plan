import { useState } from 'react'

const useStateEnhanced = <T>(
  init: T,
  callback?: (newValue?: T, oldValue?: T) => void,
) => {
  const [state, setState] = useState(init)
  const _setState = (data: T) => {
    const oldValue = state
    setState(data)
    callback?.(data, oldValue)
  }
  return {
    state,
    set: _setState,
  }
}

export default useStateEnhanced
