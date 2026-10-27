import React from 'react';
import { 
  Sparkles, 
  BarChart3, 
  Clock, 
  LogOut, 
  CheckSquare
} from 'lucide-react';

export default function Navbar({
  activeView,
  setActiveView,
  onOpenSchedules,
  user,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-40 w-full" style={{ background: 'rgba(3, 10, 25, 0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(100, 150, 220, 0.1)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Sparkles size={16} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-base text-white tracking-tight">
              Flow<span className="text-indigo-400">Do</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
              v2.0
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-0.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(100,150,220,0.15)' }}>
          <button
            onClick={() => setActiveView('tasks')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-xs font-semibold transition-all duration-200 ${
              activeView === 'tasks'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare size={13} />
            <span>Tugas</span>
          </button>

          <button
            onClick={() => setActiveView('analytics')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-xs font-semibold transition-all duration-200 ${
              activeView === 'analytics'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 size={13} />
            <span>Grafik</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Jadwal Rutin button */}
          <button
            onClick={onOpenSchedules}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(100,150,220,0.18)', color: '#94a3b8' }}
            title="Kelola jadwal rutin otomatis"
            onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.borderColor = 'rgba(100,150,220,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(100,150,220,0.18)'; }}
          >
            <Clock size={13} className="text-indigo-400" />
            <span className="hidden sm:inline">Jadwal Rutin</span>
          </button>

          {user && (
            <div className="flex items-center gap-2 pl-2" style={{ borderLeft: '1px solid rgba(100,150,220,0.15)' }}>
              {/* User email */}
              <span
                className="hidden md:inline text-xs text-slate-400 max-w-[160px] truncate"
                title={user.email}
              >
                {user.email}
              </span>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="p-1.5 rounded-xl transition-all"
                style={{ color: '#64748b' }}
                title="Keluar dari akun"
                onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
