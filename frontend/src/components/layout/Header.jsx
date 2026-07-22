import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HiSearch, HiBell, HiUser, HiLogout } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS } from '../../utils/constants';

export default function Header() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const currentNav = NAV_ITEMS.find((item) => item.path === location.pathname);
  const title = currentNav ? currentNav.label : 'SOC Dashboard';

  return (
    <header className="h-16 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white tracking-wide">{title}</h1>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950/80 text-indigo-400 border border-indigo-500/30">
          PROD-CLUSTER-01
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <HiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search threats, IPs, hashes..."
            className="w-64 bg-slate-900/80 text-slate-200 text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800/60 transition-colors"
          title="Notifications"
        >
          <HiBell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-slate-900"></span>
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
              {user?.name ? user.name[0] : 'A'}
            </div>
            <div className="hidden sm:flex flex-col text-left pr-2">
              <span className="text-xs font-semibold text-slate-200">{user?.name || 'Analyst'}</span>
              <span className="text-[10px] text-slate-400">{user?.role || 'ADMIN'}</span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="text-xs font-medium text-white">{user?.name || 'SecOps Admin'}</p>
                <p className="text-[10px] text-slate-400">{user?.email || 'admin@sentinelai.io'}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-slate-800/60 transition-colors"
              >
                <HiLogout className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
