import { ExcelDataCell } from '../types'
import {
  Cell,
  CellLocation,
  Column,
  HeaderCell,
  Id,
  MenuOption,
  Row,
  TextCell,
} from '@silevis/reactgrid'
import { MutableRefObject, useEffect, useState } from 'react'
import { useWindowSize } from '../../../hooks/useWindowResize'
import safeConsole from '../../../helpers/safeConsole'

const getColumnName = (colNumber: number): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  let id = ''
  do {
    id += letters[colNumber % letters.length]
    colNumber -= letters.length
  } while (colNumber >= 0)
  return id
}
const getColumns = (data: ExcelDataCell[][], windowWidth: number): Column[] => {
  const cols: Column[] = []
  let numberOfColsRequired = (data[0] || []).length
  let columnWidth = windowWidth / (numberOfColsRequired || 1)
  if (columnWidth < 150) columnWidth = 150
  for (let i = 0; i < numberOfColsRequired; i++) {
    cols.push({
      columnId: i,
      width: columnWidth,
      resizable: true,
    })
  }
  return [
    {
      columnId: '0', // Column for serial number of the rows
      width: 30,
      resizable: false,
    },
    ...cols,
  ]
}
export const getHeader = (columns: Column[]) => {
  return {
    rowId: 'header',
    cells: columns.map<HeaderCell>((item) => ({
      type: 'header',
      text: item.columnId === '0' ? '' : getColumnName(item.columnId as number),
      className: 'bg-gray-100 text-white',
      style: {
        background: '',
        color: '#1B1E1F',
      },
    })),
  } as Row
}
const getRows = (data: ExcelDataCell[][]) => {
  return data.map<Row<Cell>>((dataRow, rowIndex) => {
    return {
      rowId: rowIndex,
      cells: [
        {
          type: 'text',
          text: (rowIndex + 1).toString(),
          nonEditable: true,
          className: 'bg-gray-100',
          style: {
            color: '#1B1E1F',
          },
        },
        ...(dataRow || []).map<TextCell>((item) => ({
          ...item,
          className: 'bg-white',
          nonEditable: false,
          style: {
            color: '#1B1E1F',
          },
        })),
      ] as TextCell[],
    } as Row<Cell>
  })
}
export const useSheetColumns = (
  data: MutableRefObject<ExcelDataCell[][] | undefined>,
) => {
  const window = useWindowSize()
  const [sheetCols, setSheetCols] = useState<Column[]>(
    getColumns(data.current || [], window.innerWidth || 0),
  )
  useEffect(() => {
    setSheetCols(getColumns(data.current || [], window.innerWidth || 0))
  }, [window])
  const notifyDataChange = () => {
    try {
      if ((data.current?.[0] || []).length === sheetCols.length - 1) return
      setSheetCols(getColumns(data.current || [], window.innerWidth || 0))
    } catch (e) {
      safeConsole()?.error(e)
    }
  }
  return {
    data: sheetCols,
    notifyDataChange,
    onColumnResized: (columnId: Id, width: number, selectedColIds: Id[]) => {
      setSheetCols(
        sheetCols.map((item) => {
          if (item.columnId === columnId) return { ...item, width }
          return item
        }),
      )
    },
  }
}
export const useSheetRows = (
  data: MutableRefObject<ExcelDataCell[][] | undefined>,
) => {
  const [sheetRows, setSheetRows] = useState<Row<Cell>[]>(
    getRows(data.current || []),
  )
  const notifyDataChange = () => {
    setSheetRows(getRows(data.current || []))
  }
  return {
    data: sheetRows,
    notifyDataChange,
  }
}
export const createAddRowContextMenu = (
  selectedRanges: Array<CellLocation[]>,
  columnCount: number,
  type: 'above' | 'below',
  onClickAddRows?: (
    count: number,
    anchorRowId: number,
    rowsToAdd: ExcelDataCell[][],
  ) => void,
): MenuOption | undefined => {
  if (selectedRanges.length > 1) return undefined
  const rowsSelected = new Set()
  let earliestRow = Number.MAX_SAFE_INTEGER
  let latestRow = -1
  selectedRanges.forEach((selection) =>
    selection.forEach((item) => {
      if (earliestRow > item.rowId) earliestRow = item.rowId as number
      if (latestRow < item.rowId) latestRow = item.rowId as number
      rowsSelected.add(item.rowId)
    }),
  )
  return {
    id: `add-rows-${type}`,
    label: `Add ${rowsSelected.size} Row(s) ${
      type === 'above' ? 'Above' : 'Below'
    }`,
    handler: () => {
      const row = [] as ExcelDataCell[]
      for (let i = 0; i < columnCount; i++) {
        row.push({ type: 'text', text: '' })
      }
      const data = [] as ExcelDataCell[][]
      for (let i = 0; i < rowsSelected.size; i++) {
        data.push([...row])
      }
      try {
        onClickAddRows?.(
          rowsSelected.size,
          type === 'above' ? earliestRow : latestRow + 1,
          data,
        )
      } catch (e) {
        safeConsole()?.error(e)
      }
    },
  }
}
export const createAddColumnsContextMenu = (
  selectedRanges: Array<CellLocation[]>,
  type: 'left' | 'right',
  onClickAddCols?: (
    count: number,
    anchorRowId: number,
    colsToAdd: ExcelDataCell[],
  ) => void,
): MenuOption | undefined => {
  if (selectedRanges.length > 1) return undefined
  const colsSelected = new Set()
  let earliestCol = Number.MAX_SAFE_INTEGER
  let latestCol = -1
  selectedRanges.forEach((selection) =>
    selection.forEach((item) => {
      if (earliestCol > item.columnId) earliestCol = item.columnId as number
      if (latestCol < item.columnId) latestCol = item.columnId as number
      colsSelected.add(item.columnId)
    }),
  )
  return {
    id: `add-cols-${type}`,
    label: `Add ${colsSelected.size} Column(s) ${
      type === 'left' ? 'Left' : 'Right'
    }`,
    handler: () => {
      const row = [] as ExcelDataCell[]
      for (let i = 0; i < colsSelected.size; i++) {
        row.push({ type: 'text', text: '' } as ExcelDataCell)
      }
      try {
        onClickAddCols?.(
          colsSelected.size,
          type === 'left' ? earliestCol : latestCol + 1,
          row,
        )
      } catch (e) {
        safeConsole()?.error(e)
      }
    },
  }
}

export function createRemoveColumnsContextMenu(
  selectedRanges: Array<CellLocation[]>,
  columnsCount: number,
  onClickRemoveCols?: (columnIds: number[]) => void,
): MenuOption | undefined {
  if (selectedRanges.length > 1) return undefined
  const columnIds = new Set()
  selectedRanges.forEach((selection) =>
    selection.forEach((item) => {
      columnIds.add(item.columnId)
    }),
  )
  if (columnIds.size === columnsCount) return undefined
  return {
    id: `remove-cols`,
    label: `Remove ${columnIds.size} Column(s)`,
    handler: () => {
      try {
        onClickRemoveCols?.(Array.from(columnIds) as number[])
      } catch (e) {
        safeConsole()?.error(e)
      }
    },
  }
}
