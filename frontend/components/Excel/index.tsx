import React, { MutableRefObject, useCallback, useState } from 'react'
import useReactiveRef from '../../hooks/useReactiveRef'
import { ExcelDataType } from './types'
import Sheet from './Sheet'
import ExcelContainer, { ExcelButtonContainer } from './Container'
import { ExcelSheetAddButton, ExcelSheetButton } from './Button'
import { createEmptySheet } from './utils'
import Modal from '../Modal'
import { TextCell } from '@silevis/reactgrid'
import { HomePageActionButton, SuppressedHomePageActionButton } from '../Buttons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faTrash } from '@fortawesome/free-solid-svg-icons'
import Separator from '../Separator'
import Form, { FormInputItem } from '../utils/Form'

interface IExcel {
  data?: ExcelDataType
  dataRef?: MutableRefObject<ExcelDataType | undefined>
}

const Excel = ({
  data = { 'sheet1': {
    title: "Sheet 1",
    data:  createEmptySheet()
    } },
  dataRef,
}: IExcel) => {
  const {
    get: getExcelData,
    ref: refExcelData,
    onChange: onChangeExcelData,
    triggerChange: triggerExcelDataChange,
  } = useReactiveRef<ExcelDataType>(data)
  const [selectedExcelSheet, setSelectedExcelSheet] = useState(
    Object.keys(data)[0],
  )
  const [excelSheets, setExcelSheets] = useState<string[]>(
    Object.keys(getExcelData() || {}),
  )
  const [requestedContextMenu, setRequestContextMenu] = useState<{index: number, key: string} | undefined>(undefined)
  onChangeExcelData((newValue) => {
    setExcelSheets(Object.keys(newValue || {}))
  })
  const onAddSheet = useCallback(() => {
    const numberOfSheets = Object.keys(getExcelData() || {}).length
    if (!refExcelData.current) {
      refExcelData.current = { 'sheet1': {
          title: "Sheet 1",
          data:  createEmptySheet()
        }}
    } else {
      refExcelData.current[`sheet${numberOfSheets + 1}`] = {
        title: `Sheet ${numberOfSheets + 1}`,
        data: createEmptySheet()
      }
    }
    triggerExcelDataChange()
  }, [getExcelData, triggerExcelDataChange, refExcelData])
  const onChangeData = useCallback((sheet: string, data: TextCell[][]) => {
    if (!refExcelData.current) return
    refExcelData.current[sheet].data = data
    if (dataRef) {
      dataRef.current = refExcelData.current
    }
  }, [refExcelData, dataRef])
  const sheetSettingsInput: FormInputItem[] = [
    { label: 'Sheet Name', type: 'text', key: 'sheetName' },
  ].map((item) => ({ isRequired: false, ...item }))

  const onSubmitSheetSettings = (sheetKey?: string, sheetIndex?: number) => async (value: {[p: string] : any}) => {
    if (!sheetKey) return
    if (sheetIndex === undefined) return
    if (refExcelData.current) {
      refExcelData.current[sheetKey].title = value["sheetName"]
    }
    triggerExcelDataChange()
    setRequestContextMenu(undefined)
  }

  const onDeleteSheetSettings = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (requestedContextMenu?.index === 0) {
      setSelectedExcelSheet(Object.keys(refExcelData.current || {})[1])
    } else {
      setSelectedExcelSheet(Object.keys(refExcelData.current || {})[0])
    }
    if (requestedContextMenu?.key && refExcelData.current) {
      delete refExcelData.current[requestedContextMenu.key]
    }
    setExcelSheets(Object.keys(refExcelData.current || {}))
    setRequestContextMenu(undefined)
    e.preventDefault()
  }

  return (
    <>
      <ExcelContainer>
        <div className={'overflow-x-auto overflow-y-auto bg-white flex-1'}>
          <Sheet
            sheet={selectedExcelSheet}
            data={(getExcelData() || {})[selectedExcelSheet].data}
            onChange={onChangeData}
          />
        </div>
        <ExcelButtonContainer>
          {excelSheets.map((item, index) => (
            <ExcelSheetButton
              key={index}
              title={refExcelData?.current?.[item]?.title || ""}
              onClick={() => setSelectedExcelSheet(item)}
              isSheetSelected={selectedExcelSheet === item}
              isLastItem={index === excelSheets.length - 1}
              onContextMenu={(e) => {
                e.preventDefault()
                setRequestContextMenu({
                  index,
                  key: item
                })
              }}
            />
          ))}
          <ExcelSheetAddButton onClick={onAddSheet} />
        </ExcelButtonContainer>
      </ExcelContainer>
      <Modal show={Boolean(requestedContextMenu)} onClickBackground={() => setRequestContextMenu(undefined)}>
        <SuppressedHomePageActionButton
          className="bg-gray-100 text-servian-black hover:bg-gray-200"
          text={'Back'}
          icon={<FontAwesomeIcon icon={faArrowLeft} />}
          onClick={() => setRequestContextMenu(undefined)}
        />
        <Separator padding={16} />
        <h1 className="text-2xl sm:text-4xl font-bold">
          Sheet Settings
        </h1>
        <div className="max-w-[400px] mt-4">
          <Form
            formValues={{sheetName: refExcelData?.current?.[requestedContextMenu?.key || ""]?.title || ""}}
            inputs={sheetSettingsInput}
            handleSubmit={onSubmitSheetSettings(requestedContextMenu?.key, requestedContextMenu?.index)}
            SubmitButton={() => (
              <div className="flex gap-6 justify-start w-full flex-wrap">
                <HomePageActionButton
                  text="Submit"
                  type={'submit'}
                />
                {
                  (Object.keys(refExcelData.current || {}).length > 1) && (
                    <HomePageActionButton
                      type={'button'}
                      className="bg-red-500 hover:bg-red-600"
                      text="Delete"
                      icon={<FontAwesomeIcon icon={faTrash} />}
                      onClick={onDeleteSheetSettings}
                    />
                  )
                }
              </div>
            )}
          />
        </div>
      </Modal>
    </>
  )
}

export default Excel
