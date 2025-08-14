import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Analytics } from '../../src/analytics'
import { writeFileSync, unlinkSync, mkdirSync } from 'fs'
import { join } from 'path'

describe('Analytics Unit Tests', () => {
  let testSpansPath: string
  let analytics: Analytics

  beforeEach(() => {
    // Create test directory
    const testDir = join(process.cwd(), '.spinal')
    try {
      mkdirSync(testDir, { recursive: true })
    } catch {
      // Directory might already exist
    }

    testSpansPath = join(testDir, 'test-analytics.jsonl')
    analytics = new Analytics(testSpansPath)
  })

  afterEach(() => {
    // Clean up test file
    try {
      unlinkSync(testSpansPath)
    } catch {
      // File might not exist
    }
  })

  const createMockSpan = (overrides: any = {}) => ({
    name: 'openai-api-call',
    trace_id: 'f5b8abd666e2dd5c90ad4007d46de644',
    span_id: '23871d783d0a13ee',
    parent_span_id: null,
    start_time: [1755130071, 471000000],
    end_time: [1755130073, 260907250],
    status: { code: 1 },
    attributes: {
      'spinal.model': 'openai:gpt-4o-mini-2024-07-18',
      'spinal.input_tokens': 12,
      'spinal.output_tokens': 2,
      'spinal.total_tokens': 14,
      'spinal.aggregation_id': 'test-feature',
      ...overrides.attributes
    },
    events: [],
    links: [],
    instrumentation_info: { name: 'spinal-openai' },
    ...overrides
  })

  const writeSpans = (spans: any[]) => {
    writeFileSync(testSpansPath, spans.map(span => JSON.stringify(span)).join('\n'))
  }

  describe('Cost Analysis', () => {
    it('should calculate costs correctly for single span', () => {
      const span = createMockSpan()
      writeSpans([span])

      const analysis = analytics.analyzeCosts()
      
      expect(analysis.totalCalls).toBe(1)
      expect(analysis.totalCost).toBeGreaterThan(0)
      expect(analysis.averageCostPerCall).toBe(analysis.totalCost)
    })

    it('should calculate costs correctly for multiple spans', () => {
      const spans = [
        createMockSpan({
          attributes: {
            'spinal.model': 'openai:gpt-4o-mini-2024-07-18',
            'spinal.input_tokens': 12,
            'spinal.output_tokens': 2
          }
        }),
        createMockSpan({
          attributes: {
            'spinal.model': 'openai:gpt-4o',
            'spinal.input_tokens': 100,
            'spinal.output_tokens': 50
          }
        })
      ]
      writeSpans(spans)

      const analysis = analytics.analyzeCosts()
      
      expect(analysis.totalCalls).toBe(2)
      expect(analysis.totalCost).toBeGreaterThan(0)
      expect(analysis.averageCostPerCall).toBe(analysis.totalCost / 2)
    })

    it('should group costs by model', () => {
      const spans = [
        createMockSpan({
          attributes: {
            'spinal.model': 'openai:gpt-4o-mini-2024-07-18',
            'spinal.input_tokens': 12,
            'spinal.output_tokens': 2
          }
        }),
        createMockSpan({
          attributes: {
            'spinal.model': 'openai:gpt-4o-mini-2024-07-18',
            'spinal.input_tokens': 8,
            'spinal.output_tokens': 1
          }
        }),
        createMockSpan({
          attributes: {
            'spinal.model': 'openai:gpt-4o',
            'spinal.input_tokens': 100,
            'spinal.output_tokens': 50
          }
        })
      ]
      writeSpans(spans)

      const analysis = analytics.analyzeCosts()
      
      expect(Object.keys(analysis.costByModel)).toHaveLength(2)
      expect(analysis.costByModel['openai:gpt-4o-mini-2024-07-18']).toBeDefined()
      expect(analysis.costByModel['openai:gpt-4o']).toBeDefined()
      expect(analysis.costByModel['openai:gpt-4o-mini-2024-07-18'].calls).toBe(2)
      expect(analysis.costByModel['openai:gpt-4o'].calls).toBe(1)
    })

    it('should group costs by aggregation ID', () => {
      const spans = [
        createMockSpan({
          attributes: {
            'spinal.aggregation_id': 'feature-a',
            'spinal.input_tokens': 12,
            'spinal.output_tokens': 2
          }
        }),
        createMockSpan({
          attributes: {
            'spinal.aggregation_id': 'feature-b',
            'spinal.input_tokens': 100,
            'spinal.output_tokens': 50
          }
        })
      ]
      writeSpans(spans)

      const analysis = analytics.analyzeCosts()
      
      expect(Object.keys(analysis.costByAggregation)).toHaveLength(2)
      expect(analysis.costByAggregation['feature-a']).toBeDefined()
      expect(analysis.costByAggregation['feature-b']).toBeDefined()
    })

    it('should handle time filtering', () => {
      const oldSpan = createMockSpan({
        start_time: [Math.floor((Date.now() - 25 * 60 * 60 * 1000) / 1000), 0], // 25 hours ago
        end_time: [Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000), 0]
      })
      const recentSpan = createMockSpan({
        start_time: [Math.floor((Date.now() - 30 * 60 * 1000) / 1000), 0], // 30 minutes ago
        end_time: [Math.floor((Date.now() - 20 * 60 * 1000) / 1000), 0]
      })
      writeSpans([oldSpan, recentSpan])

      const analysis24h = analytics.analyzeCosts({ since: '24h' })
      const analysis1h = analytics.analyzeCosts({ since: '1h' })
      
      expect(analysis24h.totalCalls).toBe(1) // Only recent span
      expect(analysis1h.totalCalls).toBe(1) // Only recent span
    })
  })

  describe('Usage Analysis', () => {
    it('should calculate token usage correctly', () => {
      const spans = [
        createMockSpan({
          attributes: {
            'spinal.input_tokens': 12,
            'spinal.output_tokens': 2,
            'spinal.total_tokens': 14
          }
        }),
        createMockSpan({
          attributes: {
            'spinal.input_tokens': 100,
            'spinal.output_tokens': 50,
            'spinal.total_tokens': 150
          }
        })
      ]
      writeSpans(spans)

      const analysis = analytics.analyzeUsage()
      
      expect(analysis.totalCalls).toBe(2)
      expect(analysis.totalTokens).toBe(164)
      expect(analysis.inputTokens).toBe(112)
      expect(analysis.outputTokens).toBe(52)
      expect(analysis.tokenEfficiency.tokenRatio).toBeCloseTo(0.464, 3)
    })

    it('should calculate token efficiency metrics', () => {
      const span = createMockSpan({
        attributes: {
          'spinal.input_tokens': 12,
          'spinal.output_tokens': 2,
          'spinal.total_tokens': 14
        }
      })
      writeSpans([span])

      const analysis = analytics.analyzeUsage()
      
      expect(analysis.tokenEfficiency.averageInputTokensPerCall).toBe(12)
      expect(analysis.tokenEfficiency.averageOutputTokensPerCall).toBe(2)
      expect(analysis.tokenEfficiency.tokenRatio).toBeCloseTo(0.167, 3)
    })

    it('should group usage by model', () => {
      const spans = [
        createMockSpan({
          attributes: {
            'spinal.model': 'openai:gpt-4o-mini-2024-07-18',
            'spinal.total_tokens': 14
          }
        }),
        createMockSpan({
          attributes: {
            'spinal.model': 'openai:gpt-4o',
            'spinal.total_tokens': 150
          }
        })
      ]
      writeSpans(spans)

      const analysis = analytics.analyzeUsage()
      
      expect(analysis.usageByModel['openai:gpt-4o-mini-2024-07-18'].calls).toBe(1)
      expect(analysis.usageByModel['openai:gpt-4o-mini-2024-07-18'].tokens).toBe(14)
      expect(analysis.usageByModel['openai:gpt-4o'].calls).toBe(1)
      expect(analysis.usageByModel['openai:gpt-4o'].tokens).toBe(150)
    })
  })

  describe('Performance Analysis', () => {
    it('should calculate response times correctly', () => {
      const spans = [
        createMockSpan({
          start_time: [Math.floor((Date.now() - 60000) / 1000), 0],
          end_time: [Math.floor((Date.now() - 50000) / 1000), 0] // 10 second duration
        }),
        createMockSpan({
          start_time: [Math.floor((Date.now() - 30000) / 1000), 0],
          end_time: [Math.floor((Date.now() - 20000) / 1000), 0] // 10 second duration
        })
      ]
      writeSpans(spans)

      const analysis = analytics.analyzePerformance()
      
      expect(analysis.totalRequests).toBe(2)
      expect(analysis.successful).toBe(2)
      expect(analysis.failed).toBe(0)
      expect(analysis.successRate).toBe(100)
      expect(analysis.responseTimes.average).toBe(10000) // 10 seconds in ms
      expect(analysis.responseTimes.median).toBe(10000)
    })

    it('should handle failed requests', () => {
      const spans = [
        createMockSpan({
          status: { code: 1 } // Success
        }),
        createMockSpan({
          status: { code: 2 } // Error
        })
      ]
      writeSpans(spans)

      const analysis = analytics.analyzePerformance()
      
      expect(analysis.totalRequests).toBe(2)
      expect(analysis.successful).toBe(1)
      expect(analysis.failed).toBe(1)
      expect(analysis.successRate).toBe(50)
    })

    it('should calculate percentiles correctly', () => {
      const spans = [
        createMockSpan({
          start_time: [Math.floor((Date.now() - 60000) / 1000), 0],
          end_time: [Math.floor((Date.now() - 50000) / 1000), 0] // 10s
        }),
        createMockSpan({
          start_time: [Math.floor((Date.now() - 30000) / 1000), 0],
          end_time: [Math.floor((Date.now() - 25000) / 1000), 0] // 5s
        }),
        createMockSpan({
          start_time: [Math.floor((Date.now() - 15000) / 1000), 0],
          end_time: [Math.floor((Date.now() - 10000) / 1000), 0] // 5s
        })
      ]
      writeSpans(spans)

      const analysis = analytics.analyzePerformance()
      
      expect(analysis.responseTimes.fastest).toBe(5000)
      expect(analysis.responseTimes.slowest).toBe(10000)
      expect(analysis.responseTimes.median).toBe(5000)
    })
  })

  describe('Model Analysis', () => {
    it('should analyze models correctly', () => {
      const spans = [
        createMockSpan({
          attributes: {
            'spinal.model': 'openai:gpt-4o-mini-2024-07-18',
            'spinal.input_tokens': 12,
            'spinal.output_tokens': 2
          },
          start_time: [1755130071, 471000000],
          end_time: [1755130073, 260907250]
        }),
        createMockSpan({
          attributes: {
            'spinal.model': 'openai:gpt-4o',
            'spinal.input_tokens': 100,
            'spinal.output_tokens': 50
          },
          start_time: [1755130075, 0],
          end_time: [1755130077, 0]
        })
      ]
      writeSpans(spans)

      const analysis = analytics.analyzeModels()
      
      expect(Object.keys(analysis.models)).toHaveLength(2)
      
      const miniModel = analysis.models['openai:gpt-4o-mini-2024-07-18']
      expect(miniModel.calls).toBe(1)
      expect(miniModel.totalCost).toBeGreaterThan(0)
      expect(miniModel.avgResponseTime).toBeCloseTo(1790, 0) // ~1.79 seconds
      expect(miniModel.successRate).toBe(100)
      
      const fullModel = analysis.models['openai:gpt-4o']
      expect(fullModel.calls).toBe(1)
      expect(fullModel.totalCost).toBeGreaterThan(0)
      expect(fullModel.avgResponseTime).toBeCloseTo(2000, 0) // 2 seconds
      expect(fullModel.successRate).toBe(100)
    })
  })

  describe('Aggregation Analysis', () => {
    it('should analyze aggregations correctly', () => {
      const spans = [
        createMockSpan({
          attributes: {
            'spinal.aggregation_id': 'feature-a',
            'spinal.input_tokens': 12,
            'spinal.output_tokens': 2
          },
          status: { code: 1 }
        }),
        createMockSpan({
          attributes: {
            'spinal.aggregation_id': 'feature-b',
            'spinal.input_tokens': 100,
            'spinal.output_tokens': 50
          },
          status: { code: 2 } // Error
        })
      ]
      writeSpans(spans)

      const analysis = analytics.analyzeAggregations()
      
      expect(Object.keys(analysis.aggregations)).toHaveLength(2)
      
      const featureA = analysis.aggregations['feature-a']
      expect(featureA.calls).toBe(1)
      expect(featureA.successRate).toBe(100)
      
      const featureB = analysis.aggregations['feature-b']
      expect(featureB.calls).toBe(1)
      expect(featureB.successRate).toBe(0)
    })
  })

  describe('Trends Analysis', () => {
    it('should calculate trends correctly', () => {
      const spans = [
        createMockSpan({
          attributes: {
            'spinal.input_tokens': 12,
            'spinal.output_tokens': 2
          }
        }),
        createMockSpan({
          attributes: {
            'spinal.input_tokens': 100,
            'spinal.output_tokens': 50
          }
        })
      ]
      writeSpans(spans)

      const analysis = analytics.analyzeTrends()
      
      expect(analysis.usageTrends.dailyAverageCalls).toBeGreaterThan(0)
      expect(analysis.costTrends.dailyAverageCost).toBeGreaterThan(0)
      expect(analysis.performanceTrends.responseTimeTrend).toBeDefined()
    })
  })

  describe('Optimization Recommendations', () => {
    it('should generate cost optimization recommendations', () => {
      const spans = [
        createMockSpan({
          attributes: {
            'spinal.model': 'openai:gpt-4o',
            'spinal.input_tokens': 1000,
            'spinal.output_tokens': 500
          }
        })
      ]
      writeSpans(spans)

      const recommendations = analytics.getOptimizationRecommendations()
      
      expect(recommendations.costOptimization).toBeInstanceOf(Array)
      expect(recommendations.performanceOptimization).toBeInstanceOf(Array)
      expect(recommendations.usageOptimization).toBeInstanceOf(Array)
    })

    it('should recommend gpt-4o-mini for high-cost usage', () => {
      const spans = [
        createMockSpan({
          attributes: {
            'spinal.model': 'openai:gpt-4o',
            'spinal.input_tokens': 1000,
            'spinal.output_tokens': 500
          }
        })
      ]
      writeSpans(spans)

      const recommendations = analytics.getOptimizationRecommendations()
      
      const hasCostRecommendation = recommendations.costOptimization.some(rec => 
        rec.includes('gpt-4o-mini')
      )
      expect(hasCostRecommendation).toBe(true)
    })
  })

  describe('Real Data Integration', () => {
    it('should analyze comprehensive real span data', () => {
      // Use the comprehensive fixture data
      const fixturePath = join(__dirname, '../fixtures/real-spans.jsonl')
      const fixtureAnalytics = new Analytics(fixturePath)
      
      const costAnalysis = fixtureAnalytics.analyzeCosts()
      const usageAnalysis = fixtureAnalytics.analyzeUsage()
      const performanceAnalysis = fixtureAnalytics.analyzePerformance()
      const modelAnalysis = fixtureAnalytics.analyzeModels()
      const aggregationAnalysis = fixtureAnalytics.analyzeAggregations()
      
      // Verify we have the expected number of calls
      expect(costAnalysis.totalCalls).toBe(5)
      expect(usageAnalysis.totalCalls).toBe(5)
      expect(performanceAnalysis.totalRequests).toBe(5)
      
      // Verify we have multiple models
      expect(Object.keys(modelAnalysis.models)).toHaveLength(3)
      expect(modelAnalysis.models['openai:gpt-4o-mini-2024-07-18']).toBeDefined()
      expect(modelAnalysis.models['openai:gpt-4o-mini']).toBeDefined()
      expect(modelAnalysis.models['openai:gpt-4o']).toBeDefined()
      
      // Verify we have multiple aggregations
      expect(Object.keys(aggregationAnalysis.aggregations)).toHaveLength(4) // Including 'unknown' for spans without aggregation_id
      expect(aggregationAnalysis.aggregations['test-feature']).toBeDefined()
      expect(aggregationAnalysis.aggregations['error-test']).toBeDefined()
      expect(aggregationAnalysis.aggregations['feature-b']).toBeDefined()
      expect(aggregationAnalysis.aggregations['unknown']).toBeDefined()
      
      // Verify performance metrics
      expect(performanceAnalysis.successful).toBe(4)
      expect(performanceAnalysis.failed).toBe(1)
      expect(performanceAnalysis.successRate).toBe(80)
      
      // Verify token totals
      expect(usageAnalysis.totalTokens).toBe(569) // 14 + 75 + 150 + 30 + 300
      expect(usageAnalysis.inputTokens).toBe(392) // 12 + 50 + 100 + 30 + 200
      expect(usageAnalysis.outputTokens).toBe(177) // 2 + 25 + 50 + 0 + 100
    })
  })

  describe('Response Analysis', () => {
    it('should analyze response content and quality', () => {
      const spans = [
        createMockSpan({
          attributes: {
            'spinal.model': 'openai:gpt-4o-mini',
            'spinal.input_tokens': 50,
            'spinal.output_tokens': 25,
            'spinal.total_tokens': 75,
            'spinal.response.binary_data': JSON.stringify({
              id: 'chatcmpl-test-1',
              object: 'chat.completion',
              choices: [{
                index: 0,
                message: { role: 'assistant', content: 'This is a test response with 25 tokens.' },
                finish_reason: 'stop'
              }],
              usage: { prompt_tokens: 50, completion_tokens: 25, total_tokens: 75 }
            }),
            'spinal.response.size': 1024,
            'spinal.response.capture_method': 'fetch_clone'
          }
        }),
        createMockSpan({
          status: { code: 2 },
          attributes: {
            'spinal.model': 'openai:gpt-4o',
            'spinal.input_tokens': 30,
            'spinal.output_tokens': 0,
            'spinal.total_tokens': 30,
            'spinal.response.binary_data': JSON.stringify({
              error: {
                message: 'Rate limit exceeded',
                type: 'rate_limit_exceeded',
                code: 'rate_limit_exceeded'
              }
            }),
            'spinal.response.size': 156,
            'spinal.response.capture_method': 'fetch_clone'
          }
        })
      ]
      writeSpans(spans)

      const analysis = analytics.analyzeResponses()
      
      expect(analysis.totalResponses).toBe(2)
      expect(analysis.averageResponseSize).toBe(590) // (1024 + 156) / 2
      expect(analysis.errorAnalysis.totalErrors).toBe(1)
      expect(analysis.errorAnalysis.successRate).toBe(50)
      expect(analysis.errorAnalysis.errorTypes['rate_limit_exceeded']).toBe(1)
      expect(analysis.modelResponseQuality['openai:gpt-4o-mini']).toBeDefined()
      expect(analysis.modelResponseQuality['openai:gpt-4o-mini'].successRate).toBe(100)
    })

    it('should categorize response sizes correctly', () => {
      const spans = [
        createMockSpan({
          attributes: {
            'spinal.model': 'openai:gpt-4o-mini',
            'spinal.response.binary_data': '{"choices":[{"message":{"content":"short"}}]}',
            'spinal.response.size': 300, // small
            'spinal.response.capture_method': 'fetch_clone'
          }
        }),
        createMockSpan({
          attributes: {
            'spinal.model': 'openai:gpt-4o',
            'spinal.response.binary_data': '{"choices":[{"message":{"content":"medium length response"}}]}',
            'spinal.response.size': 1000, // medium
            'spinal.response.capture_method': 'fetch_clone'
          }
        }),
        createMockSpan({
          attributes: {
            'spinal.model': 'openai:gpt-4o',
            'spinal.response.binary_data': '{"choices":[{"message":{"content":"very long response with lots of content"}}]}',
            'spinal.response.size': 3000, // large
            'spinal.response.capture_method': 'fetch_clone'
          }
        })
      ]
      writeSpans(spans)

      const analysis = analytics.analyzeResponses()
      
      expect(analysis.responseSizeDistribution.small).toBe(1)
      expect(analysis.responseSizeDistribution.medium).toBe(1)
      expect(analysis.responseSizeDistribution.large).toBe(1)
    })
  })

  describe('Content Insights', () => {
    it('should analyze response content patterns', () => {
      const spans = [
        createMockSpan({
          attributes: {
            'spinal.model': 'openai:gpt-4o-mini',
            'spinal.output_tokens': 10,
            'spinal.response.binary_data': JSON.stringify({
              choices: [{
                message: { content: 'Hi' }, // short response
                finish_reason: 'stop'
              }]
            }),
            'spinal.response.size': 200,
            'spinal.response.capture_method': 'fetch_clone'
          }
        }),
        createMockSpan({
          attributes: {
            'spinal.model': 'openai:gpt-4o',
            'spinal.output_tokens': 50,
            'spinal.response.binary_data': JSON.stringify({
              choices: [{
                message: { content: 'This is a medium length response with more content than the short one.' }, // medium response
                finish_reason: 'length'
              }]
            }),
            'spinal.response.size': 800,
            'spinal.response.capture_method': 'fetch_clone'
          }
        })
      ]
      writeSpans(spans)

      const insights = analytics.getContentInsights()
      
      expect(insights.responsePatterns.shortResponses).toBe(1)
      expect(insights.responsePatterns.mediumResponses).toBe(1)
      expect(insights.responsePatterns.longResponses).toBe(0)
      expect(insights.finishReasons['stop']).toBe(1)
      expect(insights.finishReasons['length']).toBe(1)
      expect(insights.responseQuality.averageTokensPerCharacter).toBeGreaterThan(0)
      expect(insights.responseQuality.responseEfficiency).toBeGreaterThan(0)
    })

    it('should categorize errors correctly', () => {
      const spans = [
        createMockSpan({
          status: { code: 2 },
          attributes: {
            'spinal.response.binary_data': JSON.stringify({
              error: { type: 'rate_limit_exceeded', message: 'Rate limit exceeded' }
            }),
            'spinal.response.size': 100,
            'spinal.response.capture_method': 'fetch_clone'
          }
        }),
        createMockSpan({
          status: { code: 2 },
          attributes: {
            'spinal.response.binary_data': JSON.stringify({
              error: { type: 'authentication_error', message: 'Invalid API key' }
            }),
            'spinal.response.size': 100,
            'spinal.response.capture_method': 'fetch_clone'
          }
        })
      ]
      writeSpans(spans)

      const insights = analytics.getContentInsights()
      
      expect(insights.commonErrors.rateLimit).toBe(1)
      expect(insights.commonErrors.authentication).toBe(1)
      expect(insights.commonErrors.modelNotFound).toBe(0)
      expect(insights.commonErrors.other).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty spans file', () => {
      writeFileSync(testSpansPath, '')
      
      const analysis = analytics.analyzeCosts()
      expect(analysis.totalCalls).toBe(0)
      expect(analysis.totalCost).toBe(0)
    })

    it('should handle malformed JSON lines', () => {
      writeFileSync(testSpansPath, 'invalid json\n{"valid": "json"}\nanother invalid')
      
      const analysis = analytics.analyzeCosts()
      expect(analysis.totalCalls).toBe(0) // Should skip invalid lines
    })

    it('should handle spans without token data', () => {
      const span = createMockSpan({
        attributes: {
          'spinal.model': 'openai:gpt-4o-mini-2024-07-18'
          // No token data
        }
      })
      writeSpans([span])

      const analysis = analytics.analyzeCosts()
      expect(analysis.totalCalls).toBe(1)
      expect(analysis.totalCost).toBe(0) // No tokens = no cost
    })

    it('should handle non-OpenAI spans', () => {
      const span = createMockSpan({
        name: 'http-request',
        instrumentation_info: { name: 'http', version: '1.0.0' }
      })
      writeSpans([span])

      const analysis = analytics.analyzeCosts()
      expect(analysis.totalCalls).toBe(0) // Should not count non-OpenAI spans
    })
  })
})
