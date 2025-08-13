import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Command } from 'commander'

// Mock dependencies
vi.mock('commander', () => ({
  Command: vi.fn().mockImplementation(() => ({
    name: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    version: vi.fn().mockReturnThis(),
    command: vi.fn().mockReturnThis(),
    option: vi.fn().mockReturnThis(),
    action: vi.fn().mockReturnThis(),
    parseAsync: vi.fn()
  }))
}))

vi.mock('conf', () => ({
  default: vi.fn().mockImplementation(() => ({
    set: vi.fn(),
    get: vi.fn()
  }))
}))

vi.mock('open', () => ({
  default: vi.fn()
}))

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  promises: {
    readFile: vi.fn()
  }
}))

vi.mock('../../src/runtime/config', () => ({
  getConfig: vi.fn(() => ({
    mode: 'local',
    endpoint: 'https://test.com',
    localStorePath: '/test/path/spans.jsonl'
  }))
}))

vi.mock('../../src/pricing', () => ({
  estimateCost: vi.fn(() => 0.001)
}))

describe('CLI Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('CLI Setup', () => {
    it('should create commander instance', () => {
      require('../../src/cli/index')
      expect(Command).toHaveBeenCalled()
    })

    it('should set CLI name and description', () => {
      const mockCommand = {
        name: vi.fn().mockReturnThis(),
        description: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        command: vi.fn().mockReturnThis(),
        option: vi.fn().mockReturnThis(),
        action: vi.fn().mockReturnThis(),
        parseAsync: vi.fn()
      }
      ;(Command as any).mockImplementation(() => mockCommand)

      require('../../src/cli/index')

      expect(mockCommand.name).toHaveBeenCalledWith('spinal')
      expect(mockCommand.description).toHaveBeenCalledWith('Spinal CLI')
      expect(mockCommand.version).toHaveBeenCalledWith('0.1.0')
    })
  })

  describe('Status Command', () => {
    it('should have status command', () => {
      const mockCommand = {
        name: vi.fn().mockReturnThis(),
        description: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        command: vi.fn().mockReturnThis(),
        option: vi.fn().mockReturnThis(),
        action: vi.fn().mockReturnThis(),
        parseAsync: vi.fn()
      }
      ;(Command as any).mockImplementation(() => mockCommand)

      require('../../src/cli/index')

      expect(mockCommand.command).toHaveBeenCalledWith('status')
      expect(mockCommand.description).toHaveBeenCalledWith('Show current mode and configuration summary')
    })
  })

  describe('Login Command', () => {
    it('should have login command', () => {
      const mockCommand = {
        name: vi.fn().mockReturnThis(),
        description: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        command: vi.fn().mockReturnThis(),
        option: vi.fn().mockReturnThis(),
        action: vi.fn().mockReturnThis(),
        parseAsync: vi.fn()
      }
      ;(Command as any).mockImplementation(() => mockCommand)

      require('../../src/cli/index')

      expect(mockCommand.command).toHaveBeenCalledWith('login')
      expect(mockCommand.description).toHaveBeenCalledWith('Login for cloud mode (opens backend dashboard)')
    })
  })

  describe('Init Command', () => {
    it('should have init command', () => {
      const mockCommand = {
        name: vi.fn().mockReturnThis(),
        description: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        command: vi.fn().mockReturnThis(),
        option: vi.fn().mockReturnThis(),
        action: vi.fn().mockReturnThis(),
        parseAsync: vi.fn()
      }
      ;(Command as any).mockImplementation(() => mockCommand)

      require('../../src/cli/index')

      expect(mockCommand.command).toHaveBeenCalledWith('init')
      expect(mockCommand.description).toHaveBeenCalledWith('Initialize configuration (optional)')
    })
  })

  describe('Report Command', () => {
    it('should have report command', () => {
      const mockCommand = {
        name: vi.fn().mockReturnThis(),
        description: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        command: vi.fn().mockReturnThis(),
        option: vi.fn().mockReturnThis(),
        action: vi.fn().mockReturnThis(),
        parseAsync: vi.fn()
      }
      ;(Command as any).mockImplementation(() => mockCommand)

      require('../../src/cli/index')

      expect(mockCommand.command).toHaveBeenCalledWith('report')
      expect(mockCommand.description).toHaveBeenCalledWith('Summarize local usage and estimated costs')
    })
  })

  describe('CLI Execution', () => {
    it('should call parseAsync', () => {
      const mockCommand = {
        name: vi.fn().mockReturnThis(),
        description: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        command: vi.fn().mockReturnThis(),
        option: vi.fn().mockReturnThis(),
        action: vi.fn().mockReturnThis(),
        parseAsync: vi.fn()
      }
      ;(Command as any).mockImplementation(() => mockCommand)

      require('../../src/cli/index')

      expect(mockCommand.parseAsync).toHaveBeenCalled()
    })
  })
})
