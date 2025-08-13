import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SpinalExporter } from '../../src/runtime/exporter'

// Mock fetch
global.fetch = vi.fn()

// Mock the config module
vi.mock('../../src/runtime/config', () => ({
  getConfig: vi.fn(() => ({
    endpoint: 'https://test.com',
    headers: { 'X-Test': 'test' },
    timeoutMs: 5000
  }))
}))

describe('SpinalExporter', () => {
  let exporter: SpinalExporter

  beforeEach(() => {
    vi.clearAllMocks()
    exporter = new SpinalExporter()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should create SpinalExporter instance', () => {
      expect(exporter).toBeInstanceOf(SpinalExporter)
    })
  })

  describe('export()', () => {
    it('should export spans successfully', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      } as Response)

      const spans = [
        {
          name: 'test-span',
          attributes: { 'test.attr': 'value' }
        }
      ]

      const result = await exporter.export(spans, () => {})

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.com',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Test': 'test'
          }),
          body: expect.any(String)
        })
      )
      expect(result).toBeDefined()
    })

    it('should handle export failure', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const spans = [{ name: 'test-span' }]

      const result = await exporter.export(spans, () => {})

      expect(mockFetch).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('should handle empty spans array', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      } as Response)

      const result = await exporter.export([], () => {})

      expect(mockFetch).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('should handle non-200 response', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response)

      const spans = [{ name: 'test-span' }]

      const result = await exporter.export(spans, () => {})

      expect(mockFetch).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('should handle timeout', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )

      const spans = [{ name: 'test-span' }]

      const result = await exporter.export(spans, () => {})

      expect(mockFetch).toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })

  describe('shutdown()', () => {
    it('should shutdown successfully', async () => {
      const result = await exporter.shutdown()
      expect(result).toBeDefined()
    })
  })
})
