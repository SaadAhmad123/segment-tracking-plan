import React from 'react'
import useKeyboard from './useKeyboard'

/**
 * Custom hook for listening to keyboard events and executing an action when a specific key combination is pressed.
 *
 * @param {string} controlKeyCode - The key code of the key to be pressed in the key combination. The codes
 * must belong to this [list of key codes](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values).
 * @param {() => void | Promise<void>} action - The action to be executed when the key combination is pressed.
 *
 * @returns {void}
 *
 * @example
 * import React from 'react'
 * import useKeyboardControl from './useKeyboardControl'
 *
 * const MyComponent = () => {
 *  const handleKeyCombination = () => {
 *    console.log('The key combination was pressed!')
 *  }
 *
 *  useKeyboardControl('KeyA', handleKeyCombination)
 *
 *  return <div>Press Shift + Alt + A to trigger the action</div>
 * }
 *
 */
const useKeyboardControl = (
  controlKeyCode: string,
  action: () => any | Promise<any>,
) => {
  useKeyboard({
    condition: (event) =>
      event.shiftKey && event.altKey && event.code === controlKeyCode,
    action: action,
  })
}

export default useKeyboardControl
