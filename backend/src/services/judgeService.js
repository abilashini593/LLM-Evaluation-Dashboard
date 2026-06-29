import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize clients conditionally
let openaiClient = null;
let geminiClient = null;

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

// Robust rule-based Mock Judge to evaluate responses when API keys are not provided
const evaluateWithMockJudge = (prompt, response, modelId) => {
  if (!response) {
    return {
      scores: { relevance: 1, coherence: 1, quality: 1, overall: 1 },
      judgeFeedback: 'The model failed to return a valid response, resulting in minimum scores.',
    };
  }

  const promptLower = prompt.toLowerCase();
  const respLower = response.toLowerCase();
  
  // Calculate basic heuristics
  const length = response.length;
  const wordCount = response.split(/\s+/).length;
  
  // 1. Coherence: Look for structure (markdown elements)
  let coherence = 3.5;
  if (response.includes('```')) coherence += 1.0; // Has code blocks
  if (response.includes('\n-') || response.includes('\n*') || response.includes('\n1.')) coherence += 0.5; // Has lists
  if (response.includes('###') || response.includes('##')) coherence += 0.5; // Has headings
  if (length < 100) coherence -= 1.0; // Too short
  coherence = Math.max(1, Math.min(5, Math.round(coherence * 10) / 10));

  // 2. Relevance: Look for keyword matches from prompt
  const promptWords = promptLower.split(/\s+/).filter(w => w.length > 4);
  let matchCount = 0;
  promptWords.forEach(word => {
    // strip punctuation
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    if (cleanWord && respLower.includes(cleanWord)) {
      matchCount++;
    }
  });

  let relevance = 3.5;
  const matchRatio = promptWords.length > 0 ? matchCount / promptWords.length : 0.5;
  relevance += (matchRatio * 2) - 1; // shift by -1 to +1
  if (length < 50) relevance -= 1.5;
  relevance = Math.max(1, Math.min(5, Math.round(relevance * 10) / 10));

  // 3. Quality: Balance of length, details, and formatting
  let quality = 3.0;
  if (wordCount > 100) quality += 1.0;
  if (wordCount > 250) quality += 0.5;
  if (response.includes('```')) quality += 0.5;
  if (length < 80) quality -= 1.5;
  // Introduce small random variance based on model properties
  const hash = modelId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variance = (hash % 10) / 15 - 0.3; // -0.3 to +0.3
  quality += variance;
  quality = Math.max(1, Math.min(5, Math.round(quality * 10) / 10));

  // 4. Overall score: Average of the three
  const overall = Math.max(1, Math.min(5, Math.round(((relevance + coherence + quality) / 3) * 10) / 10));

  // Generate a customized critique based on scores
  let feedback = '';
  if (overall >= 4.5) {
    feedback = `Excellent response from ${modelId}. It is highly relevant, exceptionally well-structured with clear markdown headings or code snippets, and fully addresses the prompt's core intent with correct formatting.`;
  } else if (overall >= 3.5) {
    feedback = `Good response from ${modelId}. It covers the main aspects of the prompt and maintains solid readability. It could be enhanced with more precise structural headings or slightly deeper technical definitions, but is fully competent.`;
  } else if (overall >= 2.5) {
    feedback = `Moderate quality. The response from ${modelId} addresses the topic but lacks detail or fails to structure the answer effectively (missing lists, subheadings, or code examples). It feels somewhat generic or brief.`;
  } else {
    feedback = `Poor response. The output is either too brief, lacks relevant details, or fails to properly format instructions. It does not adequately answer the prompt query.`;
  }

  return {
    scores: {
      relevance: Math.round(relevance),
      coherence: Math.round(coherence),
      quality: Math.round(quality),
      overall: Math.round(overall),
    },
    judgeFeedback: feedback,
  };
};

/**
 * Score a response using an LLM as a Judge (or Mock fallback)
 * @param {string} prompt The original prompt
 * @param {string} response The response being evaluated
 * @param {string} modelId The ID of the model that generated the response
 * @returns {Promise<object>} Scores and written feedback
 */
export const evaluateResponse = async (prompt, response, modelId) => {
  // If response failed, immediately return error score
  if (!response) {
    return {
      scores: { relevance: 1, coherence: 1, quality: 1, overall: 1 },
      judgeFeedback: `Model ${modelId} failed to generate a response.`,
    };
  }

  const openai = getOpenAIClient();
  const gemini = getGeminiClient();

  // If no API keys, run mock judge
  if (!openai && !gemini) {
    return evaluateWithMockJudge(prompt, response, modelId);
  }

  const systemPrompt = `You are an expert AI-as-a-Judge system. Your task is to evaluate an LLM's response based on the original user prompt.
Evaluate the response on three metrics (Relevance, Coherence, Quality), scoring each from 1 to 5 (integer, where 5 is excellent and 1 is very poor).
Also compute an Overall score from 1 to 5.
Provide a clear, objective feedback explanation summarizing the strengths and weaknesses of the response.

You MUST respond strictly in the following JSON format without markdown wraps:
{
  "relevance": 5,
  "coherence": 4,
  "quality": 5,
  "overall": 5,
  "feedback": "The response is..."
}`;

  const userEvaluationPrompt = `[User Prompt]: "${prompt}"
[Model Response]: "${response}"

Evaluate the response above.`;

  try {
    let resultJSON = null;

    if (gemini) {
      // Use Gemini as judge
      const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userEvaluationPrompt}` }] }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        }
      });
      const responseText = result.response.text();
      resultJSON = JSON.parse(responseText);
    } else if (openai) {
      // Use OpenAI as judge (gpt-4o-mini is cost-effective)
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userEvaluationPrompt }
        ],
        response_format: { type: 'json_object' }
      });
      resultJSON = JSON.parse(completion.choices[0].message.content);
    }

    if (resultJSON) {
      return {
        scores: {
          relevance: Number(resultJSON.relevance) || 3,
          coherence: Number(resultJSON.coherence) || 3,
          quality: Number(resultJSON.quality) || 3,
          overall: Number(resultJSON.overall) || 3,
        },
        judgeFeedback: resultJSON.feedback || 'Evaluation completed successfully.',
      };
    }
  } catch (error) {
    console.error('Error in LLM-as-a-Judge execution, falling back to rule-based evaluation:', error);
  }

  // Fallback to mock judge if real API judge fails mid-call
  return evaluateWithMockJudge(prompt, response, modelId);
};
