# Local Analytics

Spinal's local mode provides comprehensive analytics capabilities that work entirely on your machine, ensuring complete privacy while giving you powerful insights into your OpenAI API usage.

## Overview

Local analytics processes the spans collected by Spinal in local mode, providing detailed analysis of:
- **Cost analysis** - Track and optimize your OpenAI API spending
- **Usage patterns** - Understand how you're using different models and features
- **Performance metrics** - Monitor response times and success rates
- **Response analysis** - Analyze the actual content and quality of API responses
- **Content insights** - Understand response patterns and efficiency

## CLI Commands

### Cost Analysis

```bash
# Basic cost analysis
spinal cost

# Detailed cost breakdown by model
spinal cost --by-model

# Cost analysis by aggregation ID
spinal cost --by-aggregation

# Cost trends over time
spinal cost --trends

# Different output formats
spinal cost --format json
spinal cost --format csv
spinal cost --format summary
```

### Usage Analytics

```bash
# Basic usage statistics
spinal usage

# Token breakdown
spinal usage --tokens

# Usage by model
spinal usage --by-model

# Usage by aggregation
spinal usage --by-aggregation
```

### Performance Analysis

```bash
# Basic performance metrics
spinal performance

# Detailed response time analysis
spinal performance --response-times

# Error analysis
spinal performance --errors

# Performance by model
spinal performance --by-model
```

### Response Analysis

**NEW**: Analyze the actual content and quality of OpenAI API responses.

```bash
# Basic response analysis
spinal responses

# Detailed error analysis
spinal responses --errors

# Response quality by model
spinal responses --by-model

# Response size distribution
spinal responses --size-distribution

# All response analysis options
spinal responses --errors --by-model --size-distribution
```

**What you can learn:**
- Response content patterns and quality
- Error types and frequencies
- Model-specific response characteristics
- Response size distributions
- Success rates and failure patterns

### Content Insights

**NEW**: Get detailed insights about response content patterns and efficiency.

```bash
# Basic content insights
spinal content

# Response length patterns
spinal content --patterns

# Finish reason distribution
spinal content --finish-reasons

# Response quality metrics
spinal content --quality

# All content insights
spinal content --patterns --finish-reasons --quality
```

**What you can learn:**
- Response length patterns (short/medium/long)
- Finish reasons (stop, length, content_filter)
- Token efficiency metrics
- Response quality indicators
- Common error patterns

### Model Analysis

```bash
# Compare models across multiple metrics
spinal models

# Model efficiency analysis
spinal models --efficiency

# Cost analysis by model
spinal models --costs
```

### Aggregation Analysis

```bash
# Analyze usage by custom aggregation IDs
spinal aggregations

# Specific aggregation ID analysis
spinal aggregations --id "feature-name"

# Cost analysis by aggregation
spinal aggregations --costs
```

### Trends Analysis

```bash
# Usage and cost trends
spinal trends

# Focus on cost trends
spinal trends --costs

# Focus on usage trends
spinal trends --usage

# Focus on performance trends
spinal trends --performance
```

### Optimization Recommendations

```bash
# Get actionable recommendations
spinal optimize

# Cost optimization focus
spinal optimize --costs

# Performance optimization focus
spinal optimize --performance
```

## Time Filtering

All commands support time-based filtering:

```bash
# Last hour
spinal cost --since 1h

# Last 24 hours
spinal usage --since 24h

# Last week
spinal performance --since 7d

# Last month
spinal responses --since 30d

# Last quarter
spinal content --since 90d

# Last year
spinal trends --since 1y
```

## Output Formats

Most commands support multiple output formats:

- `table` - Human-readable table format (default)
- `json` - Structured JSON output
- `csv` - Comma-separated values
- `summary` - Brief summary format

## Response Analysis Features

### What Gets Analyzed

When Spinal captures OpenAI API responses in local mode, it analyzes:

1. **Response Content**
   - Actual response text from the API
   - Response size in bytes
   - Response length in characters
   - Finish reasons (stop, length, content_filter)

2. **Error Patterns**
   - Error types and frequencies
   - Error messages
   - Success/failure rates
   - Model-specific error patterns

3. **Quality Metrics**
   - Tokens per character ratio
   - Response efficiency (tokens per byte)
   - Response size distribution
   - Model performance comparisons

4. **Content Patterns**
   - Short vs medium vs long responses
   - Response length distributions
   - Content quality indicators
   - Usage pattern analysis

### Privacy Benefits

- **Complete privacy**: All analysis happens locally
- **No data transmission**: Response content never leaves your machine
- **Real-time insights**: Get immediate feedback during development
- **Historical analysis**: Track patterns over time without external dependencies

### Use Cases

1. **Cost Optimization**
   - Identify which models produce longer/shorter responses
   - Analyze cost efficiency per response size
   - Optimize prompts based on response patterns

2. **Quality Monitoring**
   - Track response quality metrics
   - Monitor finish reasons to understand completion patterns
   - Detect degradation in response quality

3. **Error Debugging**
   - Detailed error analysis with actual error messages
   - Pattern detection in API failures
   - Model-specific error tracking

4. **Performance Analysis**
   - Response size vs token efficiency
   - Model comparison across multiple metrics
   - Usage pattern optimization

## Examples

### Basic Response Analysis

```bash
$ spinal responses --format table

📄 Response Analysis (Last 7d)
────────────────────────────────────────────────────────────
Total Responses: 5
Average Response Size: 1068.0 bytes
Success Rate: 80.0%
Error Rate: 20.0%
────────────────────────────────────────────────────────────

📊 Response Size Distribution:
• Small (< 500 bytes): 1 responses
• Medium (500-2000 bytes): 4 responses
• Large (> 2000 bytes): 0 responses

🚨 Error Analysis:
• rate_limit_exceeded: 1 occurrences

🤖 Response Quality by Model:
openai:gpt-4o-mini:
  • Avg response length: 39.0 chars
  • Avg response size: 1024.0 bytes
  • Success rate: 100.0%
```

### Content Insights

```bash
$ spinal content --format table --patterns --quality

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

### Cost Analysis with Response Context

```bash
$ spinal cost --by-model --format table

💰 Cost Analysis (Last 7d)
────────────────────────────────────────────────────────────
Total Cost: $0.0023
Total API Calls: 5
Average Cost per Call: $0.0005
────────────────────────────────────────────────────────────

📊 Cost by Model:
• openai:gpt-4o-mini: $0.0008 (2 calls, 34.8%)
• openai:gpt-4o: $0.0015 (2 calls, 65.2%)
```

## Integration with Development Workflow

### During Development

```bash
# Monitor costs in real-time
spinal cost --since 1h --format summary

# Check response quality
spinal responses --since 24h --by-model

# Debug API issues
spinal content --since 1h --format json
```

### Before Production

```bash
# Comprehensive cost analysis
spinal cost --since 7d --by-model --by-aggregation

# Performance validation
spinal performance --since 7d --response-times

# Response quality assessment
spinal responses --since 7d --errors --by-model
```

### Ongoing Monitoring

```bash
# Daily cost tracking
spinal cost --since 24h --format summary

# Weekly performance review
spinal performance --since 7d --format table

# Monthly optimization review
spinal optimize --since 30d
```

## Advanced Usage

### Custom Time Windows

```bash
# Custom time periods
spinal cost --since 12h
spinal usage --since 3d
spinal responses --since 14d
```

### Combining Multiple Analyses

```bash
# Comprehensive analysis
spinal cost --by-model --trends --format json > cost-analysis.json
spinal responses --errors --by-model --format json > response-analysis.json
spinal content --patterns --quality --format json > content-analysis.json
```

### Automation

```bash
#!/bin/bash
# Daily analytics script
echo "=== Daily Spinal Analytics ==="
echo "Costs:"
spinal cost --since 24h --format summary
echo ""
echo "Performance:"
spinal performance --since 24h --format summary
echo ""
echo "Response Quality:"
spinal responses --since 24h --format summary
```

## Troubleshooting

### No Data Found

If you see "No local data found" messages:

1. Ensure Spinal is configured for local mode
2. Check that your application is making OpenAI API calls
3. Verify the local store path is correct
4. Check file permissions on the `.spinal` directory

### Missing Response Data

If response analysis shows limited data:

1. Ensure you're using the latest version of Spinal
2. Check that response capture is enabled
3. Verify your OpenAI API calls are being instrumented
4. Check for any error messages in your application logs

### Performance Issues

If analytics commands are slow:

1. Use time filtering to limit data scope
2. Use summary format for quick overviews
3. Consider archiving old data if you have large datasets
4. Use specific aggregation IDs to focus analysis

## Next Steps

- Explore the [CLI Quick Reference](CLI_QUICK_REFERENCE.md) for command details
- Check [Configuration Options](CONFIGURATION_OPTIONS.md) for advanced settings
- Review [Local Mode](LOCAL_MODE.md) for setup instructions
- See [Tracking](TRACKING.md) for instrumentation details
