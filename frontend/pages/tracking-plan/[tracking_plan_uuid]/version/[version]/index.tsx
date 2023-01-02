import React from 'react'
import AuthProvider from '../../../../../AuthContext'
import TrackingPlanPage from '../../../../../components/TrackingPlanPage'

// eslint-disable-next-line react/display-name
export default function () {
  return (
    <AuthProvider>
      <TrackingPlanPage />
    </AuthProvider>
  )
}
