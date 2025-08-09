# Spinal Node SDK – Action Plan (public repo, npm-first)

## Goals
- Ship a public Node SDK that works standalone today (cloud optional), local mode coming soon
- Encapsulate our app concept: tagging, cost awareness, privacy-first telemetry
- Create a strong GitHub/npm presence while keeping cloud optional and separate

## Deliverables
1) Documentation (this repo)
- `README.md`: positioning, install, quickstart, env vars, roadmap
- `ARCHITECTURE.mmd`: high-level diagram
- `docs/PLAN.md`: milestones (this file)

2) Cloud mode (current)
- Env-driven config: `SPINAL_API_KEY`, `SPINAL_TRACING_ENDPOINT`
- HTTP instrumentation and minimal OpenAI enable hook
- Baggage tags under `spinal.*` applied to spans
- Scrubber for secrets/PII

3) Local mode (planned, no backend)
- Local store for spans (JSONL or sqlite)
- Pricing calculators (per model/provider, e.g., OpenAI `gpt-4o-mini`)
- CLI commands:
  - `spinal login` (optional, stores token for cloud mode later)
  - `spinal status` (mode, recent spans count, store path)
  - `spinal report --since 24h` (usage + cost summaries)
- Config precedence: CLI > env > defaults

4) Optional cloud connect (later)
- If `SPINAL_MODE=cloud` and `SPINAL_API_KEY` present: export to Spinal endpoint
- If not, fall back to local store + reports

5) Distribution & DX
- `tsup` build: ESM with types
- Semantic versioning, conventional commits
- GitHub Actions: lint, typecheck, release to npm with provenance

## Milestones
- M1: Public repo bootstrapped, README/diagram/plan committed
- M2: Solidify cloud mode (current code), publish as `@spinal/obs-node@0.1.0`
- M3: CLI skeleton (`spinal`) with `status` and local store toggle (no analytics yet)
- M4: Pricing calculators + `report`
- M5: Enriched LLM adapters beyond generic HTTP

## CLI Spec (initial)
- `spinal status`
  - Shows: mode, endpoint, queue sizes, local store path (if enabled), last export result
- `spinal login` (deferred)
  - Opens browser to backend-dashboard auth, stores token in keychain (using `keytar`)
  - Only used when `SPINAL_MODE=cloud`
- `spinal report [--since <dur>] [--format json|table]`
  - Aggregates local spans into usage/cost per service/model, estimates totals

## Publishing (your first npm release)
1. Create public GitHub repo (e.g., `withspinal/obs-node`)
2. Set `name` in `package.json` to `@spinal/obs-node` (scoped) or `spinal-obs` (unscoped)
3. Add `files` field to publish built `dist/` and typings
4. Build: `npx tsup src/index.ts --dts` (configure in `package.json` scripts)
5. Login: `npm login` (one-time)
6. Version: `npm version 0.1.0`
7. Publish: `npm publish --access public`

## Non-goals for now
- No Cloudflare workers or remote processing in local mode
- No user PII capture; minimal attributes, scrubbed
- No heavy runtime patching beyond standard OTel instrumentations

## Open questions
- Pricing model coverage: OpenAI/Anthropic/Groq – source of truth/versioning
- Local store format: sqlite (better queries) vs JSONL (simpler shipping)
- Backfill path to cloud: sync local summaries vs raw spans

## Success criteria
- Developers can install, configure, and see immediate value (tags + basic spans)
- Docs convey roadmap and business intent clearly
- Repo is clean, testable, and ready for incremental local-mode PRs
