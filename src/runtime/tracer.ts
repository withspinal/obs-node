import { BatchSpanProcessor, AlwaysOnSampler } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import type { ReadableSpan, Span } from '@opentelemetry/sdk-trace-base'
import { context as otContext, propagation } from '@opentelemetry/api'
import type { Baggage, BaggageEntry } from '@opentelemetry/api'
import { getConfig } from './config'
import { SpinalExporter } from './exporter'

const SPINAL_NAMESPACE = 'spinal'

export class SpinalSpanProcessor extends BatchSpanProcessor {
  private exporter: SpinalExporter
  constructor() {
    const cfg = getConfig()
    const exporter = new SpinalExporter()
    super(exporter, {
      maxQueueSize: cfg.maxQueueSize,
      scheduledDelayMillis: cfg.scheduleDelayMs,
      maxExportBatchSize: cfg.maxExportBatchSize,
      exportTimeoutMillis: cfg.exportTimeoutMs,
    })
    this.exporter = exporter
  }

  private excludedHosts = (() => {
    const defaultHosts = ['api.anthropic.com', 'api.azure.com'] // Removed api.openai.com from default exclusions
    const override = process.env.SPINAL_EXCLUDED_HOSTS?.trim()
    const list = override && override.length > 0 ? override.split(',').map((s) => s.trim()).filter(Boolean) : defaultHosts
    const set = new Set(list)
    // Only exclude OpenAI if explicitly configured to do so
    if (process.env.SPINAL_EXCLUDE_OPENAI === 'true') {
      set.add('api.openai.com')
    }
    return set
  })()

  private shouldProcess(span: ReadableSpan | Span): boolean {
    const scopeName = (span as any).instrumentationLibrary?.name || (span as any).instrumentationScope?.name || ''
    if (!scopeName) return false
    
    // Always process OpenAI spans
    if (scopeName.includes('spinal-openai')) return true
    
    if (scopeName.includes('http')) {
      const url = (span as any).attributes?.['http.url'] as string | undefined
      try {
        if (url) {
          const host = new URL(url).host
          if (this.excludedHosts.has(host)) return false
        }
      } catch {
        // Ignore invalid URLs
      }
      return true
    }
    if (scopeName.includes('openai') || scopeName.includes('anthropic') || scopeName.includes('openai_agents')) return true
    return false
  }

  onStart(span: Span, parentContext: any): void {
    if (!this.shouldProcess(span)) return
    const bag: Baggage | undefined = propagation.getBaggage(parentContext ?? otContext.active())
    if (!bag) return
    const entries = bag.getAllEntries() as [string, BaggageEntry][]
    entries.forEach(([key, entry]) => {
      if (key.startsWith(`${SPINAL_NAMESPACE}.`)) {
        span.setAttribute(key, String(entry.value))
      }
    })
  }
}

let providerSingleton: NodeTracerProvider | undefined

export function getIsolatedProvider(): NodeTracerProvider {
  if (providerSingleton) return providerSingleton
  const provider = new NodeTracerProvider({
    sampler: new AlwaysOnSampler(),
    spanProcessors: [new SpinalSpanProcessor()],
  })
  provider.register()
  providerSingleton = provider
  return provider
}

export async function shutdown(): Promise<void> {
  if (!providerSingleton) return
  await providerSingleton.shutdown()
}

export async function forceFlush(): Promise<void> {
  if (!providerSingleton) return
  await providerSingleton.forceFlush()
}
