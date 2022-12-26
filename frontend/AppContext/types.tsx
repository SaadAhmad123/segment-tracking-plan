export type ThemeType = 'light' | 'dark'
export type AppContextType = {
  onThemeChange?: (value: (theme?: ThemeType) => void) => void
  removeOnThemeChange?: (index: number) => void
  toggleTheme?: () => void
  getTheme?: () => ThemeType
}
