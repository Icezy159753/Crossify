import { describe, expect, it } from 'vitest'

import { yieldToBrowser } from './browserScheduler'

describe('yieldToBrowser', () => {
  it('resolves in non-browser test environments', async () => {
    await expect(yieldToBrowser()).resolves.toBeUndefined()
  })
})
