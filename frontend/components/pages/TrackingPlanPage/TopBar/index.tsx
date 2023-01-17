import React from 'react'

interface ITopBar {
  children: React.ReactNode | React.ReactNode[]
}

const TopBar = ({ children }: ITopBar) => {
  return <div className="flex items-center gap-2">{children}</div>
}

export default TopBar
export { TrackingPlanControlIconButton } from './ControlIconButton'
