import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  pickSavFileViaSystem,
  supportsFileSystemAccess,
} from '../lib/fileAccess'

type SavFileLoader = (file: File, handle?: FileSystemFileHandle) => Promise<void>
type ErrorSetter = (message: string) => void

interface UseSavFileOpenInput {
  loadFile: SavFileLoader
  setError: ErrorSetter
  picker?: typeof pickSavFileViaSystem
  supportsPicker?: typeof supportsFileSystemAccess
  createFileInput?: () => HTMLInputElement
}

function defaultCreateFileInput() {
  return document.createElement('input')
}

export function useSavFileOpen({
  loadFile,
  setError,
  picker = pickSavFileViaSystem,
  supportsPicker = supportsFileSystemAccess,
  createFileInput = defaultCreateFileInput,
}: UseSavFileOpenInput) {
  const openSavFile = useCallback(async () => {
    try {
      if (supportsPicker()) {
        const result = await picker()
        if (!result) return
        await loadFile(result.file, result.handle)
      } else {
        const input = createFileInput()
        input.type = 'file'
        input.accept = '.sav'
        input.onchange = async () => {
          const file = input.files?.[0]
          if (file) await loadFile(file)
        }
        input.click()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [createFileInput, loadFile, picker, setError, supportsPicker])

  const handleFileDrop = useCallback((files: File[]) => {
    const file = files[0]
    if (file) void loadFile(file)
  }, [loadFile])

  const {
    getRootProps: getLandingDropProps,
    getInputProps: getLandingInputProps,
    isDragActive: isLandingDragActive,
  } = useDropzone({
    onDrop: handleFileDrop,
    accept: { 'application/octet-stream': ['.sav'] },
    noClick: false,
    multiple: false,
  })

  return {
    getLandingDropProps,
    getLandingInputProps,
    handleFileDrop,
    isLandingDragActive,
    openSavFile,
  }
}
