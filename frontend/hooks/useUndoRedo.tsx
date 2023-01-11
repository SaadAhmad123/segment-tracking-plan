import { useCallback, useRef } from 'react'
import useKeyboard from './useKeyboard'

interface IUseUndoRedo<T> {
  onUndo?: (updateRedoStack: (data: T) => void, data: T) => void
  onRedo?: (
    updateUndoStack: (data: T, clearRedoStack: boolean) => void,
    data: T,
  ) => void
}

/**
 * useUndoRedo is a hook that provides undo [(Cmd | Ctrl) + Z]/redo [(Shift + (Cmd | Ctrl) + Z)]
 * functionality by listening for
 * keyboard events and calling the provided `onUndo` and `onRedo` functions if the
 * corresponding event occurs.
 *
 * @param options
 * @param options.onUndo - A function that is called when the undo event occurs.
 * @param options.onRedo - A function that is called when the redo event occurs.
 *
 * @returns An object with the following functions:
 *
 * - `updateUndoStack`: a function that updates the undo stack with the provided data.
 * - `updateRedoStack`: a function that updates the redo stack with the provided data.
 */
function useUndoRedo<T>({ onRedo, onUndo }: IUseUndoRedo<T>) {
  const undoRef = useRef<string[]>([])
  const redoRef = useRef<string[]>([])

  const updateUndoStack = useCallback(
    (data: T, clearRedoStack = true) => {
      undoRef.current.push(JSON.stringify(data))
      if (undoRef.current.length >= 100) {
        undoRef.current.splice(0, 10)
      }
      if (clearRedoStack) redoRef.current = []
    },
    [undoRef, redoRef],
  )

  const updateRedoStack = useCallback(
    (data: T) => {
      redoRef.current.push(JSON.stringify(data))
      if (redoRef.current.length >= 100) {
        redoRef.current.splice(0, 10)
      }
    },
    [undoRef, redoRef],
  )

  // On Undo
  useKeyboard({
    condition: (event) =>
      !event.shiftKey &&
      (event.ctrlKey || event.metaKey) &&
      event.code === 'KeyZ',
    action: () => {
      if (undoRef.current.length === 0) return
      const data = JSON.parse(undoRef.current.pop() || '[]') as T
      onUndo?.(updateRedoStack, data)
    },
  })

  // On Redo
  useKeyboard({
    condition: (event) =>
      event.shiftKey &&
      (event.ctrlKey || event.metaKey) &&
      event.code === 'KeyZ',
    action: () => {
      if (redoRef.current.length === 0) return
      const data = JSON.parse(redoRef.current.pop() || '') as T
      onRedo?.(updateUndoStack, data)
    },
  })

  return {
    updateUndoStack,
    updateRedoStack,
  }
}

export default useUndoRedo
