#!/usr/bin/env node
import { Command } from 'commander'
import Conf from 'conf'
import open from 'open'
import { getConfig } from '../runtime/config'
import fs from 'fs'
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
  .command('local')
  .description('Display local collected data in a readable format')
  .option('--limit <number>', 'Limit number of spans to display', '10')
  .option('--format <format>', 'Output format: table, json, or summary', 'table')
  .action(async (opts) => {
    const cfg = getConfig()
    const file = cfg.localStorePath
    
    if (!fs.existsSync(file)) {
      console.log('No local data found. Start your application with Spinal configured to collect data.')
      return
    }

    const raw = await fs.promises.readFile(file, 'utf8')
    const lines = raw.trim().length ? raw.trim().split('\n') : []
    
    if (lines.length === 0) {
      console.log('No spans collected yet. Start your application with Spinal configured to collect data.')
      return
    }

    const spans = []
    for (const line of lines) {
      try {
        const span = JSON.parse(line)
        spans.push(span)
      } catch {
        // Ignore malformed JSON lines
      }
    }

    const limit = parseInt(opts.limit, 10)
    const displaySpans = spans.slice(-limit) // Show most recent spans

    if (opts.format === 'json') {
      console.log(JSON.stringify(displaySpans, null, 2))
    } else if (opts.format === 'summary') {
      const summary = {
        totalSpans: spans.length,
        uniqueTraces: new Set(spans.map(s => s.trace_id)).size,
        spanTypes: spans.reduce((acc, span) => {
          const type = span.name || 'unknown'
          acc[type] = (acc[type] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        estimatedCost: spans.reduce((total, span) => {
          const attrs = span.attributes || {}
          const inputTokens = Number(attrs['spinal.input_tokens'] || 0)
          const outputTokens = Number(attrs['spinal.output_tokens'] || 0)
          const model = String(attrs['spinal.model'] || 'openai:gpt-4o-mini')
          return total + estimateCost({ model, inputTokens, outputTokens })
        }, 0)
      }
      console.log(JSON.stringify(summary, null, 2))
    } else {
      // Default table format
      console.log(`\n📊 Spinal Local Data (showing last ${displaySpans.length} of ${spans.length} spans)\n`)
      console.log('─'.repeat(120))
      console.log(`${'Name'.padEnd(30)} ${'Trace ID'.padEnd(32)} ${'Duration (ms)'.padEnd(12)} ${'Status'.padEnd(8)} ${'Model'.padEnd(15)} ${'Cost ($)'.padEnd(8)}`)
      console.log('─'.repeat(120))
      
      for (const span of displaySpans) {
        const name = (span.name || 'unknown').substring(0, 29).padEnd(30)
        const traceId = span.trace_id.substring(0, 31).padEnd(32)
        const duration = span.end_time && span.start_time 
          ? ((span.end_time - span.start_time) / 1000000).toFixed(1).padEnd(12)
          : 'N/A'.padEnd(12)
        const status = (span.status?.code || 'UNSET').padEnd(8)
        
        const attrs = span.attributes || {}
        const model = (attrs['spinal.model'] || 'N/A').toString().substring(0, 14).padEnd(15)
        const inputTokens = Number(attrs['spinal.input_tokens'] || 0)
        const outputTokens = Number(attrs['spinal.output_tokens'] || 0)
        const cost = inputTokens > 0 || outputTokens > 0 
          ? estimateCost({ 
              model: String(attrs['spinal.model'] || 'openai:gpt-4o-mini'), 
              inputTokens, 
              outputTokens 
            }).toFixed(4).padEnd(8)
          : 'N/A'.padEnd(8)
        
        console.log(`${name} ${traceId} ${duration} ${status} ${model} ${cost}`)
      }
      console.log('─'.repeat(120))
      
      // Show summary at bottom
      const totalCost = spans.reduce((total, span) => {
        const attrs = span.attributes || {}
        const inputTokens = Number(attrs['spinal.input_tokens'] || 0)
        const outputTokens = Number(attrs['spinal.output_tokens'] || 0)
        const model = String(attrs['spinal.model'] || 'openai:gpt-4o-mini')
        return total + estimateCost({ model, inputTokens, outputTokens })
      }, 0)
      
      console.log(`\n💰 Total estimated cost: $${totalCost.toFixed(4)}`)
      console.log(`📈 Total spans collected: ${spans.length}`)
      console.log(`🔍 Unique traces: ${new Set(spans.map(s => s.trace_id)).size}`)
    }
  })

program
  .command('report')
  .description('Summarize local usage and estimated costs')
  .option('--since <duration>', 'Time window, e.g., 24h', '24h')
  .action(async () => {
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
      } catch {
        // Ignore malformed JSON lines
      }
    }
    console.log(JSON.stringify({ spansProcessed: count, estimatedCostUSD: Number(est.toFixed(4)) }, null, 2))
  })

program.parseAsync()


