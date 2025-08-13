import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { instrumentHTTP } from '../../src/providers/http'
import { instrumentOpenAI } from '../../src/providers/openai'

// Mock the runtime modules
vi.mock('../../src/runtime/tracer', () => ({
  getIsolatedProvider: vi.fn(() => ({
    register: vi.fn(),
    shutdown: vi.fn()
  }))
}))

vi.mock('@opentelemetry/instrumentation-http', () => ({
  HttpInstrumentation: vi.fn().mockImplementation(() => ({
    enable: vi.fn()
  }))
}))

describe('Providers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('HTTP Provider', () => {
    it('should export instrumentHTTP function', () => {
      expect(typeof instrumentHTTP).toBe('function')
    })

    it('should create and enable HttpInstrumentation', () => {
      const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')
      const { getIsolatedProvider } = require('../../src/runtime/tracer')
      
      instrumentHTTP()
      
      expect(getIsolatedProvider).toHaveBeenCalled()
      expect(HttpInstrumentation).toHaveBeenCalledWith({})
      
      const httpInstr = HttpInstrumentation.mock.results[0].value
      expect(httpInstr.enable).toHaveBeenCalled()
    })
  })

  describe('OpenAI Provider', () => {
    it('should export instrumentOpenAI function', () => {
      expect(typeof instrumentOpenAI).toBe('function')
    })

    it('should call getIsolatedProvider', () => {
      const { getIsolatedProvider } = require('../../src/runtime/tracer')
      
      instrumentOpenAI()
      
      expect(getIsolatedProvider).toHaveBeenCalled()
    })
  })
})
