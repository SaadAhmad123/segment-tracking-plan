import React, { useCallback, useRef, useState } from 'react'
import { AppContextType, ThemeType } from './types'
import AppContext from './Context'
import useTheme from '../hooks/useTheme'
import useReactiveRef from '../hooks/useReactiveRef'

interface IAppContextProvider {
  children: React.ReactNode
}

export const AppContextProvider = ({ children }: IAppContextProvider) => {
  const { set: setOnThemeChange, get: getOnThemeChange } = useReactiveRef<
    Array<(theme?: ThemeType) => void>
  >([])
  const { set: setTheme } = useReactiveRef<ThemeType>('light', (theme) => {
    getOnThemeChange()?.forEach((item) => item(theme))
  })
  const mainRef = useRef<HTMLElement>(null)
  const { toggleTheme, theme: getTheme } = useTheme(mainRef, {
    themeLocalStorageKey: 'appTheme',
    onChange: (theme) => setTheme(theme || 'light'),
  })

  const onThemeChange = useCallback(
    (callback: (theme?: ThemeType) => void) => {
      const index = (getOnThemeChange() || []).length
      setOnThemeChange([...(getOnThemeChange() || []), callback])
      return index + 1
    },
    [setOnThemeChange, getOnThemeChange],
  )

  const removeOnThemeChange = useCallback(
    (index: number) => {
      setOnThemeChange((getOnThemeChange() || []).splice(index, 1))
    },
    [setOnThemeChange, getOnThemeChange],
  )

  const value = {
    onThemeChange,
    removeOnThemeChange,
    toggleTheme,
    getTheme,
  } as AppContextType

  return (
    <AppContext.Provider value={value}>
      <main ref={mainRef}>{children}</main>
    </AppContext.Provider>
  )
}
