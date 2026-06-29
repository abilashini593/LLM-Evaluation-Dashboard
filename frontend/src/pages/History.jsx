import React, { useState, useEffect } from 'react';
import { evaluationAPI } from '../services/api.js';
import { 
  Search, 
  Trash2, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Calendar,
  Sliders,
  AlertCircle,
  Clock,
  BookOpen,
  Coins,
  FileCheck
} from 'lucide-react';

const MODELS_LIST = [
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'qwen/qwen3-32b',
  'meta-llama/llama-4-scout-17b-16e-instruct'
];

const History = ({ setPlaygroundData }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [scoreFilter, setScoreFilter] = useState('');
  
  // Expanded evaluations state (multiple rows can be expanded)
  const [expandedRows, setExpandedRows] = useState({});
  const [expandedCritiques, setExpandedCritiques] = useState({});

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const response = await evaluationAPI.getAll(search, modelFilter, scoreFilter);
      if (response.success) {
        setEvaluations(response.data);
      }
    } catch (err) {
      console.error('Error fetching evaluations history:', err);
      setError('Failed to fetch evaluations history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search/filters fetches
    const delayDebounceFn = setTimeout(() => {
      fetchEvaluations();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, modelFilter, scoreFilter]);

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Avoid expanding row when clicking delete
    if (!window.confirm('Are you sure you want to delete this evaluation run?')) return;

    try {
      const response = await evaluationAPI.delete(id);
      if (response.success) {
        setEvaluations(evaluations.filter(item => item._id !== id));
      }
    } catch (err) {
      console.error('Error deleting evaluation:', err);
      alert('Failed to delete evaluation.');
    }
  };

  const handleRerun = (item, e) => {
    e.stopPropagation();
    const modelIds = item.results.map(r => r.modelId);
    setPlaygroundData({
      prompt: item.prompt,
      selectedModels: modelIds,
      temperature: item.parameters?.temperature || 0.7,
      maxTokens: item.parameters?.maxTokens || 1000
    });
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleCritique = (evalId, modelId) => {
    const key = `${evalId}-${modelId}`;
    setExpandedCritiques(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getScoreColorClass = (score) => {
    if (score >= 4.5) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 3.5) return 'text-teal-400 border-teal-500/20 bg-teal-500/5';
    if (score >= 2.5) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-red-400 border-red-500/20 bg-red-500/5';
  };

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans">Evaluation History</h2>
        <p className="text-sm text-gray-400 mt-1 font-sans">Search, filter, and drill down into all past benchmarking sessions</p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 border border-darkBorder">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search prompt keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-darkBg/60 border border-darkBorder rounded-xl text-white text-xs focus:border-brandIndigo focus:outline-none transition-all font-sans"
          />
        </div>

        {/* Model Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
            <Sliders size={16} />
          </span>
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#090d16] border border-darkBorder rounded-xl text-white text-xs focus:border-brandIndigo focus:outline-none cursor-pointer appearance-none font-sans"
          >
            <option value="">All Models</option>
            {MODELS_LIST.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        {/* Score Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
            <Sliders size={16} />
          </span>
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#090d16] border border-darkBorder rounded-xl text-white text-xs focus:border-brandIndigo focus:outline-none cursor-pointer appearance-none font-sans"
          >
            <option value="">Any Score</option>
            <option value="4">Overall Score ≥ 4.0</option>
            <option value="3">Overall Score ≥ 3.0</option>
            <option value="2">Overall Score ≥ 2.0</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && evaluations.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-brandIndigo/30 border-t-brandIndigo rounded-full animate-spin"></div>
        </div>
      ) : evaluations.length === 0 ? (
        /* Empty history */
        <div className="glass-panel rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <AlertCircle size={40} className="text-gray-600 mb-3" />
          <h4 className="text-lg font-bold text-white font-sans">No Evaluations Found</h4>
          <p className="text-xs text-gray-500 mt-2 font-sans">
            Try adjusting your search criteria or clear filters to view historical logs.
          </p>
        </div>
      ) : (
        /* History list */
        <div className="space-y-4">
          {evaluations.map((item) => {
            const isRowExpanded = !!expandedRows[item._id];
            
            return (
              <div 
                key={item._id} 
                className="glass-panel rounded-2xl border border-darkBorder hover:border-white/10 transition-all overflow-hidden"
              >
                {/* Header row click to expand */}
                <div 
                  onClick={() => toggleRow(item._id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer bg-darkBg/20 select-none"
                >
                  <div className="flex-1 min-w-0 pr-4 space-y-1">
                    <p className="font-extrabold text-sm text-white truncate font-sans">"{item.prompt}"</p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 font-sans">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(item.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>•</span>
                      <span>T: {item.parameters?.temperature}</span>
                      <span>•</span>
                      <span>Max T: {item.parameters?.maxTokens}</span>
                      <span>•</span>
                      <span className="flex gap-1.5 mt-0.5">
                        {item.results.map(r => (
                          <span key={r.modelId} className="px-1.5 py-0.2 bg-white/5 border border-white/10 rounded-md text-[8px] font-semibold text-gray-400">
                            {r.modelId.split('-')[0]}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 ml-auto md:ml-0">
                    <button
                      onClick={(e) => handleRerun(item, e)}
                      className="p-2 border border-brandIndigo/20 hover:border-brandIndigo/40 text-brandIndigo hover:text-white bg-brandIndigo/5 hover:bg-brandIndigo/10 rounded-xl transition-all"
                      title="Load configuration in playground"
                    >
                      <RefreshCw size={14} />
                    </button>
                    
                    <button
                      onClick={(e) => handleDelete(item._id, e)}
                      className="p-2 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-all"
                      title="Delete log entry"
                    >
                      <Trash2 size={14} />
                    </button>
                    
                    <div className="text-gray-500 pl-2">
                      {isRowExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Side-by-side details block */}
                {isRowExpanded && (
                  <div className="p-5 border-t border-darkBorder bg-darkBg/10 animate-slide-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {item.results.map((result) => {
                        const critiqueKey = `${item._id}-${result.modelId}`;
                        const isCritiqueExpanded = !!expandedCritiques[critiqueKey];
                        
                        return (
                          <div 
                            key={result.modelId}
                            className="bg-darkBg/40 border border-darkBorder rounded-xl flex flex-col transition-all hover:border-white/5"
                          >
                            {/* Model Header */}
                            <div className="p-4 border-b border-darkBorder flex items-center justify-between bg-darkBg/60">
                              <span className="font-extrabold text-xs text-white font-sans">{result.modelId}</span>
                              {result.response && (
                                <div className={`px-2 py-0.5 rounded-md border text-[10px] font-bold font-sans ${getScoreColorClass(result.scores?.overall)}`}>
                                  {result.scores?.overall ? result.scores.overall.toFixed(1) : 'N/A'}
                                </div>
                              )}
                            </div>

                            {/* Response content */}
                            <div className="p-4 flex-1">
                              {result.error ? (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-sans">
                                  {result.error}
                                </div>
                              ) : (
                                <div className="text-[11px] text-gray-300 leading-relaxed font-sans h-44 overflow-y-auto pr-1 select-text">
                                  {result.response}
                                </div>
                              )}
                            </div>

                            {/* Metrics footer */}
                            {!result.error && (
                              <div className="px-4 py-2 border-t border-darkBorder/30 grid grid-cols-3 gap-1 text-[9px] text-gray-500 font-sans font-semibold">
                                <span className="flex items-center gap-1"><Clock size={10} className="text-brandCyan" /> {(result.latency / 1000).toFixed(2)}s</span>
                                <span className="flex items-center gap-1"><BookOpen size={10} className="text-brandIndigo" /> {result.promptTokens}p / {result.completionTokens}c</span>
                                <span className="flex items-center gap-1"><Coins size={10} className="text-purple-400" /> ${result.cost?.toFixed(5)}</span>
                              </div>
                            )}

                            {/* Scores & Critique block */}
                            {!result.error && (
                              <div className="p-4 border-t border-darkBorder/30 bg-darkBg/60 rounded-b-xl space-y-2">
                                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                                  <div className="bg-darkBg/50 border border-darkBorder/80 p-1.5 rounded-lg">
                                    <span className="text-[8px] font-bold text-gray-500 block font-sans uppercase">Relevance</span>
                                    <span className="font-extrabold text-white font-sans">{result.scores?.relevance}</span>
                                  </div>
                                  <div className="bg-darkBg/50 border border-darkBorder/80 p-1.5 rounded-lg">
                                    <span className="text-[8px] font-bold text-gray-500 block font-sans uppercase">Coherence</span>
                                    <span className="font-extrabold text-white font-sans">{result.scores?.coherence}</span>
                                  </div>
                                  <div className="bg-darkBg/50 border border-darkBorder/80 p-1.5 rounded-lg">
                                    <span className="text-[8px] font-bold text-gray-500 block font-sans uppercase">Quality</span>
                                    <span className="font-extrabold text-white font-sans">{result.scores?.quality}</span>
                                  </div>
                                </div>

                                <div className="border border-darkBorder/80 rounded-lg bg-darkBg overflow-hidden">
                                  <button
                                    onClick={() => toggleCritique(item._id, result.modelId)}
                                    className="w-full flex items-center justify-between p-2 text-left hover:bg-white/5 transition-all text-[9px] font-bold text-gray-400 font-sans uppercase"
                                  >
                                    <span className="flex items-center gap-1.5"><FileCheck size={11} className="text-brandCyan" /> Judge Feedback</span>
                                    {isCritiqueExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                  </button>
                                  {isCritiqueExpanded && (
                                    <div className="p-3 border-t border-darkBorder/50 text-[10px] text-gray-400 leading-relaxed font-sans select-text">
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
