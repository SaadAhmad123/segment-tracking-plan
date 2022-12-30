import React from 'react'
import Separator from '../../Separator'

type InputProps = {
  label: string
  type: string
  value: string
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
  isRequired?: boolean
}

const Input = ({
  label,
  type,
  value,
  onChange,
  isRequired = false,
}: InputProps) => {
  return (
    <>
      <label
        htmlFor={label}
        className="block font-medium text-gray-700 dark:text-servian-white mb-2"
      >
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          autoComplete="on"
          id={label}
          name={label}
          value={value || ''}
          onChange={onChange}
          className="block w-full py-2 px-3 border focus:outline-none focus:border-indigo-600 bg-gray-50 dark:bg-[#212526] dark:border-gray-500 focus:dark:border-indigo-400"
          aria-label={label}
          aria-describedby={`${label}-description`}
          placeholder={`Enter ${label}`}
          required={isRequired}
        />
      ) : (
        <input
          autoComplete="on"
          type={type}
          id={label}
          name={label}
          value={value || ''}
          onChange={onChange}
          className="block w-full py-2 px-3 border focus:outline-none focus:border-indigo-600 bg-gray-50 dark:bg-[#212526] dark:border-gray-500 focus:dark:border-indigo-400"
          aria-label={label}
          aria-describedby={`${label}-description`}
          placeholder={`Enter ${label}`}
          required={isRequired}
        />
      )}
      <p
        id={`${label}-description`}
        className="text-gray-600 dark:text-servian-light-gray text-xs font-thin mt-2"
      >
        Please enter your {label} in the field above.
      </p>
      <Separator padding={6} />
    </>
  )
}

export default Input
