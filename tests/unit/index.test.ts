import { describe, it, expect } from 'vitest'
import { configure, instrumentHTTP, instrumentOpenAI, tag, shutdown } from '../../src/index'

describe('Main Entry Point', () => {
  describe('configure()', () => {
    it('should export configure function', () => {
      expect(typeof configure).toBe('function')
    })

    it('should accept configuration options', () => {
      expect(() => configure({ endpoint: 'https://test.com' })).not.toThrow()
    })

    it('should accept empty configuration', () => {
      expect(() => configure({})).not.toThrow()
    })
  })

  describe('instrumentHTTP()', () => {
    it('should export instrumentHTTP function', () => {
      expect(typeof instrumentHTTP).toBe('function')
    })

    it('should not throw when called', () => {
      expect(() => instrumentHTTP()).not.toThrow()
    })
  })

  describe('instrumentOpenAI()', () => {
    it('should export instrumentOpenAI function', () => {
      expect(typeof instrumentOpenAI).toBe('function')
    })

    it('should not throw when called', () => {
      expect(() => instrumentOpenAI()).not.toThrow()
    })
  })

  describe('tag()', () => {
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
  })

  describe('shutdown()', () => {
    it('should export shutdown function', () => {
      expect(typeof shutdown).toBe('function')
    })

    it('should return a promise', async () => {
      const result = shutdown()
      expect(result).toBeInstanceOf(Promise)
      await result
    })
  })
})
