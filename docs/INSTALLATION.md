# Installation Guide

This guide explains what you get when you install the Spinal Observability SDK and how to use it effectively.

## 🚀 **Quick Install**

```bash
npm install spinal-obs-node
```

## 📦 **What You Get**

When you install `spinal-obs-node`, you automatically receive:

### **Core SDK Components**
- ✅ **OpenTelemetry Integration** - Full OpenTelemetry SDK for Node.js
- ✅ **HTTP Instrumentation** - Automatic HTTP request tracking
- ✅ **Cost Tracking** - Built-in cost estimation for LLM APIs
- ✅ **Privacy Protection** - Automatic data scrubbing and PII filtering
- ✅ **Local Mode** - Offline-capable local storage and analysis

### **CLI Tool**
- ✅ **`spinal` command** - Available globally via `npx spinal`
- ✅ **Status checking** - `spinal status` for configuration overview
- ✅ **Usage reports** - `spinal report` for cost and usage analysis
- ✅ **Configuration** - `spinal init` for setup assistance

### **Automatic Dependencies**
The following packages are automatically installed and managed:

#### **OpenTelemetry Core (Required for SDK)**
```json
{
  "@opentelemetry/api": "^1.9.0",                    // Core API
  "@opentelemetry/instrumentation-http": "^0.203.0", // HTTP tracking
  "@opentelemetry/instrumentation-undici": "^0.14.0", // HTTP client tracking
  "@opentelemetry/resources": "^2.0.1",              // Resource management
  "@opentelemetry/sdk-trace-base": "^2.0.1",         // Tracing SDK
  "@opentelemetry/sdk-trace-node": "^2.0.1",         // Node.js tracing
  "@opentelemetry/semantic-conventions": "^1.36.0"   // Standard attributes
}
```

#### **CLI Dependencies (Required for CLI tool)**
```json
{
  "commander": "^14.0.0",    // CLI argument parsing
  "conf": "^14.0.0",         // Configuration management
  "keytar": "^7.9.0",        // Secure credential storage
  "open": "^10.2.0",         // Browser opening for auth
  "undici": "^7.13.0"        // HTTP client for cloud mode
}
```

## 📊 **Package Information**

- **Package Size**: 26.7 kB (compressed)
- **Unpacked Size**: 129.4 kB
- **Node.js Version**: Requires Node.js 18.0.0 or higher
- **TypeScript Support**: Built-in type definitions included

## 🎯 **Usage Options**

### **Option 1: SDK Only (Programmatic)**
```typescript
import { configure, instrumentHTTP, instrumentOpenAI, tag, shutdown } from 'spinal-obs-node'

// Initialize
configure()
instrumentHTTP()
instrumentOpenAI()

// Add context
const t = tag({ aggregationId: 'user-flow', tenant: 'acme' })
// ... your code ...
t.dispose()

// Cleanup
await shutdown()
```

### **Option 2: CLI Only**
```bash
# Check status
npx spinal status

# Generate reports
npx spinal report

# Initialize configuration
npx spinal init
```

### **Option 3: Both SDK and CLI**
```typescript
// Use SDK in your code
import { configure, instrumentHTTP, tag } from 'spinal-obs-node'
configure()
instrumentHTTP()

// Use CLI for analysis
// npx spinal report --since 24h
```

## 🔧 **What's NOT Included**

The following are **NOT** installed for end users (only for development):

```json
{
  "devDependencies": {
    "@eslint/js": "^9.33.0",              // Linting (dev only)
    "@types/node": "^24.2.1",             // TypeScript types (dev only)
    "@vitest/coverage-v8": "^2.1.9",      // Testing (dev only)
    "eslint": "^9.33.0",                  // Linting (dev only)
    "tsup": "^8.5.0",                     // Building (dev only)
    "typescript": "^5.9.2",               // TypeScript (dev only)
    "typescript-eslint": "^8.39.1",       // TypeScript linting (dev only)
    "vitest": "^2.1.9"                    // Testing (dev only)
  }
}
```

## 🏗️ **Architecture Overview**

```
spinal-obs-node/
├── dist/                    # Compiled JavaScript
│   ├── index.js            # Main SDK (ESM)
│   ├── index.cjs           # Main SDK (CommonJS)
│   ├── cli/index.js        # CLI tool (ESM)
│   └── cli/index.cjs       # CLI tool (CommonJS)
├── docs/                   # Documentation
└── README.md              # Main documentation
```

## 🔒 **Security & Privacy**

### **What Gets Installed**
- ✅ All dependencies are from trusted npm packages
- ✅ No external scripts or binaries
- ✅ All code is open source and auditable

### **What Gets Tracked**
- ✅ API request metadata (URLs, methods, status codes)
- ✅ Performance timing data
- ✅ Cost estimation data
- ✅ Custom contextual tags

### **What Gets Scrubbed**
- ❌ API keys and authentication tokens
- ❌ Request/response content
- ❌ User messages or prompts
- ❌ PII data (emails, names, etc.)

## 🚀 **Getting Started**

### **1. Install the Package**
```bash
npm install spinal-obs-node
```

### **2. Initialize in Your App**
```typescript
import { configure, instrumentHTTP, instrumentOpenAI } from 'spinal-obs-node'

// Initialize once at app startup
configure()
instrumentHTTP()
instrumentOpenAI()
```

### **3. Add Context to Your API Calls**
```typescript
import { tag } from 'spinal-obs-node'

const t = tag({ 
  aggregationId: 'user-chat-flow', 
  tenant: 'acme-corp' 
})

// Your OpenAI API call here
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello!' }]
})

t.dispose()
```

### **4. Add to .gitignore (Recommended)**
```bash
# Add to your .gitignore file
echo ".spinal/" >> .gitignore
```

This prevents accidentally committing local telemetry data to version control.

### **5. Analyze Your Usage**
```bash
# Check current status
npx spinal status

# Generate cost report
npx spinal report --since 24h
```

## 🔄 **Modes**

### **Local Mode (Default)**
- ✅ No API key required
- ✅ Data stored locally
- ✅ Works offline
- ✅ Free forever

### **Cloud Mode (Optional)**
- 🔑 Requires API key
- ☁️ Data sent to Spinal cloud
- 📊 Advanced analytics dashboard
- 🏢 Team collaboration features

## 📚 **Related Documentation**

- [QUICKSTART.md](./QUICKSTART.md) - Get started in minutes
- [LOCAL_MODE.md](./LOCAL_MODE.md) - Local mode storage guide
- [TRACKING.md](./TRACKING.md) - What data gets tracked
- [README.md](../README.md) - Complete SDK documentation

## 🆘 **Support**

- **Documentation**: Check the [README.md](../README.md)
- **Issues**: [GitHub Issues](https://github.com/withspinal/obs-node/issues)
- **Email**: founders@withspinal.com
