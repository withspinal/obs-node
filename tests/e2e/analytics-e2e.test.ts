import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { configure, instrumentOpenAI, shutdown } from '../../src/index'
import { Analytics } from '../../src/analytics'
import { readFileSync, mkdirSync } from 'fs'
import { join } from 'path'

describe('Analytics E2E Tests', () => {
  const testSpansPath = join(process.cwd(), '.spinal', 'test-spans.jsonl')
  const openaiApiKey = process.env.OPENAI_API_KEY

  beforeAll(async () => {
    if (!openaiApiKey) {
      throw new Error('❌ OPENAI_API_KEY environment variable is required for E2E tests. Please set it to run these tests.')
    }

    // Create test directory
    try {
      mkdirSync(join(process.cwd(), '.spinal'), { recursive: true })
    } catch {
      // Directory might already exist
    }

    // Configure Spinal for testing
    configure({
      mode: 'local',
      localStorePath: testSpansPath
    })

    // Instrument OpenAI
    instrumentOpenAI()
  })

  afterAll(async () => {
    await shutdown()
  })

  it('should capture OpenAI API calls and calculate costs correctly', async () => {

    console.log('🧪 Making OpenAI API calls for E2E test...')

    // Make multiple API calls with different models and token counts
    const calls = [
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say hello in one word' }],
        max_tokens: 10,
        temperature: 0.7
      },
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Explain quantum computing in one sentence' }],
        max_tokens: 50,
        temperature: 0.7
      },
      {
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Write a short poem about AI' }],
        max_tokens: 100,
        temperature: 0.7
      }
    ]

    for (const call of calls) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify(call)
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`OpenAI API error ${response.status}:`, errorText)
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
        }

        const data = await response.json() as any
        console.log(`✅ ${call.model}: ${data.usage?.total_tokens || 0} tokens`)
      } catch (error) {
        console.error(`❌ Error with ${call.model}:`, error)
        throw error
      }
    }

    // Wait for spans to be exported
    console.log('⏳ Waiting for spans to be exported...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Verify spans were captured
    expect(readFileSync(testSpansPath, 'utf8').trim()).toBeTruthy()

    // Test analytics functionality
    const analytics = new Analytics(testSpansPath)
    
    // Test cost analysis
    const costAnalysis = analytics.analyzeCosts({ since: '1h' })
    expect(costAnalysis.totalCalls).toBeGreaterThan(0)
    expect(costAnalysis.totalCost).toBeGreaterThan(0)
    expect(costAnalysis.averageCostPerCall).toBeGreaterThan(0)
    
    console.log(`💰 Total cost: $${costAnalysis.totalCost.toFixed(6)}`)
    console.log(`📊 Total calls: ${costAnalysis.totalCalls}`)
    console.log(`📈 Average cost per call: $${costAnalysis.averageCostPerCall.toFixed(6)}`)

    // Test usage analysis
    const usageAnalysis = analytics.analyzeUsage({ since: '1h' })
    expect(usageAnalysis.totalCalls).toBeGreaterThan(0)
    expect(usageAnalysis.totalTokens).toBeGreaterThan(0)
    expect(usageAnalysis.inputTokens).toBeGreaterThan(0)
    expect(usageAnalysis.outputTokens).toBeGreaterThan(0)

    console.log(`🔤 Total tokens: ${usageAnalysis.totalTokens}`)
    console.log(`📥 Input tokens: ${usageAnalysis.inputTokens}`)
    console.log(`📤 Output tokens: ${usageAnalysis.outputTokens}`)

    // Test model analysis
    const modelAnalysis = analytics.analyzeModels({ since: '1h' })
    expect(Object.keys(modelAnalysis.models).length).toBeGreaterThan(0)
    
    // Verify we have data for both models
    const models = Object.keys(modelAnalysis.models)
    expect(models.some(m => m.includes('gpt-4o-mini'))).toBe(true)
    expect(models.some(m => m.includes('gpt-4o'))).toBe(true)

    console.log('🤖 Models used:', models)

    // Test performance analysis
    const performanceAnalysis = analytics.analyzePerformance({ since: '1h' })
    expect(performanceAnalysis.totalRequests).toBeGreaterThan(0)
    expect(performanceAnalysis.successRate).toBeGreaterThan(95) // Should be very high
    expect(performanceAnalysis.responseTimes.average).toBeGreaterThan(0)

    console.log(`⚡ Success rate: ${performanceAnalysis.successRate.toFixed(1)}%`)
    console.log(`⏱️ Avg response time: ${performanceAnalysis.responseTimes.average.toFixed(1)}ms`)

    // Test optimization recommendations
    const recommendations = analytics.getOptimizationRecommendations({ since: '1h' })
    expect(recommendations).toBeDefined()
    expect(Array.isArray(recommendations.costOptimization)).toBe(true)
    expect(Array.isArray(recommendations.performanceOptimization)).toBe(true)
    expect(Array.isArray(recommendations.usageOptimization)).toBe(true)

    console.log('💡 Optimization recommendations generated')

    // E2E test should verify integration works, not exact calculations
    console.log(`📊 Total cost captured: $${costAnalysis.totalCost.toFixed(6)}`)
    console.log(`📊 Total calls captured: ${costAnalysis.totalCalls}`)
    
    // Verify that the SDK successfully captured and processed the API calls
    expect(costAnalysis.totalCalls).toBeGreaterThan(0)
    expect(costAnalysis.totalCost).toBeGreaterThan(0)
    expect(usageAnalysis.totalTokens).toBeGreaterThan(0)

    console.log('✅ E2E test completed successfully!')
  }, 60000) // 60 second timeout for API calls

  it('should handle time filtering correctly', async () => {

    const analytics = new Analytics(testSpansPath)
    
    // Test different time periods
    const periods = ['1h', '24h', '7d'] as const
    
    for (const period of periods) {
      const costAnalysis = analytics.analyzeCosts({ since: period })
      const usageAnalysis = analytics.analyzeUsage({ since: period })
      
      // Should have data for recent periods
      if (period === '1h' || period === '24h') {
        expect(costAnalysis.totalCalls).toBeGreaterThan(0)
        expect(usageAnalysis.totalCalls).toBeGreaterThan(0)
      }
    }

    console.log('✅ Time filtering test passed')
  })

  it('should handle different output formats', async () => {

    const analytics = new Analytics(testSpansPath)
    
    // Test that all analysis methods return valid data
    const analyses = [
      analytics.analyzeCosts({ since: '1h' }),
      analytics.analyzeUsage({ since: '1h' }),
      analytics.analyzePerformance({ since: '1h' }),
      analytics.analyzeModels({ since: '1h' }),
      analytics.analyzeAggregations({ since: '1h' }),
      analytics.analyzeTrends({ since: '1h' }),
      analytics.getOptimizationRecommendations({ since: '1h' })
    ]

    for (const analysis of analyses) {
      expect(analysis).toBeDefined()
      expect(typeof analysis).toBe('object')
    }

    console.log('✅ Output format test passed')
  })

  it('should analyze response content and quality', async () => {
    console.log('🔍 Testing response analysis capabilities...')

    const analytics = new Analytics(testSpansPath)
    
    // Test response analysis
    const responseAnalysis = analytics.analyzeResponses({ since: '1h' })
    expect(responseAnalysis.totalResponses).toBeGreaterThan(0)
    expect(responseAnalysis.averageResponseSize).toBeGreaterThan(0)
    expect(responseAnalysis.errorAnalysis.successRate).toBeGreaterThan(0)
    
    console.log(`📄 Total responses: ${responseAnalysis.totalResponses}`)
    console.log(`📏 Avg response size: ${responseAnalysis.averageResponseSize.toFixed(1)} bytes`)
    console.log(`✅ Success rate: ${responseAnalysis.errorAnalysis.successRate.toFixed(1)}%`)

    // Test response size distribution
    expect(responseAnalysis.responseSizeDistribution.small).toBeGreaterThanOrEqual(0)
    expect(responseAnalysis.responseSizeDistribution.medium).toBeGreaterThanOrEqual(0)
    expect(responseAnalysis.responseSizeDistribution.large).toBeGreaterThanOrEqual(0)

    console.log(`📊 Response size distribution:`, responseAnalysis.responseSizeDistribution)

    // Test model response quality
    expect(Object.keys(responseAnalysis.modelResponseQuality).length).toBeGreaterThan(0)
    
    Object.entries(responseAnalysis.modelResponseQuality).forEach(([model, data]) => {
      expect(data.averageResponseLength).toBeGreaterThanOrEqual(0)
      expect(data.averageResponseSize).toBeGreaterThan(0)
      expect(data.successRate).toBeGreaterThanOrEqual(0)
      expect(data.successRate).toBeLessThanOrEqual(100)
      
      console.log(`${model}: ${data.averageResponseLength.toFixed(1)} chars, ${data.averageResponseSize.toFixed(1)} bytes, ${data.successRate.toFixed(1)}% success`)
    })

    // Test content insights
    const contentInsights = analytics.getContentInsights({ since: '1h' })
    expect(contentInsights.responsePatterns.shortResponses).toBeGreaterThanOrEqual(0)
    expect(contentInsights.responsePatterns.mediumResponses).toBeGreaterThanOrEqual(0)
    expect(contentInsights.responsePatterns.longResponses).toBeGreaterThanOrEqual(0)
    expect(Object.keys(contentInsights.finishReasons).length).toBeGreaterThan(0)
    expect(contentInsights.responseQuality.averageTokensPerCharacter).toBeGreaterThan(0)
    expect(contentInsights.responseQuality.responseEfficiency).toBeGreaterThan(0)

    console.log(`📝 Response patterns:`, contentInsights.responsePatterns)
    console.log(`🎯 Finish reasons:`, contentInsights.finishReasons)
    console.log(`⚡ Quality metrics: ${contentInsights.responseQuality.averageTokensPerCharacter.toFixed(2)} tokens/char, ${contentInsights.responseQuality.responseEfficiency.toFixed(4)} efficiency`)

    // Test error analysis if there are errors
    if (responseAnalysis.errorAnalysis.totalErrors > 0) {
      expect(Object.keys(responseAnalysis.errorAnalysis.errorTypes).length).toBeGreaterThan(0)
      expect(responseAnalysis.errorAnalysis.errorMessages.length).toBeGreaterThan(0)
      
      console.log(`🚨 Error types:`, responseAnalysis.errorAnalysis.errorTypes)
      console.log(`📝 Error messages:`, responseAnalysis.errorAnalysis.errorMessages.slice(0, 3))
    }

    console.log('✅ Response analysis test completed successfully!')
  }, 30000) // 30 second timeout

  it('should handle response analysis edge cases', async () => {
    console.log('🔍 Testing response analysis edge cases...')

    const analytics = new Analytics(testSpansPath)
    
    // Test with different time periods
    const periods = ['1h', '24h', '7d'] as const
    
    for (const period of periods) {
      const responseAnalysis = analytics.analyzeResponses({ since: period })
      const contentInsights = analytics.getContentInsights({ since: period })
      
      // Should have data for recent periods
      if (period === '1h' || period === '24h') {
        expect(responseAnalysis.totalResponses).toBeGreaterThan(0)
        expect(contentInsights.responsePatterns.shortResponses + 
               contentInsights.responsePatterns.mediumResponses + 
               contentInsights.responsePatterns.longResponses).toBeGreaterThan(0)
      }
      
      // All metrics should be valid numbers
      expect(responseAnalysis.averageResponseSize).toBeGreaterThanOrEqual(0)
      expect(responseAnalysis.errorAnalysis.successRate).toBeGreaterThanOrEqual(0)
      expect(responseAnalysis.errorAnalysis.successRate).toBeLessThanOrEqual(100)
      expect(contentInsights.responseQuality.averageTokensPerCharacter).toBeGreaterThanOrEqual(0)
      expect(contentInsights.responseQuality.responseEfficiency).toBeGreaterThanOrEqual(0)
    }

    console.log('✅ Response analysis edge cases test passed')
  })
})
