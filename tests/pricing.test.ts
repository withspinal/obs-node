import { describe, it, expect } from 'vitest'
import { estimateCost } from '../src/pricing'

describe('pricing.estimateCost', () => {
  it('computes combined input+output cost', () => {
    const cost = estimateCost({ model: 'openai:gpt-4o-mini', inputTokens: 1000, outputTokens: 1000 })
    expect(cost).toBeGreaterThan(0)
  })

  it('defaults to gpt-4o-mini when model missing', () => {
    const cost = estimateCost({ inputTokens: 2000, outputTokens: 0 })
    expect(cost).toBeCloseTo(0.3, 3)
  })
})


