import React from 'react'
import Separator from '../../../../Separator'
import TrackingPlanTileContainer from '../../utils/TrackingPlanTile/Container'

const TrackingPlanCreatedByMe = () => {
  return (
    <div className="">
      <h1 className="text-2xl sm:text-4xl font-bold text-center sm:text-left">
        My Tracking Plans
      </h1>
      <Separator padding={12} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <TrackingPlanTileContainer>
          <p>HDSAFDD</p>
        </TrackingPlanTileContainer>
      </div>
    </div>
  )
}

export default TrackingPlanCreatedByMe
