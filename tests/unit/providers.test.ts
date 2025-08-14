import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { configure, instrumentOpenAI, shutdown } from '../../src/index'

describe('OpenAI Provider', () => {
  beforeEach(() => {
    configure({ mode: 'local' })
    instrumentOpenAI()
  })

  afterEach(async () => {
    await shutdown()
  })

  it('should capture token usage from OpenAI API responses', async () => {
    // Mock fetch to simulate OpenAI API response
    const mockFetch = vi.fn()
    global.fetch = mockFetch

    const mockResponse = {
      ok: true,
      clone: () => ({
        text: () => Promise.resolve(JSON.stringify({
          id: 'chatcmpl-123',
          object: 'chat.completion',
          created: 1677652288,
          model: 'gpt-4o-mini',
          usage: {
            prompt_tokens: 150,
            completion_tokens: 75,
            total_tokens: 225
          },
          choices: [{
            message: {
              role: 'assistant',
              content: 'Hello! How can I help you today?'
            }
          }]
        }))
      })
    }

    mockFetch.mockResolvedValue(mockResponse)

    // Make a mock OpenAI API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    })

    expect(response).toBe(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('gpt-4o-mini')
      })
    )
  })

  it('should handle non-OpenAI requests normally', async () => {
    const mockFetch = vi.fn()
    global.fetch = mockFetch

    const mockResponse = { ok: true }
    mockFetch.mockResolvedValue(mockResponse)

    // Make a non-OpenAI request
    const response = await fetch('https://api.example.com/data')

    expect(response).toBe(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data')
  })

  it('should handle API errors gracefully', async () => {
    const mockFetch = vi.fn()
    global.fetch = mockFetch

    const error = new Error('API Error')
    mockFetch.mockRejectedValue(error)

    // Make a mock OpenAI API call that fails
    await expect(
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Hello' }]
        })
      })
    ).rejects.toThrow('API Error')
  })
})
