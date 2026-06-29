import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Playground from './pages/Playground.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import History from './pages/History.jsx';
import TestCases from './pages/TestCases.jsx';
import Settings from './pages/Settings.jsx';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [playgroundData, setPlaygroundData] = useState(null);

  const handleLoadToPlayground = (data) => {
    setPlaygroundData(data);
    setCurrentPage('playground');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brandIndigo/30 border-t-brandIndigo rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is not authenticated, show login/register screen
  if (!user) {
    return <Auth />;
  }

  // Main Authenticated Shell Layout
  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex">
      {/* Sidebar navigation */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content Pane */}
      <main className="flex-1 min-h-screen pl-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-8 py-8">
          
          {currentPage === 'dashboard' && (
            <Dashboard setCurrentPage={setCurrentPage} />
          )}
          
          {currentPage === 'playground' && (
            <Playground 
              initialData={playgroundData} 
              onClearInitialData={() => setPlaygroundData(null)} 
            />
          )}
          
          {currentPage === 'leaderboard' && (
            <Leaderboard />
          )}
          
          {currentPage === 'history' && (
            <History setPlaygroundData={handleLoadToPlayground} />
          )}
          
          {currentPage === 'testcases' && (
            <TestCases setPlaygroundData={handleLoadToPlayground} />
          )}
          
          {currentPage === 'settings' && (
            <Settings />
          )}
          
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
