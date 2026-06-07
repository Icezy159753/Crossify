import { beforeEach, describe, expect, it, vi } from 'vitest'

const { parseSav, applyValueLabels } = vi.hoisted(() => ({
  parseSav: vi.fn(),
  applyValueLabels: vi.fn(),
}))

vi.mock('./savParser', () => ({
  parseSav,
  applyValueLabels,
}))

import { LIGHT_LOAD_THRESHOLD_BYTES, loadSavDatasetFromFile } from './savLoadWorkflow'

describe('loadSavDatasetFromFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    parseSav.mockResolvedValue({
      variables: [{ name: 'Q1', label: 'Question 1' }],
      cases: [{ Q1: 1 }],
      meta: { caseCount: 1 },
    })
    applyValueLabels.mockReturnValue([{ Q1: 'Yes' }])
  })

  it('parses a file, applies value labels, and returns the labeled dataset', async () => {
    const file = new File(['x'], 'sample.sav')

    const result = await loadSavDatasetFromFile(file)

    expect(parseSav).toHaveBeenCalledWith(file, undefined)
    expect(applyValueLabels).toHaveBeenCalledWith([{ Q1: 1 }], [{ name: 'Q1', label: 'Question 1' }])
    expect(result).toEqual({
      lightLoadMode: false,
      dataset: {
        variables: [{ name: 'Q1', label: 'Question 1' }],
        cases: [{ Q1: 'Yes' }],
        meta: { caseCount: 1 },
      },
    })
  })

  it('enables light load mode for files above the threshold', async () => {
    const file = new File(['large'], 'large.sav')

    const result = await loadSavDatasetFromFile(file, { lightLoadThresholdBytes: 1 })

    expect(parseSav).toHaveBeenCalledWith(file, undefined)
    expect(result.lightLoadMode).toBe(true)
  })

  it('forwards parser progress events', async () => {
    const onProgress = vi.fn()
    const file = new File(['x'], 'sample.sav')

    await loadSavDatasetFromFile(file, { onProgress })

    expect(parseSav).toHaveBeenCalledWith(file, onProgress)
  })

  it('uses the shared production light-load threshold by default', async () => {
    const file = new File(['x'], 'sample.sav')

    await loadSavDatasetFromFile(file)

    expect(LIGHT_LOAD_THRESHOLD_BYTES).toBe(150 * 1024 * 1024)
  })
})
