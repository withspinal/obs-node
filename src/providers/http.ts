import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { getIsolatedProvider } from '../runtime/tracer'

export function instrumentHTTP() {
  getIsolatedProvider() // ensure provider exists
  
  const httpInstr = new HttpInstrumentation({
    // Intercept request to capture OpenAI-specific data
    requestHook: (span, request) => {
      // Extract URL from various possible sources
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const url = (request as any).url || (request as any).path || (request as any).href || ''
      
      if (typeof url === 'string' && url.includes('api.openai.com')) {
        // Mark this as an OpenAI request
        span.setAttribute('spinal.provider', 'openai')
        
        // Try to extract model from request body if available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body = (request as any).body
        if (body) {
          try {
            const bodyStr = typeof body === 'string' ? body : JSON.stringify(body)
            const parsed = JSON.parse(bodyStr)
            if (parsed.model) {
              span.setAttribute('spinal.model', `openai:${parsed.model}`)
            }
          } catch {
            // Ignore parsing errors
          }
        }
      }
    }
  })
  
  httpInstr.enable()
}
