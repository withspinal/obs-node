# Local Mode Implementation

This document summarizes the local mode functionality that has been implemented in the Spinal Observability SDK.

## What Was Implemented

### 1. Local Data Storage
- **File-based storage**: Spans are stored in JSONL format locally
- **Configurable path**: Defaults to `.spinal/spans.jsonl` in project directory
- **Customizable location**: Can be set via `localStorePath` option or `SPINAL_LOCAL_STORE_PATH` environment variable

### 2. CLI Commands
- **`spinal local`**: Display collected local data in readable formats
  - Table format (default): Shows recent spans with cost information
  - Summary format: Provides statistics and cost totals
  - JSON format: Raw data export for further processing
- **`spinal report`**: Cost analysis and usage statistics
- **`spinal status`**: Configuration and mode information

### 3. Programmatic API
- **`displayLocalData()`**: Function to display local data programmatically
- **Local mode configuration**: Automatic detection when no API key is provided
- **Tag-based cost tracking**: Support for custom cost attributes

### 4. Data Formats

#### Span Structure
```json
{
  "name": "HTTP GET",
  "trace_id": "1234567890abcdef",
  "span_id": "abcdef1234567890",
  "parent_span_id": null,
  "start_time": 1640995200000000,
  "end_time": 1640995201000000,
  "status": { "code": "OK" },
  "attributes": {
    "http.method": "GET",
    "http.url": "https://api.openai.com/v1/chat/completions",
    "spinal.model": "openai:gpt-4o-mini",
    "spinal.input_tokens": 150,
    "spinal.output_tokens": 75,
    "aggregationId": "user-signup-flow",
    "tenant": "acme-corp"
  },
  "events": [],
  "links": []
}
```

#### Cost Tracking Attributes
- `spinal.model`: AI model used (e.g., "openai:gpt-4o-mini")
- `spinal.input_tokens`: Number of input tokens
- `spinal.output_tokens`: Number of output tokens
- `spinal.estimated_cost`: Custom cost estimate

## Usage Examples

### Basic Setup
```javascript
import { configure, instrumentHTTP, instrumentOpenAI, tag } from 'spinal-obs-node';

// Configure in local mode
configure({ mode: 'local' });

// Enable instrumentation
instrumentHTTP();
instrumentOpenAI();

// Add contextual tags
const t = tag({ aggregationId: 'my-operation', tenant: 'acme' });
// ... your code ...
t.dispose();
```

### CLI Usage
```bash
# View recent spans
npx spinal local

# Get cost summary
npx spinal local --format summary

# Export data
npx spinal local --format json --limit 100 > spans.json
```

### Programmatic Data Display
```javascript
import { displayLocalData } from 'spinal-obs-node';

// Display summary
await displayLocalData({ format: 'summary' });

// Display recent spans
await displayLocalData({ limit: 10, format: 'table' });
```

## Configuration Options

### Environment Variables
```bash
SPINAL_MODE=local                    # Enable local mode
SPINAL_LOCAL_STORE_PATH=./spans.jsonl # Custom storage path
SPINAL_PROCESS_MAX_QUEUE_SIZE=2048   # Queue size tuning
SPINAL_PROCESS_MAX_EXPORT_BATCH_SIZE=512 # Batch size tuning
SPINAL_PROCESS_SCHEDULE_DELAY=5000   # Export delay (ms)
SPINAL_PROCESS_EXPORT_TIMEOUT=30000  # Export timeout (ms)
```

### Programmatic Configuration
```javascript
configure({
  mode: 'local',
  localStorePath: './custom-spans.jsonl',
  maxQueueSize: 1024,
  maxExportBatchSize: 256,
  scheduleDelayMs: 2000,
  exportTimeoutMs: 15000
});
```

## Integration Patterns

### Express.js Backend
```javascript
import express from 'express';
import { configure, instrumentHTTP, instrumentOpenAI, tag } from 'spinal-obs-node';

configure({ mode: 'local' });
instrumentHTTP();
instrumentOpenAI();

const app = express();

app.post('/api/chat', async (req, res) => {
  const requestTag = tag({
    aggregationId: 'chat-api',
    userId: req.user?.id
  });

  try {
    // Your OpenAI API call here
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: req.body.messages
    });

    res.json(response.data);
  } finally {
    requestTag.dispose();
  }
});
```

### Next.js Application
```javascript
// pages/api/chat.js
import { configure, instrumentHTTP, instrumentOpenAI, tag } from 'spinal-obs-node';

if (!global.spinalConfigured) {
  configure({ mode: 'local' });
  instrumentHTTP();
  instrumentOpenAI();
  global.spinalConfigured = true;
}

export default async function handler(req, res) {
  const requestTag = tag({
    aggregationId: 'nextjs-chat',
    userId: req.headers['x-user-id']
  });

  try {
    // Your API logic here
    const result = await processChatRequest(req.body);
    res.json(result);
  } finally {
    requestTag.dispose();
  }
}
```

## Benefits

### 1. Privacy-First
- No data sent to external servers
- Complete control over data retention
- Automatic scrubbing of sensitive information

### 2. Zero Dependencies
- No API keys required
- No network connectivity needed
- Works offline

### 3. Immediate Value
- Real-time cost tracking
- Usage pattern analysis
- Performance monitoring

### 4. Easy Migration
- Seamless transition to cloud mode
- Historical data preservation
- Same API interface

## Performance Characteristics

- **Minimal overhead**: <1ms per span
- **Memory usage**: Configurable queue size (default: 2048 spans)
- **Disk usage**: ~1KB per span in JSONL format
- **Export frequency**: Configurable (default: 5s delay)

## Data Management

### File Organization
```
project/
├── .spinal/
│   └── spans.jsonl          # Main data file
├── src/
├── package.json
└── .gitignore              # Should include .spinal/
```

### Backup and Archival
```bash
# Create backup
cp .spinal/spans.jsonl .spinal/spans.backup.jsonl

# Archive old data
mv .spinal/spans.jsonl .spinal/spans-$(date +%Y%m%d).jsonl

# Compress old files
gzip .spinal/spans-*.jsonl
```

## Future Enhancements

### Planned Features
- **Time-based filtering**: Filter spans by date range
- **Advanced analytics**: Usage pattern detection
- **Data compression**: Automatic compression of old data
- **Export formats**: CSV, Excel, and other formats
- **Real-time monitoring**: Live span viewing

### Integration Opportunities
- **Dashboard integration**: Web-based local dashboard
- **Alert system**: Cost threshold notifications
- **Team collaboration**: Shared local data stores
- **Cloud sync**: Optional data synchronization

## Troubleshooting

### Common Issues

1. **No spans generated**
   - Check configuration: Ensure `mode: 'local'` is set
   - Verify instrumentation: Call `instrumentHTTP()` and `instrumentOpenAI()`
   - Check file path: Verify `localStorePath` is writable
   - Wait for export: Spans are exported asynchronously (default: 5s delay)

2. **Permission errors**
   - Check file permissions: `ls -la .spinal/spans.jsonl`
   - Fix permissions: `chmod 644 .spinal/spans.jsonl`

3. **Large file size**
   - Monitor usage: `ls -lh .spinal/spans.jsonl`
   - Archive old data: Move to separate files
   - Implement rotation: Set up automatic file rotation

### Getting Help
- **Documentation**: Check [LOCAL_MODE.md](./LOCAL_MODE.md)
- **Examples**: See [examples/local-mode-example.js](../examples/local-mode-example.js)
- **Issues**: [GitHub Issues](https://github.com/withspinal/obs-node/issues)
- **Email**: founders@withspinal.com
