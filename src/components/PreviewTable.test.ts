/**
 * @vitest-environment jsdom
 */
import { createElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { PreviewTable } from './PreviewTable'
import type { CrosstabConfig, CrosstabResult } from '../lib/crosstabEngine'

const config: CrosstabConfig = {
  rowVar: 'row',
  colVar: 'col',
  showCount: true,
  showPercent: true,
  percentType: 'column',
}

function makeResult(rowValues: string[]): CrosstabResult {
  return {
    rowVar: 'row',
    colVar: 'col',
    rowLabel: 'Row',
    colLabel: 'Col',
    rowValues,
    colValues: ['A'],
    rowTypes: rowValues.map(() => 'data'),
    rowPaths: rowValues.map(value => [value]),
    colPaths: [['A']],
    counts: rowValues.map((_, index) => [index + 1]),
    rowTotalsN: rowValues.map((_, index) => index + 1),
    colTotalsN: [rowValues.length * (rowValues.length + 1) / 2],
    grandTotal: rowValues.length * (rowValues.length + 1) / 2,
  }
}

function preview(result: CrosstabResult) {
  return createElement(PreviewTable, { result, config })
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('PreviewTable row keys', () => {
  it('rerenders duplicate row labels without React key collisions', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const first = makeResult(['เจน', 'เจน'])
    const second = makeResult(['GBKK', 'Net : UPC', 'ภาคเหนือ'])

    const { rerender, queryAllByText, getByText } = render(preview(first))
    expect(queryAllByText('เจน').length).toBeGreaterThan(0)

    rerender(preview(second))

    expect(queryAllByText('เจน')).toHaveLength(0)
    expect(getByText('GBKK')).toBeTruthy()
    const errorText = consoleError.mock.calls.flat().map(String).join('\n')
    expect(errorText).not.toContain('Encountered two children with the same key')
  })
})
