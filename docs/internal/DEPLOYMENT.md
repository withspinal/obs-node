# Spinal SDK Deployment Guide

## What We Built

### 🎯 **Spinal Observability SDK**
A cost-aware OpenTelemetry instrumentation library for Node.js applications that automatically tracks API usage patterns, particularly focusing on LLM/AI service costs.

### 📦 **Package Details**
- **Name**: `spinal-obs-node`
- **Version**: 1.0.0
- **Type**: Public npm package
- **License**: MIT
- **Repository**: https://github.com/withspinal/obs-node

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your App      │    │  Spinal SDK     │    │   Spinal Cloud  │
│                 │    │                 │    │                 │
│ - Next.js       │───▶│ - Auto-instrument│───▶│ - FastAPI       │
│ - Express       │    │ - Cost tracking │    │ - ClickHouse    │
│ - Any Node.js   │    │ - Privacy scrub │    │ - Dashboard     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Features
- ✅ **Auto-instrumentation**: HTTP requests + OpenAI API calls
- ✅ **Cost tracking**: Usage patterns for optimization
- ✅ **Privacy-first**: Scrubs sensitive data before export
- ✅ **Contextual tagging**: Custom tags for cost grouping
- ✅ **Dual modes**: Local (free) + Cloud (with dashboard)

## Development Setup

### Prerequisites
- Node.js 18+
- npm account
- GitHub repository

### Local Development
```bash
# Clone repository
git clone https://github.com/withspinal/obs-node.git
cd obs-node

# Install dependencies
npm install

# Build package
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

### Testing Locally
```bash
# Link package locally
npm link

# In another project
npm link spinal-obs-node
```

## CI/CD Pipeline

### GitHub Actions Workflow
**File**: `.github/workflows/publish.yml`

**Trigger**: PR merge to main branch
**Steps**:
1. ✅ Run linting
2. ✅ Run unit tests (e2e removed for speed)
3. ✅ Build package
4. ✅ Bump patch version
5. ✅ Publish to npm
6. ✅ Create git tag

### Required Secrets
- `NPM_TOKEN`: npm authentication token for publishing

### Workflow Configuration
```yaml
on:
  pull_request:
    types: [closed]
    branches: [main]

jobs:
  test-and-publish:
    if: github.event.pull_request.merged == true
    # ... rest of workflow
```

## Publishing Process

### Manual Publishing
```bash
# Build and publish
npm run build
npm publish --access public
```

### Automated Publishing
1. Create PR to main branch
2. Merge PR → Triggers workflow
3. Automatic version bump (patch)
4. Automatic npm publish
5. Automatic git tag creation

### Package Contents
```
spinal-obs-node/
├── dist/           # Built JavaScript files (ESM + CJS)
├── README.md       # Main documentation
├── ARCHITECTURE.mmd # System architecture
├── docs/           # Additional documentation
│   ├── DEPLOYMENT.md
│   ├── PLAN.md
│   └── WHAT_WE_BUILT.md
└── .cursorrules    # AI assistant context
```

### Package Optimization
- **Included**: Only essential runtime files and documentation
- **Excluded**: Source code, tests, dev dependencies, config files
- **Size**: ~24KB compressed, ~120KB unpacked
- **Files**: 21 total files (optimized for production)

## Integration Examples

### Next.js Application
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

### Express Backend
```typescript
import { configure, instrumentHTTP, instrumentOpenAI, tag } from 'spinal-obs-node'

// Initialize early
configure()
instrumentHTTP()
instrumentOpenAI()

app.get('/api/chat', async (req, res) => {
  const t = tag({ aggregationId: 'chat-completion', tenant: req.user.tenant })
  
  try {
    // Your OpenAI call here
    const response = await openai.chat.completions.create({...})
    res.json(response)
  } finally {
    t.dispose()
  }
})
```

## Environment Variables

### Required (Cloud Mode)
- `SPINAL_API_KEY`: Authentication token for Spinal cloud

### Optional
- `SPINAL_TRACING_ENDPOINT`: Custom endpoint (defaults to Spinal cloud)
- `SPINAL_PROCESS_MAX_QUEUE_SIZE`: Queue size tuning
- `SPINAL_PROCESS_MAX_EXPORT_BATCH_SIZE`: Batch size tuning
- `SPINAL_PROCESS_SCHEDULE_DELAY`: Export delay tuning
- `SPINAL_PROCESS_EXPORT_TIMEOUT`: Export timeout tuning

## Testing Strategy

### Unit Tests
- **Location**: `tests/unit/`
- **Command**: `npm test`
- **Framework**: Vitest
- **Coverage**: Core functionality, pricing calculations

### E2E Tests (Removed)
- **Reason**: Slower feedback loop
- **Alternative**: Manual testing + unit tests

### Local Testing
```bash
# Test in another project
npm install spinal-obs-node
# Add integration code
# Test functionality
```

## Monitoring & Debugging

### Local Development
```bash
# Enable debug logging
DEBUG=spinal:* npm run dev

# Check package contents
npm pack --dry-run

# Test build
npm run build
```

### Production Monitoring
- Monitor npm download statistics
- Track GitHub Action success rates
- Monitor package size and performance

## Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

**Publish Failures**
- Check NPM_TOKEN secret is set
- Verify package name is available
- Check npm login status

**Test Failures**
```bash
# Run specific test
npm test -- tests/unit/pricing.test.ts

# Run with verbose output
npm test -- --reporter=verbose
```

## Future Enhancements

### Planned Features
- [ ] Local mode with file storage
- [ ] CLI tool for cost analysis
- [ ] More LLM provider integrations
- [ ] Real-time cost alerts
- [ ] Team dashboard features

### Version Strategy
- **Patch**: Bug fixes, minor improvements
- **Minor**: New features, backward compatible
- **Major**: Breaking changes

## Support & Resources

### Documentation
- [README.md](./README.md) - Main documentation
- [ARCHITECTURE.mmd](./ARCHITECTURE.mmd) - System architecture
- [PLAN.md](./PLAN.md) - Development roadmap
- [WORKFLOW_TEMPLATES.md](./WORKFLOW_TEMPLATES.md) - CI/CD workflow templates
- [TRACKING.md](./TRACKING.md) - What the SDK tracks and captures

### Community
- GitHub Issues: https://github.com/withspinal/obs-node/issues
- Email: founders@withspinal.com

### Related Projects
- Spinal Cloud Backend (FastAPI + ClickHouse)
- Spinal Dashboard (Next.js frontend)
- Spinal CLI (Terminal interface)
