import { SpreadSheetColumn } from './types'

export type TestRecord = {
  name: string
  age: string
  time: string
  first_name: string
  last_name: string
  created_at: string
  [p: string]: string
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
]

export const createTestRecords = (n = 2) => {
  const records: TestRecord[] = []
  for (let i = 0; i < n; i++) {
    records.push({
      name: `string${i}`,
      age: `string${i}`,
      time: `string${i}`,
      first_name: `string${i}`,
      last_name: `string${i}`,
      created_at: `string${i}`,
    })
  }
  return records
}
