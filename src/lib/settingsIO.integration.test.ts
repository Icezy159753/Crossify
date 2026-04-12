/**
 * Integration tests for settingsIO.ts — roundtrip save/load with real ExcelJS.
 *
 * Uses jsdom so that `File` / `Blob` globals are available.
 *
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { buildSettingsWorkbookBuffer, loadSettings } from './settingsIO'
import type { SettingsWorkbookPayload, AllSettings } from './settingsIO'

// ─── helpers ─────────────────────────────────────────────────────────────────

function makePayload(overrides: Partial<SettingsWorkbookPayload> = {}): SettingsWorkbookPayload {
  return {
    tables: [
      { name: 'T1', rowVar: 'Q1', colVar: 'GENDER', folderId: null },
      { name: 'T2', rowVar: 'Q2', colVar: 'AGE',    folderId: 'f1' },
    ],
    folders: [
      { id: 'f1', name: 'Demographics' },
    ],
    output: { showCount: true, showPercent: false, percentType: 'column', hideZeroRows: false },
    variableOverrides: {},
    detectedMrsets: [],
    sourceMappings: [],
    activeLock: null,
    ...overrides,
  }
}

async function roundtrip(payload: SettingsWorkbookPayload): Promise<AllSettings> {
  const buffer = await buildSettingsWorkbookBuffer(payload)
  const file = new File([buffer], 'settings.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  return loadSettings(file)
}

// ─── basic roundtrip ──────────────────────────────────────────────────────────

describe('buildSettingsWorkbookBuffer + loadSettings roundtrip', () => {
  it('restores tables name, rowVar, colVar', async () => {
    const settings = await roundtrip(makePayload())
    expect(settings.tables).toHaveLength(2)
    expect(settings.tables[0].name).toBe('T1')
    expect(settings.tables[0].rowVar).toBe('Q1')
    expect(settings.tables[0].colVar).toBe('GENDER')
  })

  it('restores output settings', async () => {
    const settings = await roundtrip(makePayload({
      output: { showCount: false, showPercent: true, percentType: 'row', hideZeroRows: true },
    }))
    expect(settings.output.showCount).toBe(false)
    expect(settings.output.showPercent).toBe(true)
    expect(settings.output.percentType).toBe('row')
    expect(settings.output.hideZeroRows).toBe(true)
  })

  it('restores sourceDataset', async () => {
    const settings = await roundtrip(makePayload({
      sourceDataset: { fileName: 'survey.sav', filePath: 'C:\\data\\survey.sav' },
    }))
    expect(settings.sourceDataset?.fileName).toBe('survey.sav')
    expect(settings.sourceDataset?.filePath).toBe('C:\\data\\survey.sav')
  })

  it('restores variableOverrides labels via hidden sheet', async () => {
    const settings = await roundtrip(makePayload({
      variableOverrides: {
        Q1: { labels: { '1': 'Agree', '2': 'Disagree' }, weights: {}, order: [], numericStats: [], groups: [], summaries: [] },
      },
    }))
    const labels = (settings.variableOverrides?.Q1 as { labels: Record<string, string> })?.labels
    expect(labels?.['1']).toBe('Agree')
    expect(labels?.['2']).toBe('Disagree')
  })

  it('restores version as 1.9', async () => {
    const settings = await roundtrip(makePayload())
    expect(settings.version).toBe('1.9')
  })

  it('restores activeLock when provided', async () => {
    const lock = {
      sessionId: 'sess-1',
      ownerLabel: 'Alice',
      status: 'ACTIVE' as const,
      acquiredAt: '2026-04-12T00:00:00Z',
      updatedAt:  '2026-04-12T00:00:00Z',
      expiresAt:  '2026-04-12T01:00:00Z',
    }
    const settings = await roundtrip(makePayload({ activeLock: lock }))
    expect(settings.activeLock?.sessionId).toBe('sess-1')
    expect(settings.activeLock?.ownerLabel).toBe('Alice')
  })

  it('restores detectedMrsets via hidden sheet', async () => {
    const mrsets = [{ groupName: 'Q8$', label: 'Q8 MA group', members: ['Q8$1', 'Q8$2'] }]
    const settings = await roundtrip(makePayload({ detectedMrsets: mrsets }))
    const found = settings.customMrsets?.find(m => m.groupName === 'Q8$')
    expect(found?.members).toEqual(['Q8$1', 'Q8$2'])
  })

  it('restores sourceMappings', async () => {
    const mappings = [{
      id: 'path:c:/data/survey.sav',
      fileName: 'survey.sav',
      filePath: 'C:/data/survey.sav',
      lastBoundAt: '2026-04-01T00:00:00Z',
      lastBoundBy: 'Alice',
    }]
    const settings = await roundtrip(makePayload({ sourceMappings: mappings }))
    expect(settings.sourceMappings?.length).toBeGreaterThanOrEqual(1)
    expect(settings.sourceMappings?.[0].fileName).toBe('survey.sav')
  })

  it('table with filter description survives roundtrip', async () => {
    const settings = await roundtrip(makePayload({
      tables: [{
        name: 'Filtered',
        rowVar: 'Q1',
        colVar: 'GENDER',
        folderId: null,
        filter: { description: 'Male respondents', rootJoin: 'all', groups: [] },
      }],
    }))
    expect(settings.tables[0].filter?.description).toBe('Male respondents')
  })
})
