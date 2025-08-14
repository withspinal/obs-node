import { readFileSync } from 'fs'
import { join } from 'path'
import { estimateCost } from '../pricing'

export interface Span {
  name: string
  trace_id: string
  span_id: string
  parent_span_id: string | null
  start_time: [number, number]
  end_time: [number, number]
  status: { code: number }
  attributes: Record<string, any>
  events: any[]
  links: any[]
  instrumentation_info: { name: string; version: string }
}

export interface AnalyticsOptions {
  since?: string // e.g., "7d", "24h", "1h"
  format?: 'table' | 'json' | 'csv' | 'summary'
  byModel?: boolean
  byAggregation?: boolean
  trends?: boolean
}

export interface CostAnalysis {
  totalCost: number
  totalCalls: number
  averageCostPerCall: number
  costByModel: Record<string, { cost: number; calls: number; percentage: number }>
  costByAggregation: Record<string, { cost: number; calls: number; percentage: number }>
  costTrends: Array<{ date: string; cost: number; calls: number }>
}

export interface UsageAnalysis {
  totalCalls: number
  totalTokens: number
  inputTokens: number
  outputTokens: number
  usageByModel: Record<string, { calls: number; tokens: number; percentage: number }>
  usageByAggregation: Record<string, { calls: number; tokens: number; percentage: number }>
  tokenEfficiency: {
    averageInputTokensPerCall: number
    averageOutputTokensPerCall: number
    tokenRatio: number
  }
}

export interface PerformanceAnalysis {
  totalRequests: number
  successful: number
  failed: number
  successRate: number
  responseTimes: {
    average: number
    median: number
    p95: number
    fastest: number
    slowest: number
  }
  errors: {
    rateLimit: number
    authentication: number
    network: number
    other: number
  }
}

export interface ModelAnalysis {
  models: Record<string, {
    calls: number
    totalCost: number
    avgCostPerCall: number
    avgResponseTime: number
    successRate: number
    totalTokens: number
  }>
}

export interface AggregationAnalysis {
  aggregations: Record<string, {
    calls: number
    totalCost: number
    avgCostPerCall: number
    successRate: number
    totalTokens: number
  }>
}

export interface TrendsAnalysis {
  usageTrends: {
    dailyAverageCalls: number
    peakUsage: { date: string; calls: number }
    growthRate: number
  }
  costTrends: {
    dailyAverageCost: number
    peakCost: { date: string; cost: number }
    costPerCallTrend: 'increasing' | 'decreasing' | 'stable'
  }
  performanceTrends: {
    responseTimeTrend: 'improving' | 'degrading' | 'stable'
    errorRateTrend: 'improving' | 'degrading' | 'stable'
    successRateTrend: 'improving' | 'degrading' | 'stable'
  }
}

export interface OptimizationRecommendations {
  costOptimization: string[]
  performanceOptimization: string[]
  usageOptimization: string[]
}

export interface ResponseAnalysis {
  totalResponses: number
  averageResponseSize: number
  responseSizeDistribution: {
    small: number // < 500 bytes
    medium: number // 500-2000 bytes
    large: number // > 2000 bytes
  }
  contentPatterns: {
    averageResponseLength: number
    commonPhrases: string[]
    responseTypes: Record<string, number> // 'error', 'success', 'truncated'
  }
  errorAnalysis: {
    totalErrors: number
    errorTypes: Record<string, number>
    errorMessages: string[]
    successRate: number
  }
  modelResponseQuality: Record<string, {
    averageResponseLength: number
    averageResponseSize: number
    successRate: number
    commonErrors: string[]
  }>
}

export interface ContentInsights {
  responsePatterns: {
    shortResponses: number // < 50 chars
    mediumResponses: number // 50-200 chars
    longResponses: number // > 200 chars
  }
  finishReasons: Record<string, number> // 'stop', 'length', 'content_filter'
  responseQuality: {
    averageTokensPerCharacter: number
    responseEfficiency: number // output tokens / response size
  }
  commonErrors: {
    rateLimit: number
    authentication: number
    modelNotFound: number
    other: number
  }
}

export class Analytics {
  private spans: Span[] = []
  private spansPath: string

  constructor(spansPath?: string) {
    this.spansPath = spansPath || join(process.cwd(), '.spinal', 'spans.jsonl')
  }

  private loadSpans(): Span[] {
    try {
      const raw = readFileSync(this.spansPath, 'utf8')
      const lines = raw.trim().length ? raw.trim().split('\n') : []
      
      const spans: Span[] = []
      for (const line of lines) {
        try {
          const span = JSON.parse(line)
          spans.push(span)
        } catch {
          // Ignore malformed JSON lines
        }
      }
      
      return spans
    } catch {
      return []
    }
  }

  private filterSpansByTime(spans: Span[], since?: string): Span[] {
    if (!since) return spans

    const now = Date.now()
    const timeMap: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    }

    const cutoff = now - (timeMap[since] || 0)
    
    return spans.filter(span => {
      const spanTime = span.start_time[0] * 1000 + span.start_time[1] / 1000000
      return spanTime >= cutoff
    })
  }

  private isOpenAISpan(span: Span): boolean {
    return span.name === 'openai-api-call' || 
           span.attributes?.['spinal.provider'] === 'openai' ||
           span.instrumentation_info?.name === 'spinal-openai'
  }

  private getSpanDuration(span: Span): number {
    const start = span.start_time[0] * 1000 + span.start_time[1] / 1000000
    const end = span.end_time[0] * 1000 + span.end_time[1] / 1000000
    return end - start
  }

  public analyzeCosts(options: AnalyticsOptions = {}): CostAnalysis {
    this.spans = this.loadSpans()
    const filteredSpans = this.filterSpansByTime(this.spans, options.since)
    const openAISpans = filteredSpans.filter(span => this.isOpenAISpan(span))

    let totalCost = 0
    const totalCalls = openAISpans.length
    const costByModel: Record<string, { cost: number; calls: number; percentage: number }> = {}
    const costByAggregation: Record<string, { cost: number; calls: number; percentage: number }> = {}

    for (const span of openAISpans) {
      const attrs = span.attributes || {}
      const inputTokens = Number(attrs['spinal.input_tokens'] || 0)
      const outputTokens = Number(attrs['spinal.output_tokens'] || 0)
      const model = String(attrs['spinal.model'] || 'openai:gpt-4o-mini')
      const aggregationId = String(attrs['spinal.aggregation_id'] || 'unknown')

      const cost = estimateCost({ model, inputTokens, outputTokens })
      totalCost += cost

      // Group by model
      if (!costByModel[model]) {
        costByModel[model] = { cost: 0, calls: 0, percentage: 0 }
      }
      costByModel[model].cost += cost
      costByModel[model].calls += 1

      // Group by aggregation
      if (!costByAggregation[aggregationId]) {
        costByAggregation[aggregationId] = { cost: 0, calls: 0, percentage: 0 }
      }
      costByAggregation[aggregationId].cost += cost
      costByAggregation[aggregationId].calls += 1
    }

    // Calculate percentages
    Object.values(costByModel).forEach(model => {
      model.percentage = totalCost > 0 ? (model.cost / totalCost) * 100 : 0
    })

    Object.values(costByAggregation).forEach(agg => {
      agg.percentage = totalCost > 0 ? (agg.cost / totalCost) * 100 : 0
    })

    // Calculate cost trends (simplified - daily buckets)
    const costTrends = this.calculateCostTrends(filteredSpans)

    return {
      totalCost,
      totalCalls,
      averageCostPerCall: totalCalls > 0 ? totalCost / totalCalls : 0,
      costByModel,
      costByAggregation,
      costTrends
    }
  }

  public analyzeUsage(options: AnalyticsOptions = {}): UsageAnalysis {
    this.spans = this.loadSpans()
    const filteredSpans = this.filterSpansByTime(this.spans, options.since)
    const openAISpans = filteredSpans.filter(span => this.isOpenAISpan(span))

    const totalCalls = openAISpans.length
    let totalTokens = 0
    let inputTokens = 0
    let outputTokens = 0
    const usageByModel: Record<string, { calls: number; tokens: number; percentage: number }> = {}
    const usageByAggregation: Record<string, { calls: number; tokens: number; percentage: number }> = {}

    for (const span of openAISpans) {
      const attrs = span.attributes || {}
      const spanInputTokens = Number(attrs['spinal.input_tokens'] || 0)
      const spanOutputTokens = Number(attrs['spinal.output_tokens'] || 0)
      const spanTotalTokens = Number(attrs['spinal.total_tokens'] || 0)
      const model = String(attrs['spinal.model'] || 'openai:gpt-4o-mini')
      const aggregationId = String(attrs['spinal.aggregation_id'] || 'unknown')

      inputTokens += spanInputTokens
      outputTokens += spanOutputTokens
      totalTokens += spanTotalTokens

      // Group by model
      if (!usageByModel[model]) {
        usageByModel[model] = { calls: 0, tokens: 0, percentage: 0 }
      }
      usageByModel[model].calls += 1
      usageByModel[model].tokens += spanTotalTokens

      // Group by aggregation
      if (!usageByAggregation[aggregationId]) {
        usageByAggregation[aggregationId] = { calls: 0, tokens: 0, percentage: 0 }
      }
      usageByAggregation[aggregationId].calls += 1
      usageByAggregation[aggregationId].tokens += spanTotalTokens
    }

    // Calculate percentages
    Object.values(usageByModel).forEach(model => {
      model.percentage = totalCalls > 0 ? (model.calls / totalCalls) * 100 : 0
    })

    Object.values(usageByAggregation).forEach(agg => {
      agg.percentage = totalCalls > 0 ? (agg.calls / totalCalls) * 100 : 0
    })

    return {
      totalCalls,
      totalTokens,
      inputTokens,
      outputTokens,
      usageByModel,
      usageByAggregation,
      tokenEfficiency: {
        averageInputTokensPerCall: totalCalls > 0 ? inputTokens / totalCalls : 0,
        averageOutputTokensPerCall: totalCalls > 0 ? outputTokens / totalCalls : 0,
        tokenRatio: inputTokens > 0 ? outputTokens / inputTokens : 0
      }
    }
  }

  public analyzePerformance(options: AnalyticsOptions = {}): PerformanceAnalysis {
    this.spans = this.loadSpans()
    const filteredSpans = this.filterSpansByTime(this.spans, options.since)
    const openAISpans = filteredSpans.filter(span => this.isOpenAISpan(span))

    const totalRequests = openAISpans.length
    const successful = openAISpans.filter(span => span.status.code === 1).length
    const failed = totalRequests - successful
    const successRate = totalRequests > 0 ? (successful / totalRequests) * 100 : 0

    const responseTimes = openAISpans.map(span => this.getSpanDuration(span)).sort((a, b) => a - b)
    const average = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0
    const median = responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length / 2)] : 0
    const p95 = responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length * 0.95)] : 0
    const fastest = responseTimes.length > 0 ? responseTimes[0] : 0
    const slowest = responseTimes.length > 0 ? responseTimes[responseTimes.length - 1] : 0

    // Simplified error analysis (would need more detailed error tracking)
    const errors = {
      rateLimit: 0,
      authentication: 0,
      network: 0,
      other: failed
    }

    return {
      totalRequests,
      successful,
      failed,
      successRate,
      responseTimes: {
        average,
        median,
        p95,
        fastest,
        slowest
      },
      errors
    }
  }

  public analyzeModels(options: AnalyticsOptions = {}): ModelAnalysis {
    this.spans = this.loadSpans()
    const filteredSpans = this.filterSpansByTime(this.spans, options.since)
    const openAISpans = filteredSpans.filter(span => this.isOpenAISpan(span))

    const models: Record<string, {
      calls: number
      totalCost: number
      avgCostPerCall: number
      avgResponseTime: number
      successRate: number
      totalTokens: number
    }> = {}

    for (const span of openAISpans) {
      const attrs = span.attributes || {}
      const model = String(attrs['spinal.model'] || 'openai:gpt-4o-mini')
      const inputTokens = Number(attrs['spinal.input_tokens'] || 0)
      const outputTokens = Number(attrs['spinal.output_tokens'] || 0)
      const totalTokens = Number(attrs['spinal.total_tokens'] || 0)
      const cost = estimateCost({ model, inputTokens, outputTokens })
      const responseTime = this.getSpanDuration(span)
      const isSuccess = span.status.code === 1

      if (!models[model]) {
        models[model] = {
          calls: 0,
          totalCost: 0,
          avgCostPerCall: 0,
          avgResponseTime: 0,
          successRate: 0,
          totalTokens: 0
        }
      }

      models[model].calls += 1
      models[model].totalCost += cost
      models[model].totalTokens += totalTokens
      models[model].avgResponseTime = (models[model].avgResponseTime * (models[model].calls - 1) + responseTime) / models[model].calls
      models[model].avgCostPerCall = models[model].totalCost / models[model].calls
      models[model].successRate = ((models[model].successRate * (models[model].calls - 1)) + (isSuccess ? 100 : 0)) / models[model].calls
    }

    return { models }
  }

  public analyzeAggregations(options: AnalyticsOptions = {}): AggregationAnalysis {
    this.spans = this.loadSpans()
    const filteredSpans = this.filterSpansByTime(this.spans, options.since)
    const openAISpans = filteredSpans.filter(span => this.isOpenAISpan(span))

    const aggregations: Record<string, {
      calls: number
      totalCost: number
      avgCostPerCall: number
      successRate: number
      totalTokens: number
    }> = {}

    for (const span of openAISpans) {
      const attrs = span.attributes || {}
      const aggregationId = String(attrs['spinal.aggregation_id'] || 'unknown')
      const inputTokens = Number(attrs['spinal.input_tokens'] || 0)
      const outputTokens = Number(attrs['spinal.output_tokens'] || 0)
      const totalTokens = Number(attrs['spinal.total_tokens'] || 0)
      const model = String(attrs['spinal.model'] || 'openai:gpt-4o-mini')
      const cost = estimateCost({ model, inputTokens, outputTokens })
      const isSuccess = span.status.code === 1

      if (!aggregations[aggregationId]) {
        aggregations[aggregationId] = {
          calls: 0,
          totalCost: 0,
          avgCostPerCall: 0,
          successRate: 0,
          totalTokens: 0
        }
      }

      aggregations[aggregationId].calls += 1
      aggregations[aggregationId].totalCost += cost
      aggregations[aggregationId].totalTokens += totalTokens
      aggregations[aggregationId].avgCostPerCall = aggregations[aggregationId].totalCost / aggregations[aggregationId].calls
      aggregations[aggregationId].successRate = ((aggregations[aggregationId].successRate * (aggregations[aggregationId].calls - 1)) + (isSuccess ? 100 : 0)) / aggregations[aggregationId].calls
    }

    return { aggregations }
  }

  public analyzeTrends(options: AnalyticsOptions = {}): TrendsAnalysis {
    this.spans = this.loadSpans()
    const filteredSpans = this.filterSpansByTime(this.spans, options.since)
    const openAISpans = filteredSpans.filter(span => this.isOpenAISpan(span))

    // Simplified trends calculation
    const dailyCalls = openAISpans.length / 30 // Assuming 30 days if no specific period
    const peakUsage = { date: 'unknown', calls: Math.max(...openAISpans.map(() => 1)) }
    const growthRate = 0 // Would need historical data for accurate calculation

    const totalCost = openAISpans.reduce((total, span) => {
      const attrs = span.attributes || {}
      const inputTokens = Number(attrs['spinal.input_tokens'] || 0)
      const outputTokens = Number(attrs['spinal.output_tokens'] || 0)
      const model = String(attrs['spinal.model'] || 'openai:gpt-4o-mini')
      return total + estimateCost({ model, inputTokens, outputTokens })
    }, 0)

    const dailyCost = totalCost / 30
    const peakCost = { date: 'unknown', cost: totalCost }
    const costPerCallTrend: 'increasing' | 'decreasing' | 'stable' = 'stable'

    return {
      usageTrends: {
        dailyAverageCalls: dailyCalls,
        peakUsage,
        growthRate
      },
      costTrends: {
        dailyAverageCost: dailyCost,
        peakCost,
        costPerCallTrend
      },
      performanceTrends: {
        responseTimeTrend: 'stable',
        errorRateTrend: 'stable',
        successRateTrend: 'stable'
      }
    }
  }

  public getOptimizationRecommendations(options: AnalyticsOptions = {}): OptimizationRecommendations {
    const costAnalysis = this.analyzeCosts(options)
    const usageAnalysis = this.analyzeUsage(options)
    const performanceAnalysis = this.analyzePerformance(options)
    const modelAnalysis = this.analyzeModels(options)

    const recommendations: OptimizationRecommendations = {
      costOptimization: [],
      performanceOptimization: [],
      usageOptimization: []
    }

    // Cost optimization recommendations
    if (costAnalysis.averageCostPerCall > 0.02) {
      recommendations.costOptimization.push('Consider using gpt-4o-mini for simple tasks to reduce costs')
    }

    if (costAnalysis.totalCost > 10) {
      recommendations.costOptimization.push('Monitor token usage and optimize prompts to reduce costs')
    }

    // Performance optimization recommendations
    if (performanceAnalysis.responseTimes.average > 3000) {
      recommendations.performanceOptimization.push('Consider implementing caching for repeated queries')
    }

    if (performanceAnalysis.successRate < 99) {
      recommendations.performanceOptimization.push('Monitor error rates and implement retry logic')
    }

    // Usage optimization recommendations
    const gpt4Usage = Object.entries(modelAnalysis.models).find(([model]) => model.includes('gpt-4o') && !model.includes('mini'))
    if (gpt4Usage && gpt4Usage[1].calls > usageAnalysis.totalCalls * 0.5) {
      recommendations.usageOptimization.push('Consider using gpt-4o-mini for simple tasks to reduce costs')
    }

    return recommendations
  }

  public analyzeResponses(options: AnalyticsOptions = {}): ResponseAnalysis {
    this.spans = this.loadSpans()
    const filteredSpans = this.filterSpansByTime(this.spans, options.since)
    const openAISpans = filteredSpans.filter(span => this.isOpenAISpan(span))

    let totalResponses = 0
    let totalResponseSize = 0
    const responseSizeDistribution = { small: 0, medium: 0, large: 0 }
    const responseTypes: Record<string, number> = { success: 0, error: 0, truncated: 0 }
    const errorTypes: Record<string, number> = {}
    const errorMessages: string[] = []
    const modelResponseQuality: Record<string, any> = {}
    const allResponseLengths: number[] = []

    for (const span of openAISpans) {
      const attrs = span.attributes || {}
      const responseData = attrs['spinal.response.binary_data']
      const responseSize = Number(attrs['spinal.response.size'] || 0)
      const model = String(attrs['spinal.model'] || 'unknown')
      const isSuccess = span.status.code === 1

      if (responseData) {
        totalResponses++
        totalResponseSize += responseSize

        // Categorize response size
        if (responseSize < 500) responseSizeDistribution.small++
        else if (responseSize < 2000) responseSizeDistribution.medium++
        else responseSizeDistribution.large++

        try {
          const parsed = JSON.parse(responseData)
          
          // Analyze response content
          if (parsed.error) {
            responseTypes.error++
            const errorType = parsed.error.type || 'unknown'
            errorTypes[errorType] = (errorTypes[errorType] || 0) + 1
            errorMessages.push(parsed.error.message || 'Unknown error')
          } else if (parsed.choices && parsed.choices.length > 0) {
            responseTypes.success++
            const choice = parsed.choices[0]
            const content = choice.message?.content || ''
            const responseLength = content.length
            allResponseLengths.push(responseLength)

            if (!modelResponseQuality[model]) {
              modelResponseQuality[model] = {
                averageResponseLength: 0,
                averageResponseSize: 0,
                successRate: 0,
                commonErrors: [],
                totalResponses: 0,
                totalSize: 0,
                totalLength: 0,
                successful: 0
              }
            }

            modelResponseQuality[model].totalResponses++
            modelResponseQuality[model].totalSize += responseSize
            modelResponseQuality[model].totalLength += responseLength
            modelResponseQuality[model].successful += isSuccess ? 1 : 0
          }
        } catch {
          responseTypes.truncated++
        }
      }
    }

    // Calculate averages and percentages
    const averageResponseSize = totalResponses > 0 ? totalResponseSize / totalResponses : 0
    const averageResponseLength = allResponseLengths.length > 0 
      ? allResponseLengths.reduce((a, b) => a + b, 0) / allResponseLengths.length 
      : 0

    // Calculate model-specific metrics
    Object.keys(modelResponseQuality).forEach(model => {
      const data = modelResponseQuality[model]
      data.averageResponseLength = data.totalResponses > 0 ? data.totalLength / data.totalResponses : 0
      data.averageResponseSize = data.totalResponses > 0 ? data.totalSize / data.totalResponses : 0
      data.successRate = data.totalResponses > 0 ? (data.successful / data.totalResponses) * 100 : 0
    })

    return {
      totalResponses,
      averageResponseSize,
      responseSizeDistribution,
      contentPatterns: {
        averageResponseLength,
        commonPhrases: [], // Could be enhanced with NLP analysis
        responseTypes
      },
      errorAnalysis: {
        totalErrors: responseTypes.error,
        errorTypes,
        errorMessages: [...new Set(errorMessages)], // Remove duplicates
        successRate: totalResponses > 0 ? (responseTypes.success / totalResponses) * 100 : 0
      },
      modelResponseQuality
    }
  }

  public getContentInsights(options: AnalyticsOptions = {}): ContentInsights {
    this.spans = this.loadSpans()
    const filteredSpans = this.filterSpansByTime(this.spans, options.since)
    const openAISpans = filteredSpans.filter(span => this.isOpenAISpan(span))

    const responsePatterns = { shortResponses: 0, mediumResponses: 0, longResponses: 0 }
    const finishReasons: Record<string, number> = {}
    const commonErrors = { rateLimit: 0, authentication: 0, modelNotFound: 0, other: 0 }
    let totalOutputTokens = 0
    let totalResponseSize = 0
    let totalResponseLength = 0

    for (const span of openAISpans) {
      const attrs = span.attributes || {}
      const responseData = attrs['spinal.response.binary_data']
      const responseSize = Number(attrs['spinal.response.size'] || 0)
      const outputTokens = Number(attrs['spinal.output_tokens'] || 0)

      if (responseData) {
        totalOutputTokens += outputTokens
        totalResponseSize += responseSize

        try {
          const parsed = JSON.parse(responseData)
          
          if (parsed.error) {
            const errorType = parsed.error.type || 'unknown'
            if (errorType.includes('rate_limit')) commonErrors.rateLimit++
            else if (errorType.includes('auth')) commonErrors.authentication++
            else if (errorType.includes('model')) commonErrors.modelNotFound++
            else commonErrors.other++
          } else if (parsed.choices && parsed.choices.length > 0) {
            const choice = parsed.choices[0]
            const content = choice.message?.content || ''
            const responseLength = content.length
            totalResponseLength += responseLength

            // Categorize response length
            if (responseLength < 50) responsePatterns.shortResponses++
            else if (responseLength < 200) responsePatterns.mediumResponses++
            else responsePatterns.longResponses++

            // Track finish reasons
            const finishReason = choice.finish_reason || 'unknown'
            finishReasons[finishReason] = (finishReasons[finishReason] || 0) + 1
          }
        } catch {
          // Ignore malformed responses
        }
      }
    }

    return {
      responsePatterns,
      finishReasons,
      responseQuality: {
        averageTokensPerCharacter: totalResponseLength > 0 ? totalOutputTokens / totalResponseLength : 0,
        responseEfficiency: totalResponseSize > 0 ? totalOutputTokens / totalResponseSize : 0
      },
      commonErrors
    }
  }

  private calculateCostTrends(spans: Span[]): Array<{ date: string; cost: number; calls: number }> {
    // Simplified trend calculation - would need more sophisticated time bucketing
    const openAISpans = spans.filter(span => this.isOpenAISpan(span))
    
    if (openAISpans.length === 0) return []

    const totalCost = openAISpans.reduce((total, span) => {
      const attrs = span.attributes || {}
      const inputTokens = Number(attrs['spinal.input_tokens'] || 0)
      const outputTokens = Number(attrs['spinal.output_tokens'] || 0)
      const model = String(attrs['spinal.model'] || 'openai:gpt-4o-mini')
      return total + estimateCost({ model, inputTokens, outputTokens })
    }, 0)

    return [
      { date: 'Today', cost: totalCost, calls: openAISpans.length }
    ]
  }
}
