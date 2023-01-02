import React from 'react'

interface ITopBar {
  children: React.ReactNode | React.ReactNode[]
}

const TopBar = ({ children }: ITopBar) => {
  return (
    <div className="px-2 sm:px-4 md:px-6 flex items-center gap-2">
      {children}
    </div>
  )
}

export default TopBar
export { TrackingPlanControlIconButton } from './ControlIconButton'
