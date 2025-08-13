import { diag, DiagLogLevel } from '@opentelemetry/api'
import path from 'path'

export interface Scrubber {
  scrubAttributes(attributes: Record<string, unknown>): Record<string, unknown>
}

class DefaultScrubber implements Scrubber {
  private sensitive = [
    /password/i,
    /passwd/i,
    /secret/i,
    /api[._-]?key/i,
    /auth[._-]?token/i,
    /access[._-]?token/i,
    /private[._-]?key/i,
    /encryption[._-]?key/i,
    /bearer/i,
    /credential/i,
    /user[._-]?name/i,
    /first[._-]?name/i,
    /last[._-]?name/i,
    /email/i,
    /email[._-]?address/i,
    /phone[._-]?number/i,
    /ip[._-]?address/i,
  ]
  private protected = [/^attributes$/i, /^spinal\./i]

  scrubAttributes(attributes: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(attributes ?? {})) {
      if (this.sensitive.some((r) => r.test(k))) {
        out[k] = '[Scrubbed]'
      } else if (Array.isArray(v)) {
        out[k] = v.map((x) => (typeof x === 'object' && x !== null ? this.scrubAttributes(x as any) : x))
      } else if (typeof v === 'object' && v !== null) {
        out[k] = this.scrubAttributes(v as any)
      } else {
        out[k] = v
      }
    }
    return out
  }
}

export interface ConfigureOptions {
  endpoint?: string
  apiKey?: string
  headers?: Record<string, string>
  timeoutMs?: number
  maxQueueSize?: number
  maxExportBatchSize?: number
  scheduleDelayMs?: number
  exportTimeoutMs?: number
  scrubber?: Scrubber
  opentelemetryLogLevel?: DiagLogLevel
  mode?: 'cloud' | 'local'
  localStorePath?: string
}

export interface SpinalConfig extends Required<Omit<ConfigureOptions, 'scrubber' | 'opentelemetryLogLevel'>> {
  scrubber: Scrubber
  opentelemetryLogLevel: DiagLogLevel
}

let globalConfig: SpinalConfig | undefined

export function configure(opts: ConfigureOptions = {}): SpinalConfig {
  const endpoint = opts.endpoint ?? process.env.SPINAL_TRACING_ENDPOINT ?? 'https://cloud.withspinal.com'
  const apiKey = opts.apiKey ?? process.env.SPINAL_API_KEY ?? ''
  const inferredMode: 'cloud' | 'local' = (opts.mode ?? (process.env.SPINAL_MODE as any)) || (apiKey ? 'cloud' : 'local')
  const mode = inferredMode
  const headers = mode === 'cloud' ? { ...(opts.headers ?? {}), 'X-SPINAL-API-KEY': apiKey } : { ...(opts.headers ?? {}) }
  const timeoutMs = opts.timeoutMs ?? 5_000
  const maxQueueSize = opts.maxQueueSize ?? parseInt(process.env.SPINAL_PROCESS_MAX_QUEUE_SIZE ?? '2048', 10)
  const maxExportBatchSize =
    opts.maxExportBatchSize ?? parseInt(process.env.SPINAL_PROCESS_MAX_EXPORT_BATCH_SIZE ?? '512', 10)
  const scheduleDelayMs = opts.scheduleDelayMs ?? parseInt(process.env.SPINAL_PROCESS_SCHEDULE_DELAY ?? '5000', 10)
  const exportTimeoutMs = opts.exportTimeoutMs ?? parseInt(process.env.SPINAL_PROCESS_EXPORT_TIMEOUT ?? '30000', 10)
  const scrubber = opts.scrubber ?? new DefaultScrubber()
  const opentelemetryLogLevel = opts.opentelemetryLogLevel ?? DiagLogLevel.ERROR
  const localStorePath = opts.localStorePath ?? process.env.SPINAL_LOCAL_STORE_PATH ?? path.join(process.cwd(), '.spinal', 'spans.jsonl')

  if (!endpoint) throw new Error('Spinal endpoint must be provided')
  if (mode === 'cloud' && !apiKey) throw new Error('No API key provided. Set SPINAL_API_KEY or pass to configure().')

  diag.setLogger(console as any, opentelemetryLogLevel)

  globalConfig = {
    endpoint,
    apiKey,
    headers,
    timeoutMs,
    maxQueueSize,
    maxExportBatchSize,
    scheduleDelayMs,
    exportTimeoutMs,
    scrubber,
    opentelemetryLogLevel,
    mode,
    localStorePath,
  }
  return globalConfig
}

export function getConfig(): SpinalConfig {
  if (!globalConfig) return configure()
  return globalConfig
}
