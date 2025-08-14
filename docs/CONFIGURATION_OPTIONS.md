# Configuration Options

The Spinal Observability SDK provides flexible configuration options for both local and cloud modes. This document covers all available configuration options, their usage, and examples.

## Configuration API

### Basic Configuration

```typescript
import { configure } from 'spinal-obs-node'

configure({
  // Mode and API Configuration
  mode?: 'cloud' | 'local'                    // Explicitly set mode
  apiKey?: string                             // API key for cloud mode
  endpoint?: string                           // Custom endpoint URL
  
  // Local Mode Options
  disableLocalMode?: boolean                  // Force cloud mode (requires API key)
  localStorePath?: string                     // Custom path for local data storage
  
  // Performance Tuning
  maxQueueSize?: number                       // Max spans in export queue (default: 2048)
  maxExportBatchSize?: number                 // Max spans per export batch (default: 512)
  scheduleDelayMs?: number                    // Export schedule delay (default: 5000ms)
  exportTimeoutMs?: number                    // Export timeout (default: 30000ms)
  
  // Advanced Options
  headers?: Record<string, string>            // Custom headers for cloud mode
  timeoutMs?: number                          // Request timeout (default: 5000ms)
  scrubber?: Scrubber                         // Custom data scrubbing logic
  opentelemetryLogLevel?: DiagLogLevel        // OpenTelemetry log level
})
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SPINAL_API_KEY` | API key for cloud mode | - | Yes (cloud mode) |
| `SPINAL_TRACING_ENDPOINT` | Spinal cloud endpoint | `https://cloud.withspinal.com` | No |
| `SPINAL_MODE` | Set to `'local'` for local mode | `'local'` (if no API key) | No |
| `SPINAL_LOCAL_STORE_PATH` | Custom path for local data storage | `./.spinal/spans.jsonl` | No |
| `SPINAL_DISABLE_LOCAL_MODE` | Set to `'true'` to force cloud mode | `false` | No |
| `SPINAL_PROCESS_MAX_QUEUE_SIZE` | Max spans in export queue | `2048` | No |
| `SPINAL_PROCESS_MAX_EXPORT_BATCH_SIZE` | Max spans per export batch | `512` | No |
| `SPINAL_PROCESS_SCHEDULE_DELAY` | Export schedule delay (ms) | `5000` | No |
| `SPINAL_PROCESS_EXPORT_TIMEOUT` | Export timeout (ms) | `30000` | No |

## Configuration Examples

### 1. Force Cloud Mode (Disable Local Fallback)

Use this when you want to ensure your application only runs in cloud mode and fails fast if no API key is provided.

```typescript
configure({
  apiKey: 'your-api-key',
  disableLocalMode: true  // Will throw error if no API key provided
})
```

**Environment Variable:**
```bash
export SPINAL_DISABLE_LOCAL_MODE="true"
export SPINAL_API_KEY="your-api-key"
```

### 2. Custom Local Storage Path

Store local data in a custom location instead of the default `.spinal/spans.jsonl`.

```typescript
configure({
  localStorePath: '/tmp/my-app-spans.jsonl'  // Store in custom location
})
```

**Environment Variable:**
```bash
export SPINAL_LOCAL_STORE_PATH="/var/log/spinal/spans.jsonl"
```

### 3. Performance Tuning

Optimize the SDK for your specific use case and environment constraints.

```typescript
configure({
  maxQueueSize: 1000,           // Smaller queue for memory-constrained environments
  maxExportBatchSize: 100,      // Smaller batches for more frequent exports
  scheduleDelayMs: 2000,        // Export every 2 seconds instead of 5
  exportTimeoutMs: 15000,       // Shorter timeout for faster failure detection
  timeoutMs: 3000               // Shorter request timeout
})
```

**Environment Variables:**
```bash
export SPINAL_PROCESS_MAX_QUEUE_SIZE="1000"
export SPINAL_PROCESS_MAX_EXPORT_BATCH_SIZE="100"
export SPINAL_PROCESS_SCHEDULE_DELAY="2000"
export SPINAL_PROCESS_EXPORT_TIMEOUT="15000"
```

### 4. Custom Headers and Advanced Options

Add custom headers for authentication, user agents, or other requirements.

```typescript
configure({
  apiKey: 'your-api-key',
  headers: {
    'X-Custom-Header': 'custom-value',
    'User-Agent': 'MyApp/1.0',
    'X-Environment': 'production'
  },
  opentelemetryLogLevel: 'ERROR' // Suppress verbose logging
})
```

### 5. Local Mode with Custom Path

Explicitly configure local mode with a custom storage location.

```typescript
configure({
  mode: 'local',
  localStorePath: './logs/spinal-data.jsonl'
})
```

## Mode Selection Logic

The SDK uses the following logic to determine the mode:

1. **Explicit Mode**: If `mode` is specified in configuration, use that
2. **Environment Mode**: If `SPINAL_MODE` environment variable is set, use that
3. **API Key Detection**: If `apiKey` is provided (via config or `SPINAL_API_KEY`), use `'cloud'`
4. **Local Fallback**: Default to `'local'` if no API key is available

### Disable Local Mode

When `disableLocalMode` is `true`:
- **With API Key**: Forces cloud mode
- **Without API Key**: Throws error immediately

This is useful for production environments where you want to ensure cloud mode is always used.

## Error Handling

The SDK provides clear error messages for configuration issues:

- **Missing API Key**: `"No API key provided. Set SPINAL_API_KEY or pass to configure()."`
- **Disabled Local Mode**: `"Cannot disable local mode without providing an API key for cloud mode"`
- **Missing Endpoint**: `"Spinal endpoint must be provided"`

## Best Practices

### Production Environments
```typescript
configure({
  apiKey: process.env.SPINAL_API_KEY,
  disableLocalMode: true,  // Ensure cloud mode only
  maxQueueSize: 4096,      // Larger queue for high-throughput
  scheduleDelayMs: 1000,   // More frequent exports
  timeoutMs: 10000         // Longer timeout for network issues
})
```

### Development Environments
```typescript
configure({
  mode: 'local',
  localStorePath: './dev-data/spans.jsonl',
  maxQueueSize: 512,       // Smaller queue for development
  opentelemetryLogLevel: 'DEBUG'  // More verbose logging
})
```

### Testing Environments
```typescript
configure({
  mode: 'local',
  localStorePath: '/tmp/test-spans.jsonl',
  maxQueueSize: 100,       // Minimal queue for tests
  scheduleDelayMs: 100     // Fast exports for testing
})
```

## Migration Guide

### From Previous Versions

If you're upgrading from a previous version:

1. **No Breaking Changes**: All existing configurations will continue to work
2. **New Options**: You can optionally add `disableLocalMode` and `localStorePath`
3. **Environment Variables**: New environment variables are backward compatible

### Example Migration

**Before:**
```typescript
configure({
  apiKey: 'your-key',
  endpoint: 'https://cloud.withspinal.com'
})
```

**After (with new options):**
```typescript
configure({
  apiKey: 'your-key',
  endpoint: 'https://cloud.withspinal.com',
  disableLocalMode: true,  // New: ensure cloud mode only
  localStorePath: '/var/log/spinal/spans.jsonl'  // New: custom path (for local mode)
})
```

## Troubleshooting

### Common Issues

1. **"Cannot disable local mode without providing an API key"**
   - Solution: Provide an API key when using `disableLocalMode: true`

2. **"No API key provided"**
   - Solution: Set `SPINAL_API_KEY` environment variable or pass `apiKey` to configure()

3. **Permission denied for localStorePath**
   - Solution: Ensure the directory exists and is writable

4. **High memory usage**
   - Solution: Reduce `maxQueueSize` and `maxExportBatchSize`

### Debug Configuration

Use the CLI to check your current configuration:

```bash
npx spinal status
```

This will show all current configuration values and help identify any issues.
