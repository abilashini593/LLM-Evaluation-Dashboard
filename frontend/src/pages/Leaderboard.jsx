import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api.js';
import { 
  Trophy, 
  Cpu, 
  Clock, 
  Coins, 
  AlertTriangle,
  Award,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  Legend,
  Tooltip
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await analyticsAPI.getLeaderboard();
        if (response.success) {
          setData(response.data);
        }
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="w-10 h-10 border-4 border-brandIndigo/30 border-t-brandIndigo rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center px-4 animate-slide-in">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2 font-sans">Error</h3>
        <p className="text-gray-400 max-w-md mb-6 text-sm font-sans">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] text-center px-4 animate-slide-in">
        <Trophy size={48} className="text-gray-600 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2 font-sans">Leaderboard Unpopulated</h3>
        <p className="text-gray-400 max-w-md text-sm leading-relaxed font-sans">
          Rankings will update as soon as you run evaluations in the Playground. Run some queries first!
        </p>
      </div>
    );
  }

  // Prep radar comparison data for top 3 models
  const topModels = data.slice(0, 3);
  const radarData = [
    { subject: 'Relevance', fullMark: 5 },
    { subject: 'Coherence', fullMark: 5 },
    { subject: 'Quality', fullMark: 5 },
    { subject: 'Overall', fullMark: 5 },
  ];

  // Map scores into subjects
  radarData.forEach(row => {
    topModels.forEach(model => {
      let key = 'avgOverall';
      if (row.subject === 'Relevance') key = 'avgRelevance';
      if (row.subject === 'Coherence') key = 'avgCoherence';
      if (row.subject === 'Quality') key = 'avgQuality';
      row[model.modelId] = model[key] || 0;
    });
  });

  const getRankBadgeClass = (index) => {
    switch (index) {
      case 0: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'; // Gold
      case 1: return 'text-slate-300 bg-slate-300/10 border-slate-300/20'; // Silver
      case 2: return 'text-amber-600 bg-amber-600/10 border-amber-600/20'; // Bronze
      default: return 'text-gray-400 bg-darkBg border-darkBorder';
    }
  };

  const getRankIcon = (index) => {
    if (index < 3) {
      return <Award size={16} />;
    }
    return <span className="text-xs font-semibold">{index + 1}</span>;
  };

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans">Leaderboard</h2>
        <p className="text-sm text-gray-400 mt-1 font-sans">Aggregated model rankings and evaluations</p>
      </div>

      {/* Top Models Radar Chart Compare */}
      {topModels.length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 font-sans flex items-center gap-2">
            <Zap size={18} className="text-brandCyan" />
            Performance Radar (Top Models)
          </h3>
          <div className="h-[350px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#4b5563', fontSize: 9 }} />
                {
                  topModels.map((model, index) => (
                    <Radar
                      key={model.modelId}
                      name={model.modelId}
                      dataKey={model.modelId}
                      stroke={COLORS[index % COLORS.length]}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={0.25}
                    />
                  ))
                }
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Rankings Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-darkBorder">
        <div className="p-6 border-b border-darkBorder flex items-center justify-between bg-darkBg/20">
          <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            <Trophy size={18} className="text-yellow-400" />
            Model Standings
          </h3>
          <span className="text-xs text-gray-500 font-semibold font-sans">Updated in real-time</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-darkBorder text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-darkBg/30">
                <th className="py-4.5 px-6 text-center w-16">Rank</th>
                <th className="py-4.5 px-6">Model ID</th>
                <th className="py-4.5 px-6 text-center">Overall Score</th>
                <th className="py-4.5 px-6 text-center">Relevance</th>
                <th className="py-4.5 px-6 text-center">Coherence</th>
                <th className="py-4.5 px-6 text-center">Quality</th>
                <th className="py-4.5 px-6 text-center">Latency</th>
                <th className="py-4.5 px-6 text-center">Total Cost</th>
                <th className="py-4.5 px-6 text-center">Runs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-darkBorder/40">
              {data.map((row, index) => (
                <tr key={row.modelId} className="hover:bg-white/5 transition-all text-xs text-gray-300">
                  {/* Rank */}
                  <td className="py-4 px-6 text-center">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mx-auto ${getRankBadgeClass(index)}`}>
                      {getRankIcon(index)}
                    </div>
                  </td>
                  {/* Model Name */}
                  <td className="py-4 px-6 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <Cpu size={14} className="text-brandIndigo" />
                      <span>{row.modelId}</span>
                    </div>
                  </td>
                  {/* Overall Score */}
                  <td className="py-4 px-6 text-center">
                    <span className="font-extrabold text-sm text-emerald-400">{row.avgOverall?.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-500"> / 5.0</span>
                  </td>
                  {/* Averages metrics */}
                  <td className="py-4 px-6 text-center font-medium">{row.avgRelevance?.toFixed(2)}</td>
                  <td className="py-4 px-6 text-center font-medium">{row.avgCoherence?.toFixed(2)}</td>
                  <td className="py-4 px-6 text-center font-medium">{row.avgQuality?.toFixed(2)}</td>
                  {/* Latency */}
                  <td className="py-4 px-6 text-center font-medium">
                    <div className="flex items-center justify-center gap-1 text-brandCyan">
                      <Clock size={12} />
                      <span>{row.avgLatency} ms</span>
                    </div>
                  </td>
                  {/* Cost */}
                  <td className="py-4 px-6 text-center font-medium text-purple-400">
                    <div className="flex items-center justify-center gap-1">
                      <Coins size={12} />
                      <span>${row.totalCost?.toFixed(5)}</span>
                    </div>
                  </td>
                  {/* Runs */}
                  <td className="py-4 px-6 text-center font-bold text-gray-400">{row.totalRuns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
