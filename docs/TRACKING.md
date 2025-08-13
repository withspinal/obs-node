# What the Spinal SDK Tracks

This document explains what data the Spinal Observability SDK captures and tracks for LLM providers, particularly OpenAI.

## 🔍 **OpenAI Tracking Overview**

### **Current Implementation (HTTP-based)**
The SDK uses OpenTelemetry's HTTP instrumentation to capture OpenAI API interactions:

#### **Request Data Captured:**
- **Request URLs**: `https://api.openai.com/v1/chat/completions`
- **HTTP Method**: `POST`, `GET`, etc.
- **Request Headers**: Including authentication tokens (scrubbed)
- **Request Body Size**: Data volume being sent
- **Timing**: Request start time and duration

#### **Response Data Captured:**
- **Response Status**: Success/failure codes (200, 400, 429, etc.)
- **Response Headers**: Metadata about the response
- **Response Size**: Data volume received
- **Latency**: Total request duration

#### **Contextual Data:**
- **Custom Tags**: User-defined aggregation IDs, tenant info
- **Service Context**: Which service made the request
- **User Context**: User-specific metadata

## 💰 **Cost Tracking & Estimation**

### **Current Pricing Models**
The SDK includes built-in pricing for popular models:

```typescript
const catalog: PricingModel[] = [
  { model: 'openai:gpt-4o-mini', inputPer1K: 0.15, outputPer1K: 0.60 },
  { model: 'openai:gpt-4o', inputPer1K: 2.50, outputPer1K: 10.00 },
]
```

### **Cost Calculation**
```typescript
export function estimateCost(params: {
  model?: string
  inputTokens?: number
  outputTokens?: number
}): number {
  const { model = 'openai:gpt-4o-mini', inputTokens = 0, outputTokens = 0 } = params
  const entry = catalog.find((c) => c.model === model) ?? catalog[0]
  const inputCost = (inputTokens / 1000) * entry.inputPer1K
  const outputCost = (outputTokens / 1000) * entry.outputPer1K
  return roundUSD(inputCost + outputCost)
}
```

## 🛡️ **Privacy & Security**

### **Data Scrubbing**
The SDK automatically scrubs sensitive information:

- **API Keys**: Authentication tokens are removed
- **Sensitive Headers**: Authorization headers scrubbed
- **PII Data**: Personal information filtered out
- **Request Bodies**: Content may be sanitized

### **What Gets Exported**
Only safe, non-sensitive metadata is sent to Spinal cloud:

```json
{
  "span": {
    "name": "HTTP POST",
    "attributes": {
      "http.url": "https://api.openai.com/v1/chat/completions",
      "http.method": "POST",
      "http.status_code": 200,
      "http.request.header.content-length": "1234",
      "spinal.aggregationId": "user-chat-flow",
      "spinal.tenant": "acme-corp",
      "spinal.service": "chatbot"
    },
    "duration": 1500,
    "estimated_cost": 0.0025
  }
}
```

## 🎯 **Current vs Future Tracking**

### **Current Capabilities (HTTP-based)**
- ✅ Request/response metadata
- ✅ Timing and performance metrics
- ✅ Cost estimates (based on URL patterns)
- ✅ Basic usage statistics
- ✅ Error tracking and status codes
- ✅ Custom contextual tagging

### **Future Enhancements (Direct Integration)**
- ✅ Exact token counts (input/output)
- ✅ Model-specific pricing and usage
- ✅ Detailed usage analytics
- ✅ Performance optimization insights
- ✅ Rate limiting analysis
- ✅ Error pattern analysis

## 📊 **Example Tracking Data**

### **Successful API Call**
```json
{
  "span": {
    "name": "OpenAI Chat Completion",
    "attributes": {
      "http.url": "https://api.openai.com/v1/chat/completions",
      "http.method": "POST",
      "http.status_code": 200,
      "http.request.header.content-length": "1234",
      "http.response.header.content-length": "5678",
      "spinal.aggregationId": "user-chat-flow",
      "spinal.tenant": "acme-corp",
      "spinal.service": "chatbot",
      "spinal.model": "gpt-4o-mini",
      "spinal.estimated_cost": 0.0025
    },
    "duration": 1500,
    "startTime": "2024-01-15T10:30:00.000Z",
    "endTime": "2024-01-15T10:30:01.500Z"
  }
}
```

### **Failed API Call**
```json
{
  "span": {
    "name": "OpenAI Chat Completion",
    "attributes": {
      "http.url": "https://api.openai.com/v1/chat/completions",
      "http.method": "POST",
      "http.status_code": 429,
      "http.status_text": "Too Many Requests",
      "spinal.aggregationId": "user-chat-flow",
      "spinal.tenant": "acme-corp",
      "spinal.service": "chatbot",
      "error": true
    },
    "duration": 500,
    "startTime": "2024-01-15T10:30:00.000Z",
    "endTime": "2024-01-15T10:30:00.500Z"
  }
}
```

## 🔧 **Configuration Options**

### **Environment Variables**
```bash
# Enable OpenAI tracking (default: true)
SPINAL_INCLUDE_OPENAI=true

# Exclude specific hosts
SPINAL_EXCLUDED_HOSTS=api.openai.com,api.anthropic.com

# Custom endpoint
SPINAL_TRACING_ENDPOINT=https://cloud.withspinal.com
```

### **Custom Tagging**
```typescript
import { tag } from 'spinal-obs-node'

// Add context to your API calls
const t = tag({ 
  aggregationId: 'user-chat-flow', 
  tenant: 'acme-corp',
  service: 'chatbot',
  userId: 'user-123',
  sessionId: 'session-456'
})

// Your OpenAI API call here
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello!' }]
})

// Clean up
t.dispose()
```

## 📈 **Usage Analytics**

### **What You Can Track**
- **API Call Frequency**: How often you're calling OpenAI
- **Model Usage**: Which models are most/least used
- **Cost Patterns**: Spending trends over time
- **Performance**: Response times and latency
- **Error Rates**: Failed requests and retries
- **User Patterns**: Usage by user, tenant, or service

### **Cost Optimization Insights**
- **Expensive Models**: Identify high-cost model usage
- **Inefficient Patterns**: Find opportunities to reduce calls
- **Rate Limiting**: Monitor and optimize for rate limits
- **Error Costs**: Track costs from failed requests

## 🚀 **Integration Examples**

### **Next.js Application**
```typescript
// lib/spinal.ts
import { configure, instrumentHTTP, instrumentOpenAI, tag } from 'spinal-obs-node'

export function initializeSpinal() {
  configure()
  instrumentHTTP()
  instrumentOpenAI()
}

export function trackChatCompletion(userId: string, sessionId: string) {
  return tag({ 
    aggregationId: 'chat-completion',
    tenant: 'my-app',
    userId,
    sessionId
  })
}
```

### **Express Backend**
```typescript
import { configure, instrumentHTTP, instrumentOpenAI, tag } from 'spinal-obs-node'

// Initialize
configure()
instrumentHTTP()
instrumentOpenAI()

app.post('/api/chat', async (req, res) => {
  const t = tag({ 
    aggregationId: 'api-chat',
    tenant: req.user.tenant,
    userId: req.user.id
  })
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: req.body.messages
    })
    res.json(response)
  } finally {
    t.dispose()
  }
})
```

## 🔮 **Roadmap**

### **Phase 1: Enhanced Token Tracking**
- Direct integration with OpenAI SDK
- Exact input/output token counts
- Model-specific usage analytics

### **Phase 2: Advanced Analytics**
- Usage pattern analysis
- Cost optimization recommendations
- Performance benchmarking

### **Phase 3: Multi-Provider Support**
- Anthropic Claude tracking
- Google Gemini tracking
- Azure OpenAI tracking
- Custom model support

## 📚 **Related Documentation**

- [README.md](../README.md) - Main SDK documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Setup and deployment guide
- [ARCHITECTURE.mmd](../ARCHITECTURE.mmd) - System architecture
- [WORKFLOW_TEMPLATES.md](./WORKFLOW_TEMPLATES.md) - CI/CD workflows

## 🆘 **Support**

For questions about tracking capabilities:
- Check the [README.md](../README.md) for quickstart
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for setup
- Contact: founders@withspinal.com
