import React from 'react'

interface ISeparator {
  padding?: number
  horizontal?: boolean
}

const Separator: React.FC<ISeparator> = ({ padding = 4, horizontal }) => {
  if (horizontal) {
    return (
      <div style={{ display: 'inline-block', padding: `0 ${padding}px` }} />
    )
  }
  return <div style={{ display: 'block', padding: `${padding}px 0` }} />
}

export default Separator
