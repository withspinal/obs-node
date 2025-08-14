import { context, propagation } from '@opentelemetry/api'
import { getIsolatedProvider } from './tracer'

const SPINAL_NAMESPACE = 'spinal'

export function tag(tags: Record<string, string | number | undefined> & { aggregationId?: string | number } = {}) {
  let ctx = context.active()
  const entries: [string, string][] = []

  if (tags.aggregationId) {
    entries.push([`${SPINAL_NAMESPACE}.aggregation_id`, String(tags.aggregationId)])
  }

  for (const [k, v] of Object.entries(tags)) {
    if (k === 'aggregationId') continue
    if (v === undefined) continue
    entries.push([`${SPINAL_NAMESPACE}.${k}`, String(v)])
  }

  const currentBaggage = propagation.getBaggage(ctx) ?? propagation.createBaggage()
  const updated = entries.reduce((bag, [k, v]) => bag.setEntry(k, { value: v }), currentBaggage)
  ctx = propagation.setBaggage(ctx, updated)
  
  // Create a span to ensure the tags get exported
  const provider = getIsolatedProvider()
  const tracer = provider.getTracer('spinal-tag')
  
  const span = tracer.startSpan('spinal.tag', undefined, ctx)
  
  // Set the tags as span attributes
  entries.forEach(([key, value]) => {
    span.setAttribute(key, value)
  })
  
  // End the span immediately to ensure it gets exported
  span.end()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = (context as any).attach?.(ctx) ?? undefined
  return {
    dispose() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (token && (context as any).detach) (context as any).detach(token)
    },
  }
}
