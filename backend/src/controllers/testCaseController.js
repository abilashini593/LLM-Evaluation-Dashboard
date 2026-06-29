import TestCase from '../models/TestCase.js';

// @desc    Get all user test cases
// @route   GET /api/test-cases
// @access  Private
export const getTestCases = async (req, res) => {
  try {
    const testCases = await TestCase.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: testCases.length,
      data: testCases,
    });
  } catch (error) {
    console.error('Get test cases error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a new test case
// @route   POST /api/test-cases
// @access  Private
export const createTestCase = async (req, res) => {
  const { name, description, prompt, models, parameters } = req.body;

  try {
    if (!name || !prompt) {
      return res.status(400).json({ success: false, error: 'Please provide a name and prompt' });
    }

    const testCase = await TestCase.create({
      user: req.user.id,
      name,
      description,
      prompt,
      models: models || [],
      parameters: parameters || { temperature: 0.7, maxTokens: 1000 },
    });

    return res.status(201).json({
      success: true,
      data: testCase,
    });
  } catch (error) {
    console.error('Create testcase error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a testcase
// @route   PUT /api/test-cases/:id
// @access  Private
export const updateTestCase = async (req, res) => {
  const { name, description, prompt, models, parameters } = req.body;

  try {
    let testCase = await TestCase.findOne({ _id: req.params.id, user: req.user.id });

    if (!testCase) {
      return res.status(404).json({ success: false, error: 'Test case not found' });
    }

    testCase = await TestCase.findByIdAndUpdate(
      req.params.id,
      { name, description, prompt, models, parameters },
      { new: true, runValidators: true }
    );

    return res.json({
      success: true,
      data: testCase,
    });
  } catch (error) {
    console.error('Update testcase error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a testcase
// @route   DELETE /api/test-cases/:id
// @access  Private
export const deleteTestCase = async (req, res) => {
  try {
    const testCase = await TestCase.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!testCase) {
      return res.status(404).json({ success: false, error: 'Test case not found' });
    }

    return res.json({
      success: true,
      message: 'Test case deleted successfully',
    });
  } catch (error) {
    console.error('Delete testcase error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
