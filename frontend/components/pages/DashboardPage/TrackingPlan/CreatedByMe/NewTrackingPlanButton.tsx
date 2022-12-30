import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import Separator from '../../../../Separator'
import React from 'react'

interface INewTrackingPlanButton {
  onClick?: () => void
}

function NewTrackingPlanButton({ onClick }: INewTrackingPlanButton) {
  return (
    <div
      onClick={onClick}
      tabIndex={0}
      className="cursor-pointer bg-servian-orange px-4 py-3 text-servian-white flex-shrink-0 h-[200px] w-[200px] sm:h-[256px] sm:w-[256px]"
    >
      <div className="h-full w-full flex items-center justify-center font-bold">
        <div>
          <div className="flex items-center justify-center">
            <FontAwesomeIcon icon={faPlus} size={'3x'} />
          </div>
          <Separator />
          <p className="text-lg">New Tracking Plan</p>
        </div>
      </div>
    </div>
  )
}

export default NewTrackingPlanButton
