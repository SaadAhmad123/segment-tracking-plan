import {
  BaseRecordColumns,
  BaseSpreadSheetObj,
  BaseSpreadSheetType,
  SpreadSheetColumn,
} from './types'
import { createList } from './utils'

export type TestRecord = BaseSpreadSheetType & {
  name: string
  age: string
  time: string
  first_name: string
  last_name: string
  created_at: string
}

export const TestRecordColumns: SpreadSheetColumn<TestRecord>[] = [
  {
    header: 'Name',
    columnId: 'name',
  },
  {
    header: 'Age',
    columnId: 'age',
  },
  {
    header: 'Time',
    columnId: 'time',
  },
  {
    header: 'First Name',
    columnId: 'first_name',
  },
  {
    header: 'Last Name',
    columnId: 'last_name',
  },
  {
    header: 'Created At',
    columnId: 'created_at',
  },
  ...BaseRecordColumns,
]

export const createTestRecords = (n = 50) => {
  return createList<TestRecord>(
    {
      name: '',
      age: '',
      time: '',
      first_name: '',
      last_name: '',
      created_at: '',
    },
    n,
  )
}
