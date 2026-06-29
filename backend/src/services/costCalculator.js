// Service to calculate token usage and costs for different LLM models

const RATES = {
  // OpenAI
  'gpt-4o': { input: 5.00 / 1000000, output: 15.00 / 1000000 },
  'gpt-4o-mini': { input: 0.150 / 1000000, output: 0.600 / 1000000 },
  
  // Gemini
  'gemini-2.5-pro': { input: 1.25 / 1000000, output: 5.00 / 1000000 },
  'gemini-2.0-flash': { input: 0.075 / 1000000, output: 0.300 / 1000000 },
  
  // Groq
  'llama-3.1-8b-instant': { input: 0.05 / 1000000, output: 0.08 / 1000000 },
  'llama-3.3-70b-versatile': { input: 0.59 / 1000000, output: 0.79 / 1000000 },
  'qwen/qwen3-32b': { input: 0.24 / 1000000, output: 0.24 / 1000000 }
};

/**
 * Approximate token count based on text length (standard baseline: 1 token ~ 4 characters)
 * @param {string} text 
 * @returns {number}
 */
export const estimateTokens = (text) => {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
};

/**
 * Calculate cost for a run based on model rate and estimated/actual token counts
 * @param {string} modelId 
 * @param {number} promptTokens 
 * @param {number} completionTokens 
 * @returns {number} Cost in USD (decimal)
 */
export const calculateCost = (modelId, promptTokens, completionTokens) => {
  const rate = RATES[modelId];
  if (!rate) return 0; // Default to 0 if unknown model (e.g. mock models not in pricing)
  
  const inputCost = promptTokens * rate.input;
  const outputCost = completionTokens * rate.output;
  
  return Number((inputCost + outputCost).toFixed(8));
};
