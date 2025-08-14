# Spinal CLI Quick Reference

## Essential Commands

| Command | Description | Example |
|---------|-------------|---------|
| `spinal status` | Show configuration | `npx spinal status` |
| `spinal local` | View local data | `npx spinal local --limit 20` |
| `spinal report` | Cost analysis | `npx spinal report --since 7d` |
| `spinal login` | Cloud mode setup | `npx spinal login` |

## Analytics Commands

| Command | Description | Example |
|---------|-------------|---------|
| `spinal cost` | Cost analysis | `npx spinal cost --by-model` |
| `spinal usage` | Usage patterns | `npx spinal usage --tokens` |
| `spinal performance` | Performance metrics | `npx spinal performance --response-times` |
| `spinal responses` | **NEW** Response analysis | `npx spinal responses --errors --by-model` |
| `spinal content` | **NEW** Content insights | `npx spinal content --patterns --quality` |
| `spinal models` | Model comparison | `npx spinal models --efficiency` |
| `spinal aggregations` | Aggregation analysis | `npx spinal aggregations --costs` |
| `spinal trends` | Usage trends | `npx spinal trends --costs` |
| `spinal optimize` | Optimization tips | `npx spinal optimize --costs` |

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

### Response Analysis (NEW)
```bash
# Basic response analysis
npx spinal responses --format table

# Detailed error analysis
npx spinal responses --errors --by-model

# Response size distribution
npx spinal responses --size-distribution

# Content insights
npx spinal content --patterns --finish-reasons --quality

# Export response analysis
npx spinal responses --format json > response-analysis.json
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

### Response Analysis Output
```bash
📄 Response Analysis (Last 7d)
────────────────────────────────────────────────────────────
Total Responses: 5
Average Response Size: 1068.0 bytes
Success Rate: 80.0%
Error Rate: 20.0%

📊 Response Size Distribution:
• Small (< 500 bytes): 1 responses
• Medium (500-2000 bytes): 4 responses
• Large (> 2000 bytes): 0 responses

🤖 Response Quality by Model:
openai:gpt-4o-mini:
  • Avg response length: 39.0 chars
  • Avg response size: 1024.0 bytes
  • Success rate: 100.0%
```

### Content Insights Output
```bash
📝 Content Insights (Last 7d)
────────────────────────────────────────────────────────────

📊 Response Length Patterns:
• Short responses (< 50 chars): 2 (50.0%)
• Medium responses (50-200 chars): 2 (50.0%)
• Long responses (> 200 chars): 0 (0.0%)

🎯 Finish Reasons:
• stop: 4 responses

⚡ Response Quality Metrics:
• Average tokens per character: 0.60
• Response efficiency (tokens/byte): 0.0331
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
npx spinal responses --help    # Response analysis help
npx spinal content --help      # Content insights help
npx spinal cost --help         # Cost analysis help
npx spinal usage --help        # Usage analysis help
```
