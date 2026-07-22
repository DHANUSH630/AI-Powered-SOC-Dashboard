import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiShieldCheck, HiLockClosed, HiMail } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('admin@sentinelai.io');
  const [password, setPassword] = useState('••••••••••••');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] cyber-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl glass glow-primary space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-xl shadow-indigo-500/30">
            <HiShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wider">
            Sentinel<span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400">
            Enter your credentials to access the SOC Command Platform.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <HiMail className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <HiLockClosed className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-[11px] text-slate-500">
            Protected by SentinelAI Threat Prevention Engine
          </span>
        </div>
      </div>
    </div>
  );
}
