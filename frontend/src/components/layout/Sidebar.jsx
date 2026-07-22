import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HiShieldCheck, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { NAV_ITEMS } from '../../utils/constants';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#0f172a]/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30 flex-shrink-0">
            <HiShieldCheck className="w-6 h-6" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-wider text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Sentinel<span className="text-cyan-400 font-extrabold">AI</span>
              </span>
              <span className="text-[10px] text-indigo-400 tracking-widest uppercase font-semibold">
                SOC Command
              </span>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <HiChevronRight className="w-5 h-5" /> : <HiChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* System Status Footbar */}
      <div className="p-3 border-t border-slate-800/80">
        <div
          className={`flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="relative flex-shrink-0">
            <span className="w-3 h-3 rounded-full bg-emerald-500 block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-400 block absolute top-0 left-0 animate-ping opacity-75"></span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-300">Engine Online</span>
              <span className="text-[10px] text-emerald-400 font-mono">Real-Time Protection</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
