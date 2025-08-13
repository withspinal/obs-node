import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getIsolatedProvider, shutdown, forceFlush, SpinalSpanProcessor } from '../../src/runtime/tracer'

// Mock OpenTelemetry modules
vi.mock('@opentelemetry/sdk-trace-base', () => ({
  BatchSpanProcessor: vi.fn().mockImplementation(function() {
    return {
      onStart: vi.fn(),
      onEnd: vi.fn(),
      shutdown: vi.fn(),
      forceFlush: vi.fn()
    }
  }),
  AlwaysOnSampler: vi.fn().mockImplementation(() => ({
    shouldSample: vi.fn(() => ({ decision: 1 }))
  }))
}))

vi.mock('@opentelemetry/sdk-trace-node', () => ({
  NodeTracerProvider: vi.fn().mockImplementation(() => ({
    register: vi.fn(),
    shutdown: vi.fn(),
    forceFlush: vi.fn(),
    addSpanProcessor: vi.fn()
  }))
}))

vi.mock('@opentelemetry/api', () => ({
  context: {
    active: vi.fn(() => ({})),
    with: vi.fn((ctx, fn) => fn())
  },
  propagation: {
    getBaggage: vi.fn(() => ({
      getAllEntries: vi.fn(() => [])
    }))
  }
}))

vi.mock('../../src/runtime/config', () => ({
  getConfig: vi.fn(() => ({
    maxQueueSize: 2048,
    maxExportBatchSize: 512,
    scheduleDelayMs: 5000,
    exportTimeoutMs: 30000
  }))
}))

vi.mock('../../src/runtime/exporter', () => ({
  SpinalExporter: vi.fn().mockImplementation(() => ({
    export: vi.fn(),
    shutdown: vi.fn()
  }))
}))

describe('Tracer Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getIsolatedProvider()', () => {
    it('should export getIsolatedProvider function', () => {
      expect(typeof getIsolatedProvider).toBe('function')
    })

    it('should create and register provider on first call', () => {
      const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node')
      const { AlwaysOnSampler } = require('@opentelemetry/sdk-trace-base')
      const { SpinalSpanProcessor } = require('@opentelemetry/sdk-trace-base')

      const provider = getIsolatedProvider()

      expect(NodeTracerProvider).toHaveBeenCalledWith({
        sampler: expect.any(AlwaysOnSampler),
        spanProcessors: expect.arrayContaining([
          expect.any(SpinalSpanProcessor)
        ])
      })
      expect(provider.register).toHaveBeenCalled()
    })

    it('should return same provider on subsequent calls', () => {
      const provider1 = getIsolatedProvider()
      const provider2 = getIsolatedProvider()

      expect(provider1).toBe(provider2)
    })
  })

  describe('shutdown()', () => {
    it('should export shutdown function', () => {
      expect(typeof shutdown).toBe('function')
    })

    it('should call provider shutdown', async () => {
      const provider = getIsolatedProvider()
      await shutdown()

      expect(provider.shutdown).toHaveBeenCalled()
    })

    it('should handle when no provider exists', async () => {
      // Clear the singleton
      vi.doMock('../../src/runtime/tracer', async () => {
        const actual = await vi.importActual('../../src/runtime/tracer')
        return { ...actual, providerSingleton: undefined }
      })

      await expect(shutdown()).resolves.not.toThrow()
    })
  })

  describe('forceFlush()', () => {
    it('should export forceFlush function', () => {
      expect(typeof forceFlush).toBe('function')
    })

    it('should call provider forceFlush', async () => {
      const provider = getIsolatedProvider()
      await forceFlush()

      expect(provider.forceFlush).toHaveBeenCalled()
    })

    it('should handle when no provider exists', async () => {
      // Clear the singleton
      vi.doMock('../../src/runtime/tracer', async () => {
        const actual = await vi.importActual('../../src/runtime/tracer')
        return { ...actual, providerSingleton: undefined }
      })

      await expect(forceFlush()).resolves.not.toThrow()
    })
  })

  describe('SpinalSpanProcessor', () => {
    it('should extend BatchSpanProcessor', () => {
      const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base')
      expect(SpinalSpanProcessor).toBe(BatchSpanProcessor)
    })

    it('should be instantiable', () => {
      const processor = new SpinalSpanProcessor()
      expect(processor).toBeDefined()
    })
  })
})
