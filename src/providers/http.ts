import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { getIsolatedProvider } from '../runtime/tracer'

export function instrumentHTTP() {
  getIsolatedProvider() // ensure provider exists
  const httpInstr = new HttpInstrumentation({})
  httpInstr.enable()
}
