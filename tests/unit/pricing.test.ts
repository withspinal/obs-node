import { describe, it, expect } from 'vitest'
import { estimateCost } from '../../src/pricing'

describe('Pricing Calculator', () => {
  it('should calculate cost for gpt-4o-mini', () => {
    const cost = estimateCost({
      model: 'openai:gpt-4o-mini',
      inputTokens: 1000,
      outputTokens: 500,
    })

    // (1000/1000 * 0.15) + (500/1000 * 0.60) = 0.15 + 0.30 = 0.45
    expect(cost).toBe(0.45)
  })

  it('should calculate cost for gpt-4o', () => {
    const cost = estimateCost({
      model: 'openai:gpt-4o',
      inputTokens: 1000,
      outputTokens: 500,
    })

    // (1000/1000 * 2.50) + (500/1000 * 10.00) = 2.50 + 5.00 = 7.50
    expect(cost).toBe(7.50)
  })

  it('should use default model when not specified', () => {
    const cost = estimateCost({
      inputTokens: 1000,
      outputTokens: 500,
    })

    // Should default to gpt-4o-mini
    expect(cost).toBe(0.45)
  })

  it('should handle zero tokens', () => {
    const cost = estimateCost({
      model: 'openai:gpt-4o-mini',
      inputTokens: 0,
      outputTokens: 0,
    })

    expect(cost).toBe(0)
  })

  it('should handle unknown model gracefully', () => {
    const cost = estimateCost({
      model: 'unknown:model',
      inputTokens: 1000,
      outputTokens: 500,
    })

    // Should fall back to default (gpt-4o-mini)
    expect(cost).toBe(0.45)
  })

  it('should round to 4 decimal places', () => {
    const cost = estimateCost({
      model: 'openai:gpt-4o-mini',
      inputTokens: 333,
      outputTokens: 333,
    })

    // (333/1000 * 0.15) + (333/1000 * 0.60) = 0.04995 + 0.1998 = 0.24975
    // Should round to 0.2498
    expect(cost).toBe(0.2498)
  })
})
