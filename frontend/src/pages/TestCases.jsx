import React, { useState, useEffect } from 'react';
import { testCaseAPI } from '../services/api.js';
import { 
  FolderHeart, 
  Play, 
  Edit, 
  Trash2, 
  Plus, 
  AlertCircle,
  X,
  Sliders
} from 'lucide-react';

const MODELS_LIST = [
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'qwen/qwen3-32b',
  'meta-llama/llama-4-scout-17b-16e-instruct'
];

const TestCases = ({ setPlaygroundData }) => {
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null); // null if creating
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prompt: '',
    models: ['gpt-4o-mini', 'gemini-2.0-flash'],
    temperature: 0.7,
    maxTokens: 1000
  });

  const fetchTestCases = async () => {
    try {
      setLoading(true);
      const response = await testCaseAPI.getAll();
      if (response.success) {
        setTestCases(response.data);
      }
    } catch (err) {
      console.error('Error fetching test cases:', err);
      setError('Failed to load saved test cases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestCases();
  }, []);

  const openCreateModal = () => {
    setEditingCase(null);
    setFormData({
      name: '',
      description: '',
      prompt: '',
      models: ['gpt-4o-mini', 'gemini-2.0-flash'],
      temperature: 0.7,
      maxTokens: 1000
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingCase(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      prompt: item.prompt,
      models: item.models || [],
      temperature: item.parameters?.temperature ?? 0.7,
      maxTokens: item.parameters?.maxTokens ?? 1000
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test case?')) return;

    try {
      const response = await testCaseAPI.delete(id);
      if (response.success) {
        setTestCases(testCases.filter(item => item._id !== id));
      }
    } catch (err) {
      console.error('Error deleting test case:', err);
      alert('Failed to delete test case.');
    }
  };

  const handleModelToggle = (modelId) => {
    const current = formData.models;
    if (current.includes(modelId)) {
      if (current.length > 1) {
        setFormData({ ...formData, models: current.filter(id => id !== modelId) });
      }
    } else {
      setFormData({ ...formData, models: [...current, modelId] });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCase) {
        // Update
        const response = await testCaseAPI.update(editingCase._id, {
          name: formData.name,
          description: formData.description,
          prompt: formData.prompt,
          models: formData.models,
          parameters: {
            temperature: formData.temperature,
            maxTokens: formData.maxTokens
          }
        });
        if (response.success) {
          setTestCases(testCases.map(item => item._id === editingCase._id ? response.data : item));
        }
      } else {
        // Create
        const response = await testCaseAPI.create({
          name: formData.name,
          description: formData.description,
          prompt: formData.prompt,
          models: formData.models,
          parameters: {
            temperature: formData.temperature,
            maxTokens: formData.maxTokens
          }
        });
        if (response.success) {
          setTestCases([response.data, ...testCases]);
        }
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving test case:', err);
      alert(err.response?.data?.error || 'Failed to save test case.');
    }
  };

  const handleRunTestCase = (item) => {
    setPlaygroundData({
      prompt: item.prompt,
      selectedModels: item.models,
      temperature: item.parameters?.temperature || 0.7,
      maxTokens: item.parameters?.maxTokens || 1000
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="w-10 h-10 border-4 border-brandIndigo/30 border-t-brandIndigo rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans">Saved Test Cases</h2>
          <p className="text-sm text-gray-400 mt-1 font-sans">Manage prompt presets to easily re-evaluate configurations</p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brandIndigo to-brandPurple text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all duration-300 shadow-glow-indigo hover:scale-105 font-sans"
        >
          <Plus size={14} />
          Create Test Case
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-2 text-xs font-sans">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Grid List of Test Cases */}
      {testCases.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <FolderHeart size={40} className="text-gray-600 mb-3" />
          <h4 className="text-lg font-bold text-white font-sans">No Test Cases Yet</h4>
          <p className="text-xs text-gray-500 mt-2 font-sans max-w-sm leading-relaxed">
            Create standard prompt scenarios (e.g., Code writing, Logic riddles, Poem summaries) to rerun easily and benchmark performance over time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testCases.map((item) => (
            <div 
              key={item._id} 
              className="glass-panel rounded-2xl border border-darkBorder hover:border-white/10 transition-all flex flex-col justify-between"
            >
              {/* Title & info */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-white truncate font-sans">{item.name}</h4>
                    <p className="text-[10px] text-gray-400 font-sans mt-0.5 truncate">{item.description || 'No description provided.'}</p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 bg-brandIndigo/10 border border-brandIndigo/25 text-brandIndigo font-bold rounded-md uppercase font-sans">
                    {item.models?.length || 0} Models
                  </span>
                </div>

                {/* Prompt block */}
                <div className="bg-darkBg/60 border border-darkBorder/60 rounded-xl p-3.5 h-24 overflow-y-auto">
                  <p className="text-[11px] text-gray-300 leading-relaxed font-mono font-medium">
                    {item.prompt}
                  </p>
                </div>

                {/* Parameters pills */}
                <div className="flex flex-wrap items-center gap-2 text-[9px] text-gray-500 font-semibold font-sans">
                  <span className="px-2 py-0.5 bg-white/5 rounded-md border border-white/5">Temp: {item.parameters?.temperature ?? 0.7}</span>
                  <span className="px-2 py-0.5 bg-white/5 rounded-md border border-white/5">Tokens: {item.parameters?.maxTokens ?? 1000}</span>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="px-5 py-3.5 bg-darkBg/40 border-t border-darkBorder/40 flex items-center justify-between">
                {/* Models listing in preview */}
                <div className="flex gap-1 overflow-x-auto max-w-[50%] pr-2">
                  {item.models?.map(m => (
                    <span key={m} className="px-1.5 py-0.2 bg-white/5 border border-white/10 rounded-md text-[8px] font-semibold text-gray-400 whitespace-nowrap">
                      {m.split('-')[0]}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 border border-darkBorder hover:border-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
                    title="Edit test case"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 border border-red-500/15 hover:border-red-500/30 text-red-400 hover:text-red-300 rounded-xl transition-all"
                    title="Delete test case"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => handleRunTestCase(item)}
                    className="flex items-center gap-1 px-3 py-2 bg-brandIndigo hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all shadow-glow-indigo"
                  >
                    <Play size={10} />
                    Run
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-darkBg/95 border border-darkBorder rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-slide-in">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-all"
            >
              <X size={18} />
            </button>

            <h4 className="text-lg font-bold text-white mb-2 font-sans">
              {editingCase ? 'Modify Test Case' : 'Create Preset Test Case'}
            </h4>
            <p className="text-xs text-gray-400 mb-6 font-sans">Define parameters, prompts, and target models to save as a standard scenario.</p>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="E.g., Python Fibonacci recursion"
                    className="w-full px-4 py-2.5 bg-darkBg border border-darkBorder rounded-xl text-white text-xs focus:border-brandIndigo focus:outline-none font-sans"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short description of purpose"
                    className="w-full px-4 py-2.5 bg-darkBg border border-darkBorder rounded-xl text-white text-xs focus:border-brandIndigo focus:outline-none font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Prompt scenarios</label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="Type or paste prompt text here..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-darkBg border border-darkBorder rounded-xl text-white text-xs focus:border-brandIndigo focus:outline-none resize-none font-sans"
                  required
                />
              </div>

              {/* Models selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Target Comparison Models</label>
                <div className="flex flex-wrap gap-2">
                  {MODELS_LIST.map((modelId) => {
                    const isChecked = formData.models.includes(modelId);
                    return (
                      <button
                        key={modelId}
                        type="button"
                        onClick={() => handleModelToggle(modelId)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                          isChecked 
                            ? 'bg-brandIndigo/15 border-brandIndigo text-brandIndigo' 
                            : 'bg-darkBg border-darkBorder text-gray-400 hover:border-white/10'
                        }`}
                      >
                        {modelId}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Parameters settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-darkBorder/40 pt-4">
                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-gray-400 uppercase tracking-wider font-sans flex items-center gap-1"><Sliders size={12} /> Temperature</span>
                    <span className="font-extrabold text-brandIndigo font-sans">{formData.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.2"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-brandIndigo bg-darkBg rounded-lg h-1.5 cursor-pointer"
                  />
                </div>

                {/* Max tokens */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-gray-400 uppercase tracking-wider font-sans flex items-center gap-1"><Sliders size={12} /> Max Tokens</span>
                    <span className="font-extrabold text-brandIndigo font-sans">{formData.maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="50"
                    value={formData.maxTokens}
                    onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                    className="w-full accent-brandIndigo bg-darkBg rounded-lg h-1.5 cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex gap-4 pt-4 border-t border-darkBorder/40">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold border border-white/5 transition-all font-sans"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-brandIndigo to-brandPurple text-white rounded-xl text-xs font-bold shadow-glow-indigo transition-all font-sans"
                >
                  {editingCase ? 'Save Changes' : 'Create Preset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCases;
