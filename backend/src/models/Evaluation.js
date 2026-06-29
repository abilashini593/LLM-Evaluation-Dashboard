import mongoose from 'mongoose';

const evaluationResultSchema = new mongoose.Schema({
  modelId: {
    type: String,
    required: true,
  },
  response: {
    type: String,
  },
  latency: {
    type: Number, // in milliseconds
  },
  promptTokens: {
    type: Number,
    default: 0,
  },
  completionTokens: {
    type: Number,
    default: 0,
  },
  cost: {
    type: Number, // in USD
    default: 0,
  },
  scores: {
    relevance: {
      type: Number, // 1-5
      default: 0,
    },
    coherence: {
      type: Number, // 1-5
      default: 0,
    },
    quality: {
      type: Number, // 1-5
      default: 0,
    },
    overall: {
      type: Number, // 1-5
      default: 0,
    },
  },
  judgeFeedback: {
    type: String,
  },
  error: {
    type: String,
  },
});

const evaluationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prompt: {
      type: String,
      required: [true, 'Please add a prompt for evaluation'],
    },
    parameters: {
      temperature: {
        type: Number,
        default: 0.7,
      },
      maxTokens: {
        type: Number,
        default: 1000,
      },
    },
    results: [evaluationResultSchema],
  },
  {
    timestamps: true,
  }
);

const Evaluation = mongoose.model('Evaluation', evaluationSchema);
export default Evaluation;
