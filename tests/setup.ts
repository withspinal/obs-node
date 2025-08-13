import fs from 'fs'
import path from 'path'
import { afterAll, beforeEach } from 'vitest'

// Clean up test artifacts before each test
beforeEach(() => {
  const testDataDir = path.join(process.cwd(), '.spinal-test')
  if (fs.existsSync(testDataDir)) {
    fs.rmSync(testDataDir, { recursive: true, force: true })
  }
})

// Clean up after all tests
afterAll(() => {
  const testDataDir = path.join(process.cwd(), '.spinal-test')
  if (fs.existsSync(testDataDir)) {
    fs.rmSync(testDataDir, { recursive: true, force: true })
  }
})

// Mock environment for consistent testing
process.env.SPINAL_MODE = 'local'
process.env.SPINAL_LOCAL_STORE_PATH = path.join(process.cwd(), '.spinal-test', 'spans.jsonl')
