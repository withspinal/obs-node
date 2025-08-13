# Spinal CLI Commands

The Spinal CLI provides powerful tools for managing and analyzing your observability data. All commands are available via `npx spinal` or after installing the package globally.

## Quick Reference

```bash
# Configuration and status
npx spinal status                    # Show current configuration
npx spinal init                      # Initialize configuration

# Local mode commands
npx spinal local                     # View local data (table format)
npx spinal local --format summary    # View summary statistics
npx spinal local --format json       # Export as JSON
npx spinal report                    # Cost analysis report

# Cloud mode commands
npx spinal login                     # Login for cloud mode
```

## Command Details

### `spinal status`

Display current configuration and mode information.

**Usage:**
```bash
npx spinal status
```

**Output:**
```json
{
  "mode": "local",
  "endpoint": "https://cloud.withspinal.com",
  "localStorePath": "/path/to/project/.spinal/spans.jsonl",
  "excludedHosts": "api.openai.com,api.anthropic.com,api.azure.com",
  "includeOpenAI": false
}
```

**What it shows:**
- **mode**: Current mode (`local` or `cloud`)
- **endpoint**: Spinal cloud endpoint (for cloud mode)
- **localStorePath**: Where local data is stored (for local mode)
- **excludedHosts**: HTTP hosts excluded from tracking
- **includeOpenAI**: Whether OpenAI tracking is enabled

**Use cases:**
- Verify configuration is correct
- Check which mode is active
- Debug instrumentation issues
- Confirm file paths for local mode

---

### `spinal init`

Initialize Spinal configuration (optional setup).

**Usage:**
```bash
npx spinal init [options]
```

**Options:**
- `--endpoint <url>`: Set Spinal endpoint (default: `https://cloud.withspinal.com`)

**Examples:**
```bash
# Use default endpoint
npx spinal init

# Set custom endpoint
npx spinal init --endpoint https://my-spinal-instance.com
```

**What it does:**
- Saves configuration to local config file
- Creates `.spinal` directory if needed
- Sets up default settings

**Use cases:**
- First-time setup
- Custom endpoint configuration
- Team environment setup

---

### `spinal local`

Display collected local data in various formats.

**Usage:**
```bash
npx spinal local [options]
```

**Options:**
- `--limit <number>`: Number of spans to display (default: `10`)
- `--format <format>`: Output format: `table`, `summary`, or `json` (default: `table`)
- `-h, --help`: Show help information

**Examples:**

**Table format (default):**
```bash
npx spinal local
```

Output:
```
📊 Spinal Local Data (showing last 10 of 25 spans)

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Name                           Trace ID                        Duration (ms) Status    Model            Cost ($) 
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
HTTP POST                      1234567890abcdef1234567890      1250.5        OK       openai:gpt-4o-mini 0.0025  
HTTP GET                       abcdef1234567890abcdef1234      45.2          OK       N/A              N/A      
HTTP POST                      567890abcdef1234567890abcd      890.1         OK       openai:gpt-4o-mini 0.0018  
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

💰 Total estimated cost: $0.0043
📈 Total spans collected: 25
🔍 Unique traces: 18
```

**Summary format:**
```bash
npx spinal local --format summary
```

Output:
```json
{
  "totalSpans": 25,
  "uniqueTraces": 18,
  "spanTypes": {
    "HTTP POST": 15,
    "HTTP GET": 8,
    "Custom Span": 2
  },
  "estimatedCost": 0.0043
}
```

**JSON format:**
```bash
npx spinal local --format json --limit 5
```

Output:
```json
[
  {
    "name": "HTTP POST",
    "trace_id": "1234567890abcdef1234567890",
    "span_id": "abcdef1234567890abcdef1234",
    "start_time": 1640995200000000,
    "end_time": 1640995201250000,
    "status": { "code": "OK" },
    "attributes": {
      "http.method": "POST",
      "http.url": "https://api.openai.com/v1/chat/completions",
      "spinal.model": "openai:gpt-4o-mini",
      "spinal.input_tokens": 150,
      "spinal.output_tokens": 75
    }
  }
]
```

**Use cases:**
- Monitor recent API usage
- Analyze cost patterns
- Debug performance issues
- Export data for external analysis

---

### `spinal report`

Generate cost analysis and usage reports.

**Usage:**
```bash
npx spinal report [options]
```

**Options:**
- `--since <duration>`: Time window (e.g., `24h`, `7d`, `1h`) (default: `24h`)
- `-h, --help`: Show help information

**Examples:**
```bash
# Last 24 hours (default)
npx spinal report

# Last 7 days
npx spinal report --since 7d

# Last hour
npx spinal report --since 1h

# Last 30 days
npx spinal report --since 30d
```

**Output:**
```json
{
  "spansProcessed": 150,
  "estimatedCostUSD": 0.0450,
  "timeWindow": "24h",
  "averageCostPerHour": 0.0019
}
```

**What it analyzes:**
- Total spans processed in time window
- Estimated cost in USD
- Cost per hour/day averages
- Usage patterns over time

**Use cases:**
- Daily cost monitoring
- Budget planning
- Usage trend analysis
- Cost optimization

---

### `spinal login`

Login for cloud mode (opens backend dashboard).

**Usage:**
```bash
npx spinal login [options]
```

**Options:**
- `--dashboard-url <url>`: Custom dashboard URL (default: `https://dashboard.withspinal.com/login`)

**Examples:**
```bash
# Use default dashboard
npx spinal login

# Use custom dashboard
npx spinal login --dashboard-url https://my-dashboard.com/login
```

**What it does:**
- Opens browser to Spinal dashboard
- Provides login instructions
- Guides you through API key setup

**Use cases:**
- Setting up cloud mode
- Getting API key for cloud features
- Team onboarding
- Dashboard access

---

## Environment Variables

The CLI respects these environment variables:

```bash
# Mode configuration
SPINAL_MODE=local                    # Force local mode
SPINAL_API_KEY=your-api-key          # Cloud mode API key

# Local storage
SPINAL_LOCAL_STORE_PATH=./spans.jsonl # Custom local file path

# Performance tuning
SPINAL_PROCESS_MAX_QUEUE_SIZE=2048   # Queue size
SPINAL_PROCESS_MAX_EXPORT_BATCH_SIZE=512 # Batch size
SPINAL_PROCESS_SCHEDULE_DELAY=5000   # Export delay (ms)
SPINAL_PROCESS_EXPORT_TIMEOUT=30000  # Export timeout (ms)

# HTTP tracking
SPINAL_EXCLUDED_HOSTS=api.openai.com,api.anthropic.com # Excluded hosts
SPINAL_INCLUDE_OPENAI=true           # Enable OpenAI tracking
```

## Common Workflows

### 1. First-Time Setup (Local Mode)

```bash
# Check if Spinal is installed
npx spinal status

# Initialize configuration (optional)
npx spinal init

# Start your application with Spinal configured
# ... run your app ...

# View collected data
npx spinal local

# Get cost summary
npx spinal report
```

### 2. Daily Monitoring

```bash
# Check today's usage
npx spinal report --since 24h

# View recent activity
npx spinal local --limit 20

# Export data for analysis
npx spinal local --format json --limit 100 > today-spans.json
```

### 3. Cost Analysis

```bash
# Weekly cost report
npx spinal report --since 7d

# Monthly analysis
npx spinal report --since 30d

# Detailed span analysis
npx spinal local --format summary
```

### 4. Cloud Mode Setup

```bash
# Login to get API key
npx spinal login

# Set API key
export SPINAL_API_KEY=your-api-key

# Verify configuration
npx spinal status

# Start using cloud features
```

## Troubleshooting

### Common Issues

**"No local data found"**
```bash
# Check if data file exists
ls -la .spinal/spans.jsonl

# Verify configuration
npx spinal status

# Check if application is generating spans
```

**"Permission denied"**
```bash
# Fix file permissions
chmod 644 .spinal/spans.jsonl

# Check directory permissions
chmod 755 .spinal/
```

**"Invalid format"**
```bash
# Use correct format options
npx spinal local --format table    # or summary, json
npx spinal report --since 24h      # or 7d, 1h, etc.
```

### Getting Help

```bash
# Command-specific help
npx spinal local --help
npx spinal report --help
npx spinal login --help

# General help
npx spinal --help
```

## Integration Examples

### Scripting with CLI

**Bash script for daily monitoring:**
```bash
#!/bin/bash
echo "=== Daily Spinal Report ==="
npx spinal report --since 24h

echo "=== Recent Activity ==="
npx spinal local --limit 10

echo "=== Cost Summary ==="
npx spinal local --format summary
```

**Node.js integration:**
```javascript
import { execSync } from 'child_process';

function getDailyReport() {
  const output = execSync('npx spinal report --since 24h', { encoding: 'utf8' });
  return JSON.parse(output);
}

function getRecentSpans(limit = 10) {
  const output = execSync(`npx spinal local --format json --limit ${limit}`, { encoding: 'utf8' });
  return JSON.parse(output);
}
```

**Python integration:**
```python
import subprocess
import json

def get_spinal_report():
    result = subprocess.run(
        ['npx', 'spinal', 'report', '--since', '24h'],
        capture_output=True,
        text=True
    )
    return json.loads(result.stdout)

def get_recent_spans(limit=10):
    result = subprocess.run(
        ['npx', 'spinal', 'local', '--format', 'json', '--limit', str(limit)],
        capture_output=True,
        text=True
    )
    return json.loads(result.stdout)
```

## Best Practices

### 1. Regular Monitoring
- Set up daily cost checks with `spinal report`
- Monitor usage patterns with `spinal local`
- Archive old data periodically

### 2. Automation
- Integrate CLI commands into CI/CD pipelines
- Set up automated cost alerts
- Create scheduled reports

### 3. Data Management
- Regularly backup `.spinal/` directory
- Archive old span files
- Monitor disk usage

### 4. Team Collaboration
- Share configuration via environment variables
- Document custom workflows
- Set up team dashboards (cloud mode)

## Related Documentation

- **[LOCAL_MODE.md](./LOCAL_MODE.md)** - Complete local mode guide
- **[QUICKSTART.md](./QUICKSTART.md)** - Getting started with Spinal
- **[TRACKING.md](./TRACKING.md)** - What data gets tracked
- **[README.md](../README.md)** - Main SDK documentation
