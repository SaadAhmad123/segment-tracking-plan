import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ExcelDataCell } from '../types'
import useReactiveRef from '../../../hooks/useReactiveRef'
import {
  CellChange,
  CellLocation,
  Id,
  MenuOption,
  ReactGrid,
  SelectionMode,
  TextCell,
} from '@silevis/reactgrid'
import '@silevis/reactgrid/styles.css'
import safeConsole from '../../../helpers/safeConsole'
import useUndoRedo from '../../../hooks/useUndoRedo'
import {
  createAddColumnsContextMenu,
  createAddRowContextMenu,
  createRemoveColumnsContextMenu,
  getHeader,
  useSheetColumns,
  useSheetRows,
} from './utils'
import Separator from '../../Separator'
import Modal from '../../Modal'

interface ISheet {
  sheet: string
  data: ExcelDataCell[][]
  onChange?: (sheet: string, data: ExcelDataCell[][]) => void
}

const Sheet = ({ data, sheet, onChange }: ISheet) => {
  const {
    get: sheetData,
    set: setSheetData,
    ref: sheetDataRef,
    onChange: onChangeSheetData,
    triggerChange: triggerSheetDataChange,
  } = useReactiveRef<ExcelDataCell[][]>(data)
  useEffect(() => {
    setSheetData(data)
  }, [data])
  const sheetColumns = useSheetColumns(sheetDataRef)
  const sheetRows = useSheetRows(sheetDataRef)
  const [stickyTopRows, setStickyTopRows] = useState(1)

  const [toFormat, setToFormat] = useState<CellLocation[][] | undefined>(
    undefined,
  )

  const { updateUndoStack } = useUndoRedo<ExcelDataCell[][]>({
    onUndo: (updateRedoStack, data) => {
      try {
        updateRedoStack(sheetDataRef.current || [])
        sheetDataRef.current = data
        triggerSheetDataChange()
      } catch (e) {
        safeConsole()?.log(e)
      }
    },
    onRedo: (updateUndoStack, data) => {
      try {
        updateUndoStack(sheetDataRef.current || [], false)
        sheetDataRef.current = data
        triggerSheetDataChange()
      } catch (e) {
        safeConsole()?.log(e)
      }
    },
  })

  onChangeSheetData((newValue) => {
    sheetColumns.notifyDataChange()
    sheetRows.notifyDataChange()
    onChange?.(sheet, newValue || [])
  })

  /**
   * A callback function that is called when a cell is changed.
   * It updates the corresponding cell in `sheetDataRef` with the new value.
   */
  const onCellChanged = useCallback((changes: CellChange[]) => {
    try {
      updateUndoStack(sheetDataRef.current || [])
      for (let i = 0; i < changes.length; i++) {
        const change = changes[i]
        if (!sheetDataRef.current) return
        sheetDataRef.current[change.rowId as number][
          change.columnId as number
        ] = change.newCell as TextCell
      }
      triggerSheetDataChange()
    } catch (e) {
      safeConsole()?.error(e)
    }
  }, [])

  const onClick = {
    addRows: (count: number, anchor: number, rows: ExcelDataCell[][]) => {
      updateUndoStack(sheetDataRef.current || [])
      sheetDataRef.current?.splice(anchor, 0, ...rows)
      triggerSheetDataChange()
    },
    addColumns: (count: number, anchor: number, row: ExcelDataCell[]) => {
      updateUndoStack(sheetDataRef.current || [])
      if (!sheetDataRef.current) return
      sheetDataRef.current = sheetDataRef.current.map((item) => {
        const data = [...item]
        data.splice(anchor, 0, ...row)
        return data
      })
      triggerSheetDataChange()
    },
    removeColumn: (columnIds: number[]) => {
      console.log({ columnIds })
      if (sheetColumns.data.length - 1 === columnIds.length) return
      updateUndoStack(sheetDataRef.current || [])
      if (!sheetDataRef.current) return
      sheetDataRef.current = sheetDataRef.current.map((row) => {
        const newRow = [...row]
        for (let i = columnIds.length - 1; i >= 0; i--) {
          newRow.splice(columnIds[i], 1)
        }
        return newRow
      })
      triggerSheetDataChange()
    },
  }

  /**
   * A callback function that is called when the context menu is opened.
   * It returns the provided menu options.
   */
  const onContextMenu = useCallback(
    (
      selectedRowIds: Id[],
      selectedColIds: Id[],
      selectionMode: SelectionMode,
      menuOptions: MenuOption[],
      selectedRanges: Array<CellLocation[]>,
    ) => {
      return [
        ...menuOptions,
        {
          id: 'format',
          label: 'Format',
          handler: (
            selectedRowIds: Id[],
            selectedColIds: Id[],
            selectionMode: SelectionMode,
            selectedRanges: Array<CellLocation[]>,
          ) => {
            setToFormat(selectedRanges)
          },
        },
        createAddRowContextMenu(
          selectedRanges,
          sheetColumns.data.length - 1,
          'above',
          onClick.addRows,
        ),
        createAddRowContextMenu(
          selectedRanges,
          sheetColumns.data.length - 1,
          'below',
          onClick.addRows,
        ),
        createAddColumnsContextMenu(selectedRanges, 'left', onClick.addColumns),
        createAddColumnsContextMenu(
          selectedRanges,
          'right',
          onClick.addColumns,
        ),
        createRemoveColumnsContextMenu(
          selectedRanges,
          sheetColumns.data.length - 1,
          onClick.removeColumn,
        ),
      ].filter((item) => Boolean(item)) as MenuOption[]
    },
    [],
  )

  const header = useMemo(
    () => getHeader(sheetColumns.data),
    [sheetColumns.data],
  )
  return (
    <>
      <ReactGrid
        columns={sheetColumns.data}
        rows={[
          header,
          ...(sheetRows.data || []).map((item) => {
            return {
              ...item,
              cells:
                item.cells.filter(
                  (item, index) => index < sheetColumns.data.length,
                ) || [],
            }
          }),
        ]}
        stickyTopRows={stickyTopRows}
        stickyLeftColumns={1}
        enableRangeSelection
        onColumnResized={sheetColumns.onColumnResized}
        onCellsChanged={onCellChanged}
        onContextMenu={onContextMenu}
      />
      <Modal
        show={Boolean(toFormat)}
        onClickBackground={() => setToFormat(undefined)}
      >
        <h1 className="text-2xl sm:text-4xl font-bold">Format Cell</h1>
        <Separator />
        <p>{JSON.stringify(toFormat, null, 2)}</p>
      </Modal>
    </>
  )
}

export default Sheet
