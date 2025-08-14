import fs from 'fs'
import path from 'path'
import { afterAll, beforeEach } from 'vitest'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Polyfill for undici Web APIs
if (typeof globalThis.File === 'undefined') {
  globalThis.File = class File {
    private _name: string
    private _size: number
    constructor(name: string, size: number) {
      this._name = name
      this._size = size
    }
    get size() { return this._size }
    get name() { return this._name }
  } as any
}

if (typeof globalThis.Blob === 'undefined') {
  globalThis.Blob = class Blob {
    constructor(public readonly content: any[]) {}
    get size() { return 0 }
    get type() { return '' }
  } as any
}

if (typeof globalThis.FormData === 'undefined') {
  globalThis.FormData = class FormData {
    append() {}
    delete() {}
    get() { return null }
    getAll() { return [] }
    has() { return false }
    set() {}
    entries() { return [] }
    keys() { return [] }
    values() { return [] }
  } as any
}

if (typeof globalThis.Headers === 'undefined') {
  globalThis.Headers = class Headers {
    constructor() {}
    append() {}
    delete() {}
    get() { return null }
    has() { return false }
    set() {}
    entries() { return [] }
    keys() { return [] }
    values() { return [] }
  } as any
}

// Clean up test artifacts before each test
beforeEach(() => {
  const testDataDir = path.join(process.cwd(), '.spinal-test')
  if (fs.existsSync(testDataDir)) {
    fs.rmSync(testDataDir, { recursive: true, force: true })
  }
  // Ensure directory exists for tests that need it
  fs.mkdirSync(testDataDir, { recursive: true })
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
