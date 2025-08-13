# Spinal CLI Quick Reference

## Essential Commands

| Command | Description | Example |
|---------|-------------|---------|
| `spinal status` | Show configuration | `npx spinal status` |
| `spinal local` | View local data | `npx spinal local --limit 20` |
| `spinal report` | Cost analysis | `npx spinal report --since 7d` |
| `spinal login` | Cloud mode setup | `npx spinal login` |

## Data Viewing Options

### `spinal local` Formats
```bash
npx spinal local                    # Table (default)
npx spinal local --format summary   # Statistics
npx spinal local --format json      # Raw data
npx spinal local --limit 50         # Show more spans
```

### `spinal report` Time Windows
```bash
npx spinal report                   # Last 24h (default)
npx spinal report --since 1h        # Last hour
npx spinal report --since 7d        # Last week
npx spinal report --since 30d       # Last month
```

## Common Workflows

### Daily Monitoring
```bash
# Check today's costs
npx spinal report --since 24h

# View recent activity
npx spinal local --limit 10

# Export for analysis
npx spinal local --format json > today.json
```

### Cost Analysis
```bash
# Weekly summary
npx spinal report --since 7d

# Detailed breakdown
npx spinal local --format summary

# Export spans
npx spinal local --format json --limit 100 > spans.json
```

### Setup & Configuration
```bash
# Check current setup
npx spinal status

# Initialize config
npx spinal init

# Setup cloud mode
npx spinal login
export SPINAL_API_KEY=your-key
```

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `SPINAL_MODE` | Force mode | `SPINAL_MODE=local` |
| `SPINAL_API_KEY` | Cloud API key | `SPINAL_API_KEY=sk-...` |
| `SPINAL_LOCAL_STORE_PATH` | Local file path | `SPINAL_LOCAL_STORE_PATH=./data.jsonl` |

## Output Examples

### Status Output
```json
{
  "mode": "local",
  "localStorePath": "./.spinal/spans.jsonl",
  "excludedHosts": "api.openai.com,api.anthropic.com"
}
```

### Report Output
```json
{
  "spansProcessed": 150,
  "estimatedCostUSD": 0.0450,
  "timeWindow": "24h"
}
```

### Local Summary Output
```json
{
  "totalSpans": 25,
  "uniqueTraces": 18,
  "estimatedCost": 0.0043
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No local data found" | Check if app is running with Spinal configured |
| "Permission denied" | `chmod 644 .spinal/spans.jsonl` |
| "Invalid format" | Use `table`, `summary`, or `json` |

## Help Commands

```bash
npx spinal --help              # General help
npx spinal local --help        # Local command help
npx spinal report --help       # Report command help
npx spinal login --help        # Login command help
```
