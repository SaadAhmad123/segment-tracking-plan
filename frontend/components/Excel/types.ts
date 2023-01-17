import { TextCell } from '@silevis/reactgrid'

export type ExcelDataCell = TextCell
export type ExcelDataType = {
  [sheet: string]: {
    title: string
    data: ExcelDataCell[][]
  }
}
