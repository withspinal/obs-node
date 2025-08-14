import { configure as _configure } from './runtime/config';
import { tag as _tag } from './runtime/tag';
import { instrumentOpenAI as _instrumentOpenAI } from './providers/openai';
import { instrumentHTTP as _instrumentHTTP } from './providers/http';
export { estimateCost } from './pricing'

export const configure = _configure;
export const tag = _tag;
export const instrumentOpenAI = _instrumentOpenAI;
export const instrumentHTTP = _instrumentHTTP;

export { shutdown, forceFlush } from './runtime/tracer';
export type { ConfigureOptions, Scrubber } from './runtime/config';

// Local data display function
export async function displayLocalData(options: {
  limit?: number;
  format?: 'table' | 'json' | 'summary';
} = {}) {
  const { getConfig } = await import('./runtime/config');
  const { estimateCost } = await import('./pricing');
  const fs = await import('fs');
  
  const cfg = getConfig();
  const file = cfg.localStorePath;
  
  if (!fs.existsSync(file)) {
    console.log('No local data found. Start your application with Spinal configured to collect data.');
    return;
  }

  const raw = await fs.promises.readFile(file, 'utf8');
  const lines = raw.trim().length ? raw.trim().split('\n') : [];
  
  if (lines.length === 0) {
    console.log('No spans collected yet. Start your application with Spinal configured to collect data.');
    return;
  }

  const spans = [];
  for (const line of lines) {
    try {
      const span = JSON.parse(line);
      spans.push(span);
    } catch {
      // Ignore malformed JSON lines
    }
  }

  const limit = options.limit || 10;
  const format = options.format || 'table';
  const displaySpans = spans.slice(-limit); // Show most recent spans

  if (format === 'json') {
    console.log(JSON.stringify(displaySpans, null, 2));
  } else if (format === 'summary') {
    const summary = {
      totalSpans: spans.length,
      uniqueTraces: new Set(spans.map(s => s.trace_id)).size,
      spanTypes: spans.reduce((acc, span) => {
        const type = span.name || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      estimatedCost: spans.reduce((total, span) => {
        const attrs = span.attributes || {};
        const inputTokens = Number(attrs['spinal.input_tokens'] || 0);
        const outputTokens = Number(attrs['spinal.output_tokens'] || 0);
        const model = String(attrs['spinal.model'] || 'openai:gpt-4o-mini');
        return total + estimateCost({ model, inputTokens, outputTokens });
      }, 0)
    };
    console.log(JSON.stringify(summary, null, 2));
  } else {
    // Default table format
    console.log(`\n📊 Spinal Local Data (showing last ${displaySpans.length} of ${spans.length} spans)\n`);
    console.log('─'.repeat(120));
    console.log(`${'Name'.padEnd(30)} ${'Trace ID'.padEnd(32)} ${'Duration (ms)'.padEnd(12)} ${'Status'.padEnd(8)} ${'Model'.padEnd(15)} ${'Cost ($)'.padEnd(8)}`);
    console.log('─'.repeat(120));
    
    for (const span of displaySpans) {
      const name = (span.name || 'unknown').substring(0, 29).padEnd(30);
      const traceId = span.trace_id.substring(0, 31).padEnd(32);
      const duration = span.end_time && span.start_time 
        ? ((span.end_time - span.start_time) / 1000000).toFixed(1).padEnd(12)
        : 'N/A'.padEnd(12);
      const status = String(span.status?.code || 'UNSET').padEnd(8);
      
      const attrs = span.attributes || {};
      const model = (attrs['spinal.model'] || 'N/A').toString().substring(0, 14).padEnd(15);
      const inputTokens = Number(attrs['spinal.input_tokens'] || 0);
      const outputTokens = Number(attrs['spinal.output_tokens'] || 0);
      const cost = inputTokens > 0 || outputTokens > 0 
        ? estimateCost({ 
            model: String(attrs['spinal.model'] || 'openai:gpt-4o-mini'), 
            inputTokens, 
            outputTokens 
          }).toFixed(4).padEnd(8)
        : 'N/A'.padEnd(8);
      
      console.log(`${name} ${traceId} ${duration} ${status} ${model} ${cost}`);
    }
    console.log('─'.repeat(120));
    
    // Show summary at bottom
    const totalCost = spans.reduce((total, span) => {
      const attrs = span.attributes || {};
      const inputTokens = Number(attrs['spinal.input_tokens'] || 0);
      const outputTokens = Number(attrs['spinal.output_tokens'] || 0);
      const model = String(attrs['spinal.model'] || 'openai:gpt-4o-mini');
      return total + estimateCost({ model, inputTokens, outputTokens });
    }, 0);
    
    console.log(`\n💰 Total estimated cost: $${totalCost.toFixed(4)}`);
    console.log(`📈 Total spans collected: ${spans.length}`);
    console.log(`🔍 Unique traces: ${new Set(spans.map(s => s.trace_id)).size}`);
  }
}
