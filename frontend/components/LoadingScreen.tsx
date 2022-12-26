import React from 'react'
import Layout from './Layout'
import Spinner from './Spinner'
import Separator from './Separator'

const LoadingScreen = () => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center py-24 justify-center">
        <div className="flex flex-col items-center justify-center">
          <Spinner
            size={40}
            tailwindBorderColor="dark:border-servian-white border-servian-black"
          />
          <Separator />
          <Separator />
          <p>Loading, Please wait...</p>
        </div>
      </div>
    </Layout>
  )
}

export default LoadingScreen
