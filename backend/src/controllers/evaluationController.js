import Evaluation from '../models/Evaluation.js';
import { runMultiModelEvaluations } from '../services/llmService.js';
import { evaluateResponse } from '../services/judgeService.js';

// @desc    Run evaluation on selected models
// @route   POST /api/evaluations/run
// @access  Private
export const runEvaluation = async (req, res) => {
  const { prompt, models, parameters } = req.body;

  try {
    if (!prompt || !models || !Array.isArray(models) || models.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide a prompt and at least one model' });
    }

    // 1. Run LLM completions in parallel
    const completionResults = await runMultiModelEvaluations(models, prompt, parameters);

    // 2. Perform evaluations (LLM-as-a-Judge) on each response
    const evaluationResults = [];
    for (const result of completionResults) {
      if (result.error) {
        // Model call errored out
        evaluationResults.push({
          modelId: result.modelId,
          response: null,
          latency: result.latency,
          promptTokens: result.promptTokens,
          completionTokens: 0,
          cost: 0,
          scores: { relevance: 0, coherence: 0, quality: 0, overall: 0 },
          judgeFeedback: `Error occurred during LLM run: ${result.error}`,
          error: result.error,
        });
      } else {
        // Model run succeeded, run judge evaluation
        const evaluation = await evaluateResponse(prompt, result.response, result.modelId);
        
        evaluationResults.push({
          modelId: result.modelId,
          response: result.response,
          latency: result.latency,
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          cost: result.cost,
          scores: evaluation.scores,
          judgeFeedback: evaluation.judgeFeedback,
        });
      }
    }

    // 3. Save evaluation session to DB
    const newEvaluation = await Evaluation.create({
      user: req.user.id,
      prompt,
      parameters,
      results: evaluationResults,
    });

    return res.status(201).json({
      success: true,
      data: newEvaluation,
    });
  } catch (error) {
    console.error('Run evaluation error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all user evaluations (with filtering & searching)
// @route   GET /api/evaluations
// @access  Private
export const getEvaluations = async (req, res) => {
  try {
    const { search, model, minScore } = req.query;
    
    // Base query
    const query = { user: req.user.id };

    // Apply search filter (case-insensitive keyword in prompt)
    if (search) {
      query.prompt = { $regex: search, $options: 'i' };
    }

    // Apply model filter
    if (model) {
      query['results.modelId'] = model;
    }

    // Apply minScore filter
    if (minScore) {
      query['results.scores.overall'] = { $gte: Number(minScore) };
    }

    const evaluations = await Evaluation.find(query).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: evaluations.length,
      data: evaluations,
    });
  } catch (error) {
    console.error('Get evaluations error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get a single evaluation detail
// @route   GET /api/evaluations/:id
// @access  Private
export const getEvaluationById = async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!evaluation) {
      return res.status(404).json({ success: false, error: 'Evaluation not found' });
    }

    return res.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    console.error('Get evaluation by ID error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete an evaluation
// @route   DELETE /api/evaluations/:id
// @access  Private
export const deleteEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!evaluation) {
      return res.status(404).json({ success: false, error: 'Evaluation not found' });
    }

    return res.json({
      success: true,
      message: 'Evaluation deleted successfully',
    });
  } catch (error) {
    console.error('Delete evaluation error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
