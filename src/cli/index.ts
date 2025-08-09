#!/usr/bin/env node
import { Command } from 'commander'
import Conf from 'conf'
import open from 'open'
import { configure, getConfig } from '../runtime/config'
import fs from 'node:fs'
import path from 'node:path'
import { estimateCost } from '../pricing'

const program = new Command()
program.name('spinal').description('Spinal CLI').version('0.1.0')

const store = new Conf({ projectName: 'spinal' })

program
  .command('status')
  .description('Show current mode and configuration summary')
  .action(async () => {
    const cfg = getConfig()
    const mode = cfg.mode
    const endpoint = cfg.endpoint
    const excluded = process.env.SPINAL_EXCLUDED_HOSTS ?? 'api.openai.com,api.anthropic.com,api.azure.com'
    const includeOpenAI = process.env.SPINAL_INCLUDE_OPENAI === 'true'
    console.log(JSON.stringify({ mode, endpoint, localStorePath: cfg.localStorePath, excludedHosts: excluded, includeOpenAI }, null, 2))
  })

program
  .command('login')
  .description('Login for cloud mode (opens backend dashboard)')
  .option('--dashboard-url <url>', 'Backend dashboard URL', 'https://dashboard.withspinal.com/login')
  .action(async (opts) => {
    await open(opts.dashboardUrl)
    console.log('Opened browser for login. After obtaining an API key, set SPINAL_API_KEY.')
  })

program
  .command('init')
  .description('Initialize configuration (optional)')
  .option('--endpoint <url>', 'Spinal endpoint', process.env.SPINAL_TRACING_ENDPOINT || 'https://cloud.withspinal.com')
  .action(async (opts) => {
    store.set('endpoint', opts.endpoint)
    console.log('Saved endpoint to local config.')
  })

program
  .command('report')
  .description('Summarize local usage and estimated costs')
  .option('--since <duration>', 'Time window, e.g., 24h', '24h')
  .action(async (opts) => {
    const cfg = getConfig()
    if (cfg.mode !== 'local') {
      console.log('report is for local mode. Set SPINAL_MODE=local or omit SPINAL_API_KEY.')
      return
    }
    const file = cfg.localStorePath
    if (!fs.existsSync(file)) {
      console.log('No local data found.')
      return
    }
    const raw = await fs.promises.readFile(file, 'utf8')
    const lines = raw.trim().length ? raw.trim().split('\n') : []
    let count = 0
    let est = 0
    for (const line of lines) {
      try {
        const span = JSON.parse(line)
        // Heuristic: look for attributes capturing token counts
        const attrs = span.attributes || {}
        const inputTokens = Number(attrs['spinal.input_tokens'] || 0)
        const outputTokens = Number(attrs['spinal.output_tokens'] || 0)
        const model = String(attrs['spinal.model'] || 'openai:gpt-4o-mini')
        est += estimateCost({ model, inputTokens, outputTokens })
        count++
      } catch {}
    }
    console.log(JSON.stringify({ spansProcessed: count, estimatedCostUSD: Number(est.toFixed(4)) }, null, 2))
  })

program.parseAsync()


