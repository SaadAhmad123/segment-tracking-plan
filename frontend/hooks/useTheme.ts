import { ThemeType } from '../AppContext/types'
import React, { useCallback, useEffect } from 'react'
import useLocalStorage from './useLocalStorage'
import useReactiveRef from './useReactiveRef'
import onMount from './onMount'
import safeConsole from '../helpers/safeConsole'

interface IUseThemeOptions {
  themeLocalStorageKey?: string
  onChange?: (newValue?: ThemeType, oldValue?: ThemeType) => void
}

const useTheme = (
  layoutRef: React.RefObject<HTMLElement>,
  options?: IUseThemeOptions,
) => {
  const { themeLocalStorageKey, onChange } = options || {}
  const { get: theme, set: setTheme } = useReactiveRef<ThemeType>(
    'dark',
    onChange,
  )
  const { get: localStoredTheme, set: setLocalStoredTheme } =
    useLocalStorage<ThemeType>(themeLocalStorageKey)
  const _setTheme = useCallback(
    (theme: ThemeType) => {
      setTheme(theme)
      setLocalStoredTheme(theme)
      if (!layoutRef.current) return
      layoutRef.current.className = theme
    },
    [setTheme, layoutRef], // eslint-disable-line
  )

  const toggleTheme = useCallback(() => {
    if (theme() === 'dark') _setTheme('light')
    else _setTheme('dark')
  }, [theme, _setTheme])

  onMount(() => {
    try {
      let _theme = localStoredTheme()
      if (_theme) {
        _setTheme(_theme)
        if (!layoutRef.current) return
        layoutRef.current.className = _theme
      }
      const query = window.matchMedia('(prefers-color-scheme: dark)')
      const handleThemeChange = function (e: any) {
        _setTheme(e.matches ? 'dark' : 'light')
      }
      query.addEventListener('change', handleThemeChange)
      if (!_theme) _setTheme(query.matches ? 'dark' : 'light')
    } catch (e) {
      safeConsole()?.error(e)
    }
  })

  return {
    theme: theme,
    setTheme: _setTheme,
    toggleTheme,
  }
}

export default useTheme
