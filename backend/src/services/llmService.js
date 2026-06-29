import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { estimateTokens, calculateCost } from './costCalculator.js';

// Initialize clients conditionally
let openaiClient = null;
let geminiClient = null;
let groqClient = null;

const getOpenAIClient = () => {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
};

const getGeminiClient = () => {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiClient;
};

const getGroqClient = () => {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

// Generates context-aware mock responses based on prompt keywords
const generateMockResponse = (modelId, prompt) => {
  const promptLower = prompt.toLowerCase();
  
  // 1. Coding context
  if (promptLower.includes('code') || promptLower.includes('function') || promptLower.includes('program') || promptLower.includes('fibonacci')) {
    return `Here is a solution in JavaScript to write a Fibonacci function:\n\n\`\`\`javascript\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    let temp = a + b;\n    a = b;\n    b = temp;\n  }\n  return b;\n}\n\n// Example usage:\nconsole.log(fibonacci(10)); // Output: 55\n\`\`\`\n\n### Complexity:\n- **Time Complexity:** O(n) - We loop from 2 to n once.\n- **Space Complexity:** O(1) - We only store a few variables.\n\n*Response simulated from ${modelId} in Mock Mode.*`;
  }
  
  // 2. Creative / Poem
  if (promptLower.includes('poem') || promptLower.includes('write a story') || promptLower.includes('creative')) {
    return `[Poem: Echoes of the Digital Void]\n\nSilicon whispers in the quiet night,\nElectric currents flashing bright,\nA mind of code, of text and light,\nSearching for truth, beyond our sight.\n\nFrom microchips to human dreams,\nWe weave our thoughts in silver streams,\nA canvas larger than it seems,\nUnderneath the starlight beams.\n\n*Response simulated from ${modelId} in Mock Mode.*`;
  }

  // 3. Reasoning / Math
  if (promptLower.includes('reason') || promptLower.includes('riddle') || promptLower.includes('solve') || promptLower.includes('math')) {
    return `### Analysis & Reasoning:\n\n1. Let's break down the problem step by step.\n2. We evaluate constraints and identify potential patterns.\n3. Combining these elements yields the correct solution.\n\n**Conclusion:** The solution follows directly from the logical premises outlined above.\n\n*Response simulated from ${modelId} in Mock Mode.*`;
  }

  // 4. Default general response
  return `Hello! This is a mock response to your prompt: "${prompt}".\n\nAs an AI model (${modelId}), I have processed your input. In a production environment with valid API credentials, this would return a real completion from the model servers.\n\nHere are some key aspects of this topic:\n- **Structure**: Clear headings, lists, and markdown formatting.\n- **Depth**: Attempting to answer your query comprehensively.\n- **Format**: Using bullet points for readability.\n\nLet me know if you would like me to detail any specific point further!\n\n*Response simulated from ${modelId} in Mock Mode.*`;
};

// Main runner for a single model
export const runModelPrompt = async (modelId, prompt, parameters = {}) => {
  const { temperature = 0.7, maxTokens = 1000 } = parameters;
  const startTime = Date.now();
  
  const promptTokens = estimateTokens(prompt);
  let completionText = '';
  let completionTokens = 0;
  let isMock = false;

  try {
    if (modelId.startsWith('gpt')) {
      const client = getOpenAIClient();
      if (!client) {
        // Fallback to Mock
        isMock = true;
        await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 800)); // Simulate latency
        completionText = generateMockResponse(modelId, prompt);
      } else {
        const response = await client.chat.completions.create({
          model: modelId,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        });
        completionText = response.choices[0].message.content;
      }
    } else if (modelId.startsWith('gemini')) {
      const client = getGeminiClient();
      if (!client) {
        // Fallback to Mock
        isMock = true;
        await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1000)); // Simulate latency
        completionText = generateMockResponse(modelId, prompt);
      } else {
        const model = client.getGenerativeModel({ model: modelId });
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        });
        completionText = result.response.text();
      }
    }else if (modelId.includes('llama') || modelId.includes('qwen')) {
      // Groq models
      const client = getGroqClient();
      if (!client) {
        // Fallback to Mock
        isMock = true;
        await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 300)); // Simulate lower latency for Groq
        completionText = generateMockResponse(modelId, prompt);
      } else {
        const response = await client.chat.completions.create({
          model: modelId,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        });
        completionText = response.choices[0].message.content;
      }
    } else {
      // Unknown model, fall back to mock
      isMock = true;
      await new Promise((resolve) => setTimeout(resolve, 500));
      completionText = generateMockResponse(modelId, prompt);
    }

    completionTokens = estimateTokens(completionText);
    const latency = Date.now() - startTime;
    const cost = calculateCost(modelId, promptTokens, completionTokens);

    return {
      modelId,
      response: completionText,
      latency,
      promptTokens,
      completionTokens,
      cost,
      isMock,
      error: null,
    };
  } catch (error) {
    console.error(`Error calling model ${modelId}:`, error);
    return {
      modelId,
      response: null,
      latency: Date.now() - startTime,
      promptTokens,
      completionTokens: 0,
      cost: 0,
      isMock,
      error: error.message || 'Unknown model execution error',
    };
  }
};

/**
 * Execute prompt on multiple models in parallel
 * @param {Array<string>} models 
 * @param {string} prompt 
 * @param {object} parameters 
 * @returns {Promise<Array<object>>}
 */
export const runMultiModelEvaluations = async (models, prompt, parameters = {}) => {
  const promises = models.map(modelId => runModelPrompt(modelId, prompt, parameters));
  return Promise.all(promises);
};
