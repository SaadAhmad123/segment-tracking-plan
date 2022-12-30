import * as React from 'react'
import { useState } from 'react'
import * as ReactDOM from 'react-dom'
import EZDrawer from 'react-modern-drawer'

interface ModalProps {
  show?: boolean
  children: React.ReactNode
  onClickBackground?: () => void
}

const Modal: React.FunctionComponent<ModalProps> = ({
  show,
  children,
  onClickBackground,
}) => {
  return (
    <EZDrawer
      open={show || false}
      direction={'right'}
      onClose={onClickBackground}
      size={
        window?.innerWidth && window.innerWidth / 2 > 500
          ? window.innerWidth * 0.7
          : window.innerWidth * 0.9
      }
    >
      <div className="h-screen overflow-y-auto w-full py-12 px-6 bg-white dark:bg-servian-black">
        {children}
      </div>
    </EZDrawer>
  )
}

export default Modal
