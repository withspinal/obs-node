import { getIsolatedProvider } from '../runtime/tracer'

// MVP: rely on HTTP instrumentation for OpenAI; later provide richer adapters
export function instrumentOpenAI() {
  getIsolatedProvider()
}
