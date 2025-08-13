import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { configure } from '../src/runtime/config'
import { SpinalExporter } from '../src/runtime/exporter'
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base'
import type { ExportResult } from '@opentelemetry/core'

const tmpDir = path.join(process.cwd(), '.tmp-tests')
const file = path.join(tmpDir, 'spans.jsonl')

describe('local exporter', () => {
  beforeAll(async () => {
    await fs.promises.mkdir(tmpDir, { recursive: true })
    configure({ mode: 'local', localStorePath: file, apiKey: '' })
  })
  afterAll(async () => {
    try { 
      await fs.promises.rm(tmpDir, { recursive: true, force: true }) 
    } catch {
      // Ignore cleanup errors
    }
  })

  it('appends spans to filesystem as jsonl', async () => {
    const exporter = new SpinalExporter()
    const sample: Partial<ReadableSpan> = {
      name: 'test-span',
      startTime: [0, 0] as any,
      endTime: [0, 1] as any,
      spanContext: () => ({ traceId: 't', spanId: 's', traceFlags: 1, isRemote: false }),
      events: [],
      links: [],
      attributes: { 'spinal.model': 'openai:gpt-4o-mini', 'spinal.input_tokens': 100 },
    }
    await new Promise<void>((resolve, reject) => {
      exporter.export([sample as ReadableSpan], (res: ExportResult) => {
        if (res.code === 0) resolve()
        else reject(res.error || new Error('export failed'))
      })
    })
    const content = await fs.promises.readFile(file, 'utf8')
    expect(content.split('\n').filter(Boolean).length).toBeGreaterThan(0)
  })
})


