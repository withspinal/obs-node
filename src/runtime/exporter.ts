import { ExportResult, ExportResultCode, ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base'
import { getConfig } from './config'
import fs from 'node:fs'
import path from 'node:path'
import { request } from 'undici'

export class SpinalExporter implements SpanExporter {
  private shutdownFlag = false

  async export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): Promise<void> {
    if (this.shutdownFlag) return resultCallback({ code: ExportResultCode.FAILED })
    try {
      const cfg = getConfig()
      const payload = spans.map((s) => this.toJSON(s))

      if (cfg.mode === 'local') {
        await this.writeLocal(cfg.localStorePath, payload)
        resultCallback({ code: ExportResultCode.SUCCESS })
        return
      }

      const body = { spans: payload }
      const res = await request(cfg.endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...cfg.headers },
        body: JSON.stringify(body),
        bodyTimeout: cfg.timeoutMs,
        headersTimeout: cfg.timeoutMs,
      })
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resultCallback({ code: ExportResultCode.SUCCESS })
      } else {
        resultCallback({ code: ExportResultCode.FAILED })
      }
    } catch (err) {
      resultCallback({ code: ExportResultCode.FAILED, error: err as Error })
    }
  }

  shutdown(): Promise<void> {
    this.shutdownFlag = true
    return Promise.resolve()
  }

  private toJSON(span: ReadableSpan): any {
    const cfg = getConfig()
    const attributes = { ...(span.attributes ?? {}) }
    const scrubbed = cfg.scrubber.scrubAttributes(attributes)

    return {
      name: span.name,
      trace_id: span.spanContext().traceId,
      span_id: span.spanContext().spanId,
      parent_span_id: span.parentSpanId ?? null,
      start_time: span.startTime,
      end_time: span.endTime,
      status: span.status ?? null,
      attributes: scrubbed,
      events: (span.events ?? []).map((e) => ({ name: e.name, timestamp: e.time, attributes: e.attributes ?? {} })),
      links: (span.links ?? []).map((l) => ({
        context: { trace_id: l.context.traceId, span_id: l.context.spanId },
        attributes: l.attributes ?? {},
      })),
      instrumentation_info: (span.instrumentationLibrary || span.instrumentationScope
        ? {
            name: (span as any).instrumentationLibrary?.name || (span as any).instrumentationScope?.name,
            version: (span as any).instrumentationLibrary?.version || (span as any).instrumentationScope?.version,
          }
        : null),
    }
  }

  private async writeLocal(filePath: string, payload: any[]): Promise<void> {
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
    const lines = payload.map((p) => JSON.stringify(p)).join('\n') + '\n'
    await fs.promises.appendFile(filePath, lines, 'utf8')
  }
}
