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

export type BaseSpreadSheetType = {
  A?: string
  B?: string
  C?: string
  D?: string
  E?: string
  F?: string
  G?: string
  H?: string
  I?: string
  J?: string
  K?: string
  L?: string
  M?: string
  N?: string
  O?: string
  P?: string
  Q?: string
  R?: string
  S?: string
  T?: string
  U?: string
  V?: string
  W?: string
  X?: string
  Y?: string
  Z?: string
}

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
export const BaseRecordColumns: SpreadSheetColumn<BaseSpreadSheetType>[] =
  letters.split('').map((letter) => ({
    header: letter,
    columnId: letter as keyof BaseSpreadSheetType,
  }))
export const BaseSpreadSheetObj: BaseSpreadSheetType = Object.fromEntries(
  letters.split('').map((letter) => [letter, '']),
)
