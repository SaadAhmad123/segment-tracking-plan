import React from 'react'

interface IContainer {
  children: React.ReactNode
}
const Container = ({ children }: IContainer) => (
  <div className="max-w-[1600px] min-h-screen w-screen mx-auto px-4 sm:px-8">
    {children}
  </div>
)
export default Container
