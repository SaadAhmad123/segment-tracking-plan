import React from 'react'
import Layout from '../../Layout'
import Navbar from '../../Navbar'
import TrackingPlanCreatedByMe from './TrackingPlan/CreatedByMe'
import Separator from '../../Separator'


const DashboardPage = () => {
  return (
    <Layout navbar={<Navbar />}>
      <Separator padding={10} />
      <TrackingPlanCreatedByMe />
    </Layout>
  )
}

export default DashboardPage
