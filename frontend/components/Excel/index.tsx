import React, { MutableRefObject, useMemo, useState } from 'react'
import useReactiveRef from '../../hooks/useReactiveRef'
import { ExcelDataCell, ExcelDataType } from './types'
import Sheet from './Sheet'
import { useWindowSize } from '../../hooks/useWindowResize'

interface IExcel {
  data?: ExcelDataType
  dataRef?: MutableRefObject<ExcelDataType | undefined>
}

export const createEmptySheet = (rows = 50, cols = 15) => {
  const col: ExcelDataCell[] = []
  for (let i = 0; i < cols; i++) {
    col.push({ text: '', type: 'text' } as ExcelDataCell)
  }
  const data: ExcelDataCell[][] = []
  for (let i = 0; i < rows; i++) {
    data.push([...col])
  }
  return data
}


const Excel = ({ data = { 'Sheet 1': createEmptySheet() }, dataRef }: IExcel) => {
  const windowSize = useWindowSize()
  const { get: getExcelData, ref: refExcelData, onChange: onChangeExcelData, triggerChange: triggerExcelDataChange } =
    useReactiveRef<ExcelDataType>(data)
  const [selectedExcelSheet, setSelectedExcelSheet] = useState(
    Object.keys(data)[0],
  )
  const [excelSheets, setExcelSheets] = useState<string[]>(Object.keys(getExcelData() || {}))

  onChangeExcelData((newValue) => {
    setExcelSheets(Object.keys(newValue || {}))
  })

  const onAddSheet = () => {
    const numberOfSheets = Object.keys(getExcelData() || {}).length
    if (!refExcelData.current) {
      refExcelData.current = {"Sheet 1": createEmptySheet()}
    } else {
      refExcelData.current[`Sheet ${numberOfSheets + 1}`] = createEmptySheet()
    }
    triggerExcelDataChange()
  }

  return (
    <div
      style={{
        height: windowSize?.innerHeight
          ? `${windowSize.innerHeight - 150}px`
          : '100vh',
      }}
      className={`flex flex-col border text-servian-black-dark relative`}
    >
      <div className={"overflow-x-auto overflow-y-auto bg-white flex-1"}>
        <Sheet
          sheet={selectedExcelSheet}
          data={(getExcelData() || {})[selectedExcelSheet]}
          onChange={(sheet, data) => {
            if (!refExcelData.current) return
            refExcelData.current[sheet] = data
            if (dataRef) {
              dataRef.current = refExcelData.current
            }
          }}
        />
      </div>
      <div className={"flex items-center justify-start space-x-4 overflow-x-scroll sticky bottom-0 left-0 w-full bg-white border-t"}>
        {
          excelSheets.map((item, index) => (
            <button
              key={index}
              className={`transition duration-200 min-w-[150px] px-6 py-1 text-gray-500 hover:bg-gray-200 ${index === excelSheets.length - 1 ? "" : "border-r border-r-1 border-gray-300"} ${selectedExcelSheet === item ? "bg-gray-200 border-y-gray-200" : "bg-gray-100 border-y-gray-100"} border-y border-y-4 hover:border-y-gray-200 rounded-none`}
              style={{marginLeft: 0, marginRight: 0}}
              title={item}
              onClick={() => setSelectedExcelSheet(item)}
            >
              {item.slice(0, 8)}{item.length > 8? "..." : ""}
            </button>
          ))
        }
        <button
          key={-1}
          style={{marginLeft: 0, marginRight: 0}}
          className="min-w-[100px] px-6 py-1 bg-servian-orange border-y-servian-orange hover:bg-servian-black hover:border-y-servian-black text-servian-white border-y border-y-4"
          onClick={onAddSheet}
          title={"Add"}
        >
          Add
        </button>
      </div>
    </div>
  )
}

export default Excel
