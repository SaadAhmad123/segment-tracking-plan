import { ExcelDataCell } from './types'

export const createEmptySheet = (rows = 100, cols = 25) => {
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
