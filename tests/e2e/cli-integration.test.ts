import { spawn } from 'node:child_process'
import fs from 'fs'
import path from 'path'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { configure, tag, instrumentHTTP, shutdown } from '../../src/index'

describe('CLI Integration E2E', () => {
  const testStorePath = path.join(process.cwd(), '.spinal-test', 'spans.jsonl')

  beforeEach(() => {
    // Clean test data
    if (fs.existsSync(testStorePath)) {
      fs.unlinkSync(testStorePath)
    }
    // Ensure directory exists
    const dir = path.dirname(testStorePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })

  afterEach(async () => {
    await shutdown()
  })

  const runCLI = (args: string[]): Promise<{ code: number; stdout: string; stderr: string }> => {
    return new Promise((resolve) => {
      const child = spawn('node', ['dist/cli/index.js', ...args], {
        env: {
          ...process.env,
          SPINAL_MODE: 'local',
          SPINAL_LOCAL_STORE_PATH: testStorePath,
        },
      })

      let stdout = ''
      let stderr = ''

      child.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      child.on('close', (code) => {
        resolve({ code: code || 0, stdout, stderr })
      })
    })
  }

  it('should show status in local mode', async () => {
    const result = await runCLI(['status'])

    expect(result.code).toBe(0)
    const status = JSON.parse(result.stdout)
    
    expect(status.mode).toBe('local')
    expect(status.localStorePath).toBe(testStorePath)
    expect(status.excludedHosts).toContain('api.anthropic.com')
    expect(status.excludedHosts).toContain('api.azure.com')
  })

  it('should show empty report when no data exists', async () => {
    const result = await runCLI(['report'])

    expect(result.code).toBe(0)
    expect(result.stdout).toContain('No local data found')
  })

  it('should generate report from local spans', async () => {
    // First, generate some test data
    configure({
      mode: 'local',
      localStorePath: testStorePath,
    })

    instrumentHTTP()

    const t = tag({ 
      aggregationId: 'test-report',
      model: 'openai:gpt-4o-mini',
      input_tokens: 2000,
      output_tokens: 1000
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    t.dispose()
    await shutdown()

    // Verify data was written
    expect(fs.existsSync(testStorePath)).toBe(true)

    // Run report command
    const result = await runCLI(['report'])

    expect(result.code).toBe(0)
    const report = JSON.parse(result.stdout)
    
    expect(report.spansProcessed).toBeGreaterThan(0)
    expect(report.estimatedCostUSD).toBeGreaterThan(0)
    
    // Expected cost: (2000/1000 * 0.15) + (1000/1000 * 0.60) = 0.30 + 0.60 = 0.90
    expect(report.estimatedCostUSD).toBe(0.90)
  })



  it('should show help for unknown commands', async () => {
    const result = await runCLI(['unknown-command'])

    expect(result.code).toBe(1)
    expect(result.stderr).toContain('error: unknown command')
  })

  it('should handle init command', async () => {
    const result = await runCLI(['init', '--endpoint', 'https://test.example.com'])

    expect(result.code).toBe(0)
    expect(result.stdout).toContain('Saved endpoint to local config')
  })

  it('should show response analysis commands in help', async () => {
    const result = await runCLI(['--help'])

    expect(result.code).toBe(0)
    expect(result.stdout).toContain('responses')
    expect(result.stdout).toContain('content')
    expect(result.stdout).toContain('Analyze OpenAI API response content and quality')
    expect(result.stdout).toContain('Get insights about response content patterns')
  })

  it('should run response analysis command', async () => {
    // First, generate some test data with response content
    configure({
      mode: 'local',
      localStorePath: testStorePath,
    })

    instrumentHTTP()

    const t = tag({ 
      aggregationId: 'test-response-analysis',
      model: 'openai:gpt-4o-mini',
      input_tokens: 100,
      output_tokens: 50
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    t.dispose()
    await shutdown()

    // Run response analysis command
    const result = await runCLI(['responses', '--format', 'summary'])

    expect(result.code).toBe(0)
    expect(result.stdout).toContain('Total Responses')
    expect(result.stdout).toContain('Avg Response Size')
    expect(result.stdout).toContain('Success Rate')
  })

  it('should run content insights command', async () => {
    // First, generate some test data
    configure({
      mode: 'local',
      localStorePath: testStorePath,
    })

    instrumentHTTP()

    const t = tag({ 
      aggregationId: 'test-content-insights',
      model: 'openai:gpt-4o',
      input_tokens: 200,
      output_tokens: 150
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    t.dispose()
    await shutdown()

    // Run content insights command
    const result = await runCLI(['content', '--format', 'summary'])

    expect(result.code).toBe(0)
    expect(result.stdout).toContain('Response Patterns')
    expect(result.stdout).toContain('Avg tokens/char')
    expect(result.stdout).toContain('Response efficiency')
  })

  it('should handle response analysis with different options', async () => {
    // Generate test data
    configure({
      mode: 'local',
      localStorePath: testStorePath,
    })

    instrumentHTTP()

    const t = tag({ 
      aggregationId: 'test-response-options',
      model: 'openai:gpt-4o-mini',
      input_tokens: 50,
      output_tokens: 25
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    t.dispose()
    await shutdown()

    // Test different response analysis options
    const options = [
      ['responses', '--errors'],
      ['responses', '--by-model'],
      ['responses', '--size-distribution'],
      ['content', '--patterns'],
      ['content', '--finish-reasons'],
      ['content', '--quality']
    ]

    for (const option of options) {
      const result = await runCLI([...option, '--format', 'summary'])
      expect(result.code).toBe(0)
      expect(result.stdout.length).toBeGreaterThan(0)
    }
  })

  it('should handle response analysis with time filtering', async () => {
    // Generate test data
    configure({
      mode: 'local',
      localStorePath: testStorePath,
    })

    instrumentHTTP()

    const t = tag({ 
      aggregationId: 'test-time-filtering',
      model: 'openai:gpt-4o',
      input_tokens: 75,
      output_tokens: 40
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    t.dispose()
    await shutdown()

    // Test time filtering with response analysis
    const timePeriods = ['1h', '24h', '7d']

    for (const period of timePeriods) {
      const result = await runCLI(['responses', '--since', period, '--format', 'summary'])
      expect(result.code).toBe(0)
      expect(result.stdout.length).toBeGreaterThan(0)
    }
  })
})
