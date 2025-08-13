import { describe, it, expect } from 'vitest'
import { instrumentHTTP } from '../../src/providers/http'
import { instrumentOpenAI } from '../../src/providers/openai'

describe('Providers', () => {
  describe('HTTP Provider', () => {
    it('should export instrumentHTTP function', () => {
      expect(typeof instrumentHTTP).toBe('function')
    })

    it('should not throw when called', () => {
      expect(() => instrumentHTTP()).not.toThrow()
    })
  })

  describe('OpenAI Provider', () => {
    it('should export instrumentOpenAI function', () => {
      expect(typeof instrumentOpenAI).toBe('function')
    })

    it('should not throw when called', () => {
      expect(() => instrumentOpenAI()).not.toThrow()
    })
  })
})
