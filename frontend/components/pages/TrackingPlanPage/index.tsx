import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../Layout'
import Navbar from '../../Navbar'
import TopBar, { TrackingPlanControlIconButton } from './TopBar'
import TitleBar from './TopBar/TitleBar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import Separator from '../../Separator'
import SideBar from './SideBar'
import useKeyboardControl from '../../../hooks/useKeyboardControl'
import SpreadSheet from '../../SpreadSheet'
import { createTestRecords, TestRecordColumns } from '../../SpreadSheet/test'
import {
  convertRowsToObjects,
  getRowsWithHeader,
} from '../../SpreadSheet/utils'
import Excel from '../../Excel'

const TrackingPlanPage = () => {
  const router = useRouter()
  const { tracking_plan_uuid, version } = router.query

  const [showLeftBar, setShowLeftBar] = useState(false)
  const toggleLeftBar = () => setShowLeftBar(!showLeftBar)
  useKeyboardControl('KeyS', toggleLeftBar)

  return (
    <Layout navbar={<Navbar />}>
      <TopBar>
        <TrackingPlanControlIconButton
          text="Open options list"
          icon={<FontAwesomeIcon icon={faCog} />}
          onClick={toggleLeftBar}
        />
        <TitleBar content={['Tracking Plan', 'Sheet 1']} />
      </TopBar>
      <Separator padding={6} />
      <div className="flex-1 w-full">
        <Excel />
      </div>
      <Separator padding={200} />
    </Layout>
  )
}

export default TrackingPlanPage
