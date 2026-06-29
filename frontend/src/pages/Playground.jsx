import React, { useState, useEffect } from 'react';
import { evaluationAPI, testCaseAPI } from '../services/api.js';
import { 
  Play, 
  Save, 
  Cpu, 
  Clock, 
  Coins, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  CheckCircle,
  FileCheck,
  Terminal
} from 'lucide-react';

const MODELS_LIST = [
  { id: 'llama-3.1-8b-instant', name: 'Llama 3 8B (Groq)', provider: 'Groq', description: 'Ultra-fast open-source LLM' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.1 70B (Groq)', provider: 'Groq', description: 'Powerful reasoning on Groq hardware' },
  { id: 'qwen/qwen3-32b', name: 'Qwen 3 32B (Groq)', provider: 'Groq', description: 'High-quality mixture-of-experts' },
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout', provider: 'Groq', description: 'Next-generation Meta Llama model' }
];

const Playground = ({ initialData, onClearInitialData }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState(['llama-3.1-8b-instant']);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);

  useEffect(() => {
    if (initialData) {
      if (initialData.prompt) setPrompt(initialData.prompt);
      if (initialData.selectedModels) setSelectedModels(initialData.selectedModels);
      if (initialData.temperature !== undefined) setTemperature(initialData.temperature);
      if (initialData.maxTokens !== undefined) setMaxTokens(initialData.maxTokens);
      onClearInitialData();
    }
  }, [initialData]);
  
  // Running state
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [expandedJudge, setExpandedJudge] = useState({});

  // Save Test Case state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [testCaseName, setTestCaseName] = useState('');
  const [testCaseDesc, setTestCaseDesc] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleModelToggle = (modelId) => {
    if (selectedModels.includes(modelId)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter(id => id !== modelId));
      }
    } else {
      setSelectedModels([...selectedModels, modelId]);
    }
  };

  const handleRunEvaluation = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setRunning(true);
    setResults(null);
    setError(null);
    setExpandedJudge({});

    try {
      const response = await evaluationAPI.run(prompt, selectedModels, {
        temperature,
        maxTokens
      });

      if (response.success) {
        setResults(response.data.results);
      } else {
        setError(response.error || 'Failed to complete evaluation run');
      }
    } catch (err) {
      console.error('Playground run error:', err);
      setError(err.response?.data?.error || 'Server error occurred during execution. Please check your database connection.');
    } finally {
      setRunning(false);
    }
  };

  const handleSaveTestCase = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !testCaseName.trim()) return;

    try {
      const response = await testCaseAPI.create({
        name: testCaseName,
        description: testCaseDesc,
        prompt,
        models: selectedModels,
        parameters: { temperature, maxTokens }
      });

      if (response.success) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveModalOpen(false);
          setSaveSuccess(false);
          setTestCaseName('');
          setTestCaseDesc('');
        }, 2000);
      }
    } catch (err) {
      console.error('Save testcase error:', err);
      setError(err.response?.data?.error || 'Failed to save test case');
    }
  };

  const toggleJudgeFeedback = (index) => {
    setExpandedJudge(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getScoreColorClass = (score) => {
    if (score >= 4.5) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 3.5) return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
    if (score >= 2.5) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-[calc(100vh-8rem)] animate-slide-in">
      
      {/* Parameters Panel */}
      <div className="xl:col-span-1 space-y-6">
        <div className="glass-panel rounded-2xl p-6 space-y-6 sticky top-24">
          <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2 border-b border-darkBorder pb-4">
            <Cpu size={18} className="text-brandIndigo" />
            Evaluation Setup
          </h3>

          <form onSubmit={handleRunEvaluation} className="space-y-6">
            {/* Prompt text area */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-sans">
                Prompt Under Test
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter the prompt you want to evaluate..."
                rows={6}
                className="w-full px-4 py-3 bg-darkBg/60 border border-darkBorder rounded-xl text-white text-sm focus:border-brandIndigo focus:outline-none focus:ring-1 focus:ring-brandIndigo transition-all resize-none font-sans"
                required
              />
            </div>

            {/* Model select list */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-sans">
                Select Models to Compare
              </label>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {MODELS_LIST.map((model) => {
                  const isChecked = selectedModels.includes(model.id);
                  return (
                    <div
                      key={model.id}
                      onClick={() => handleModelToggle(model.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 flex items-center justify-between ${
                        isChecked
                          ? 'border-brandIndigo/40 bg-brandIndigo/10'
                          : 'border-darkBorder bg-darkBg/30 hover:border-white/10'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white truncate font-sans">{model.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 font-semibold font-sans">{model.provider}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5 font-sans">{model.description}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                        isChecked ? 'bg-brandIndigo border-brandIndigo text-white' : 'border-gray-600'
                      }`}>
                        {isChecked && (
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-400 uppercase tracking-wider font-sans">Temperature</span>
                <span className="font-bold text-brandIndigo font-sans">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-brandIndigo bg-darkBg/80 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            {/* Max Tokens Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-400 uppercase tracking-wider font-sans">Max Tokens</span>
                <span className="font-bold text-brandIndigo font-sans">{maxTokens}</span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-brandIndigo bg-darkBg/80 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={running || !prompt.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-brandIndigo to-brandPurple text-white rounded-xl text-xs font-bold tracking-wide shadow-glow-indigo transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
              >
                <Play size={14} />
                {running ? 'Evaluating...' : 'Run Evaluation'}
              </button>
              
              <button
                type="button"
                onClick={() => setSaveModalOpen(true)}
                disabled={running || !prompt.trim()}
                className="p-3.5 bg-darkBg border border-darkBorder hover:border-white/10 text-gray-400 hover:text-white rounded-xl transition-all"
                title="Save Prompt as Test Case"
              >
                <Save size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Comparison Panel */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Error notification */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl flex items-start gap-3 text-xs leading-relaxed font-sans shadow-lg animate-slide-in">
            <AlertCircle className="flex-shrink-0 mt-0.5" size={16} />
            <div>
              <span className="font-bold block mb-0.5">Execution Failed</span>
              {error}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {running && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedModels.map((modelId) => {
              const modelObj = MODELS_LIST.find(m => m.id === modelId) || { name: modelId };
              return (
                <div key={modelId} className="glass-panel border border-white/5 rounded-2xl p-6 space-y-6 animate-pulse">
                  <div className="flex items-center justify-between border-b border-darkBorder/40 pb-4">
                    <div>
                      <div className="h-4 w-28 bg-white/10 rounded"></div>
                      <div className="h-2 w-16 bg-white/5 rounded mt-2"></div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                      <Clock size={16} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-white/5 rounded"></div>
                    <div className="h-3 w-full bg-white/5 rounded"></div>
                    <div className="h-3 w-3/4 bg-white/5 rounded"></div>
                  </div>
                  <div className="pt-4 border-t border-darkBorder/40 grid grid-cols-3 gap-2">
                    <div className="h-8 bg-white/5 rounded"></div>
                    <div className="h-8 bg-white/5 rounded"></div>
                    <div className="h-8 bg-white/5 rounded"></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State Greeting */}
        {!running && !results && (
          <div className="glass-panel rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="bg-brandIndigo/5 p-4 rounded-full border border-brandIndigo/10 text-brandIndigo mb-4 animate-double-pulse">
              <Terminal size={32} />
            </div>
            <h4 className="text-xl font-bold text-white font-sans">Playground Ready</h4>
            <p className="text-sm text-gray-400 max-w-sm mt-2 leading-relaxed font-sans">
              Enter your prompt in the setup panel, select the target models, and click "Run Evaluation" to see side-by-side comparative results.
            </p>
          </div>
        )}

        {/* Results grid */}
        {!running && results && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((result, idx) => {
              const modelObj = MODELS_LIST.find(m => m.id === result.modelId) || { name: result.modelId, provider: 'Unknown' };
              const isExpanded = !!expandedJudge[idx];
              
              return (
                <div key={result.modelId} className="glass-panel rounded-2xl flex flex-col border border-darkBorder hover:border-white/10 transition-all duration-300">
                  {/* Card Header */}
                  <div className="p-5 border-b border-darkBorder flex items-center justify-between bg-darkBg/20">
                    <div>
                      <h4 className="font-extrabold text-sm text-white font-sans">{modelObj.name}</h4>
                      <p className="text-[10px] text-gray-500 font-semibold font-sans mt-0.5 uppercase tracking-wider">{modelObj.provider}</p>
                    </div>
                    {/* Overall score badge */}
                    {result.response && (
                      <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold font-sans ${getScoreColorClass(result.scores?.overall)}`}>
                        {result.scores?.overall ? result.scores.overall.toFixed(1) : 'N/A'} <span className="text-[10px] font-normal text-gray-400">Score</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body (Model Response) */}
                  <div className="p-5 flex-1 space-y-4">
                    {result.error ? (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold leading-relaxed font-sans">
                        {result.error}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-300 leading-relaxed font-sans whitespace-pre-wrap break-words h-64 overflow-y-auto pr-1 select-text">
                        {result.response}
                      </div>
                    )}
                  </div>

                  {/* Latency & Token usage Stats footer */}
                  {!result.error && (
                    <div className="px-5 py-3.5 bg-darkBg/40 border-t border-darkBorder/40 grid grid-cols-3 gap-2 text-[10px] font-medium text-gray-400 font-sans">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-brandCyan" />
                        <span>{(result.latency / 1000).toFixed(2)}s</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen size={12} className="text-brandIndigo" />
                        <span>{result.promptTokens}p / {result.completionTokens}c</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Coins size={12} className="text-purple-400" />
                        <span>${result.cost ? result.cost.toFixed(5) : '0.00'}</span>
                      </div>
                    </div>
                  )}

                  {/* Judge Scores Section */}
                  {!result.error && (
                    <div className="px-5 pb-5 border-t border-darkBorder/40 pt-4 bg-darkBg/60 rounded-b-2xl space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-darkBg/50 border border-darkBorder p-2 rounded-xl text-center">
                          <p className="text-[9px] text-gray-500 font-bold font-sans uppercase">Relevance</p>
                          <p className="text-xs font-extrabold text-white mt-1 font-sans">{result.scores?.relevance} <span className="text-[9px] text-gray-500 font-medium">/ 5</span></p>
                        </div>
                        <div className="bg-darkBg/50 border border-darkBorder p-2 rounded-xl text-center">
                          <p className="text-[9px] text-gray-500 font-bold font-sans uppercase">Coherence</p>
                          <p className="text-xs font-extrabold text-white mt-1 font-sans">{result.scores?.coherence} <span className="text-[9px] text-gray-500 font-medium">/ 5</span></p>
                        </div>
                        <div className="bg-darkBg/50 border border-darkBorder p-2 rounded-xl text-center">
                          <p className="text-[9px] text-gray-500 font-bold font-sans uppercase">Quality</p>
                          <p className="text-xs font-extrabold text-white mt-1 font-sans">{result.scores?.quality} <span className="text-[9px] text-gray-500 font-medium">/ 5</span></p>
                        </div>
                      </div>

                      {/* Collapse/Expand Judge Feedback Rationale */}
                      <div className="border border-darkBorder rounded-xl bg-darkBg/80 overflow-hidden">
                        <button
                          onClick={() => toggleJudgeFeedback(idx)}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-all"
                        >
                          <span className="text-[10px] font-bold text-gray-300 font-sans uppercase tracking-wider flex items-center gap-1.5">
                            <FileCheck size={12} className="text-brandCyan" />
                            LLM Judge Critique
                          </span>
                          {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                        </button>
                        
                        {isExpanded && (
                          <div className="p-3.5 border-t border-darkBorder text-[10px] text-gray-400 leading-relaxed font-sans select-text">
                            {result.judgeFeedback}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Save Test Case Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-darkBg/95 border border-darkBorder rounded-3xl p-6 shadow-2xl relative animate-slide-in">
            <h4 className="text-lg font-bold text-white mb-2 font-sans">Save Prompt Configurations</h4>
            <p className="text-xs text-gray-400 mb-6 font-sans">Create a standard test case that you can quickly retrieve and re-evaluate in the future.</p>
            
            {saveSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <CheckCircle size={40} className="text-emerald-400 mb-3 animate-bounce" />
                <span className="text-sm font-bold text-white font-sans">Test Case Saved successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSaveTestCase} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Name</label>
                  <input
                    type="text"
                    value={testCaseName}
                    onChange={(e) => setTestCaseName(e.target.value)}
                    placeholder="General reasoning puzzle"
                    className="w-full px-4.5 py-3 bg-darkBg border border-darkBorder rounded-xl text-white text-sm focus:border-brandIndigo focus:outline-none font-sans"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Description (Optional)</label>
                  <input
                    type="text"
                    value={testCaseDesc}
                    onChange={(e) => setTestCaseDesc(e.target.value)}
                    placeholder="Short description of prompt context"
                    className="w-full px-4.5 py-3 bg-darkBg border border-darkBorder rounded-xl text-white text-sm focus:border-brandIndigo focus:outline-none font-sans"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSaveModalOpen(false)}
                    className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold tracking-wide border border-white/5 transition-all font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-brandIndigo to-brandPurple text-white rounded-xl text-xs font-bold tracking-wide shadow-glow-indigo transition-all font-sans"
                  >
                    Save Case
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Playground;
