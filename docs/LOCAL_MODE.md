# Spinal Local Mode

Spinal's local mode allows you to collect and analyze API usage data locally without sending data to the cloud. This is perfect for development, testing, and cost analysis without requiring an API key.

## Quick Start

### 1. Install Spinal

```bash
npm install spinal-obs-node
```

### 2. Configure in Local Mode

```javascript
import { configure, instrumentHTTP, instrumentOpenAI, tag, shutdown } from 'spinal-obs-node';

// Configure Spinal in local mode
configure({
  mode: 'local',
  localStorePath: './spans.jsonl' // Optional: custom path for span data
});

// Instrument HTTP and OpenAI API calls
instrumentHTTP();
instrumentOpenAI();
```

### 3. Add Contextual Tags

```javascript
// Tag your operations for cost grouping and analysis
const userFlowTag = tag({ 
  aggregationId: 'user-signup-flow', 
  tenant: 'acme-corp',
  userId: 'user-123'
});

// Your application code here
// ... make API calls ...

// Clean up when done
userFlowTag.dispose();
```

### 4. View Collected Data

Use the CLI to view your collected data:

```bash
# Display recent spans in table format
npx spinal local

# Show summary statistics
npx spinal local --format summary

# Export as JSON
npx spinal local --format json --limit 50
```

## Configuration Options

### Environment Variables

```bash
# Set local mode (default if no API key is provided)
SPINAL_MODE=local

# Custom path for span storage
SPINAL_LOCAL_STORE_PATH=./my-spans.jsonl

# Tuning parameters
SPINAL_PROCESS_MAX_QUEUE_SIZE=2048
SPINAL_PROCESS_MAX_EXPORT_BATCH_SIZE=512
SPINAL_PROCESS_SCHEDULE_DELAY=5000
SPINAL_PROCESS_EXPORT_TIMEOUT=30000
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

## Integration Examples

### Express.js Backend

```javascript
import express from 'express';
import { configure, instrumentHTTP, instrumentOpenAI, tag } from 'spinal-obs-node';

// Configure Spinal
configure({ mode: 'local' });
instrumentHTTP();
instrumentOpenAI();

const app = express();

app.post('/api/chat', async (req, res) => {
  // Tag the request for cost tracking
  const requestTag = tag({
    aggregationId: 'chat-api',
    userId: req.user?.id,
    sessionId: req.session?.id
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

// Configure once at module level
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

### FastAPI Backend (Python with Node.js instrumentation)

```python
# If you have a Node.js service alongside FastAPI
import subprocess
import json

def analyze_costs():
    # Run Spinal CLI to get cost analysis
    result = subprocess.run(
        ['npx', 'spinal', 'local', '--format', 'summary'],
        capture_output=True,
        text=True
    )
    return json.loads(result.stdout)
```

## CLI Commands

### View Local Data

```bash
# Default table view (last 10 spans)
npx spinal local

# Show more spans
npx spinal local --limit 50

# Summary format
npx spinal local --format summary

# JSON export
npx spinal local --format json --limit 100 > spans.json
```

### Cost Analysis

```bash
# Get cost summary
npx spinal report

# Analyze specific time window
npx spinal report --since 7d
```

### Configuration Status

```bash
# Check current configuration
npx spinal status
```

## Data Format

Spans are stored in JSONL format with the following structure:

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

## Cost Tracking

Spinal automatically tracks costs for:

- **OpenAI API calls**: Based on model, input tokens, and output tokens
- **HTTP requests**: Duration and endpoint information
- **Custom spans**: Any manually created spans with cost attributes

### Cost Attributes

Add these attributes to your spans for cost tracking:

```javascript
tag({
  'spinal.model': 'openai:gpt-4o-mini',
  'spinal.input_tokens': 150,
  'spinal.output_tokens': 75,
  'spinal.estimated_cost': 0.0025
});
```

## Best Practices

### 1. Early Configuration

Configure Spinal as early as possible in your application lifecycle:

```javascript
// At the top of your main file
import { configure, instrumentHTTP, instrumentOpenAI } from 'spinal-obs-node';

configure({ mode: 'local' });
instrumentHTTP();
instrumentOpenAI();
```

### 2. Meaningful Aggregation IDs

Use descriptive aggregation IDs for cost grouping:

```javascript
tag({
  aggregationId: 'user-onboarding-flow',
  feature: 'email-verification',
  userType: 'premium'
});
```

### 3. Proper Cleanup

Always dispose of tags when done:

```javascript
const tag = tag({ aggregationId: 'my-operation' });
try {
  // Your code here
} finally {
  tag.dispose();
}
```

### 4. Regular Analysis

Set up regular cost analysis:

```bash
# Daily cost check
npx spinal local --format summary

# Weekly report
npx spinal report --since 7d
```

## Troubleshooting

### No Spans Generated

1. **Check configuration**: Ensure `mode: 'local'` is set
2. **Verify instrumentation**: Call `instrumentHTTP()` and `instrumentOpenAI()`
3. **Check file path**: Verify `localStorePath` is writable
4. **Wait for export**: Spans are exported asynchronously (default: 5s delay)

### Performance Impact

- **Minimal overhead**: <1ms per span
- **Memory usage**: Configurable queue size (default: 2048 spans)
- **Disk usage**: ~1KB per span in JSONL format

### Data Privacy

Local mode ensures complete privacy:
- No data sent to external servers
- All data stored locally
- Sensitive information automatically scrubbed
- Full control over data retention

## Migration to Cloud Mode

When ready to use cloud features:

1. **Get API key**: Sign up at [dashboard.withspinal.com](https://dashboard.withspinal.com)
2. **Set environment variable**: `SPINAL_API_KEY=your-key-here`
3. **Update configuration**: Remove `mode: 'local'` or set `mode: 'cloud'`
4. **Data migration**: Historical local data can be imported to cloud dashboard

```javascript
// Cloud mode configuration
configure({
  apiKey: process.env.SPINAL_API_KEY,
  mode: 'cloud' // or omit for auto-detection
});
```
