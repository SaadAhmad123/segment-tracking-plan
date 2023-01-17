import React from 'react'

interface IExcelSheetButton {
  onClick?: () => void
  title: string
  isLastItem?: boolean
  isSheetSelected?: boolean
  onContextMenu?: React.MouseEventHandler<HTMLButtonElement>
}

export const ExcelSheetButton = ({
  title,
  onClick,
  isSheetSelected,
  isLastItem,
  onContextMenu,
}: IExcelSheetButton) => {
  return (
    <>
      <button
        className={`transition duration-200 min-w-[150px] px-6 py-1 
          text-gray-500 hover:bg-gray-200 ${
          isLastItem ? '' : 'border-r border-r-1 border-gray-300'
        } ${
          isSheetSelected
            ? 'bg-gray-200 border-b-gray-200 border-t-servian-orange'
            : 'bg-gray-100 border-y-gray-100 hover:border-y-gray-200'
        } border-y border-y-4 rounded-none`}
        style={{ marginLeft: 0, marginRight: 0 }}
        title={title}
        onClick={onClick}
        onContextMenu={onContextMenu}
      >
        {title.slice(0, 8)}
        {title.length > 8 ? '...' : ''}
      </button>
    </>
  )
}

interface IExcelSheetAddButton {
  onClick?: () => void
}

export const ExcelSheetAddButton = ({ onClick }: IExcelSheetAddButton) => {
  return (
    <button
      style={{ marginLeft: 0, marginRight: 0 }}
      className={`min-w-[100px] px-6 py-1 bg-servian-orange 
        border-y-servian-orange hover:bg-servian-black 
        hover:border-y-servian-black text-servian-white 
        border-y border-y-4`}
      onClick={onClick}
      title={'Add'}
    >
      Add
    </button>
  )
}
