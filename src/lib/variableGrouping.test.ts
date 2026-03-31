import { describe, expect, it } from 'vitest'
import { buildVariableCatalog, getGroupedSelections } from './variableGrouping'
import type { SpssVariable } from './savParser'

function numericVar(
  name: string,
  valueLabels: Record<string, string>,
  label = name,
): SpssVariable {
  return {
    name,
    longName: name,
    label,
    valueLabels,
    isString: false,
    stringLength: 0,
    slotCount: 1,
    dictIndex: 1,
  }
}

describe('variableGrouping', () => {
  it('normalizes aggregate-by-code labels so SPSS-style decimal keys still match raw case values', () => {
    const variables = [
      numericVar('QUOTA_SUMZ1$1', {
        '1.00000000': 'Random A',
        '2.00000000': 'Random B',
      }, '*quota_sum'),
      numericVar('QUOTA_SUMZ1$2', {
        '3.00000000': 'Random C',
        '4.00000000': 'Random D',
      }, '*quota_sum'),
    ]

    const catalog = buildVariableCatalog(variables, [
      {
        groupName: 'QUOTA_SUMZ1_O',
        label: '*quota_sum',
        members: ['QUOTA_SUMZ1$1', 'QUOTA_SUMZ1$2'],
      },
    ])

    const grouped = catalog.groupedByName.get('QUOTA_SUMZ1_O')
    expect(grouped).toBeDefined()
    expect(grouped?.options.map(option => option.valueCode)).toEqual(['1', '2', '3', '4'])

    const selected = getGroupedSelections(grouped!, {
      'QUOTA_SUMZ1$1': 1,
      'QUOTA_SUMZ1$2': 4,
    })

    expect(selected).toEqual(['1. Random A', '4. Random D'])
  })

  it('treats shared 0/1-style member codes as a dichotomy set instead of aggregating by code', () => {
    const variables = [
      numericVar('Q1$1', { '0': 'No', '1': 'Yes' }, 'Can'),
      numericVar('Q1$2', { '0': 'No', '1': 'Yes' }, 'Cup'),
      numericVar('Q1$3', { '0': 'No', '1': 'Yes' }, 'Pouch'),
      numericVar('Q1', { '1': 'Can', '2': 'Cup', '3': 'Pouch' }, 'Q1'),
    ]

    const catalog = buildVariableCatalog(variables)
    const grouped = catalog.groupedByName.get('Q1_O')
    expect(grouped).toBeDefined()
    expect(grouped?.aggregateByCode).toBe(false)
    expect(grouped?.options.map(option => option.label)).toEqual(['1. Can', '2. Cup', '3. Pouch'])
  })

  it('includes observed raw codes for category sets even when SAV labels are incomplete', () => {
    const variables = [
      numericVar('Q86A$1', { '1': 'Can', '2': 'Cup', '3': 'Pouch', '4': 'Tray', '5': 'Other' }, 'Q86A'),
      numericVar('Q86A$2', { '1': 'Can', '2': 'Cup', '3': 'Pouch', '4': 'Tray', '5': 'Other' }, 'Q86A'),
      numericVar('Q86A$3', { '1': 'Can', '2': 'Cup', '3': 'Pouch', '4': 'Tray', '5': 'Other' }, 'Q86A'),
    ]

    const catalog = buildVariableCatalog(variables, [], [
      { 'Q86A$1': 27, 'Q86A$2': 20, 'Q86A$3': '' },
      { 'Q86A$1': 19, 'Q86A$2': '', 'Q86A$3': 23 },
    ])

    const grouped = catalog.groupedByName.get('Q86A_O')
    expect(grouped).toBeDefined()
    expect(grouped?.aggregateByCode).toBe(true)
    expect(grouped?.options.map(option => option.valueCode)).toEqual(['1', '2', '3', '4', '5', '19', '20', '23', '27'])
  })
})
