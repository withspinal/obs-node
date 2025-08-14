# Local Analytics - OpenAI Usage Insights

The Spinal SDK's local mode provides powerful analytics to help you understand and optimize your OpenAI API usage and costs.

## Overview

When running in local mode, the SDK stores all telemetry data as spans in a local file. You can then run analytics commands to get insights about your usage patterns, costs, and trends.

## Available Analytics Commands

### 1. Cost Analysis (`spinal cost`)

**Purpose**: Track spending over time periods and identify cost trends.

**Usage**:
```bash
# Show total cost
npx spinal cost

# Show cost for specific time period
npx spinal cost --since 7d
npx spinal cost --since 24h
npx spinal cost --since 1h

# Show cost breakdown by model
npx spinal cost --by-model

# Show cost breakdown by aggregation ID
npx spinal cost --by-aggregation

# Show cost trends over time
npx spinal cost --trends
```

**Output Examples**:
```
💰 Cost Analysis (Last 7 days)
─────────────────────────────────────
Total Cost: $12.45
Total API Calls: 1,247
Average Cost per Call: $0.010

📊 Cost by Model:
• gpt-4o-mini: $8.23 (66.1%)
• gpt-4o: $4.22 (33.9%)

📈 Cost Trends:
• Yesterday: $2.15
• 2 days ago: $1.89
• 3 days ago: $1.67
```

### 2. Usage Analytics (`spinal usage`)

**Purpose**: Understand usage patterns and token consumption.

**Usage**:
```bash
# Show overall usage stats
npx spinal usage

# Show usage by time period
npx spinal usage --since 24h

# Show token breakdown
npx spinal usage --tokens

# Show usage by model
npx spinal usage --by-model

# Show usage by aggregation ID
npx spinal usage --by-aggregation
```

**Output Examples**:
```
📊 Usage Analytics (Last 24 hours)
─────────────────────────────────────
Total API Calls: 156
Total Tokens: 12,847
• Input tokens: 8,234
• Output tokens: 4,613

🤖 Usage by Model:
• gpt-4o-mini: 89 calls (57.1%)
• gpt-4o: 67 calls (42.9%)

📈 Token Efficiency:
• Average input tokens per call: 52.8
• Average output tokens per call: 29.6
• Token ratio (output/input): 0.56
```

### 3. Performance Analytics (`spinal performance`)

**Purpose**: Monitor API performance and response times.

**Usage**:
```bash
# Show performance overview
npx spinal performance

# Show response time trends
npx spinal performance --response-times

# Show error rates
npx spinal performance --errors

# Show performance by model
npx spinal performance --by-model
```

**Output Examples**:
```
⚡ Performance Analytics (Last 7 days)
─────────────────────────────────────
Total Requests: 1,247
Successful: 1,234 (98.9%)
Failed: 13 (1.1%)

⏱️ Response Times:
• Average: 2.3s
• Median: 1.8s
• 95th percentile: 4.2s
• Fastest: 0.8s
• Slowest: 12.1s

🚨 Error Analysis:
• Rate limit errors: 8
• Authentication errors: 3
• Network errors: 2
```

### 4. Model Analytics (`spinal models`)

**Purpose**: Compare performance and costs across different models.

**Usage**:
```bash
# Show model comparison
npx spinal models

# Show model efficiency
npx spinal models --efficiency

# Show cost per model
npx spinal models --costs
```

**Output Examples**:
```
🤖 Model Analytics (Last 30 days)
─────────────────────────────────────
gpt-4o-mini:
• Calls: 2,156 (67.2%)
• Total cost: $15.67
• Avg cost per call: $0.007
• Avg response time: 1.8s
• Success rate: 99.2%

gpt-4o:
• Calls: 1,052 (32.8%)
• Total cost: $42.18
• Avg cost per call: $0.040
• Avg response time: 3.2s
• Success rate: 98.7%
```

### 5. Aggregation Analytics (`spinal aggregations`)

**Purpose**: Analyze usage by custom aggregation IDs (user flows, features, etc.).

**Usage**:
```bash
# Show aggregation overview
npx spinal aggregations

# Show specific aggregation
npx spinal aggregations --id "user-signup-flow"

# Show aggregation costs
npx spinal aggregations --costs
```

**Output Examples**:
```
🏷️ Aggregation Analytics (Last 7 days)
─────────────────────────────────────
user-signup-flow:
• Calls: 234
• Total cost: $3.45
• Avg cost per call: $0.015
• Success rate: 99.6%

chat-api:
• Calls: 1,013
• Total cost: $8.92
• Avg cost per call: $0.009
• Success rate: 98.9%
```

### 6. Trends Analysis (`spinal trends`)

**Purpose**: Identify usage patterns and trends over time.

**Usage**:
```bash
# Show overall trends
npx spinal trends

# Show cost trends
npx spinal trends --costs

# Show usage trends
npx spinal trends --usage

# Show performance trends
npx spinal trends --performance
```

**Output Examples**:
```
📈 Trends Analysis (Last 30 days)
─────────────────────────────────────
📊 Usage Trends:
• Daily average calls: 107
• Peak usage: 156 calls (Day 15)
• Growth rate: +12% week-over-week

💰 Cost Trends:
• Daily average cost: $1.23
• Peak cost: $2.45 (Day 15)
• Cost per call trend: Decreasing

⚡ Performance Trends:
• Response time trend: Stable
• Error rate trend: Decreasing
• Success rate trend: Improving
```

### 7. Optimization Recommendations (`spinal optimize`)

**Purpose**: Get actionable recommendations to optimize costs and performance.

**Usage**:
```bash
# Show optimization recommendations
npx spinal optimize

# Show cost optimization
npx spinal optimize --costs

# Show performance optimization
npx spinal optimize --performance
```

**Output Examples**:
```
💡 Optimization Recommendations
─────────────────────────────────────
💰 Cost Optimization:
• Consider using gpt-4o-mini for simple tasks (save $0.033 per call)
• 23% of calls could use shorter prompts (save ~$2.45/week)
• Batch similar requests to reduce API calls

⚡ Performance Optimization:
• 15% of calls exceed 5s response time
• Consider implementing caching for repeated queries
• Monitor rate limits during peak hours

🎯 Usage Optimization:
• 67% of calls use gpt-4o for simple tasks
• Consider model selection based on complexity
• Implement token budgeting per user/feature
```

## Time Period Options

All commands support flexible time periods:

- `--since 1h` - Last hour
- `--since 24h` - Last 24 hours
- `--since 7d` - Last 7 days
- `--since 30d` - Last 30 days
- `--since 90d` - Last 90 days
- `--since 1y` - Last year

## Output Formats

Commands support multiple output formats:

- **Table** (default) - Human-readable tables
- **JSON** - Machine-readable JSON
- **CSV** - Comma-separated values for export
- **Summary** - Brief summary statistics

Example:
```bash
npx spinal cost --since 7d --format json
npx spinal usage --since 24h --format csv
```

## Data Storage

All analytics are computed from the local spans file:
- **Default location**: `.spinal/spans.jsonl`
- **Custom location**: Set via `SPINAL_LOCAL_STORE_PATH`
- **Data retention**: Spans are kept indefinitely (no automatic cleanup)

## Use Cases

### For Developers
- Monitor API usage during development
- Track costs for different features
- Identify performance bottlenecks
- Optimize prompt engineering

### For Product Managers
- Track feature usage costs
- Monitor user engagement patterns
- Plan capacity and budgeting
- Measure ROI of AI features

### For DevOps
- Monitor API performance
- Track error rates and reliability
- Plan infrastructure scaling
- Set up alerts and monitoring

## Integration with Existing Tools

The analytics data can be exported and integrated with:
- **Business Intelligence tools** (Tableau, Power BI)
- **Monitoring systems** (Grafana, Datadog)
- **Spreadsheet applications** (Excel, Google Sheets)
- **Custom dashboards** and reporting systems
