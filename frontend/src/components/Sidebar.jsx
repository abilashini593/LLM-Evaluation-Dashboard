import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  LayoutGrid, 
  Terminal, 
  Trophy, 
  History, 
  FolderHeart, 
  Settings, 
  LogOut, 
  Cpu 
} from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutGrid },
    { id: 'playground', name: 'Playground', icon: Terminal },
    { id: 'leaderboard', name: 'Leaderboard', icon: Trophy },
    { id: 'history', name: 'History', icon: History },
    { id: 'testcases', name: 'Test Cases', icon: FolderHeart },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-darkBorder flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Brand logo header */}
      <div className="p-6 border-b border-darkBorder flex items-center gap-3">
        <div className="bg-brandIndigo/20 p-2 rounded-lg border border-brandIndigo/40 text-brandIndigo shadow-glow-indigo">
          <Cpu size={24} />
        </div>
        <div>
          <h1 className="font-bold font-sans tracking-wide text-lg text-white bg-gradient-to-r from-white via-indigo-200 to-brandCyan bg-clip-text text-transparent">
            LLM Eval
          </h1>
          <p className="text-xs text-gray-400 font-medium font-sans">Dashboard v1.0</p>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 font-sans ${
                isActive 
                  ? 'bg-gradient-to-r from-brandIndigo/25 to-brandPurple/15 border border-brandIndigo/30 text-white shadow-glow-indigo' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <IconComponent size={18} className={isActive ? 'text-brandIndigo' : 'text-gray-400'} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="p-4 border-t border-darkBorder bg-darkBg/40">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brandIndigo to-brandCyan flex items-center justify-center font-bold text-white text-sm shadow-glow-indigo">
            {user?.username?.slice(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate font-sans">{user?.username || 'User'}</p>
            <p className="text-xs text-gray-500 truncate font-sans">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 text-xs font-semibold tracking-wide transition-all duration-300 font-sans"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
