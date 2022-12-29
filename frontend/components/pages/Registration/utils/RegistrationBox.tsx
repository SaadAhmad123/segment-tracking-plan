import React from 'react'
import { useRouter } from 'next/router'
import { IconButton } from '../../../Buttons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'
import useKeyboardControl from '../../../../hooks/useKeyboardControl'

interface IRegistrationBox {
  heading: string
  error: string
  children: React.ReactNode
}

const RegistrationBox = ({ heading, error, children }: IRegistrationBox) => {
  const router = useRouter()
  useKeyboardControl('KeyH', () => router.push('/'))
  return (
    <div className="min-h-screen flex items-center py-24">
      <div className="w-full max-w-md mx-auto px-4 py-8 bg-white dark:bg-[#1B1E1F] border dark:border-gray-700">
        <div className="flex items-center justify-between  mb-4">
          <h2 className="text-2xl sm:text-4xl font-bold">{heading}</h2>
          <IconButton
            text={'Home'}
            icon={<FontAwesomeIcon icon={faHome} />}
            onClick={() => router.push('/')}
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {children}
      </div>
    </div>
  )
}

export default RegistrationBox
