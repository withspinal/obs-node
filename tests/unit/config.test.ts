import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { configure, getConfig } from '../../src/runtime/config'
import path from 'path'

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
      // Clear test environment variables for this test
      delete process.env.SPINAL_MODE
      delete process.env.SPINAL_LOCAL_STORE_PATH
      
      configure()
      const config = getConfig()
      
      expect(config.mode).toBe('local') // Default to local when no API key
      expect(config.endpoint).toBe('https://cloud.withspinal.com')
      expect(config.maxQueueSize).toBe(2048)
      expect(config.maxExportBatchSize).toBe(512)
      expect(config.scheduleDelayMs).toBe(5000)
      expect(config.exportTimeoutMs).toBe(30000)
      expect(config.disableLocalMode).toBe(false)
      expect(config.localStorePath).toBe(path.join(process.cwd(), '.spinal', 'spans.jsonl'))
    })

    it('should configure with custom values', () => {
      // Clear test environment variables for this test
      delete process.env.SPINAL_MODE
      delete process.env.SPINAL_LOCAL_STORE_PATH
      
      configure({
        endpoint: 'https://custom-endpoint.com',
        apiKey: 'test-key'
      })
      const config = getConfig()
      
      expect(config.endpoint).toBe('https://custom-endpoint.com')
      expect(config.apiKey).toBe('test-key')
      expect(config.mode).toBe('cloud')
    })

    it('should use environment variables', () => {
      // Clear test environment variables for this test
      delete process.env.SPINAL_MODE
      delete process.env.SPINAL_LOCAL_STORE_PATH
      
      process.env.SPINAL_API_KEY = 'env-key'
      process.env.SPINAL_TRACING_ENDPOINT = 'https://env-endpoint.com'
      
      configure()
      const config = getConfig()
      
      expect(config.endpoint).toBe('https://env-endpoint.com')
      expect(config.apiKey).toBe('env-key')
      expect(config.mode).toBe('cloud')
    })

    it('should set local mode when no API key', () => {
      delete process.env.SPINAL_API_KEY
      
      configure()
      const config = getConfig()
      
      expect(config.mode).toBe('local')
    })

    it('should handle disableLocalMode option', () => {
      // Clear test environment variables for this test
      delete process.env.SPINAL_MODE
      delete process.env.SPINAL_LOCAL_STORE_PATH
      
      // Should work when API key is provided
      configure({
        apiKey: 'test-key',
        disableLocalMode: true
      })
      const config = getConfig()
      
      expect(config.disableLocalMode).toBe(true)
      expect(config.mode).toBe('cloud')
    })

    it('should throw error when disableLocalMode is true but no API key provided', () => {
      expect(() => {
        configure({
          disableLocalMode: true
        })
      }).toThrow('Cannot disable local mode without providing an API key for cloud mode')
    })

    it('should handle disableLocalMode via environment variable', () => {
      // Clear test environment variables for this test
      delete process.env.SPINAL_MODE
      delete process.env.SPINAL_LOCAL_STORE_PATH
      
      process.env.SPINAL_DISABLE_LOCAL_MODE = 'true'
      process.env.SPINAL_API_KEY = 'env-key'
      
      configure()
      const config = getConfig()
      
      expect(config.disableLocalMode).toBe(true)
      expect(config.mode).toBe('cloud')
    })

    it('should throw error when SPINAL_DISABLE_LOCAL_MODE is true but no API key provided', () => {
      // Clear test environment variables for this test
      delete process.env.SPINAL_MODE
      delete process.env.SPINAL_LOCAL_STORE_PATH
      
      process.env.SPINAL_DISABLE_LOCAL_MODE = 'true'
      delete process.env.SPINAL_API_KEY
      
      expect(() => {
        configure()
      }).toThrow('Cannot disable local mode without providing an API key for cloud mode')
    })

    it('should handle custom localStorePath', () => {
      const customPath = '/custom/path/spans.jsonl'
      configure({
        localStorePath: customPath
      })
      const config = getConfig()
      
      expect(config.localStorePath).toBe(customPath)
    })

    it('should use environment variable for localStorePath', () => {
      const envPath = '/env/path/spans.jsonl'
      process.env.SPINAL_LOCAL_STORE_PATH = envPath
      
      configure()
      const config = getConfig()
      
      expect(config.localStorePath).toBe(envPath)
    })

    it('should prioritize custom localStorePath over environment variable', () => {
      const customPath = '/custom/path/spans.jsonl'
      const envPath = '/env/path/spans.jsonl'
      process.env.SPINAL_LOCAL_STORE_PATH = envPath
      
      configure({
        localStorePath: customPath
      })
      const config = getConfig()
      
      expect(config.localStorePath).toBe(customPath)
    })
  })

  describe('Cloud Mode Configuration', () => {
    it('should configure cloud mode with API key', () => {
      // Clear test environment variables for this test
      delete process.env.SPINAL_MODE
      delete process.env.SPINAL_LOCAL_STORE_PATH
      
      configure({
        apiKey: 'cloud-api-key',
        endpoint: 'https://cloud.example.com'
      })
      const config = getConfig()
      
      expect(config.mode).toBe('cloud')
      expect(config.apiKey).toBe('cloud-api-key')
      expect(config.endpoint).toBe('https://cloud.example.com')
      expect(config.headers['X-SPINAL-API-KEY']).toBe('cloud-api-key')
    })

    it('should configure cloud mode via environment variable', () => {
      // Clear test environment variables for this test
      delete process.env.SPINAL_MODE
      delete process.env.SPINAL_LOCAL_STORE_PATH
      
      process.env.SPINAL_API_KEY = 'env-cloud-key'
      process.env.SPINAL_TRACING_ENDPOINT = 'https://env-cloud.example.com'
      
      configure()
      const config = getConfig()
      
      expect(config.mode).toBe('cloud')
      expect(config.apiKey).toBe('env-cloud-key')
      expect(config.endpoint).toBe('https://env-cloud.example.com')
      expect(config.headers['X-SPINAL-API-KEY']).toBe('env-cloud-key')
    })

    it('should throw error for cloud mode without API key', () => {
      expect(() => {
        configure({
          mode: 'cloud'
        })
      }).toThrow('No API key provided. Set SPINAL_API_KEY or pass to configure().')
    })

    it('should handle custom headers in cloud mode', () => {
      configure({
        apiKey: 'test-key',
        headers: {
          'Custom-Header': 'custom-value',
          'X-SPINAL-API-KEY': 'override-key'
        }
      })
      const config = getConfig()
      
      expect(config.headers['Custom-Header']).toBe('custom-value')
      expect(config.headers['X-SPINAL-API-KEY']).toBe('override-key')
    })

    it('should handle custom headers in local mode', () => {
      configure({
        headers: {
          'Custom-Header': 'custom-value'
        }
      })
      const config = getConfig()
      
      expect(config.headers['Custom-Header']).toBe('custom-value')
      expect(config.headers['X-SPINAL-API-KEY']).toBeUndefined()
    })
  })

  describe('Local Mode Configuration', () => {
    it('should configure local mode by default when no API key', () => {
      configure()
      const config = getConfig()
      
      expect(config.mode).toBe('local')
      expect(config.apiKey).toBe('')
      expect(config.headers['X-SPINAL-API-KEY']).toBeUndefined()
    })

    it('should configure local mode explicitly', () => {
      configure({
        mode: 'local',
        apiKey: 'ignored-key' // Should be ignored in local mode
      })
      const config = getConfig()
      
      expect(config.mode).toBe('local')
      expect(config.headers['X-SPINAL-API-KEY']).toBeUndefined()
    })

    it('should use default localStorePath in local mode', () => {
      // Clear test environment variables for this test
      delete process.env.SPINAL_MODE
      delete process.env.SPINAL_LOCAL_STORE_PATH
      
      configure()
      const config = getConfig()
      
      expect(config.localStorePath).toBe(path.join(process.cwd(), '.spinal', 'spans.jsonl'))
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

    it('should auto-configure when getConfig is called without configure', async () => {
      // Clear any existing config by re-importing
      const { configure: _configure } = await import('../../src/runtime/config')
      _configure()
      
      const config = getConfig()
      expect(config.mode).toBe('local')
      expect(config.endpoint).toBe('https://cloud.withspinal.com')
    })
  })

  describe('Error Handling', () => {
    it('should throw error for missing endpoint', () => {
      expect(() => {
        configure({
          endpoint: ''
        })
      }).toThrow('Spinal endpoint must be provided')
    })

    it('should throw error for cloud mode without API key', () => {
      expect(() => {
        configure({
          mode: 'cloud',
          apiKey: ''
        })
      }).toThrow('No API key provided. Set SPINAL_API_KEY or pass to configure().')
    })

    it('should throw error for disableLocalMode without API key', () => {
      expect(() => {
        configure({
          disableLocalMode: true,
          apiKey: ''
        })
      }).toThrow('Cannot disable local mode without providing an API key for cloud mode')
    })
  })
})
