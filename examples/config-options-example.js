import { configure, instrumentHTTP, instrumentOpenAI, tag, shutdown, displayLocalData } from '../src/index.js'

// Example 1: Force Cloud Mode (Disable Local Fallback)
console.log('=== Example 1: Force Cloud Mode ===')
try {
  configure({
    apiKey: 'your-api-key-here',
    disableLocalMode: true,  // Will throw error if no API key provided
    endpoint: 'https://cloud.withspinal.com'
  })
  console.log('✅ Cloud mode configured successfully')
} catch (error) {
  console.log('❌ Cloud mode failed:', error.message)
}

// Example 2: Custom Local Storage Path
console.log('\n=== Example 2: Custom Local Storage Path ===')
configure({
  localStorePath: '/tmp/my-app-spans.jsonl'  // Store in custom location
})
console.log('✅ Local mode with custom storage path configured')

// Example 3: Environment Variable Override
console.log('\n=== Example 3: Environment Variable Override ===')
// These would be set in your environment:
// export SPINAL_LOCAL_STORE_PATH="/var/log/spinal/spans.jsonl"
// export SPINAL_DISABLE_LOCAL_MODE="true"  // Note: requires SPINAL_API_KEY

configure() // Will use environment variables if set
console.log('✅ Configuration using environment variables')

// Example 4: Performance Tuning
console.log('\n=== Example 4: Performance Tuning ===')
configure({
  maxQueueSize: 1000,           // Smaller queue for memory-constrained environments
  maxExportBatchSize: 100,      // Smaller batches for more frequent exports
  scheduleDelayMs: 2000,        // Export every 2 seconds instead of 5
  exportTimeoutMs: 15000,       // Shorter timeout for faster failure detection
  timeoutMs: 3000               // Shorter request timeout
})
console.log('✅ Performance-tuned configuration applied')

// Example 5: Custom Headers and Advanced Options
console.log('\n=== Example 5: Custom Headers and Advanced Options ===')
configure({
  apiKey: 'your-api-key-here',
  headers: {
    'X-Custom-Header': 'custom-value',
    'User-Agent': 'MyApp/1.0'
  },
  opentelemetryLogLevel: 'ERROR' // Suppress verbose logging
})
console.log('✅ Advanced configuration with custom headers applied')

// Example 6: Local Mode with Custom Path
console.log('\n=== Example 6: Local Mode with Custom Path ===')
configure({
  mode: 'local',
  localStorePath: './logs/spinal-data.jsonl'
})
console.log('✅ Local mode with custom log path configured')

// Enable instrumentations
instrumentHTTP()
instrumentOpenAI()

// Add some context
const t = tag({ aggregationId: 'config-example', tenant: 'demo' })

// Simulate some work
setTimeout(async () => {
  console.log('\n=== Displaying Local Data ===')
  await displayLocalData({ limit: 5, format: 'summary' })
  
  t.dispose()
  await shutdown()
  console.log('✅ Example completed')
}, 1000)
