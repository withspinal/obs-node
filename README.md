## Spinal Observability – Node SDK (public preview)

**SPINAL-OBS-NODE** is Spinal's cost tracking library built on top of OpenTelemetry. It works by automatically instrumenting HTTP libraries and attaching a processor to existing OpenTelemetry setups. This dual approach allows it to integrate seamlessly with existing observability frameworks while selectively forwarding AI/LLM operations and billing events to Spinal's platform.

**What this SDK does**
- **Seamlessly integrates** with existing OpenTelemetry setups (Logfire, vanilla OpenTelemetry, or any OTEL-compatible framework)
- **Auto-instruments** Node apps via OpenTelemetry (HTTP today; LLM providers via HTTP for now)
- **Tags contexts** with `spinal.*` baggage for aggregation and cost grouping
- **Scrubs sensitive data** before export (API keys, tokens, PII patterns)
- **Selective span processing** - only sends relevant AI/billing spans to Spinal
- **Exports spans** to a Spinal endpoint when configured (cloud mode) or stores locally (local mode)

This repo is the Node SDK piece of Spinal's system. It is designed to work standalone today and later connect to a cloud dashboard (FastAPI + ClickHouse) when you opt in.

### Key Features
- **OpenTelemetry Integration**: Works with existing OTEL setups without disruption
- **Automatic Instrumentation**: Captures HTTP requests and OpenAI API calls automatically
- **Contextual Tagging**: Adds user and workflow context to spans for better tracking
- **Privacy-First**: Built-in data scrubbing for sensitive information
- **Dual Modes**: Local mode (free) and cloud mode (with backend dashboard)

### Modes
- **Cloud mode (available now):** send spans to a Spinal endpoint when `SPINAL_API_KEY` is set.
- **Local mode (available now):** store spans locally and provide basic cost analysis and usage stats with a CLI (no backend, no Cloudflare). This gives a taste of Spinal without sending data.

### Install
```bash
npm install spinal-obs-node
```

CLI (optional):
```bash
npx spinal status
```

### Quickstart (local mode)
```ts
import { configure, instrumentHTTP, instrumentOpenAI, tag, shutdown } from 'spinal-obs-node'

// 1) Configure in local mode (no API key required)
configure({
  mode: 'local',
  localStorePath: './spans.jsonl' // Optional: custom path
})

// 2) Enable built-in instrumentations
instrumentHTTP()
instrumentOpenAI()

// 3) Add contextual tags at boundaries
const t = tag({ aggregationId: 'signup-flow', tenant: 'acme' })
// ... your code ...
t.dispose()

// 4) View collected data
// npx spinal local

// 5) On shutdown
await shutdown()
```

### Quickstart (cloud mode)
```ts
import { configure, instrumentHTTP, instrumentOpenAI, tag, shutdown } from 'spinal-obs-node'

// 1) Configure once at app init
configure({
  // Defaults to process.env.SPINAL_TRACING_ENDPOINT or 'https://cloud.withspinal.com'
  // endpoint: 'https://cloud.withspinal.com',
  // apiKey defaults to process.env.SPINAL_API_KEY
})

// 2) Enable built-in instrumentations
instrumentHTTP()
instrumentOpenAI()

// 3) Add contextual tags at boundaries
const t = tag({ aggregationId: 'signup-flow', tenant: 'acme' })
// ... your code ...
t.dispose()

// 4) On shutdown
await shutdown()
```

### Configuration Options

#### Environment Variables
- **`SPINAL_API_KEY`**: required in cloud mode
- **`SPINAL_TRACING_ENDPOINT`**: defaults to `https://cloud.withspinal.com`
- **`SPINAL_MODE`**: set to `'local'` for local mode (default if no API key)
- **`SPINAL_LOCAL_STORE_PATH`**: custom path for local data storage
- **`SPINAL_DISABLE_LOCAL_MODE`**: set to `'true'` to force cloud mode (requires `SPINAL_API_KEY`)
- **`SPINAL_EXCLUDE_OPENAI`**: set to `'true'` to disable OpenAI tracking (default: false)
- **`SPINAL_EXCLUDED_HOSTS`**: comma-separated list of hosts to exclude from HTTP tracking (default: `api.anthropic.com,api.azure.com`)
- Tuning (optional): `SPINAL_PROCESS_MAX_QUEUE_SIZE`, `SPINAL_PROCESS_MAX_EXPORT_BATCH_SIZE`, `SPINAL_PROCESS_SCHEDULE_DELAY`, `SPINAL_PROCESS_EXPORT_TIMEOUT`

#### Configuration API
```typescript
configure({
  // Mode and API Configuration
  mode?: 'cloud' | 'local'                    // Explicitly set mode
  apiKey?: string                             // API key for cloud mode
  endpoint?: string                           // Custom endpoint URL
  
  // Local Mode Options
  disableLocalMode?: boolean                  // Force cloud mode (requires API key)
  localStorePath?: string                     // Custom path for local data storage
  
  // Performance Tuning
  maxQueueSize?: number                       // Max spans in export queue (default: 2048)
  maxExportBatchSize?: number                 // Max spans per export batch (default: 512)
  scheduleDelayMs?: number                    // Export schedule delay (default: 5000ms)
  exportTimeoutMs?: number                    // Export timeout (default: 30000ms)
  
  // Advanced Options
  headers?: Record<string, string>            // Custom headers for cloud mode
  timeoutMs?: number                          // Request timeout (default: 5000ms)
  scrubber?: Scrubber                         // Custom data scrubbing logic
  opentelemetryLogLevel?: DiagLogLevel        // OpenTelemetry log level
})
```

#### Configuration Examples

**Force Cloud Mode (Disable Local Fallback)**
```typescript
configure({
  apiKey: 'your-api-key',
  disableLocalMode: true  // Will throw error if no API key provided
})
```

**Custom Local Storage Path**
```typescript
configure({
  localStorePath: '/tmp/my-app-spans.jsonl'  // Store in custom location
})
```

**Environment Variable Override**
```bash
export SPINAL_LOCAL_STORE_PATH="/var/log/spinal/spans.jsonl"
export SPINAL_DISABLE_LOCAL_MODE="true"  # Note: requires SPINAL_API_KEY
```

**Analytics Examples**
```bash
# Cost analysis with different formats
npx spinal cost --format json --since 7d
npx spinal cost --by-model --format table
npx spinal cost --trends --since 30d

# Usage analytics
npx spinal usage --tokens --since 24h
npx spinal usage --by-model --format summary

# Performance insights
npx spinal performance --since 7d
npx spinal optimize --since 30d

# Model-specific analysis
npx spinal models --since 7d
npx spinal responses --since 24h
```

### CLI Commands
```bash
# View local data
npx spinal local                    # Table format (default)
npx spinal local --format summary   # Summary statistics
npx spinal local --format json      # JSON export

# Cost analysis
npx spinal report                   # Cost summary
npx spinal report --since 7d        # Time-based analysis

# Analytics commands
npx spinal cost                     # Detailed cost analysis
npx spinal cost --by-model          # Cost breakdown by model
npx spinal cost --by-aggregation    # Cost breakdown by aggregation
npx spinal cost --trends            # Cost trends over time
npx spinal usage                    # Usage analytics
npx spinal usage --tokens           # Token usage breakdown
npx spinal performance              # Performance metrics
npx spinal models                   # Model-specific analytics
npx spinal aggregations             # Aggregation-based analytics
npx spinal trends                   # Trend analysis
npx spinal optimize                 # Optimization suggestions
npx spinal responses                # Response analysis
npx spinal content                  # Content analysis

# Configuration
npx spinal status                   # Current settings (JSON format)
npx spinal login                    # Cloud mode setup
npx spinal init                     # Initialize configuration
```

### Analytics and Insights
The CLI provides comprehensive analytics for cost optimization and usage insights:

**Cost Analysis (`spinal cost`)**
- Track total costs and cost trends over time
- Breakdown costs by model, aggregation ID, or time period
- Export data in table, JSON, CSV, or summary formats

**Usage Analytics (`spinal usage`)**
- Monitor API call patterns and token usage
- Analyze usage by model, aggregation, or time period
- Track input/output token ratios and efficiency

**Performance Insights (`spinal performance`, `spinal optimize`)**
- Identify performance bottlenecks and optimization opportunities
- Get recommendations for cost reduction
- Monitor response times and error rates

**Model Analysis (`spinal models`, `spinal responses`)**
- Compare performance across different models
- Analyze response patterns and content
- Track model-specific costs and usage

### Data handling and privacy
- Attributes matching common secret/PII patterns are scrubbed to `[Scrubbed]` before export.
- Baggage keys under the `spinal.*` namespace are attached to spans for aggregation.
- Default exporter excludes certain vendor hosts from HTTP collection to avoid redundant chatter.

### Local data storage
- In local mode, data is stored in `.spinal/spans.jsonl` in your project directory.
- **Recommended**: Add `.spinal/` to your `.gitignore` to avoid committing local telemetry data.

### Why this SDK (business intent)
- Developer-first, like how Stripe/Sentry/PostHog seeded adoption: free local SDK → optional paid cloud.
- Local mode provides immediate value (usage + cost insights) without any backend.
- Cloud mode later unlocks real-time analytics, team dashboards, ClickHouse-backed queries, and enterprise controls.

### Roadmap
- ✅ Local storage of spans + pricing calculators (estimates only in local)
- ✅ Terminal CLI: `spinal login`, `spinal status`, `spinal report` (pretty usage/cost views)
- Optional cloud connect using dashboard-backend auth when `SPINAL_MODE=cloud`
- Richer LLM adapters beyond HTTP (tokens, model-aware costing)

### Development & CI/CD

This package uses automated CI/CD for seamless publishing:

- **Tests**: Unit tests and E2E tests run on PR merge
- **Versioning**: Manual version management with semantic versioning
- **Publishing**: Automatic npm publish on main branch pushes
- **Duplicate Prevention**: Won't publish same version twice
- **Cursor Rules**: `.cursorrules` file included for AI coding assistance

**Release Workflow**: Update version → Push to main → CI publishes → Create GitHub release

**Workflow**:
1. Create pull request to `main` branch
2. On merge, GitHub Action runs lint + unit tests + E2E tests
3. If all tests pass, version is bumped (patch)
4. Package is published to npm
5. Git tag is created and pushed

**Required Secrets**:
- `NPM_TOKEN`: npm authentication token for publishing
- `OPENAI_API_KEY`: OpenAI API key for E2E tests (see [GitHub Secrets Setup](./docs/GITHUB_SECRETS.md))

**📖 [Quickstart Guide](./docs/QUICKSTART.md)**
Get started in minutes with step-by-step instructions.

**📦 [Installation Guide](./docs/INSTALLATION.md)**
What you get when you install the SDK and dependency details.

**📊 [What Gets Tracked](./docs/TRACKING.md)**
Detailed explanation of tracking capabilities and data captured.

**🏠 [Local Mode Guide](./docs/LOCAL_MODE.md)**
Complete guide to local mode storage and data management.

**🖥️ [CLI Commands](./docs/CLI_COMMANDS.md)**
Complete reference for all CLI commands and usage examples.

**🚀 [Release Guide](./docs/RELEASES.md)**
Complete release workflow and version management.

### Repository boundaries
- This Node SDK should be a **public repo** and versioned/published to npm.
- Keep it separate from cloud/backend repos. Later, it can optionally connect to the Spinal cloud.

### Similar ecosystems
- Think `mermaidchart.com` distribution model: dev-first, easy install, great docs; the SDK is the product interface.

### License
MIT


