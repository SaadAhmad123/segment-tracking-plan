import { SpreadSheetColumn, SSGenericType } from './types'
import { Row, TextCell } from '@silevis/reactgrid'
import exp from 'constants'

/**
 * Maps an array of data objects to an array of rows for a grid component.
 *
 * @param columns - An array of columns containing information about the properties of each data object.
 * @param data - An array of data objects.
 * @param rowNumber - The starting row number for the generated rows. Default is 0.
 * @returns An array of rows representing the given data objects.
 */
export const getRows = <T extends SSGenericType>(
  columns: SpreadSheetColumn<T>[],
  data: T[],
  rowNumber = 0,
) => {
  if (!data.length) return []
  return data.map<Row>((item, index) => ({
    rowId: rowNumber + index,
    cells: columns.map(({ columnId }) => ({
      type: 'text',
      text: item[columnId],
    })),
  }))
}

/**
 * Maps an array of data objects to an array of rows for a grid component, including a header row.
 *
 * @param columns - An array of columns containing information about the properties of each data object.
 * @param data - An array of data objects.
 * @returns An array of rows representing the given data objects, including a header row.
 */
export const getRowsWithHeader = <T extends SSGenericType>(
  columns: SpreadSheetColumn<T>[],
  data: T[],
) => {
  const header = {
    rowId: 'header',
    cells: columns.map((item) => ({
      type: 'header',
      text: item.header,
      className: 'bg-gray-100',
      style: {
        background: '',
      },
    })),
  } as Row
  if (!data.length) return [header] as Row[]
  const rows = getRows(columns, data)
  return [header, ...rows] as Row[]
}

/**
 * Maps an array of rows to an array of data objects.
 *
 * @param columns - An array of columns containing information about the properties of each data object.
 * @param rows - An array of rows containing data.
 * @returns An array of data objects representing the given rows.
 */
export const convertRowsToObjects = <T extends SSGenericType>(
  columns: SpreadSheetColumn<T>[],
  rows: Row[],
) => {
  const objects: T[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (row.rowId === 'header') continue
    const obj = Object.assign(
      {},
      ...columns.map(({ columnId }, index) => {
        return { [columnId]: (row.cells[index] as TextCell).text }
      }),
    )
    objects.push(obj)
  }
  return objects
}

/**
 * Creates a map of column IDs to their corresponding indices in the given array of columns.
 *
 * @param columns - An array of columns containing information about the properties of each data object.
 * @returns A map of column IDs to their corresponding indices in the given array.
 */
export const makeColumnIdMap = <T extends SSGenericType>(
  columns: SpreadSheetColumn<T>[],
) => {
  return Object.assign(
    {},
    ...columns.map((item, index) => ({
      [item.columnId]: index,
    })),
  )
}
