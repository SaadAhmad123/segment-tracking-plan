import React from 'react'
import { INavbar, NavbarOption } from './types'
import { createButton } from '../Buttons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import Separator from '../Separator'
import { useRouter } from 'next/router'
import useAuth from '../../hooks/useAuth'


const OptionButton = createButton("bg-servian-white hover:bg-gray-200 dark:bg-servian-black dark:hover:bg-[#1B1E1F] px-4 py-1 rounded-full border border-servian-orange", {start: true})
const EmphasisedOptionButton = createButton("text-servian-white bg-servian-orange hover:bg-[#1B1E1F] px-4 py-1 rounded-full border border-servian-orange ", {start: true})


const Navbar = ({ title, options }: INavbar) => {
  const router = useRouter()
  const {signOut} = useAuth({})
  options = options || [
    {
      icon: <FontAwesomeIcon icon={faUserCircle}/>,
      text: "Profile",
      onClick: () => {}
    },
    {
      icon: <FontAwesomeIcon icon={faUserCircle}/>,
      text: "Sign Out",
      onClick: async () => {
        await signOut()
        router.push("/")
        return
      },
      type: 'EMPHASIS'
    }
  ] as Array<NavbarOption>
  return (
    <div
      className={'sticky top-0 mb-4 py-2 sm:py-4 bg-gray-100 dark:bg-[#1B1E1F]'}
    >
      <div className="max-w-[1600px] w-screen mx-auto px-4 sm:px-8 flex items-center justify-between">
        <div>
          {title || (
            <h1 className="font-bold sm:text-xl m-0 p-0 cursor-pointer" onClick={() => router.push("/")}>
              <span className="text-servian-orange">Tracking</span> Plans
            </h1>
          )}
        </div>
        <div className="flex items-center">
          {
            options.map((item, index) => (
              <>
                {item.type === undefined && <OptionButton key={index} text={item.text} icon={item.icon} onClick={item.onClick}/>}
                {item.type === 'EMPHASIS' && <EmphasisedOptionButton key={index} text={item.text} icon={item.icon} onClick={item.onClick}/>}
                {((options?.length || 0) === index + 1) ? <></> : <Separator horizontal padding={8}/>}
              </>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Navbar
