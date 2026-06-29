import Evaluation from '../models/Evaluation.js';

// @desc    Get model leaderboard rankings
// @route   GET /api/analytics/leaderboard
// @access  Private
export const getLeaderboard = async (req, res) => {
  try {
    // We aggregate all evaluations for the current user and unpack the results array
    const stats = await Evaluation.aggregate([
      { $match: { user: req.user._id } },
      { $unwind: '$results' },
      {
        $group: {
          _id: '$results.modelId',
          totalRuns: { $sum: 1 },
          successRuns: {
            $sum: { $cond: [{ $ifNull: ['$results.error', false] }, 0, 1] }
          },
          avgRelevance: {
            $avg: { $cond: [{ $ifNull: ['$results.error', false] }, null, '$results.scores.relevance'] }
          },
          avgCoherence: {
            $avg: { $cond: [{ $ifNull: ['$results.error', false] }, null, '$results.scores.coherence'] }
          },
          avgQuality: {
            $avg: { $cond: [{ $ifNull: ['$results.error', false] }, null, '$results.scores.quality'] }
          },
          avgOverall: {
            $avg: { $cond: [{ $ifNull: ['$results.error', false] }, null, '$results.scores.overall'] }
          },
          avgLatency: {
            $avg: { $cond: [{ $ifNull: ['$results.error', false] }, null, '$results.latency'] }
          },
          totalCost: { $sum: '$results.cost' },
          totalTokens: { $sum: { $add: ['$results.promptTokens', '$results.completionTokens'] } }
        }
      },
      {
        $project: {
          modelId: '$_id',
          totalRuns: 1,
          successRuns: 1,
          avgRelevance: { $round: ['$avgRelevance', 2] },
          avgCoherence: { $round: ['$avgCoherence', 2] },
          avgQuality: { $round: ['$avgQuality', 2] },
          avgOverall: { $round: ['$avgOverall', 2] },
          avgLatency: { $round: ['$avgLatency', 0] },
          totalCost: { $round: ['$totalCost', 5] },
          totalTokens: 1,
          errorRate: {
            $round: [
              {
                $multiply: [
                  { $divide: [{ $subtract: ['$totalRuns', '$successRuns'] }, { $max: ['$totalRuns', 1] }] },
                  100
                ]
              },
              1
            ]
          }
        }
      },
      { $sort: { avgOverall: -1, avgLatency: 1 } }
    ]);

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get dashboard chart data
// @route   GET /api/analytics/charts
// @access  Private
export const getChartsData = async (req, res) => {
  try {
    // 1. Fetch recent runs (past 15 evaluations) to plot historical scores
    const recentEvaluations = await Evaluation.find({ user: req.user.id })
      .sort({ createdAt: 1 })
      .limit(15);

    const timelineData = recentEvaluations.map(evalDoc => {
      const entry = {
        id: evalDoc._id,
        prompt: evalDoc.prompt.length > 30 ? evalDoc.prompt.slice(0, 30) + '...' : evalDoc.prompt,
        date: new Date(evalDoc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      };
      
      evalDoc.results.forEach(resObj => {
        if (!resObj.error) {
          entry[resObj.modelId] = resObj.scores.overall;
        }
      });

      return entry;
    });

    // 2. Aggregate average latency comparison
    const latencyData = await Evaluation.aggregate([
      { $match: { user: req.user._id } },
      { $unwind: '$results' },
      { $match: { 'results.error': { $exists: false } } },
      {
        $group: {
          _id: '$results.modelId',
          avgLatency: { $avg: '$results.latency' },
        }
      },
      {
        $project: {
          name: '$_id',
          latency: { $round: ['$avgLatency', 0] }
        }
      },
      { $sort: { latency: 1 } }
    ]);

    // 3. Aggregate total cost and token breakdown
    const usageData = await Evaluation.aggregate([
      { $match: { user: req.user._id } },
      { $unwind: '$results' },
      {
        $group: {
          _id: '$results.modelId',
          cost: { $sum: '$results.cost' },
          promptTokens: { $sum: '$results.promptTokens' },
          completionTokens: { $sum: '$results.completionTokens' },
        }
      },
      {
        $project: {
          name: '$_id',
          cost: { $round: ['$cost', 6] },
          promptTokens: 1,
          completionTokens: 1,
          totalTokens: { $add: ['$promptTokens', '$completionTokens'] }
        }
      }
    ]);

    return res.json({
      success: true,
      data: {
        timeline: timelineData,
        latency: latencyData,
        usage: usageData
      }
    });
  } catch (error) {
    console.error('Get charts data error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
