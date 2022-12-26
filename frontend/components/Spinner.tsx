import React from 'react'

interface ISpinner {
  tailwindBorderColor?: string
  size?: number
}

const Spinner = ({
  tailwindBorderColor = 'border-servian-white',
  size = 24,
}: ISpinner) => {
  return (
    <span
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`block border-4 ${tailwindBorderColor} border-dashed rounded-full animate-spin duration-1000`}
    />
  )
}

export default Spinner
