# Local Mode Storage Guide

This guide explains how Spinal Observability SDK stores and manages data in local mode, where all telemetry data is kept on your local machine without sending anything to external services.

## 🏠 **What is Local Mode?**

Local mode is Spinal's privacy-first approach that stores all your API usage data locally on your machine. This gives you immediate insights into your LLM costs and usage patterns without requiring any cloud services or API keys.

### **Key Benefits:**
- ✅ **Zero external dependencies** - No cloud services required
- ✅ **Complete privacy** - All data stays on your machine
- ✅ **Instant insights** - No network latency or API limits
- ✅ **Free forever** - No usage limits or costs
- ✅ **Offline capable** - Works without internet connection

## 📁 **Where Data is Stored**

### **Default Storage Location**
```
{your-project-directory}/.spinal/spans.jsonl
```

### **File Structure**
```
your-project/
├── .spinal/
│   └── spans.jsonl          # Main data file
├── src/
├── package.json
└── ...
```

### **Custom Storage Path**
You can customize where data is stored using:

**Environment Variable:**
```bash
SPINAL_LOCAL_STORE_PATH=/custom/path/to/data.jsonl
```

**Configuration Option:**
```typescript
import { configure } from 'spinal-obs-node'

configure({
  localStorePath: '/custom/path/to/data.jsonl'
})
```

## 📄 **Data Format (JSONL)**

The `.spinal/spans.jsonl` file uses JSON Lines format - each line contains a complete JSON object representing one API call or span.

### **Example Data Structure**
```jsonl
{"name":"HTTP POST","attributes":{"http.url":"https://api.openai.com/v1/chat/completions","http.method":"POST","http.status_code":200,"spinal.aggregationId":"user-chat","spinal.tenant":"acme","spinal.model":"gpt-4o-mini","spinal.input_tokens":150,"spinal.output_tokens":75},"duration":1200,"startTime":"2024-01-15T10:30:00.000Z","endTime":"2024-01-15T10:30:01.200Z"}
{"name":"HTTP POST","attributes":{"http.url":"https://api.openai.com/v1/chat/completions","http.method":"POST","http.status_code":200,"spinal.aggregationId":"user-chat","spinal.tenant":"acme","spinal.model":"gpt-4o-mini","spinal.input_tokens":200,"spinal.output_tokens":120},"duration":1800,"startTime":"2024-01-15T10:35:00.000Z","endTime":"2024-01-15T10:35:01.800Z"}
```

### **What Each Span Contains**
- **Request metadata**: URL, method, status codes
- **Performance data**: Duration, timing
- **Cost information**: Token counts, model used
- **Contextual tags**: Aggregation IDs, tenant info
- **Error details**: Failed requests, status codes

## 🛠️ **Accessing Your Data**

### **Using the CLI Tool**

**Check Storage Status:**
```bash
npx spinal status
```
Output:
```json
{
  "mode": "local",
  "localStorePath": "/path/to/your/project/.spinal/spans.jsonl",
  "endpoint": "https://cloud.withspinal.com",
  "excludedHosts": "api.openai.com,api.anthropic.com,api.azure.com",
  "includeOpenAI": true
}
```

**Generate Usage Reports:**
```bash
# Last 24 hours (default)
npx spinal report

# Custom time window
npx spinal report --since 7d
npx spinal report --since 1h
```

Output:
```json
{
  "spansProcessed": 150,
  "estimatedCostUSD": 0.0450
}
```

### **Direct File Access**

**View Raw Data:**
```bash
# View all data
cat .spinal/spans.jsonl

# View last 10 entries
tail -10 .spinal/spans.jsonl

# Count total entries
wc -l .spinal/spans.jsonl
```

**Parse with jq (if installed):**
```bash
# Extract all costs
cat .spinal/spans.jsonl | jq -r '.attributes["spinal.estimated_cost"] // empty' | awk '{sum+=$1} END {print "Total cost: $" sum}'

# Group by model
cat .spinal/spans.jsonl | jq -r '.attributes["spinal.model"] // empty' | sort | uniq -c

# Find errors
cat .spinal/spans.jsonl | jq 'select(.attributes.error == true)'
```

## 🔧 **Configuration Options**

### **Environment Variables**
```bash
# Set custom storage path
SPINAL_LOCAL_STORE_PATH=/custom/path/data.jsonl

# Enable local mode explicitly
SPINAL_MODE=local

# Disable OpenAI tracking (if needed)
SPINAL_INCLUDE_OPENAI=false
```

### **Programmatic Configuration**
```typescript
import { configure } from 'spinal-obs-node'

configure({
  mode: 'local',
  localStorePath: '/custom/path/data.jsonl'
})
```

## 📊 **Data Management**

### **File Size Considerations**
- Each span is typically 200-500 bytes
- 10,000 API calls ≈ 3-5 MB
- JSONL format allows easy appending and processing

### **Backup and Archival**
```bash
# Create backup
cp .spinal/spans.jsonl .spinal/spans.backup.jsonl

# Archive old data
mv .spinal/spans.jsonl .spinal/spans-$(date +%Y%m%d).jsonl

# Compress old files
gzip .spinal/spans-*.jsonl
```

### **Data Cleanup**
```bash
# Remove old data (keep last 30 days)
find .spinal/ -name "spans-*.jsonl" -mtime +30 -delete

# Clear all data (start fresh)
rm .spinal/spans.jsonl
```

## 🔒 **Privacy & Security**

### **What's Stored Locally**
- ✅ API request/response metadata
- ✅ Performance timing data
- ✅ Cost estimation data
- ✅ Custom contextual tags
- ✅ Error information

### **What's NOT Stored**
- ❌ API keys (automatically scrubbed)
- ❌ Request/response content
- ❌ User messages or prompts
- ❌ Sensitive headers
- ❌ PII data

### **Data Scrubbing**
The SDK automatically removes sensitive information:
```json
{
  "http.request.header.authorization": "[Scrubbed]",
  "http.request.header.x-api-key": "[Scrubbed]",
  "user.email": "[Scrubbed]"
}
```

## 🚀 **Best Practices**

### **Storage Management**
1. **Regular backups**: Copy your `.spinal` directory periodically
2. **Archive old data**: Move old files to separate directories
3. **Monitor file size**: Large files can impact performance
4. **Version control**: Add `.spinal/` to your `.gitignore`

### **Performance Optimization**
1. **Batch processing**: Process data in chunks for large files
2. **Streaming reads**: Use line-by-line processing for large datasets
3. **Indexing**: Consider creating summary files for quick queries

### **Data Analysis**
1. **Regular reports**: Run `spinal report` daily/weekly
2. **Cost tracking**: Monitor spending patterns
3. **Usage patterns**: Identify peak usage times
4. **Error analysis**: Track and fix recurring issues

## 🔄 **Migrating to Cloud Mode**

When you're ready to use Spinal's cloud dashboard:

1. **Get an API key** from [dashboard.withspinal.com](https://dashboard.withspinal.com)
2. **Set environment variable**:
   ```bash
   SPINAL_API_KEY=your_api_key_here
   ```
3. **Data automatically syncs** to cloud
4. **Local data remains** for backup/offline access

### **Hybrid Approach**
You can run both modes simultaneously:
- Local mode for immediate insights
- Cloud mode for team dashboards and advanced analytics

## 📚 **Related Documentation**

- [QUICKSTART.md](./QUICKSTART.md) - Getting started with Spinal
- [TRACKING.md](./TRACKING.md) - What data gets tracked
- [README.md](../README.md) - Complete SDK documentation
- [ARCHITECTURE.mmd](../ARCHITECTURE.mmd) - System architecture

## 🆘 **Troubleshooting**

### **Common Issues**

**File not found:**
```bash
# Check if directory exists
ls -la .spinal/

# Create directory if missing
mkdir -p .spinal/
```

**Permission errors:**
```bash
# Check file permissions
ls -la .spinal/spans.jsonl

# Fix permissions
chmod 644 .spinal/spans.jsonl
```

**Large file size:**
```bash
# Check file size
ls -lh .spinal/spans.jsonl

# Archive and start fresh
mv .spinal/spans.jsonl .spinal/spans-archive.jsonl
```

### **Getting Help**
- **Documentation**: Check the [README.md](../README.md)
- **Issues**: [GitHub Issues](https://github.com/withspinal/obs-node/issues)
- **Email**: founders@withspinal.com
