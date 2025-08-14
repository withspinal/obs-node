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
    expect(status.excludedHosts).toContain('api.openai.com')
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
})
