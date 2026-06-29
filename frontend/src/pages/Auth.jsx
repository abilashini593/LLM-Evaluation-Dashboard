import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Cpu, Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';

const Auth = () => {
  const { login, register, error, setError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setLocalError('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoadingState(true);

    const { username, email, password } = formData;

    if (!email || !password || (!isLogin && !username)) {
      setLocalError('Please fill in all fields');
      setLoadingState(false);
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
    } catch (err) {
      console.error('Auth error in form submission:', err);
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#070b13] relative overflow-hidden px-4">
      {/* Decorative background glow circles */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brandIndigo/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brandCyan/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md animate-slide-in relative z-10">
        {/* Logo header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-gradient-to-tr from-brandIndigo to-brandCyan p-3.5 rounded-2xl border border-white/10 shadow-glow-indigo text-white mb-4 animate-double-pulse">
            <Cpu size={32} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans bg-gradient-to-r from-white via-indigo-100 to-brandCyan bg-clip-text text-transparent">
            LLM Benchmarking Hub
          </h2>
          <p className="text-sm text-gray-400 mt-2 font-sans font-medium">
            Evaluate, compare, and rank model completions
          </p>
        </div>

        {/* Auth form box */}
        <div className="glass-panel-glow rounded-3xl p-8 shadow-2xl">
          {/* Tabs switch */}
          <div className="flex border-b border-darkBorder mb-8 p-1 bg-darkBg/60 rounded-xl">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
                setLocalError('');
              }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg font-sans transition-all duration-300 ${
                isLogin
                  ? 'bg-brandIndigo text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
                setLocalError('');
              }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg font-sans transition-all duration-300 ${
                !isLogin
                  ? 'bg-brandIndigo text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {(error || localError) && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs font-semibold leading-relaxed font-sans">
                {localError || error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase font-sans">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="ai_engineer"
                    className="w-full pl-10 pr-4 py-3 bg-darkBg/80 border border-darkBorder rounded-xl text-white text-sm focus:border-brandIndigo focus:outline-none focus:ring-1 focus:ring-brandIndigo transition-all font-sans"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase font-sans">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="engineer@domain.com"
                  className="w-full pl-10 pr-4 py-3 bg-darkBg/80 border border-darkBorder rounded-xl text-white text-sm focus:border-brandIndigo focus:outline-none focus:ring-1 focus:ring-brandIndigo transition-all font-sans"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 tracking-wider uppercase font-sans">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-darkBg/80 border border-darkBorder rounded-xl text-white text-sm focus:border-brandIndigo focus:outline-none focus:ring-1 focus:ring-brandIndigo transition-all font-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingState}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-brandIndigo to-brandPurple hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-bold tracking-wide shadow-glow-indigo hover:shadow-purple-500/10 focus:outline-none transition-all duration-300 disabled:opacity-50"
            >
              {loadingState ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles size={16} />
                  {isLogin ? 'Sign In to Hub' : 'Initialize Account'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo instructions */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500 leading-relaxed font-sans">
            Demo access: register with any email to test locally.<br />
            Runs against locally hosted MongoDB on port 27017.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
