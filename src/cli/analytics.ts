import { Command } from 'commander'
import { Analytics } from '../analytics'
import { getConfig } from '../runtime/config'

export function createAnalyticsCommands(): Command[] {
  const commands: Command[] = []

  // Cost Analysis Command
  const costCommand = new Command('cost')
    .description('Analyze OpenAI API costs')
    .option('--since <period>', 'Time period (1h, 24h, 7d, 30d, 90d, 1y)', '7d')
    .option('--format <format>', 'Output format (table, json, csv, summary)', 'table')
    .option('--by-model', 'Show breakdown by model')
    .option('--by-aggregation', 'Show breakdown by aggregation ID')
    .option('--trends', 'Show cost trends')
    .action(async (options) => {
      const config = getConfig()
      const analytics = new Analytics(config.localStorePath)
      const analysis = analytics.analyzeCosts({
        since: options.since,
        format: options.format,
        byModel: options.byModel,
        byAggregation: options.byAggregation,
        trends: options.trends
      })

      if (options.format === 'json') {
        console.log(JSON.stringify(analysis, null, 2))
      } else if (options.format === 'csv') {
        console.log('Period,Total Cost,Total Calls,Average Cost Per Call')
        console.log(`${options.since},${analysis.totalCost.toFixed(6)},${analysis.totalCalls},${analysis.averageCostPerCall.toFixed(6)}`)
      } else if (options.format === 'summary') {
        console.log(`💰 Total Cost: $${analysis.totalCost.toFixed(4)}`)
        console.log(`📊 Total Calls: ${analysis.totalCalls}`)
        console.log(`📈 Average Cost per Call: $${analysis.averageCostPerCall.toFixed(6)}`)
      } else {
        // Table format
        console.log(`\n💰 Cost Analysis (Last ${options.since})\n`)
        console.log('─'.repeat(60))
        console.log(`Total Cost: $${analysis.totalCost.toFixed(4)}`)
        console.log(`Total API Calls: ${analysis.totalCalls}`)
        console.log(`Average Cost per Call: $${analysis.averageCostPerCall.toFixed(6)}`)
        console.log('─'.repeat(60))

        if (options.byModel && Object.keys(analysis.costByModel).length > 0) {
          console.log('\n📊 Cost by Model:')
          Object.entries(analysis.costByModel).forEach(([model, data]) => {
            console.log(`• ${model}: $${data.cost.toFixed(4)} (${data.calls} calls, ${data.percentage.toFixed(1)}%)`)
          })
        }

        if (options.byAggregation && Object.keys(analysis.costByAggregation).length > 0) {
          console.log('\n🏷️ Cost by Aggregation:')
          Object.entries(analysis.costByAggregation).forEach(([agg, data]) => {
            console.log(`• ${agg}: $${data.cost.toFixed(4)} (${data.calls} calls, ${data.percentage.toFixed(1)}%)`)
          })
        }

        if (options.trends && analysis.costTrends.length > 0) {
          console.log('\n📈 Cost Trends:')
          analysis.costTrends.forEach(trend => {
            console.log(`• ${trend.date}: $${trend.cost.toFixed(4)} (${trend.calls} calls)`)
          })
        }
      }
    })

  // Usage Analytics Command
  const usageCommand = new Command('usage')
    .description('Analyze OpenAI API usage patterns')
    .option('--since <period>', 'Time period (1h, 24h, 7d, 30d, 90d, 1y)', '24h')
    .option('--format <format>', 'Output format (table, json, csv, summary)', 'table')
    .option('--tokens', 'Show token breakdown')
    .option('--by-model', 'Show usage by model')
    .option('--by-aggregation', 'Show usage by aggregation ID')
    .action(async (options) => {
      const config = getConfig()
      const analytics = new Analytics(config.localStorePath)
      const analysis = analytics.analyzeUsage({
        since: options.since,
        format: options.format,
        byModel: options.byModel,
        byAggregation: options.byAggregation
      })

      if (options.format === 'json') {
        console.log(JSON.stringify(analysis, null, 2))
      } else if (options.format === 'csv') {
        console.log('Period,Total Calls,Total Tokens,Input Tokens,Output Tokens')
        console.log(`${options.since},${analysis.totalCalls},${analysis.totalTokens},${analysis.inputTokens},${analysis.outputTokens}`)
      } else if (options.format === 'summary') {
        console.log(`📊 Total Calls: ${analysis.totalCalls}`)
        console.log(`🔤 Total Tokens: ${analysis.totalTokens.toLocaleString()}`)
        console.log(`📥 Input Tokens: ${analysis.inputTokens.toLocaleString()}`)
        console.log(`📤 Output Tokens: ${analysis.outputTokens.toLocaleString()}`)
      } else {
        // Table format
        console.log(`\n📊 Usage Analytics (Last ${options.since})\n`)
        console.log('─'.repeat(60))
        console.log(`Total API Calls: ${analysis.totalCalls}`)
        console.log(`Total Tokens: ${analysis.totalTokens.toLocaleString()}`)
        console.log(`• Input tokens: ${analysis.inputTokens.toLocaleString()}`)
        console.log(`• Output tokens: ${analysis.outputTokens.toLocaleString()}`)
        console.log('─'.repeat(60))

        if (options.tokens) {
          console.log('\n📈 Token Efficiency:')
          console.log(`• Average input tokens per call: ${analysis.tokenEfficiency.averageInputTokensPerCall.toFixed(1)}`)
          console.log(`• Average output tokens per call: ${analysis.tokenEfficiency.averageOutputTokensPerCall.toFixed(1)}`)
          console.log(`• Token ratio (output/input): ${analysis.tokenEfficiency.tokenRatio.toFixed(2)}`)
        }

        if (options.byModel && Object.keys(analysis.usageByModel).length > 0) {
          console.log('\n🤖 Usage by Model:')
          Object.entries(analysis.usageByModel).forEach(([model, data]) => {
            console.log(`• ${model}: ${data.calls} calls (${data.percentage.toFixed(1)}%), ${data.tokens.toLocaleString()} tokens`)
          })
        }

        if (options.byAggregation && Object.keys(analysis.usageByAggregation).length > 0) {
          console.log('\n🏷️ Usage by Aggregation:')
          Object.entries(analysis.usageByAggregation).forEach(([agg, data]) => {
            console.log(`• ${agg}: ${data.calls} calls (${data.percentage.toFixed(1)}%), ${data.tokens.toLocaleString()} tokens`)
          })
        }
      }
    })

  // Performance Analytics Command
  const performanceCommand = new Command('performance')
    .description('Analyze OpenAI API performance')
    .option('--since <period>', 'Time period (1h, 24h, 7d, 30d, 90d, 1y)', '7d')
    .option('--format <format>', 'Output format (table, json, csv, summary)', 'table')
    .option('--response-times', 'Show response time analysis')
    .option('--errors', 'Show error analysis')
    .option('--by-model', 'Show performance by model')
    .action(async (options) => {
      const config = getConfig()
      const analytics = new Analytics(config.localStorePath)
      const analysis = analytics.analyzePerformance({
        since: options.since,
        format: options.format
      })

      if (options.format === 'json') {
        console.log(JSON.stringify(analysis, null, 2))
      } else if (options.format === 'csv') {
        console.log('Period,Total Requests,Successful,Failed,Success Rate,Avg Response Time')
        console.log(`${options.since},${analysis.totalRequests},${analysis.successful},${analysis.failed},${analysis.successRate.toFixed(1)}%,${analysis.responseTimes.average.toFixed(1)}ms`)
      } else if (options.format === 'summary') {
        console.log(`⚡ Total Requests: ${analysis.totalRequests}`)
        console.log(`✅ Successful: ${analysis.successful} (${analysis.successRate.toFixed(1)}%)`)
        console.log(`❌ Failed: ${analysis.failed}`)
        console.log(`⏱️ Avg Response Time: ${analysis.responseTimes.average.toFixed(1)}ms`)
      } else {
        // Table format
        console.log(`\n⚡ Performance Analytics (Last ${options.since})\n`)
        console.log('─'.repeat(60))
        console.log(`Total Requests: ${analysis.totalRequests}`)
        console.log(`Successful: ${analysis.successful} (${analysis.successRate.toFixed(1)}%)`)
        console.log(`Failed: ${analysis.failed} (${(100 - analysis.successRate).toFixed(1)}%)`)
        console.log('─'.repeat(60))

        if (options.responseTimes) {
          console.log('\n⏱️ Response Times:')
          console.log(`• Average: ${analysis.responseTimes.average.toFixed(1)}ms`)
          console.log(`• Median: ${analysis.responseTimes.median.toFixed(1)}ms`)
          console.log(`• 95th percentile: ${analysis.responseTimes.p95.toFixed(1)}ms`)
          console.log(`• Fastest: ${analysis.responseTimes.fastest.toFixed(1)}ms`)
          console.log(`• Slowest: ${analysis.responseTimes.slowest.toFixed(1)}ms`)
        }

        if (options.errors && analysis.errors.other > 0) {
          console.log('\n🚨 Error Analysis:')
          console.log(`• Rate limit errors: ${analysis.errors.rateLimit}`)
          console.log(`• Authentication errors: ${analysis.errors.authentication}`)
          console.log(`• Network errors: ${analysis.errors.network}`)
          console.log(`• Other errors: ${analysis.errors.other}`)
        }
      }
    })

  // Models Analytics Command
  const modelsCommand = new Command('models')
    .description('Compare performance and costs across different models')
    .option('--since <period>', 'Time period (1h, 24h, 7d, 30d, 90d, 1y)', '30d')
    .option('--format <format>', 'Output format (table, json, csv, summary)', 'table')
    .option('--efficiency', 'Show model efficiency metrics')
    .option('--costs', 'Show cost analysis by model')
    .action(async (options) => {
      const config = getConfig()
      const analytics = new Analytics(config.localStorePath)
      const analysis = analytics.analyzeModels({
        since: options.since,
        format: options.format
      })

      if (options.format === 'json') {
        console.log(JSON.stringify(analysis, null, 2))
      } else if (options.format === 'summary') {
        Object.entries(analysis.models).forEach(([model, data]) => {
          console.log(`${model}: ${data.calls} calls, $${data.totalCost.toFixed(4)}, ${data.successRate.toFixed(1)}% success`)
        })
      } else {
        // Table format
        console.log(`\n🤖 Model Analytics (Last ${options.since})\n`)
        console.log('─'.repeat(80))
        
        Object.entries(analysis.models).forEach(([model, data]) => {
          console.log(`${model}:`)
          console.log(`  • Calls: ${data.calls}`)
          console.log(`  • Total cost: $${data.totalCost.toFixed(4)}`)
          console.log(`  • Avg cost per call: $${data.avgCostPerCall.toFixed(6)}`)
          console.log(`  • Avg response time: ${data.avgResponseTime.toFixed(1)}ms`)
          console.log(`  • Success rate: ${data.successRate.toFixed(1)}%`)
          console.log(`  • Total tokens: ${data.totalTokens.toLocaleString()}`)
          console.log('')
        })
      }
    })

  // Aggregations Analytics Command
  const aggregationsCommand = new Command('aggregations')
    .description('Analyze usage by custom aggregation IDs')
    .option('--since <period>', 'Time period (1h, 24h, 7d, 30d, 90d, 1y)', '7d')
    .option('--format <format>', 'Output format (table, json, csv, summary)', 'table')
    .option('--id <aggregationId>', 'Show specific aggregation ID')
    .option('--costs', 'Show cost analysis by aggregation')
    .action(async (options) => {
      const config = getConfig()
      const analytics = new Analytics(config.localStorePath)
      const analysis = analytics.analyzeAggregations({
        since: options.since,
        format: options.format
      })

      if (options.format === 'json') {
        console.log(JSON.stringify(analysis, null, 2))
      } else if (options.format === 'summary') {
        Object.entries(analysis.aggregations).forEach(([agg, data]) => {
          console.log(`${agg}: ${data.calls} calls, $${data.totalCost.toFixed(4)}, ${data.successRate.toFixed(1)}% success`)
        })
      } else {
        // Table format
        console.log(`\n🏷️ Aggregation Analytics (Last ${options.since})\n`)
        console.log('─'.repeat(80))
        
        Object.entries(analysis.aggregations).forEach(([agg, data]) => {
          console.log(`${agg}:`)
          console.log(`  • Calls: ${data.calls}`)
          console.log(`  • Total cost: $${data.totalCost.toFixed(4)}`)
          console.log(`  • Avg cost per call: $${data.avgCostPerCall.toFixed(6)}`)
          console.log(`  • Success rate: ${data.successRate.toFixed(1)}%`)
          console.log(`  • Total tokens: ${data.totalTokens.toLocaleString()}`)
          console.log('')
        })
      }
    })

  // Trends Analysis Command
  const trendsCommand = new Command('trends')
    .description('Identify usage patterns and trends over time')
    .option('--since <period>', 'Time period (1h, 24h, 7d, 30d, 90d, 1y)', '30d')
    .option('--format <format>', 'Output format (table, json, csv, summary)', 'table')
    .option('--costs', 'Show cost trends')
    .option('--usage', 'Show usage trends')
    .option('--performance', 'Show performance trends')
    .action(async (options) => {
      const config = getConfig()
      const analytics = new Analytics(config.localStorePath)
      const analysis = analytics.analyzeTrends({
        since: options.since,
        format: options.format
      })

      if (options.format === 'json') {
        console.log(JSON.stringify(analysis, null, 2))
      } else if (options.format === 'summary') {
        console.log(`📊 Daily avg calls: ${analysis.usageTrends.dailyAverageCalls.toFixed(1)}`)
        console.log(`💰 Daily avg cost: $${analysis.costTrends.dailyAverageCost.toFixed(4)}`)
        console.log(`⚡ Performance: ${analysis.performanceTrends.responseTimeTrend}`)
      } else {
        // Table format
        console.log(`\n📈 Trends Analysis (Last ${options.since})\n`)
        console.log('─'.repeat(60))

        if (options.usage || !options.costs && !options.performance) {
          console.log('\n📊 Usage Trends:')
          console.log(`• Daily average calls: ${analysis.usageTrends.dailyAverageCalls.toFixed(1)}`)
          console.log(`• Peak usage: ${analysis.usageTrends.peakUsage.calls} calls (${analysis.usageTrends.peakUsage.date})`)
          console.log(`• Growth rate: ${analysis.usageTrends.growthRate > 0 ? '+' : ''}${analysis.usageTrends.growthRate.toFixed(1)}% week-over-week`)
        }

        if (options.costs || !options.usage && !options.performance) {
          console.log('\n💰 Cost Trends:')
          console.log(`• Daily average cost: $${analysis.costTrends.dailyAverageCost.toFixed(4)}`)
          console.log(`• Peak cost: $${analysis.costTrends.peakCost.cost.toFixed(4)} (${analysis.costTrends.peakCost.date})`)
          console.log(`• Cost per call trend: ${analysis.costTrends.costPerCallTrend}`)
        }

        if (options.performance || !options.usage && !options.costs) {
          console.log('\n⚡ Performance Trends:')
          console.log(`• Response time trend: ${analysis.performanceTrends.responseTimeTrend}`)
          console.log(`• Error rate trend: ${analysis.performanceTrends.errorRateTrend}`)
          console.log(`• Success rate trend: ${analysis.performanceTrends.successRateTrend}`)
        }
      }
    })

  // Optimization Recommendations Command
  const optimizeCommand = new Command('optimize')
    .description('Get actionable recommendations to optimize costs and performance')
    .option('--since <period>', 'Time period (1h, 24h, 7d, 30d, 90d, 1y)', '7d')
    .option('--format <format>', 'Output format (table, json, csv, summary)', 'table')
    .option('--costs', 'Show cost optimization recommendations')
    .option('--performance', 'Show performance optimization recommendations')
    .action(async (options) => {
      const config = getConfig()
      const analytics = new Analytics(config.localStorePath)
      const recommendations = analytics.getOptimizationRecommendations({
        since: options.since,
        format: options.format
      })

      if (options.format === 'json') {
        console.log(JSON.stringify(recommendations, null, 2))
      } else if (options.format === 'summary') {
        const allRecs = [
          ...recommendations.costOptimization,
          ...recommendations.performanceOptimization,
          ...recommendations.usageOptimization
        ]
        allRecs.forEach(rec => console.log(`• ${rec}`))
      } else {
        // Table format
        console.log(`\n💡 Optimization Recommendations (Last ${options.since})\n`)
        console.log('─'.repeat(60))

        if (options.costs || (!options.performance && recommendations.costOptimization.length > 0)) {
          console.log('\n💰 Cost Optimization:')
          recommendations.costOptimization.forEach(rec => {
            console.log(`• ${rec}`)
          })
        }

        if (options.performance || (!options.costs && recommendations.performanceOptimization.length > 0)) {
          console.log('\n⚡ Performance Optimization:')
          recommendations.performanceOptimization.forEach(rec => {
            console.log(`• ${rec}`)
          })
        }

        if (!options.costs && !options.performance && recommendations.usageOptimization.length > 0) {
          console.log('\n🎯 Usage Optimization:')
          recommendations.usageOptimization.forEach(rec => {
            console.log(`• ${rec}`)
          })
        }

        if (recommendations.costOptimization.length === 0 && 
            recommendations.performanceOptimization.length === 0 && 
            recommendations.usageOptimization.length === 0) {
          console.log('\n✅ No specific optimization recommendations at this time.')
          console.log('Your OpenAI API usage appears to be well-optimized!')
        }
      }
    })

  // Response Analysis Command
  const responsesCommand = new Command('responses')
    .description('Analyze OpenAI API response content and quality')
    .option('--since <period>', 'Time period (1h, 24h, 7d, 30d, 90d, 1y)', '7d')
    .option('--format <format>', 'Output format (table, json, csv, summary)', 'table')
    .option('--errors', 'Show detailed error analysis')
    .option('--by-model', 'Show response quality by model')
    .option('--size-distribution', 'Show response size distribution')
    .action(async (options) => {
      const config = getConfig()
      const analytics = new Analytics(config.localStorePath)
      const analysis = analytics.analyzeResponses({
        since: options.since,
        format: options.format
      })

      if (options.format === 'json') {
        console.log(JSON.stringify(analysis, null, 2))
      } else if (options.format === 'csv') {
        console.log('Period,Total Responses,Avg Size,Success Rate,Error Rate')
        console.log(`${options.since},${analysis.totalResponses},${analysis.averageResponseSize.toFixed(1)},${analysis.errorAnalysis.successRate.toFixed(1)}%,${analysis.errorAnalysis.totalErrors}`)
      } else if (options.format === 'summary') {
        console.log(`📄 Total Responses: ${analysis.totalResponses}`)
        console.log(`📏 Avg Response Size: ${analysis.averageResponseSize.toFixed(1)} bytes`)
        console.log(`✅ Success Rate: ${analysis.errorAnalysis.successRate.toFixed(1)}%`)
        console.log(`❌ Total Errors: ${analysis.errorAnalysis.totalErrors}`)
      } else {
        // Table format
        console.log(`\n📄 Response Analysis (Last ${options.since})\n`)
        console.log('─'.repeat(60))
        console.log(`Total Responses: ${analysis.totalResponses}`)
        console.log(`Average Response Size: ${analysis.averageResponseSize.toFixed(1)} bytes`)
        console.log(`Success Rate: ${analysis.errorAnalysis.successRate.toFixed(1)}%`)
        console.log(`Error Rate: ${analysis.errorAnalysis.totalErrors > 0 ? ((analysis.errorAnalysis.totalErrors / analysis.totalResponses) * 100).toFixed(1) : 0}%`)
        console.log('─'.repeat(60))

        if (options.sizeDistribution) {
          console.log('\n📊 Response Size Distribution:')
          console.log(`• Small (< 500 bytes): ${analysis.responseSizeDistribution.small} responses`)
          console.log(`• Medium (500-2000 bytes): ${analysis.responseSizeDistribution.medium} responses`)
          console.log(`• Large (> 2000 bytes): ${analysis.responseSizeDistribution.large} responses`)
        }

        if (options.errors && analysis.errorAnalysis.totalErrors > 0) {
          console.log('\n🚨 Error Analysis:')
          Object.entries(analysis.errorAnalysis.errorTypes).forEach(([errorType, count]) => {
            console.log(`• ${errorType}: ${count} occurrences`)
          })
          
          if (analysis.errorAnalysis.errorMessages.length > 0) {
            console.log('\n📝 Recent Error Messages:')
            analysis.errorAnalysis.errorMessages.slice(0, 5).forEach(msg => {
              console.log(`• ${msg}`)
            })
          }
        }

        if (options.byModel && Object.keys(analysis.modelResponseQuality).length > 0) {
          console.log('\n🤖 Response Quality by Model:')
          Object.entries(analysis.modelResponseQuality).forEach(([model, data]) => {
            console.log(`${model}:`)
            console.log(`  • Avg response length: ${data.averageResponseLength.toFixed(1)} chars`)
            console.log(`  • Avg response size: ${data.averageResponseSize.toFixed(1)} bytes`)
            console.log(`  • Success rate: ${data.successRate.toFixed(1)}%`)
            console.log('')
          })
        }
      }
    })

  // Content Insights Command
  const contentCommand = new Command('content')
    .description('Get insights about response content patterns and quality')
    .option('--since <period>', 'Time period (1h, 24h, 7d, 30d, 90d, 1y)', '7d')
    .option('--format <format>', 'Output format (table, json, csv, summary)', 'table')
    .option('--patterns', 'Show response length patterns')
    .option('--finish-reasons', 'Show finish reason distribution')
    .option('--quality', 'Show response quality metrics')
    .action(async (options) => {
      const config = getConfig()
      const analytics = new Analytics(config.localStorePath)
      const insights = analytics.getContentInsights({
        since: options.since,
        format: options.format
      })

      if (options.format === 'json') {
        console.log(JSON.stringify(insights, null, 2))
      } else if (options.format === 'summary') {
        console.log(`📊 Response Patterns: ${insights.responsePatterns.shortResponses + insights.responsePatterns.mediumResponses + insights.responsePatterns.longResponses} total`)
        console.log(`🎯 Avg tokens/char: ${insights.responseQuality.averageTokensPerCharacter.toFixed(2)}`)
        console.log(`⚡ Response efficiency: ${insights.responseQuality.responseEfficiency.toFixed(4)}`)
      } else {
        // Table format
        console.log(`\n📝 Content Insights (Last ${options.since})\n`)
        console.log('─'.repeat(60))

        if (options.patterns || (!options.finishReasons && !options.quality)) {
          console.log('\n📊 Response Length Patterns:')
          const total = insights.responsePatterns.shortResponses + insights.responsePatterns.mediumResponses + insights.responsePatterns.longResponses
          console.log(`• Short responses (< 50 chars): ${insights.responsePatterns.shortResponses} (${total > 0 ? (insights.responsePatterns.shortResponses / total * 100).toFixed(1) : 0}%)`)
          console.log(`• Medium responses (50-200 chars): ${insights.responsePatterns.mediumResponses} (${total > 0 ? (insights.responsePatterns.mediumResponses / total * 100).toFixed(1) : 0}%)`)
          console.log(`• Long responses (> 200 chars): ${insights.responsePatterns.longResponses} (${total > 0 ? (insights.responsePatterns.longResponses / total * 100).toFixed(1) : 0}%)`)
        }

        if (options.finishReasons || (!options.patterns && !options.quality)) {
          console.log('\n🎯 Finish Reasons:')
          Object.entries(insights.finishReasons).forEach(([reason, count]) => {
            console.log(`• ${reason}: ${count} responses`)
          })
        }

        if (options.quality || (!options.patterns && !options.finishReasons)) {
          console.log('\n⚡ Response Quality Metrics:')
          console.log(`• Average tokens per character: ${insights.responseQuality.averageTokensPerCharacter.toFixed(2)}`)
          console.log(`• Response efficiency (tokens/byte): ${insights.responseQuality.responseEfficiency.toFixed(4)}`)
        }

        if (Object.values(insights.commonErrors).some(count => count > 0)) {
          console.log('\n🚨 Common Error Types:')
          Object.entries(insights.commonErrors).forEach(([errorType, count]) => {
            if (count > 0) {
              console.log(`• ${errorType}: ${count} occurrences`)
            }
          })
        }
      }
    })

  commands.push(
    costCommand,
    usageCommand,
    performanceCommand,
    modelsCommand,
    aggregationsCommand,
    trendsCommand,
    optimizeCommand,
    responsesCommand,
    contentCommand
  )

  return commands
}
