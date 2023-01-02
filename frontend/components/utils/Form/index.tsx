import React, { useCallback, useEffect, useState } from 'react'
import Input from './Input'
import Separator from '../../Separator'

export type FormInputItem = {
  label: string
  type: string
  key: string
  isRequired?: boolean
}

type FormProps = {
  inputs: FormInputItem[]
  handleSubmit: (values: { [key: string]: any }) => Promise<void>
  SubmitButton: (props: { loading: boolean }) => JSX.Element
  formValues?: { [key: string]: any }
}

const Form = ({
  inputs,
  handleSubmit,
  SubmitButton,
  formValues,
}: FormProps) => {
  const [values, setValues] = useState<{ [key: string]: any }>(formValues || {})
  useEffect(() => setValues(formValues || {}), [formValues])
  const [loading, setLoading] = useState(false)
  const handleInputChange = useCallback(
    (name: string, value: any) => {
      if (loading) return
      setValues({ ...values, [name]: value })
    },
    [setValues, values, loading],
  )

  const _handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (loading) return
      setLoading(true)
      handleSubmit(values).finally(() => setLoading(false))
    },
    [values, loading, handleSubmit, setLoading],
  )

  return (
    <form onSubmit={_handleSubmit}>
      {inputs.map((input) => (
        <Input
          key={input.key}
          label={input.label}
          type={input.type}
          value={values[input.key]}
          onChange={(
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => handleInputChange(input.key, event.target.value)}
          isRequired={input.isRequired}
        />
      ))}
      <Separator padding={8} />
      <div className="flex items-center justify-center">
        <SubmitButton loading={loading} />
      </div>
    </form>
  )
}

export default Form
