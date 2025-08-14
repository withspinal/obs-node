#!/usr/bin/env node

/**
 * Response Analysis Example
 * 
 * This example demonstrates the new response analysis capabilities
 * that leverage the captured OpenAI API response data in local mode.
 * 
 * Features demonstrated:
 * - Response content analysis
 * - Error pattern detection
 * - Response quality metrics
 * - Content insights and patterns
 * - Model-specific response analysis
 */

import { Analytics } from '../dist/index.js'

async function demonstrateResponseAnalysis() {
  console.log('🔍 Spinal Response Analysis Demo\n')
  console.log('This demo shows what we can do with captured response data in local mode.\n')

  // Initialize analytics with the fixture data
  const analytics = new Analytics('./tests/fixtures/real-spans.jsonl')

  // 1. Basic Response Analysis
  console.log('📄 1. RESPONSE ANALYSIS')
  console.log('─'.repeat(60))
  const responseAnalysis = analytics.analyzeResponses()
  
  console.log(`Total Responses: ${responseAnalysis.totalResponses}`)
  console.log(`Average Response Size: ${responseAnalysis.averageResponseSize.toFixed(1)} bytes`)
  console.log(`Success Rate: ${responseAnalysis.errorAnalysis.successRate.toFixed(1)}%`)
  console.log(`Error Rate: ${responseAnalysis.errorAnalysis.totalErrors > 0 ? ((responseAnalysis.errorAnalysis.totalErrors / responseAnalysis.totalResponses) * 100).toFixed(1) : 0}%`)
  
  console.log('\n📊 Response Size Distribution:')
  console.log(`• Small (< 500 bytes): ${responseAnalysis.responseSizeDistribution.small} responses`)
  console.log(`• Medium (500-2000 bytes): ${responseAnalysis.responseSizeDistribution.medium} responses`)
  console.log(`• Large (> 2000 bytes): ${responseAnalysis.responseSizeDistribution.large} responses`)

  // 2. Error Analysis
  if (responseAnalysis.errorAnalysis.totalErrors > 0) {
    console.log('\n🚨 Error Analysis:')
    Object.entries(responseAnalysis.errorAnalysis.errorTypes).forEach(([errorType, count]) => {
      console.log(`• ${errorType}: ${count} occurrences`)
    })
    
    if (responseAnalysis.errorAnalysis.errorMessages.length > 0) {
      console.log('\n📝 Recent Error Messages:')
      responseAnalysis.errorAnalysis.errorMessages.slice(0, 3).forEach(msg => {
        console.log(`• ${msg}`)
      })
    }
  }

  // 3. Model Response Quality
  console.log('\n🤖 Model Response Quality:')
  Object.entries(responseAnalysis.modelResponseQuality).forEach(([model, data]) => {
    console.log(`${model}:`)
    console.log(`  • Avg response length: ${data.averageResponseLength.toFixed(1)} chars`)
    console.log(`  • Avg response size: ${data.averageResponseSize.toFixed(1)} bytes`)
    console.log(`  • Success rate: ${data.successRate.toFixed(1)}%`)
    console.log('')
  })

  // 4. Content Insights
  console.log('📝 2. CONTENT INSIGHTS')
  console.log('─'.repeat(60))
  const contentInsights = analytics.getContentInsights()
  
  console.log('\n📊 Response Length Patterns:')
  const totalResponses = contentInsights.responsePatterns.shortResponses + 
                        contentInsights.responsePatterns.mediumResponses + 
                        contentInsights.responsePatterns.longResponses
  console.log(`• Short responses (< 50 chars): ${contentInsights.responsePatterns.shortResponses} (${totalResponses > 0 ? (contentInsights.responsePatterns.shortResponses / totalResponses * 100).toFixed(1) : 0}%)`)
  console.log(`• Medium responses (50-200 chars): ${contentInsights.responsePatterns.mediumResponses} (${totalResponses > 0 ? (contentInsights.responsePatterns.mediumResponses / totalResponses * 100).toFixed(1) : 0}%)`)
  console.log(`• Long responses (> 200 chars): ${contentInsights.responsePatterns.longResponses} (${totalResponses > 0 ? (contentInsights.responsePatterns.longResponses / totalResponses * 100).toFixed(1) : 0}%)`)

  console.log('\n🎯 Finish Reasons:')
  Object.entries(contentInsights.finishReasons).forEach(([reason, count]) => {
    console.log(`• ${reason}: ${count} responses`)
  })

  console.log('\n⚡ Response Quality Metrics:')
  console.log(`• Average tokens per character: ${contentInsights.responseQuality.averageTokensPerCharacter.toFixed(2)}`)
  console.log(`• Response efficiency (tokens/byte): ${contentInsights.responseQuality.responseEfficiency.toFixed(4)}`)

  if (Object.values(contentInsights.commonErrors).some(count => count > 0)) {
    console.log('\n🚨 Common Error Types:')
    Object.entries(contentInsights.commonErrors).forEach(([errorType, count]) => {
      if (count > 0) {
        console.log(`• ${errorType}: ${count} occurrences`)
      }
    })
  }

  // 5. Practical Use Cases
  console.log('\n💡 3. PRACTICAL USE CASES')
  console.log('─'.repeat(60))
  
  console.log('\n🎯 What you can do with this data:')
  console.log('• Identify which models produce longer/shorter responses')
  console.log('• Detect patterns in error rates and types')
  console.log('• Optimize prompts based on response length patterns')
  console.log('• Monitor response quality and efficiency')
  console.log('• Track finish reasons to understand completion patterns')
  console.log('• Analyze cost efficiency per response size')
  console.log('• Debug API issues with detailed error analysis')
  console.log('• Compare response patterns across different features/aggregations')

  console.log('\n🔧 CLI Commands:')
  console.log('• spinal responses --format table --errors --by-model')
  console.log('• spinal content --format table --patterns --quality')
  console.log('• spinal responses --since 24h --format json')
  console.log('• spinal content --since 7d --format summary')

  console.log('\n✨ Benefits of Local Mode Response Analysis:')
  console.log('• No data leaves your machine - complete privacy')
  console.log('• Real-time insights during development')
  console.log('• Cost optimization without external dependencies')
  console.log('• Detailed debugging information')
  console.log('• Historical analysis of your API usage patterns')
}

// Run the demo
demonstrateResponseAnalysis().catch(console.error)
