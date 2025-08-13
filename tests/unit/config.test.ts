import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { configure, getConfig } from '../../src/runtime/config'

describe('Config Module', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('configure()', () => {
    it('should configure with default values', () => {
      configure()
      const config = getConfig()
      
      expect(config.mode).toBe('local') // Default to local when no API key
      expect(config.endpoint).toBe('https://cloud.withspinal.com')
      expect(config.maxQueueSize).toBe(2048)
      expect(config.maxExportBatchSize).toBe(512)
      expect(config.scheduleDelayMs).toBe(5000)
      expect(config.exportTimeoutMs).toBe(30000)
    })

    it('should configure with custom values', () => {
      configure({
        endpoint: 'https://custom-endpoint.com',
        apiKey: 'test-key'
      })
      const config = getConfig()
      
      expect(config.endpoint).toBe('https://custom-endpoint.com')
    })

    it('should use environment variables', () => {
      process.env.SPINAL_API_KEY = 'env-key'
      process.env.SPINAL_TRACING_ENDPOINT = 'https://env-endpoint.com'
      
      configure()
      const config = getConfig()
      
      expect(config.endpoint).toBe('https://env-endpoint.com')
    })

    it('should set local mode when no API key', () => {
      delete process.env.SPINAL_API_KEY
      
      configure()
      const config = getConfig()
      
      expect(config.mode).toBe('local')
    })
  })

  describe('getConfig()', () => {
    it('should return consistent config', () => {
      configure()
      const config1 = getConfig()
      const config2 = getConfig()
      
      expect(config1).toEqual(config2)
    })

    it('should handle tuning parameters', () => {
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
})
