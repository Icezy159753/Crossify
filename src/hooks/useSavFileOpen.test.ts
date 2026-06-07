/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSavFileOpen } from './useSavFileOpen'

function savFile(name = 'fixture.sav') {
  return new File(['sav'], name, { type: 'application/octet-stream' })
}

describe('useSavFileOpen', () => {
  it('loads a picked file through the File System Access path', async () => {
    const file = savFile()
    const handle = {} as FileSystemFileHandle
    const loadFile = vi.fn(async () => undefined)
    const { result } = renderHook(() => useSavFileOpen({
      loadFile,
      setError: vi.fn(),
      supportsPicker: () => true,
      picker: async () => ({ file, handle }),
    }))

    await act(async () => {
      await result.current.openSavFile()
    })

    expect(loadFile).toHaveBeenCalledWith(file, handle)
  })

  it('loads dropped files and ignores empty drops', () => {
    const file = savFile()
    const loadFile = vi.fn(async () => undefined)
    const { result } = renderHook(() => useSavFileOpen({
      loadFile,
      setError: vi.fn(),
      supportsPicker: () => false,
    }))

    act(() => result.current.handleFileDrop([]))
    expect(loadFile).not.toHaveBeenCalled()

    act(() => result.current.handleFileDrop([file]))
    expect(loadFile).toHaveBeenCalledWith(file)
  })

  it('reports picker errors without throwing', async () => {
    const setError = vi.fn()
    const { result } = renderHook(() => useSavFileOpen({
      loadFile: vi.fn(async () => undefined),
      setError,
      supportsPicker: () => true,
      picker: async () => {
        throw new Error('Picker failed')
      },
    }))

    await act(async () => {
      await result.current.openSavFile()
    })

    expect(setError).toHaveBeenCalledWith('Picker failed')
  })
})
