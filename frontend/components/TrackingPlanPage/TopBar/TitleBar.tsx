import React from 'react'

interface ITitleBar {
  content: string[]
}

const TitleBar = ({ content }: ITitleBar) => {
  return (
    <div className="h-[40px] sm:h-[46px] px-6 flex items-center bg-gray-100 dark:bg-servian-black-dark flex-1 md:text-lg overflow-x-auto">
      <h1 className="whitespace-nowrap">{content.join(' / ')}</h1>
    </div>
  )
}

export default TitleBar
