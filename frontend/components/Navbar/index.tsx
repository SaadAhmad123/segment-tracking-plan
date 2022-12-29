import React, { useState } from 'react'
import { INavbar, NavbarOption } from './types'
import { createButton, IconButton } from '../Buttons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle, faBars } from '@fortawesome/free-solid-svg-icons'
import Separator from '../Separator'
import { useRouter } from 'next/router'
import useAuth from '../../hooks/useAuth'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'

const OptionButton = createButton(
  'bg-servian-white hover:bg-gray-200 dark:bg-servian-black dark:hover:bg-[#1B1E1F] px-4 py-1 rounded-full border border-servian-orange',
  { start: true },
)
const EmphasisedOptionButton = createButton(
  'text-servian-white bg-servian-orange hover:bg-[#1B1E1F] px-4 py-1 rounded-full border border-servian-orange ',
  { start: true },
)

const Navbar = ({ title, options }: INavbar) => {
  const router = useRouter()
  const { signOut } = useAuth({})
  options =
    options ||
    ([
      {
        icon: <FontAwesomeIcon icon={faUserCircle} />,
        text: 'Dashboard',
        onClick: () => router.push('/dashboard'),
      },
      {
        icon: <FontAwesomeIcon icon={faUserCircle} />,
        text: 'Profile',
        onClick: () => router.push('/profile'),
      },
      {
        icon: <FontAwesomeIcon icon={faUserCircle} />,
        text: 'Sign Out',
        onClick: async () => {
          await signOut()
          router.push('/')
          return
        },
        type: 'EMPHASIS',
      },
    ] as Array<NavbarOption>)

  const [open, setOpen] = useState(false)
  const toggleDrawer = () => setOpen(!open)

  return (
    <>
      <div
        className={
          'sticky top-0 mb-4 py-2 sm:py-4 bg-gray-100 dark:bg-[#1B1E1F]'
        }
      >
        <div className="max-w-[1600px] w-screen mx-auto px-4 sm:px-8 flex items-center justify-between">
          <div>
            {title || (
              <h1
                className="font-bold sm:text-xl m-0 p-0 cursor-pointer"
                onClick={() => router.push('/')}
              >
                <span className="text-servian-orange">Tracking</span> Plans
              </h1>
            )}
          </div>
          <div className="items-center hidden sm:flex">
            {options.map((item, index) => (
              <React.Fragment key={index.toString() + 'desktop-0'}>
                {item.type === undefined && (
                  <OptionButton
                    key={index.toString() + '-desktop-1'}
                    text={item.text}
                    icon={item.icon}
                    onClick={item.onClick}
                  />
                )}
                {item.type === 'EMPHASIS' && (
                  <EmphasisedOptionButton
                    key={index.toString() + '-desktop-2'}
                    text={item.text}
                    icon={item.icon}
                    onClick={item.onClick}
                  />
                )}
                {(options?.length || 0) === index + 1 ? (
                  <></>
                ) : (
                  <Separator
                    horizontal
                    padding={8}
                    key={index.toString() + '-desktop-3-sep'}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="inline-block sm:hidden">
            <IconButton
              text={'Menu'}
              icon={<FontAwesomeIcon icon={faBars} />}
              onClick={toggleDrawer}
            />
          </div>
        </div>
      </div>
      <Drawer open={open} direction={'left'} onClose={toggleDrawer}>
        <div className="h-screen overflow-y w-full py-12 px-6 flex flex-col justify-center bg-white dark:bg-servian-black">
          {options.map((item, index) => (
            <React.Fragment key={index.toString() + 'desktop-0'}>
              {item.type === undefined && (
                <OptionButton
                  key={index.toString() + '-mobile-1'}
                  text={item.text}
                  icon={item.icon}
                  onClick={item.onClick}
                />
              )}
              {item.type === 'EMPHASIS' && (
                <EmphasisedOptionButton
                  key={index.toString() + '-mobile-2'}
                  text={item.text}
                  icon={item.icon}
                  onClick={item.onClick}
                />
              )}
              {(options?.length || 0) === index + 1 ? (
                <></>
              ) : (
                <Separator
                  key={index.toString() + '-mobile-3-sep'}
                  padding={8}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </Drawer>
    </>
  )
}

export default Navbar
