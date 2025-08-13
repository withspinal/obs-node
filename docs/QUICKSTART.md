# Spinal SDK Quickstart

Get started with Spinal Observability SDK in minutes. Track your OpenAI API costs and usage patterns with minimal setup.

## 🚀 **Install**

```bash
npm install spinal-obs-node
```

## ⚡ **Quick Setup**

### **1. Initialize the SDK**
```typescript
import { configure, instrumentHTTP, instrumentOpenAI, tag, shutdown } from 'spinal-obs-node'

// Initialize once at app startup
configure()
instrumentHTTP()
instrumentOpenAI()
```

### **2. Add Context to Your API Calls**
```typescript
// Add contextual tags for cost grouping
const t = tag({ 
  aggregationId: 'user-chat-flow', 
  tenant: 'acme-corp',
  service: 'chatbot'
})

// Your OpenAI API call here
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello!' }]
})

// Clean up
t.dispose()
```

### **3. Add to .gitignore (Recommended)**
```bash
# Add to your .gitignore file to avoid committing local data
echo ".spinal/" >> .gitignore
```

### **4. Cleanup on Shutdown**
```typescript
// When your app shuts down
await shutdown()
```

## 🎯 **Complete Example**

### **Next.js Application**
```typescript
// lib/spinal.ts
import { configure, instrumentHTTP, instrumentOpenAI, tag, shutdown } from 'spinal-obs-node'

export function initializeSpinal() {
  configure()
  instrumentHTTP()
  instrumentOpenAI()
  console.log('Spinal SDK initialized')
}

export function createTag(aggregationId: string, tenant?: string) {
  return tag({ 
    aggregationId, 
    tenant: tenant || 'my-app',
    service: 'my-app'
  })
}

export async function cleanupSpinal() {
  await shutdown()
}
```

### **Express Backend**
```typescript
import { configure, instrumentHTTP, instrumentOpenAI, tag } from 'spinal-obs-node'

// Initialize early in your app
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

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Required for cloud mode
SPINAL_API_KEY=your_api_key_here

# Optional: Custom endpoint
SPINAL_TRACING_ENDPOINT=https://cloud.withspinal.com

# Optional: Enable OpenAI tracking (default: true)
SPINAL_INCLUDE_OPENAI=true
```

### **Modes**
- **Cloud Mode**: Send data to Spinal cloud dashboard (requires API key)
- **Local Mode**: Store data locally for analysis (free, no API key needed)

## 📊 **What Gets Tracked**

### **OpenAI API Calls**
- ✅ Request/response metadata
- ✅ Timing and performance
- ✅ Cost estimates
- ✅ Error tracking
- ✅ Usage patterns

### **Cost Tracking**
- ✅ Model-specific pricing
- ✅ Usage analytics
- ✅ Cost optimization insights
- ✅ Spending trends

### **Privacy & Security**
- ✅ API keys automatically scrubbed
- ✅ Sensitive data filtered
- ✅ PII protection

## 🎯 **Use Cases**

### **Cost Monitoring**
```typescript
// Track costs by user flow
const t = tag({ aggregationId: 'signup-flow' })
// ... user signup with AI assistance
t.dispose()
```

### **Performance Analysis**
```typescript
// Track performance by service
const t = tag({ aggregationId: 'chat-service' })
// ... chat completion
t.dispose()
```

### **Multi-tenant Tracking**
```typescript
// Track usage by tenant
const t = tag({ 
  aggregationId: 'user-chat',
  tenant: user.tenantId 
})
// ... API call
t.dispose()
```

## 🛠️ **CLI Tool (Optional)**

```bash
# Install CLI globally
npm install -g spinal-obs-node

# Check status
spinal status

# View local reports (local mode)
spinal report
```

## 📚 **Next Steps**

- [TRACKING.md](./TRACKING.md) - Detailed tracking capabilities
- [LOCAL_MODE.md](./LOCAL_MODE.md) - Local mode storage and data management
- [README.md](../README.md) - Full documentation
- [ARCHITECTURE.mmd](../ARCHITECTURE.mmd) - System architecture

## 🆘 **Need Help?**

- **Documentation**: Check the [README.md](../README.md)
- **Issues**: [GitHub Issues](https://github.com/withspinal/obs-node/issues)
- **Email**: founders@withspinal.com
