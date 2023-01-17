import React from 'react'
import { useWindowSize } from '../../hooks/useWindowResize'

interface IExcelContainer {
  children?: React.ReactNode
}

const ExcelContainer = ({ children }: IExcelContainer) => {
  const windowSize = useWindowSize()
  return (
    <div
      style={{
        height: windowSize?.innerHeight
          ? `${windowSize.innerHeight - 150}px`
          : '100vh',
      }}
      className={`flex flex-col border text-servian-black-dark relative`}
    >
      {children}
    </div>
  )
}

interface IExcelButtonContainer {
  children?: React.ReactNode
}

export const ExcelButtonContainer = ({ children }: IExcelButtonContainer) => {
  return (
    <div
      className={
        'flex items-center justify-start space-x-4 overflow-x-scroll sticky bottom-0 left-0 w-full bg-white border-t'
      }
    >
      {children}
    </div>
  )
}

export default ExcelContainer
