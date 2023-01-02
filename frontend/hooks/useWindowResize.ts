import { useEffect, useState } from 'react'

/**
 * Custom hook that adds a 'resize' event listener to the window object and removes it when the component
 * using the hook unmounts.
 *
 * @param onResizeCallback - callback function to be called when the window is resized
 */
const useWindowResize = (onResizeCallback: (event: UIEvent) => void) => {
  useEffect(() => {
    window.addEventListener('resize', onResizeCallback)
    return () => window.removeEventListener('resize', onResizeCallback)
  }, [onResizeCallback])
}

/**
 * Type representing the inner height and width of the window.
 */
export type WindowSizeType = {
  innerHeight?: number
  innerWidth?: number
}

/**
 * Custom hook that returns the current inner height and width of the window.
 *
 * @returns an object containing the inner height and width of the window
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<WindowSizeType>({
    innerHeight: window?.innerHeight,
    innerWidth: window?.innerWidth,
  })
  useWindowResize((event) => {
    const _window = event.target as Window
    setWindowSize({
      innerHeight: _window?.innerHeight,
      innerWidth: _window?.innerWidth,
    })
  })
  return windowSize
}

export default useWindowResize
