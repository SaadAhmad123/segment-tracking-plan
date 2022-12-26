import React from 'react'

export interface NavbarOption {
  icon?: React.ReactNode
  text: string
  onClick: () => void
  type?: 'EMPHASIS'
}

export interface INavbar {
  title?: React.ReactNode
  options?: Array<NavbarOption>
}
