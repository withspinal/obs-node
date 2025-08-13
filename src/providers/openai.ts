import { getIsolatedProvider } from '../runtime/tracer'
import { trace, context, SpanStatusCode } from '@opentelemetry/api'

// OpenAI API response structure
interface OpenAIUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

interface OpenAIResponse {
  usage?: OpenAIUsage
  model?: string
}

// Store response data for processing
const responseDataMap = new WeakMap<object, { body: string; span: any }>()

export function instrumentOpenAI() {
  getIsolatedProvider() // ensure provider exists
  
  // Intercept fetch calls to OpenAI API
  const originalFetch = global.fetch
  global.fetch = async function(input: string | URL | Request, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input.toString()
    
    if (url.includes('api.openai.com')) {
      const tracer = trace.getTracer('spinal-openai')
      const span = tracer.startSpan('openai-api-call')
      
      try {
        // Extract model from request body if available
        if (init?.body) {
          try {
            const bodyStr = typeof init.body === 'string' ? init.body : JSON.stringify(init.body)
            const parsed = JSON.parse(bodyStr)
            if (parsed.model) {
              span.setAttribute('spinal.model', `openai:${parsed.model}`)
            }
          } catch {
            // Ignore parsing errors
          }
        }
        
        // Make the actual request
        const response = await originalFetch(input, init)
        
        // Clone the response to read its body
        const clonedResponse = response.clone()
        const responseText = await clonedResponse.text()
        
        // Parse response for token usage
        try {
          const parsed: OpenAIResponse = JSON.parse(responseText)
          
          if (parsed.usage) {
            span.setAttribute('spinal.input_tokens', parsed.usage.prompt_tokens)
            span.setAttribute('spinal.output_tokens', parsed.usage.completion_tokens)
            span.setAttribute('spinal.total_tokens', parsed.usage.total_tokens)
          }
          
          if (parsed.model) {
            span.setAttribute('spinal.model', `openai:${parsed.model}`)
          }
        } catch {
          // Ignore parsing errors
        }
        
        span.setStatus({ code: SpanStatusCode.OK })
        span.end()
        
        return response
      } catch (error) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message })
        span.end()
        throw error
      }
    }
    
    // For non-OpenAI requests, use original fetch
    return originalFetch(input, init)
  }
  
  // Also intercept Node.js http/https requests if available
  try {
    const http = require('http')
    const https = require('https')
    
    // Intercept http requests
    const originalHttpRequest = http.request
    http.request = function(options: any, callback?: any) {
      const url = options.hostname || options.host || ''
      if (url.includes('api.openai.com')) {
        const tracer = trace.getTracer('spinal-openai')
        const span = tracer.startSpan('openai-api-call')
        
        // Store span for later processing
        const originalCallback = callback
        callback = function(res: any) {
          // Intercept response to capture token usage
          const chunks: Buffer[] = []
          res.on('data', (chunk: Buffer) => chunks.push(chunk))
          res.on('end', () => {
            try {
              const body = Buffer.concat(chunks).toString()
              const parsed: OpenAIResponse = JSON.parse(body)
              
              if (parsed.usage) {
                span.setAttribute('spinal.input_tokens', parsed.usage.prompt_tokens)
                span.setAttribute('spinal.output_tokens', parsed.usage.completion_tokens)
                span.setAttribute('spinal.total_tokens', parsed.usage.total_tokens)
              }
              
              if (parsed.model) {
                span.setAttribute('spinal.model', `openai:${parsed.model}`)
              }
              
              span.setStatus({ code: SpanStatusCode.OK })
              span.end()
            } catch {
              span.setStatus({ code: SpanStatusCode.OK })
              span.end()
            }
          })
          
          if (originalCallback) originalCallback(res)
        }
      }
      
      return originalHttpRequest.call(this, options, callback)
    }
    
    // Intercept https requests
    const originalHttpsRequest = https.request
    https.request = function(options: any, callback?: any) {
      const url = options.hostname || options.host || ''
      if (url.includes('api.openai.com')) {
        const tracer = trace.getTracer('spinal-openai')
        const span = tracer.startSpan('openai-api-call')
        
        // Store span for later processing
        const originalCallback = callback
        callback = function(res: any) {
          // Intercept response to capture token usage
          const chunks: Buffer[] = []
          res.on('data', (chunk: Buffer) => chunks.push(chunk))
          res.on('end', () => {
            try {
              const body = Buffer.concat(chunks).toString()
              const parsed: OpenAIResponse = JSON.parse(body)
              
              if (parsed.usage) {
                span.setAttribute('spinal.input_tokens', parsed.usage.prompt_tokens)
                span.setAttribute('spinal.output_tokens', parsed.usage.completion_tokens)
                span.setAttribute('spinal.total_tokens', parsed.usage.total_tokens)
              }
              
              if (parsed.model) {
                span.setAttribute('spinal.model', `openai:${parsed.model}`)
              }
              
              span.setStatus({ code: SpanStatusCode.OK })
              span.end()
            } catch {
              span.setStatus({ code: SpanStatusCode.OK })
              span.end()
            }
          })
          
          if (originalCallback) originalCallback(res)
        }
      }
      
      return originalHttpsRequest.call(this, options, callback)
    }
  } catch {
    // Node.js http/https modules not available (browser environment)
  }
}
