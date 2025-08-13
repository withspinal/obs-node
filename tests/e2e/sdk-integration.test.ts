import fs from 'node:fs'
import path from 'node:path'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { configure, tag, instrumentHTTP, shutdown, estimateCost } from '../../src/index'
import { getConfig } from '../../src/runtime/config'

describe('SDK Integration E2E', () => {
  const testStorePath = path.join(process.cwd(), '.spinal-test', 'spans.jsonl')

  beforeEach(() => {
    // Ensure clean state
    if (fs.existsSync(testStorePath)) {
      fs.unlinkSync(testStorePath)
    }
  })

  afterEach(async () => {
    await shutdown()
  })

  it('should configure in local mode and store spans', async () => {
    // Configure SDK
    const config = configure({
      mode: 'local',
      localStorePath: testStorePath,
    })

    expect(config.mode).toBe('local')
    expect(config.localStorePath).toBe(testStorePath)

    // Enable instrumentation
    instrumentHTTP()

    // Create tagged context
    const t = tag({ 
      aggregationId: 'test-flow',
      user: 'test-user',
      model: 'openai:gpt-4o-mini',
      input_tokens: 1000,
      output_tokens: 500
    })

    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100))

    // Dispose tag
    t.dispose()

    // Force flush to ensure spans are written
    await shutdown()

    // Verify local store was created and contains data
    expect(fs.existsSync(testStorePath)).toBe(true)
    const content = fs.readFileSync(testStorePath, 'utf8')
    const lines = content.trim().split('\n').filter(Boolean)
    
    expect(lines.length).toBeGreaterThan(0)
    
    // Parse and validate span structure
    const span = JSON.parse(lines[0])
    expect(span).toHaveProperty('name')
    expect(span).toHaveProperty('trace_id')
    expect(span).toHaveProperty('span_id')
    expect(span).toHaveProperty('attributes')
    
    // Check that spinal tags were attached
    const attrs = span.attributes
    expect(attrs['spinal.aggregation_id']).toBe('test-flow')
    expect(attrs['spinal.user']).toBe('test-user')
    expect(attrs['spinal.model']).toBe('openai:gpt-4o-mini')
    expect(attrs['spinal.input_tokens']).toBe('1000')
    expect(attrs['spinal.output_tokens']).toBe('500')
  })

  it('should estimate costs correctly', () => {
    const cost = estimateCost({
      model: 'openai:gpt-4o-mini',
      inputTokens: 1000,
      outputTokens: 500,
    })

    // Expected: (1000/1000 * 0.15) + (500/1000 * 0.60) = 0.15 + 0.30 = 0.45
    expect(cost).toBe(0.45)
  })

  it('should handle multiple spans with different tags', async () => {
    configure({
      mode: 'local',
      localStorePath: testStorePath,
    })

    instrumentHTTP()

    // First span
    const t1 = tag({ aggregationId: 'flow-1', user: 'user-1' })
    await new Promise(resolve => setTimeout(resolve, 50))
    t1.dispose()

    // Second span with different tags
    const t2 = tag({ aggregationId: 'flow-2', user: 'user-2', priority: 'high' })
    await new Promise(resolve => setTimeout(resolve, 50))
    t2.dispose()

    await shutdown()

    // Verify multiple spans were written
    const content = fs.readFileSync(testStorePath, 'utf8')
    const lines = content.trim().split('\n').filter(Boolean)
    
    expect(lines.length).toBeGreaterThan(1)
    
    // Check that spans have different trace IDs
    const span1 = JSON.parse(lines[0])
    const span2 = JSON.parse(lines[1])
    expect(span1.trace_id).not.toBe(span2.trace_id)
  })

  it('should scrub sensitive data in attributes', async () => {
    configure({
      mode: 'local',
      localStorePath: testStorePath,
    })

    instrumentHTTP()

    const t = tag({ 
      aggregationId: 'test',
      api_key: 'sk-secret123',
      password: 'mypassword',
      email: 'user@example.com'
    })

    await new Promise(resolve => setTimeout(resolve, 50))
    t.dispose()
    await shutdown()

    // Verify sensitive data was scrubbed
    const content = fs.readFileSync(testStorePath, 'utf8')
    const lines = content.trim().split('\n').filter(Boolean)
    const span = JSON.parse(lines[0])
    const attrs = span.attributes

    expect(attrs['spinal.api_key']).toBe('[Scrubbed]')
    expect(attrs['spinal.password']).toBe('[Scrubbed]')
    expect(attrs['spinal.email']).toBe('[Scrubbed]')
    expect(attrs['spinal.aggregation_id']).toBe('test') // Non-sensitive data preserved
  })
})
