import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { configure, instrumentHTTP, instrumentOpenAI, tag, shutdown } from '../../src/public'

// Mock the runtime modules
vi.mock('../../src/runtime/config', () => ({
  configure: vi.fn(),
  getConfig: vi.fn(() => ({
    mode: 'local',
    endpoint: 'https://test.com',
    maxQueueSize: 2048,
    maxExportBatchSize: 512,
    scheduleDelayMs: 5000,
    exportTimeoutMs: 30000
  }))
}))

vi.mock('../../src/runtime/tracer', () => ({
  getIsolatedProvider: vi.fn(() => ({
    register: vi.fn(),
    shutdown: vi.fn()
  })),
  shutdown: vi.fn(),
  forceFlush: vi.fn()
}))

vi.mock('../../src/runtime/tag', () => ({
  tag: vi.fn(() => ({
    dispose: vi.fn()
  }))
}))

vi.mock('../../src/providers/http', () => ({
  instrumentHTTP: vi.fn()
}))

vi.mock('../../src/providers/openai', () => ({
  instrumentOpenAI: vi.fn()
}))

describe('Public API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('configure()', () => {
    it('should export configure function', () => {
      expect(typeof configure).toBe('function')
    })

    it('should call configure from runtime', () => {
      const { configure: mockConfigure } = require('../../src/runtime/config')
      configure({ endpoint: 'https://test.com' })
      expect(mockConfigure).toHaveBeenCalledWith({ endpoint: 'https://test.com' })
    })
  })

  describe('instrumentHTTP()', () => {
    it('should export instrumentHTTP function', () => {
      expect(typeof instrumentHTTP).toBe('function')
    })

    it('should call instrumentHTTP from providers', () => {
      const { instrumentHTTP: mockInstrumentHTTP } = require('../../src/providers/http')
      instrumentHTTP()
      expect(mockInstrumentHTTP).toHaveBeenCalled()
    })
  })

  describe('instrumentOpenAI()', () => {
    it('should export instrumentOpenAI function', () => {
      expect(typeof instrumentOpenAI).toBe('function')
    })

    it('should call instrumentOpenAI from providers', () => {
      const { instrumentOpenAI: mockInstrumentOpenAI } = require('../../src/providers/openai')
      instrumentOpenAI()
      expect(mockInstrumentOpenAI).toHaveBeenCalled()
    })
  })

  describe('tag()', () => {
    it('should export tag function', () => {
      expect(typeof tag).toBe('function')
    })

    it('should call tag from runtime', () => {
      const { tag: mockTag } = require('../../src/runtime/tag')
      const result = tag({ aggregationId: 'test' })
      expect(mockTag).toHaveBeenCalledWith({ aggregationId: 'test' })
      expect(result).toHaveProperty('dispose')
    })
  })

  describe('shutdown()', () => {
    it('should export shutdown function', () => {
      expect(typeof shutdown).toBe('function')
    })

    it('should call shutdown from runtime', async () => {
      const { shutdown: mockShutdown } = require('../../src/runtime/tracer')
      await shutdown()
      expect(mockShutdown).toHaveBeenCalled()
    })
  })
})
