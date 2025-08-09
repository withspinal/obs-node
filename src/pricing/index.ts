export type PricingModel = {
  model: string
  inputPer1K: number // USD per 1K input tokens or chars (heuristic)
  outputPer1K: number // USD per 1K output tokens or chars (heuristic)
}

const catalog: PricingModel[] = [
  { model: 'openai:gpt-4o-mini', inputPer1K: 0.15, outputPer1K: 0.60 },
  { model: 'openai:gpt-4o', inputPer1K: 2.50, outputPer1K: 10.00 },
]

export function estimateCost(params: {
  model?: string
  inputTokens?: number
  outputTokens?: number
}): number {
  const { model = 'openai:gpt-4o-mini', inputTokens = 0, outputTokens = 0 } = params
  const entry = catalog.find((c) => c.model === model) ?? catalog[0]
  const inputCost = (inputTokens / 1000) * entry.inputPer1K
  const outputCost = (outputTokens / 1000) * entry.outputPer1K
  return roundUSD(inputCost + outputCost)
}

function roundUSD(n: number): number {
  return Math.round(n * 10000) / 10000
}


