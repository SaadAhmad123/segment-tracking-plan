import React from 'react'

interface ITrackingPlanTileContainer {
  children: React.ReactNode
}

const TrackingPlanTileContainer = ({
  children,
}: ITrackingPlanTileContainer) => {
  return (
    <div
      tabIndex={0}
      className="cursor-pointer border dark:border dark:border-gray-700 dark:bg-[#1B1E1F] bg-white px-4 py-3 h-[200px] md:h-[256px]"
    >
      {children}
    </div>
  )
}

export default TrackingPlanTileContainer
