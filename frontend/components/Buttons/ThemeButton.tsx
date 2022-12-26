import React, { useContext, useEffect, useState } from 'react'
import AppContext from '../../AppContext/Context'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import { createIconButton } from './index'
import { ThemeType } from '../../AppContext/types'
import useKeyboardControl from '../../hooks/useKeyboardControl'

const ThemeButton = () => {
  const [theme, setTheme] = useState<ThemeType>('light')
  const { toggleTheme, onThemeChange, removeOnThemeChange, getTheme } =
    useContext(AppContext)
  const styles =
    'flex items-center justify-center h-12 w-12 fixed right-4 md:right-6 lg:right-8 bottom-4 md:bottom-6 lg:bottom-8 hover:bg-[#1B1E1F] transition duration-200 shadow-lg'
  const LightThemeButton = createIconButton(
    `${styles} bg-servian-orange text-servian-white`,
  )
  const DarkThemeButton = createIconButton(
    `${styles} bg-servian-black text-servian-white`,
  )

  useEffect(() => {
    const key = onThemeChange?.((theme) => setTheme(theme || 'light'))
    setTheme(getTheme?.() || 'light')
    return () => {
      if (key) removeOnThemeChange?.(key)
    }
  }, [onThemeChange, removeOnThemeChange, getTheme, setTheme])

  useKeyboardControl('KeyD', () => toggleTheme?.())

  if (theme === 'light')
    return (
      <DarkThemeButton
        icon={<FontAwesomeIcon icon={faMoon} size={'lg'} />}
        onClick={() => toggleTheme?.()}
        text={'Switch to dark mode'}
      />
    )
  return (
    <LightThemeButton
      icon={<FontAwesomeIcon icon={faSun} size={'lg'} />}
      onClick={() => toggleTheme?.()}
      text={'Switch to light mode'}
    />
  )
}

export default ThemeButton
