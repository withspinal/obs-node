#!/usr/bin/env node

// Test script for analytics functionality
import { Analytics } from './dist/index.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Create .spinal directory and sample spans file
const spinalDir = join(process.cwd(), '.spinal');
const spansFile = join(spinalDir, 'spans.jsonl');

try {
  mkdirSync(spinalDir, { recursive: true });
} catch (error) {
  // Directory might already exist
}

// Create sample spans data
const sampleSpans = [
  {
    "name": "openai-api-call",
    "trace_id": "test-trace-1",
    "span_id": "span-1",
    "parent_span_id": null,
    "start_time": [Date.now() - 60000, 0],
    "end_time": [Date.now() - 50000, 0],
    "status": { "code": 1 },
    "attributes": {
      "spinal.model": "openai:gpt-4o-mini",
      "spinal.input_tokens": 50,
      "spinal.output_tokens": 25,
      "spinal.total_tokens": 75,
      "spinal.aggregation_id": "test-feature"
    },
    "events": [],
    "links": [],
    "instrumentation_info": { "name": "spinal-openai", "version": "1.0.0" }
  },
  {
    "name": "openai-api-call",
    "trace_id": "test-trace-2",
    "span_id": "span-2",
    "parent_span_id": null,
    "start_time": [Date.now() - 30000, 0],
    "end_time": [Date.now() - 20000, 0],
    "status": { "code": 1 },
    "attributes": {
      "spinal.model": "openai:gpt-4o",
      "spinal.input_tokens": 100,
      "spinal.output_tokens": 50,
      "spinal.total_tokens": 150,
      "spinal.aggregation_id": "test-feature"
    },
    "events": [],
    "links": [],
    "instrumentation_info": { "name": "spinal-openai", "version": "1.0.0" }
  }
];

// Write sample data
writeFileSync(spansFile, sampleSpans.map(span => JSON.stringify(span)).join('\n'));

console.log('🧪 Testing Analytics with Sample Data\n');

// Test analytics
const analytics = new Analytics(spansFile);

console.log('📊 Cost Analysis:');
const costAnalysis = analytics.analyzeCosts({ since: '24h' });
console.log(`Total Cost: $${costAnalysis.totalCost.toFixed(6)}`);
console.log(`Total Calls: ${costAnalysis.totalCalls}`);
console.log(`Average Cost per Call: $${costAnalysis.averageCostPerCall.toFixed(6)}`);

console.log('\n📈 Usage Analysis:');
const usageAnalysis = analytics.analyzeUsage({ since: '24h' });
console.log(`Total Calls: ${usageAnalysis.totalCalls}`);
console.log(`Total Tokens: ${usageAnalysis.totalTokens}`);
console.log(`Input Tokens: ${usageAnalysis.inputTokens}`);
console.log(`Output Tokens: ${usageAnalysis.outputTokens}`);

console.log('\n⚡ Performance Analysis:');
const performanceAnalysis = analytics.analyzePerformance({ since: '24h' });
console.log(`Total Requests: ${performanceAnalysis.totalRequests}`);
console.log(`Success Rate: ${performanceAnalysis.successRate.toFixed(1)}%`);
console.log(`Average Response Time: ${performanceAnalysis.responseTimes.average.toFixed(1)}ms`);

console.log('\n🤖 Model Analysis:');
const modelAnalysis = analytics.analyzeModels({ since: '24h' });
Object.entries(modelAnalysis.models).forEach(([model, data]) => {
  console.log(`${model}:`);
  console.log(`  • Calls: ${data.calls}`);
  console.log(`  • Total cost: $${data.totalCost.toFixed(6)}`);
  console.log(`  • Success rate: ${data.successRate.toFixed(1)}%`);
});

console.log('\n💡 Optimization Recommendations:');
const recommendations = analytics.getOptimizationRecommendations({ since: '24h' });
if (recommendations.costOptimization.length > 0) {
  console.log('💰 Cost Optimization:');
  recommendations.costOptimization.forEach(rec => console.log(`  • ${rec}`));
}
if (recommendations.performanceOptimization.length > 0) {
  console.log('⚡ Performance Optimization:');
  recommendations.performanceOptimization.forEach(rec => console.log(`  • ${rec}`));
}
if (recommendations.usageOptimization.length > 0) {
  console.log('🎯 Usage Optimization:');
  recommendations.usageOptimization.forEach(rec => console.log(`  • ${rec}`));
}

console.log('\n✅ Analytics test completed successfully!');
