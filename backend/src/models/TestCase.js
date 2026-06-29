import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a name for this test case'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    prompt: {
      type: String,
      required: [true, 'Please add a prompt'],
    },
    models: {
      type: [String],
      default: [],
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
  },
  {
    timestamps: true,
  }
);

const TestCase = mongoose.model('TestCase', testCaseSchema);
export default TestCase;
