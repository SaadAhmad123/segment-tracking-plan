import { CellLocation, MenuOption } from '@silevis/reactgrid'
import { SpreadSheetColumn, SSGenericType } from '../types'
import safeConsole from '../../../helpers/safeConsole'

export const createAddRowsContextMenuItem = <T extends SSGenericType>(
  selectedRanges: Array<CellLocation[]>,
  columns: SpreadSheetColumn<T>[],
  type: 'above' | 'below',
  onClickAddRows?: (count: number, anchorRowId: number, rowsToAdd: T[]) => void,
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
      const _data = []
      for (let i = 0; i < rowsSelected.size; i++) {
        _data.push(Object.assign(
          {},
          ...columns.map((item) => ({ [item.columnId]: '' })),
        ))
      }
      try {
        onClickAddRows?.(
          rowsSelected.size,
          type === 'above' ? earliestRow : latestRow + 1,
          _data,
        )
      } catch (e) {
        safeConsole()?.error(e)
      }
    },
  }
}

export const createDeleteRowsContextMenuItem = () => {}
