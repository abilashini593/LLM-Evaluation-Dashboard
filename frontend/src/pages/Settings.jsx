import React from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Key, 
  HelpCircle, 
  CheckCircle2, 
  Info,
  DollarSign
} from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-8 animate-slide-in">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans">Settings & System Info</h2>
        <p className="text-sm text-gray-400 mt-1 font-sans">Review system status, configuration settings, and model cost details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Connection status card */}
        <div className="glass-panel rounded-2xl p-6 lg:col-span-1 space-y-6">
          <h3 className="text-base font-bold text-white font-sans flex items-center gap-2 border-b border-darkBorder pb-3">
            <Database size={16} className="text-brandCyan" />
            Environment Status
          </h3>
          
          <div className="space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-semibold">MongoDB Service</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg">
                <CheckCircle2 size={12} />
                Running (Port 27017)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-semibold">Backend Port</span>
              <span className="text-gray-200 font-bold bg-white/5 px-2.5 py-0.5 rounded-lg border border-darkBorder">
                5000
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-semibold">Frontend Server</span>
              <span className="text-gray-200 font-bold bg-white/5 px-2.5 py-0.5 rounded-lg border border-darkBorder">
                Vite + React (Port 5173)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-semibold">Database Name</span>
              <span className="text-gray-200 font-mono bg-white/5 px-2.5 py-0.5 rounded-lg border border-darkBorder">
                llm-eval-db
              </span>
            </div>
          </div>
        </div>

        {/* API key instructions */}
        <div className="glass-panel rounded-2xl p-6 lg:col-span-2 space-y-6">
          <h3 className="text-base font-bold text-white font-sans flex items-center gap-2 border-b border-darkBorder pb-3">
            <Key size={16} className="text-brandIndigo" />
            API Key Configuration & Mock Mode
          </h3>

          <div className="space-y-4 font-sans text-xs text-gray-300 leading-relaxed">
            <p>
              To run evaluation requests against production model servers, define your API keys inside the backend configuration file located at:
            </p>
            <div className="bg-darkBg border border-darkBorder p-3 rounded-xl font-mono text-[10px] text-brandCyan select-text">
              C:\Users\dell\.gemini\antigravity-ide\scratch\llm-eval-dashboard\backend\.env
            </div>

            <div className="p-4 bg-brandIndigo/5 border border-brandIndigo/25 rounded-2xl flex gap-3 text-gray-400">
              <Info size={16} className="text-brandIndigo flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-white block text-xs">Self-Activating Mock Mode</span>
                If any key is missing, the backend will automatically toggle into **Mock Mode** for that specific model. This ensures the playground remains responsive and lets you test charts, history search, leaderboard aggregations, and judge evaluations with zero setup or API fees!
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs">Steps to enable live model inference:</h4>
              <ol className="list-decimal pl-5 space-y-1 text-gray-400">
                <li>Open the backend `.env` file listed above.</li>
                <li>Add your Groq API key: <code className="text-brandCyan font-mono bg-white/5 px-1 rounded">GROQ_API_KEY=gsk_...</code>.</li>
                <li>Restart the backend Node service.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Cost sheet */}
        <div className="glass-panel rounded-2xl p-6 lg:col-span-3 space-y-6">
          <h3 className="text-base font-bold text-white font-sans flex items-center gap-2 border-b border-darkBorder pb-3">
            <DollarSign size={16} className="text-purple-400" />
            Model Pricing Sheet (USD per Million Tokens)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-darkBorder text-[9px] font-bold text-gray-500 uppercase tracking-wider bg-darkBg/20">
                  <th className="py-3 px-4">Model ID</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4 text-right">Prompt Input Rate</th>
                  <th className="py-3 px-4 text-right">Completion Output Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder/30 text-gray-300">
               
                
                <tr className="hover:bg-white/5">
                  <td className="py-3 px-4 font-bold text-white">llama-3.1-8b-instant</td>
                  <td className="py-3 px-4 text-gray-400">Groq</td>
                  <td className="py-3 px-4 text-right font-mono">$0.05 / 1M</td>
                  <td className="py-3 px-4 text-right font-mono">$0.08 / 1M</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="py-3 px-4 font-bold text-white">llama-3.3-70b-versatile</td>
                  <td className="py-3 px-4 text-gray-400">Groq</td>
                  <td className="py-3 px-4 text-right font-mono">$0.59 / 1M</td>
                  <td className="py-3 px-4 text-right font-mono">$0.79 / 1M</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="py-3 px-4 font-bold text-white">qwen/qwen3-32b</td>
                  <td className="py-3 px-4 text-gray-400">Groq</td>
                  <td className="py-3 px-4 text-right font-mono">$0.24 / 1M</td>
                  <td className="py-3 px-4 text-right font-mono">$0.24 / 1M</td>
                </tr>
                <tr className="hover:bg-white/5">
                <td className="py-3 px-4 font-bold text-white">meta-llama/llama-4-scout-17b-16e-instruct</td>
                <td className="py-3 px-4 text-gray-400">Groq</td>
                <td className="py-3 px-4 text-right font-mono">$0.11 / 1M</td>
                <td className="py-3 px-4 text-right font-mono">$0.34 / 1M</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
