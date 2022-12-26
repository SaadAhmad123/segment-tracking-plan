import React from 'react'
import RegistrationBox from './RegistrationBox'
import Spinner from '../../../Spinner'
import Separator from '../../../Separator'

interface IWaitingBox {
  show: boolean
  heading: string
  content: string
}

const WaitingBox = ({ heading, content, show }: IWaitingBox) => {
  if (!show) return <></>
  return (
    <RegistrationBox heading={heading} error={''}>
      <>
        <Separator />
        <div className="flex items-center justify-center">
          <Spinner
            size={40}
            tailwindBorderColor="dark:border-servian-white border-servian-black"
          />
        </div>
        <Separator />
        <Separator />
        <p className={'text-center'}>{content}</p>
      </>
    </RegistrationBox>
  )
}

export default WaitingBox
