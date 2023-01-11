import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  CellChange,
  CellLocation,
  Column,
  Id,
  MenuOption,
  ReactGrid,
  SelectionMode,
  TextCell,
} from '@silevis/reactgrid'
import '@silevis/reactgrid/styles.css'
import { ISpreadSheet, SpreadSheetColumn, SSGenericType } from './types'
import { getRowsWithHeader, makeColumnIdMap } from './utils'
import useReactiveRef from '../../hooks/useReactiveRef'
import safeConsole from '../../helpers/safeConsole'
import { useWindowSize } from '../../hooks/useWindowResize'
import { createAddRowsContextMenuItem } from './ContextMenuItems'
import useUndoRedo from '../../hooks/useUndoRedo'
import Modal from '../Modal'
import Separator from '../Separator'

const attachSerialNumberToSheetColumns = <T extends SSGenericType>(
  sheetColumns: SpreadSheetColumn<T>[],
) => {
  return [
    {
      header: '',
      columnId: 'sr',
      resizable: false,
      reorderable: false,
      width: 30,
    },
    ...sheetColumns,
  ] as SpreadSheetColumn<T>[]
}

/**
 SpreadSheet is a component that displays a grid of data where the user can
 edit, select, and perform actions on the cells and rows.
 @param columns - An array of objects representing the columns of the grid.
 Each object should have at least the properties id and name.
 @param data - An array of objects representing the rows of the grid.
 Each object should have a property for each of the columns in the columns
 parameter.
 @param dataRef
 @returns {JSX.Element} A react element representing the grid.
 */
const SpreadSheet = <T extends SSGenericType>({
  columns,
  data,
  dataRef,
}: ISpreadSheet<T>) => {
  const windowSize = useWindowSize()
  const [sheetRows, setSheetRows] = useState(
    getRowsWithHeader(attachSerialNumberToSheetColumns<T>(columns), data),
  )
  const [sheetColumns, setSheetColumns] = useState(
    attachSerialNumberToSheetColumns<T>(
      columns.map((item) => ({ ...item, resizable: true })),
    ),
  )
  const [toFormat, setToFormat] = useState<CellLocation[][] | undefined>(
    undefined,
  )
  // A memoized map that maps column IDs to column indices.
  const columnIndexMap = useMemo(
    () => makeColumnIdMap(attachSerialNumberToSheetColumns(columns)),
    [columns],
  )

  const updateDataRef = (data: T[] | undefined) => {
    if (!dataRef) return
    dataRef.current = data || []
  }

  const { ref: sheetDataRef, triggerChange: sheetDataRefTriggerChange } =
    useReactiveRef<T[]>(
      data,
      (newValue) => {
        setSheetRows(
          getRowsWithHeader(
            attachSerialNumberToSheetColumns(columns),
            newValue || [],
          ),
        )
        updateDataRef(newValue)
      },
      updateDataRef,
    )

  const { updateUndoStack } = useUndoRedo<T[]>({
    onUndo: (updateRedoStack, data) => {
      updateRedoStack(sheetDataRef.current || [])
      sheetDataRef.current = data
      sheetDataRefTriggerChange()
    },
    onRedo: (updateUndoStack, data) => {
      updateUndoStack(sheetDataRef.current || [], false)
      sheetDataRef.current = data
      sheetDataRefTriggerChange()
    },
  })

  /**
   * A callback function that is called when a cell is changed.
   * It updates the corresponding cell in `sheetDataRef` with the new value.
   */
  const onCellChanged = useCallback(
    (changes: CellChange[]) => {
      updateUndoStack(sheetDataRef.current || [])
      console.log(changes)
      for (let i = 0; i < changes.length; i++) {
        const change = changes[i]
        const rowIdx = change.rowId as number
        try {
          if (!sheetDataRef.current) return
          // @ts-ignore
          sheetDataRef.current[rowIdx][change.columnId as string] = (
            change.newCell as TextCell
          ).text
          sheetDataRefTriggerChange()
        } catch (e) {
          safeConsole()?.error(e)
        }
      }
    },
    [columns, columnIndexMap],
  )

  const onClick = {
    addRows: (count: number, anchor: number, rows: T[]) => {
      updateUndoStack(sheetDataRef.current || [])
      sheetDataRef.current?.splice(anchor, 0, ...rows)
      sheetDataRefTriggerChange()
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
        createAddRowsContextMenuItem(
          selectedRanges,
          sheetColumns,
          'above',
          onClick.addRows,
        ),
        createAddRowsContextMenuItem(
          selectedRanges,
          sheetColumns,
          'below',
          onClick.addRows,
        ),
      ].filter((item) => Boolean(item)) as MenuOption[]
    },
    [],
  )

  return (
    <div
      style={{
        height: windowSize?.innerHeight
          ? `${windowSize.innerHeight - 150}px`
          : '100vh',
      }}
      className={`overflow-x-auto overflow-y-auto bg-white border text-servian-black-dark`}
    >
      <ReactGrid
        columns={sheetColumns}
        rows={sheetRows}
        onCellsChanged={onCellChanged}
        stickyTopRows={1}
        stickyLeftColumns={1}
        enableFullWidthHeader
        enableRangeSelection
        onContextMenu={onContextMenu}
        onColumnResized={(columnId, width) => {
          const cols = sheetColumns.map((item) => {
            if (item.columnId === columnId) {
              return { ...item, width }
            }
            return item
          })
          setSheetColumns(cols)
        }}
        enableColumnSelection
      />
      <Modal
        show={Boolean(toFormat)}
        onClickBackground={() => setToFormat(undefined)}
      >
        <h1 className="text-2xl sm:text-4xl font-bold">Format Cell</h1>
        <Separator />
        <p>{JSON.stringify(toFormat, null, 2)}</p>
      </Modal>
    </div>
  )
}

export default SpreadSheet
