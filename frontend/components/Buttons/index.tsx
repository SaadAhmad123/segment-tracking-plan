import React from 'react'

type ButtonProps = {
  text: string
  icon?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  type?: 'button' | 'submit' | 'reset' | undefined
  title?: string
  ariaLabel?: string
  tabIndex?: number
  className?: string
}

export const createButton = (
  className: string,
  withIcon?: {
    start?: boolean
    end?: boolean
  },
) => {
  // eslint-disable-next-line react/display-name
  return (props: ButtonProps) => {
    return (
      <button
        type={props.type}
        tabIndex={props.tabIndex || 0}
        title={props.title}
        aria-label={props.ariaLabel}
        className={`flex items-center transition duration-200 ${className} ${props.className} `}
        onClick={props.onClick}
      >
        {withIcon?.start && props.icon && (
          <span className="mr-3">{props.icon}</span>
        )}
        {props.text}
        {withIcon?.end && props.icon && (
          <span className="ml-3">{props.icon}</span>
        )}
      </button>
    )
  }
}

export const createIconButton = (className: string) => {
  // eslint-disable-next-line react/display-name
  return (props: ButtonProps) => {
    return (
      <button
        type={props.type}
        tabIndex={props.tabIndex || 0}
        title={props.title || props.text}
        aria-label={props.ariaLabel}
        className={`${className} ${props.className}`}
        onClick={props.onClick}
      >
        {props.icon}
      </button>
    )
  }
}

export const HomePageActionButton = createButton(
  'bg-servian-orange text-servian-white px-8 py-2 text-normal sm:text-lg hover:bg-[#1B1E1F] transition duration-200',
  { start: true },
)
export const SuppressedHomePageActionButton = createButton(
  'px-8 py-2 text-normal sm:text-lg transition duration-200 bg-gray-100 text-servian-black hover:bg-gray-200',
  { start: true },
)

export const FullWidthButton = createButton(
  'bg-servian-orange text-servian-white px-6 py-2 text-lg transition duration-200 w-full justify-center hover:bg-[#DB6638]',
  { start: true },
)

export const IconButton = createIconButton(
  `flex items-center justify-center h-8 w-8 hover:bg-[#1B1E1F] transition duration-200 bg-servian-orange text-servian-white`,
)

export const RegistrationSecondaryButton = createButton(
  'text-gray-600 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-black py-1 text-sm transition duration-250',
)
