import { describe, it, expect, beforeEach } from 'vitest'
import { configure, getConfig } from '../../src/runtime/config'
import { tag } from '../../src/runtime/tag'

describe('Runtime Modules', () => {
  beforeEach(() => {
    // Reset configuration before each test
    configure({})
  })

  describe('Config Module', () => {
    it('should export configure function', () => {
      expect(typeof configure).toBe('function')
    })

    it('should export getConfig function', () => {
      expect(typeof getConfig).toBe('function')
    })

    it('should return default config when no configuration is set', () => {
      const config = getConfig()
      expect(config).toHaveProperty('mode')
      expect(config).toHaveProperty('endpoint')
      expect(config).toHaveProperty('maxQueueSize')
      expect(config).toHaveProperty('maxExportBatchSize')
      expect(config).toHaveProperty('scheduleDelayMs')
      expect(config).toHaveProperty('exportTimeoutMs')
    })

    it('should accept configuration options', () => {
      expect(() => configure({ endpoint: 'https://test.com' })).not.toThrow()
    })

    it('should accept empty configuration', () => {
      expect(() => configure({})).not.toThrow()
    })

    it('should set mode to local when no API key is provided', () => {
      configure({})
      const config = getConfig()
      expect(config.mode).toBe('local')
    })



    it('should accept custom endpoint', () => {
      configure({ endpoint: 'https://custom.com' })
      const config = getConfig()
      expect(config.endpoint).toBe('https://custom.com')
    })

    it('should accept tuning parameters', () => {
      configure({ 
        maxQueueSize: 1000,
        maxExportBatchSize: 100,
        scheduleDelayMs: 1000,
        exportTimeoutMs: 5000
      })
      const config = getConfig()
      expect(config.maxQueueSize).toBe(1000)
      expect(config.maxExportBatchSize).toBe(100)
      expect(config.scheduleDelayMs).toBe(1000)
      expect(config.exportTimeoutMs).toBe(5000)
    })
  })

  describe('Tag Module', () => {
    it('should export tag function', () => {
      expect(typeof tag).toBe('function')
    })

    it('should return an object with dispose method', () => {
      const result = tag({ aggregationId: 'test' })
      expect(typeof result.dispose).toBe('function')
    })

    it('should handle empty attributes', () => {
      const result = tag({})
      expect(typeof result.dispose).toBe('function')
    })

    it('should handle spinal.* attributes', () => {
      const result = tag({ 
        'spinal.aggregationId': 'test',
        'spinal.tenant': 'acme'
      })
      expect(typeof result.dispose).toBe('function')
    })

    it('should handle non-spinal attributes', () => {
      const result = tag({ 
        'custom.attribute': 'value'
      })
      expect(typeof result.dispose).toBe('function')
    })

    it('should handle mixed attributes', () => {
      const result = tag({ 
        'spinal.aggregationId': 'test',
        'custom.attribute': 'value'
      })
      expect(typeof result.dispose).toBe('function')
    })

    it('should handle dispose method', () => {
      const result = tag({ aggregationId: 'test' })
      expect(() => result.dispose()).not.toThrow()
    })
  })
})
