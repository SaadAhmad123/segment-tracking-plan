import React from 'react'
import Head from 'next/head'
import ThemeButton from '../Buttons/ThemeButton'
import Container from './Container'

interface ILayout {
  title?: string
  children: React.ReactNode
  navbar?: React.ReactNode
}

const Layout = ({ children, title, navbar }: ILayout) => {
  return (
    <>
      <Head>
        <title>{title || `Segment Tracking Plan`}</title>
      </Head>
      <div className="min-h-screen bg-servian-white dark:bg-servian-black text-servian-black dark:text-servian-white">
        {navbar}
        <Container>{children}</Container>
      </div>
      <ThemeButton />
    </>
  )
}

export default Layout
