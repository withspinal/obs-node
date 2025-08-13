## Spinal Observability – Node SDK (public preview)

**What this SDK does**
- **Auto-instruments** Node apps via OpenTelemetry (HTTP today; LLM providers via HTTP for now)
- **Tags contexts** with `spinal.*` baggage for aggregation and cost grouping
- **Scrubs sensitive data** before export (API keys, tokens, PII patterns)
- **Exports spans** to a Spinal endpoint when configured (future: local mode without cloud)

This repo is the Node SDK piece of Spinal’s system. It is designed to work standalone today and later connect to a cloud dashboard (FastAPI + ClickHouse) when you opt in.

### Modes
- **Cloud mode (available now):** send spans to a Spinal endpoint when `SPINAL_API_KEY` is set.
- **Local mode (planned):** store spans locally and provide basic cost analysis and usage stats with a CLI (no backend, no Cloudflare). This gives a taste of Spinal without sending data.



### Install
```bash
npm install spinal-obs-node
```

CLI (optional):
```bash
npx spinal status
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

### Environment variables
- **`SPINAL_API_KEY`**: required in cloud mode
- **`SPINAL_TRACING_ENDPOINT`**: defaults to `https://cloud.withspinal.com`
- Tuning (optional): `SPINAL_PROCESS_MAX_QUEUE_SIZE`, `SPINAL_PROCESS_MAX_EXPORT_BATCH_SIZE`, `SPINAL_PROCESS_SCHEDULE_DELAY`, `SPINAL_PROCESS_EXPORT_TIMEOUT`

### Data handling and privacy
- Attributes matching common secret/PII patterns are scrubbed to `[Scrubbed]` before export.
- Baggage keys under the `spinal.*` namespace are attached to spans for aggregation.
- Default exporter excludes certain vendor hosts from HTTP collection to avoid redundant chatter.

### Why this SDK (business intent)
- Developer-first, like how Stripe/Sentry/PostHog seeded adoption: free local SDK → optional paid cloud.
- Local mode provides immediate value (usage + cost insights) without any backend.
- Cloud mode later unlocks real-time analytics, team dashboards, ClickHouse-backed queries, and enterprise controls.

### Roadmap
- Local storage of spans + pricing calculators (estimates only in local)
- Terminal CLI: `spinal login`, `spinal status`, `spinal report` (pretty usage/cost views)
- Optional cloud connect using backend-dashboard auth when `SPINAL_MODE=cloud`
- Richer LLM adapters beyond HTTP (tokens, model-aware costing)

### Development & CI/CD

This package uses automated CI/CD for seamless publishing:

- **Tests**: Unit tests run on PR merge (e2e tests removed for faster feedback)
- **Versioning**: Automatic patch version bump on merge to main
- **Publishing**: Automatic npm publish on successful tests
- **Git Tags**: Automatic git tags created for each release
- **Cursor Rules**: `.cursorrules` file included for AI coding assistance

**Workflow**:
1. Create pull request to `main` branch
2. On merge, GitHub Action runs lint + unit tests
3. If tests pass, version is bumped (patch)
4. Package is published to npm
5. Git tag is created and pushed

**Required Secrets**:
- `NPM_TOKEN`: npm authentication token for publishing

**📖 [Full Deployment Guide](./docs/DEPLOYMENT.md)**
Complete setup, testing, and deployment instructions.

### Repository boundaries
- This Node SDK should be a **public repo** and versioned/published to npm.
- Keep it separate from cloud/backend repos. Later, it can optionally connect to the Spinal cloud.

### Similar ecosystems
- Think `mermaidchart.com` distribution model: dev-first, easy install, great docs; the SDK is the product interface.

### License
MIT


