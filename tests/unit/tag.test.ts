import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { tag } from '../../src/runtime/tag'

// Mock OpenTelemetry API
vi.mock('@opentelemetry/api', () => ({
  context: {
    active: vi.fn(() => ({})),
    with: vi.fn((ctx, fn) => fn())
  },
  propagation: {
    getBaggage: vi.fn(() => ({
      setAll: vi.fn(),
      getAllEntries: vi.fn(() => [])
    })),
    setBaggage: vi.fn()
  }
}))

describe('Tag Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('tag()', () => {
    it('should export tag function', () => {
      expect(typeof tag).toBe('function')
    })

    it('should create a tag with dispose method', () => {
      const result = tag({ aggregationId: 'test' })
      expect(typeof result.dispose).toBe('function')
    })

    it('should handle empty attributes', () => {
      const result = tag({})
      expect(result).toHaveProperty('dispose')
    })

    it('should handle spinal.* attributes', () => {
      const { propagation } = require('@opentelemetry/api')
      const mockBaggage = {
        setAll: vi.fn(),
        getAllEntries: vi.fn(() => [])
      }
      propagation.getBaggage.mockReturnValue(mockBaggage)

      const result = tag({ 
        'spinal.aggregationId': 'test',
        'spinal.tenant': 'acme'
      })

      expect(result).toHaveProperty('dispose')
      expect(mockBaggage.setAll).toHaveBeenCalled()
    })

    it('should handle non-spinal attributes', () => {
      const { propagation } = require('@opentelemetry/api')
      const mockBaggage = {
        setAll: vi.fn(),
        getAllEntries: vi.fn(() => [])
      }
      propagation.getBaggage.mockReturnValue(mockBaggage)

      const result = tag({ 
        'custom.attribute': 'value'
      })

      expect(result).toHaveProperty('dispose')
      expect(mockBaggage.setAll).toHaveBeenCalled()
    })

    it('should handle mixed attributes', () => {
      const { propagation } = require('@opentelemetry/api')
      const mockBaggage = {
        setAll: vi.fn(),
        getAllEntries: vi.fn(() => [])
      }
      propagation.getBaggage.mockReturnValue(mockBaggage)

      const result = tag({ 
        'spinal.aggregationId': 'test',
        'custom.attribute': 'value'
      })

      expect(result).toHaveProperty('dispose')
      expect(mockBaggage.setAll).toHaveBeenCalled()
    })

    it('should handle dispose method', () => {
      const result = tag({ aggregationId: 'test' })
      expect(() => result.dispose()).not.toThrow()
    })
  })
})
