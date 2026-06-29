import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api.js';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Cell,
  Pie
} from 'recharts';
import { 
  Cpu, 
  Activity, 
  DollarSign, 
  Hash, 
  TrendingUp, 
  Terminal, 
  AlertCircle 
} from 'lucide-react';

const COLORS = ['#6366f1', '#06b6d4', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard = ({ setCurrentPage }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const lbRes = await analyticsAPI.getLeaderboard();
        const chartsRes = await analyticsAPI.getCharts();
        
        if (lbRes.success) setLeaderboard(lbRes.data);
        if (chartsRes.success) setChartsData(chartsRes.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to fetch dashboard statistics. Make sure the server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
        <AlertCircle size={48} className="text-red-500 mb-4 shadow-glow-emerald" />
        <h3 className="text-xl font-bold text-white mb-2 font-sans">Connection Error</h3>
        <p className="text-gray-400 max-w-md mb-6 text-sm leading-relaxed font-sans">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-brandIndigo hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-300 font-sans shadow-glow-indigo"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Handle empty state
  if (leaderboard.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] text-center px-4 animate-slide-in">
        <div className="bg-brandIndigo/10 p-5 rounded-3xl border border-brandIndigo/20 text-brandIndigo mb-6 shadow-glow-indigo">
          <Cpu size={48} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3 font-sans">No Evaluation Data Yet</h3>
        <p className="text-gray-400 max-w-md mb-8 text-sm leading-relaxed font-sans">
          You haven't run any prompts through the evaluation platform. Let's compare some models to populate this dashboard!
        </p>
        <button
          onClick={() => setCurrentPage('playground')}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brandIndigo to-brandPurple text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-glow-indigo hover:scale-105 font-sans"
        >
          <Terminal size={16} />
          Go to Playground
        </button>
      </div>
    );
  }

  // Compute stats
  const totalEvaluations = leaderboard.reduce((sum, item) => sum + item.totalRuns, 0);
  const totalModels = leaderboard.length;
  const avgOverallScore = (leaderboard.reduce((sum, item) => sum + item.avgOverall, 0) / totalModels).toFixed(2);
  const totalCost = leaderboard.reduce((sum, item) => sum + item.totalCost, 0).toFixed(5);

  const formatCostTooltip = (value) => `$${Number(value).toFixed(6)}`;
  const formatLatencyTooltip = (value) => `${value} ms`;

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans">Dashboard</h2>
        <p className="text-sm text-gray-400 mt-1 font-sans">High-level insights into your evaluated language models</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-sans">Total Evaluated Queries</p>
            <p className="text-3xl font-extrabold text-white mt-2 font-sans">{totalEvaluations}</p>
          </div>
          <div className="bg-brandIndigo/10 p-3.5 rounded-xl border border-brandIndigo/20 text-brandIndigo shadow-glow-indigo">
            <Hash size={22} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-sans">Active Models Tested</p>
            <p className="text-3xl font-extrabold text-white mt-2 font-sans">{totalModels}</p>
          </div>
          <div className="bg-brandCyan/10 p-3.5 rounded-xl border border-brandCyan/20 text-brandCyan shadow-glow-cyan">
            <Cpu size={22} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-sans">Average Overall Score</p>
            <p className="text-3xl font-extrabold text-white mt-2 font-sans">{avgOverallScore} <span className="text-xs text-gray-500 font-semibold">/ 5.0</span></p>
          </div>
          <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 text-emerald-400 shadow-glow-emerald">
            <Activity size={22} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-sans">Accumulated API Cost</p>
            <p className="text-3xl font-extrabold text-white mt-2 font-sans">${totalCost}</p>
          </div>
          <div className="bg-purple-500/10 p-3.5 rounded-xl border border-purple-500/20 text-purple-400">
            <DollarSign size={22} />
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Breakdown chart */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-white mb-4 font-sans flex items-center gap-2">
            <TrendingUp size={18} className="text-brandIndigo" />
            Average Scores by Model
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={leaderboard}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="modelId" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis domain={[0, 5]} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="avgRelevance" name="Relevance" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgCoherence" name="Coherence" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgQuality" name="Quality" fill="#a855f7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgOverall" name="Overall" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency Comparison chart */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-white mb-4 font-sans flex items-center gap-2">
            <Activity size={18} className="text-brandCyan" />
            Average Response Latency (ms)
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartsData?.latency || []}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip
                  formatter={formatLatencyTooltip}
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                />
                <Bar dataKey="latency" name="Latency (ms)" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                  {
                    (chartsData?.latency || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evaluation Scores Timeline */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-[400px] lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4 font-sans flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            Evaluation Quality Trend (Recent Runs)
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartsData?.timeline || []}
                margin={{ top: 10, right: 20, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis domain={[0, 5]} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {
                  leaderboard.map((item, index) => (
                    <Line
                      key={item.modelId}
                      type="monotone"
                      dataKey={item.modelId}
                      name={item.modelId}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))
                }
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost & Token usage chart */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-white mb-4 font-sans flex items-center gap-2">
            <DollarSign size={18} className="text-purple-400" />
            API Cost Spent per Model
          </h3>
          <div className="flex-1 w-full min-h-0 flex items-center justify-center">
            {chartsData?.usage?.some(u => u.cost > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartsData?.usage || []}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="cost"
                  >
                    {
                      (chartsData?.usage || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))
                    }
                  </Pie>
                  <Tooltip 
                    formatter={formatCostTooltip}
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500 text-xs py-8">
                All evaluations were run in Mock Mode (zero actual API costs generated).
              </div>
            )}
          </div>
        </div>

        {/* Tokens consumed breakdown */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-white mb-4 font-sans flex items-center gap-2">
            <Hash size={18} className="text-brandCyan" />
            Total Tokens Consumed (Prompt vs Completion)
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartsData?.usage || []}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="promptTokens" name="Prompt Tokens" fill="#6366f1" stackId="tokens" radius={[0, 0, 0, 0]} />
                <Bar dataKey="completionTokens" name="Completion Tokens" fill="#a855f7" stackId="tokens" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
