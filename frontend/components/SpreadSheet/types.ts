import { Column, Row } from '@silevis/reactgrid'
import React from 'react'

export type SSGenericType = Record<string, any>

export type SpreadSheetColumn<T extends SSGenericType> = Column & {
  header?: string
  columnId: keyof T
}

export type SpreadSheetRef<T extends SSGenericType> = {
  data: T[]
}

export interface ISpreadSheet<T extends SSGenericType> {
  columns: SpreadSheetColumn<T>[]
  data: T[]
  dataRef?: React.MutableRefObject<Array<T>>
}
