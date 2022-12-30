import React from 'react'

interface ITrackingPlanTileContainer {
  children: React.ReactNode
  onClick?: () => void
}

const TrackingPlanTileContainer = ({
  children,
  onClick,
}: ITrackingPlanTileContainer) => {
  return (
    <div
      onClick={onClick}
      tabIndex={0}
      className="cursor-pointer border dark:border dark:border-gray-700 dark:bg-[#1B1E1F] bg-white px-4 py-3 flex-shrink-0 h-[200px] w-[200px] sm:h-[256px] sm:w-[256px]"
    >
      {children}
    </div>
  )
}

export default TrackingPlanTileContainer
