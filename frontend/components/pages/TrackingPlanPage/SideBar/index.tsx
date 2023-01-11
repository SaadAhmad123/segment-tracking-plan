import React from 'react'
import EZDrawer from 'react-modern-drawer'

interface ISideBar {
  show?: boolean
  onClose?: () => void
  children?: React.ReactNode | React.ReactNode[]
  className?: string
  direction: 'left' | 'right'
}

const SideBar = ({
  show,
  onClose,
  children,
  className,
  direction,
}: ISideBar) => {
  return (
    <>
      {show && (
        <div
          className={`hidden sm:block sm:w-[200px] md:w-[256px] ${className}`}
        >
          <div className="w-full bg-servian-white dark:bg-servian-black-dark">
            {children}
          </div>
        </div>
      )}
      <div className="block sm:hidden">
        <EZDrawer open={show || false} direction={direction} onClose={onClose}>
          <div className="h-screen overflow-y w-full bg-white dark:bg-servian-black">
            {children}
          </div>
        </EZDrawer>
      </div>
    </>
  )
}

export default SideBar
