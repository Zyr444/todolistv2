import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Check, 
  Activity, 
  Dumbbell, 
  BookOpen, 
  Calendar as CalendarIcon,
  X,
  Sparkles,
  ListCheck
} from 'lucide-react';
import TaskCategoryIcon from './TaskCategoryIcon';

const DAYS_HEADER = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

const MONTH_NAMES = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];

export default function CalendarStreak({ tasks = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(null);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDay = today.getDate();

  const firstDayIndex   = new Date(year, month, 1).getDay();
  const totalDays       = new Date(year, month + 1, 0).getDate();

  // Map completed tasks by date
  const completedMap = {};
  tasks.forEach(t => {
    if (t.status === 'completed' && t.completed_date) {
      if (!completedMap[t.completed_date]) completedMap[t.completed_date] = [];
      completedMap[t.completed_date].push(t);
    }
  });

  // Calculate streak
  let currentStreak = 0;
  let checkDate = new Date(today);
  while (true) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;

    if (completedMap[key] && completedMap[key].length > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      if (currentStreak === 0 && checkDate.getDate() === today.getDate()) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        if (completedMap[yKey] && completedMap[yKey].length > 0) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }

  // Build calendar grid
  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) daysArray.push(null);
  for (let day = 1; day <= totalDays; day++) daysArray.push(day);

  // Icon for completed date
  const renderIcon = (list) => {
    if (!list || list.length === 0) return null;
    const txt = list.map(t => `${t.title} ${t.category}`).join(' ').toLowerCase();
    if (txt.includes('jogging') || txt.includes('lari'))
      return <Activity size={15} className="text-amber-400" />;
    if (txt.includes('gym') || txt.includes('workout') || txt.includes('olahraga'))
      return <Dumbbell size={15} className="text-indigo-300" />;
    if (txt.includes('belajar') || txt.includes('study'))
      return <BookOpen size={15} className="text-blue-300" />;
    return <Check size={15} className="text-indigo-400 stroke-[3]" />;
  };

  const handleDayClick = (day, dateKey, list) => {
    setSelectedHistoryDate({
      day,
      monthName: MONTH_NAMES[month],
      year,
      dateKey,
      tasks: list || []
    });
  };

  const panelStyle = {
    background: 'rgba(6, 16, 40, 0.80)',
    backdropFilter: 'blur(18px)',
    border: '1px solid rgba(100, 150, 220, 0.15)',
    borderRadius: '1.25rem',
    boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
  };

  return (
    <div style={panelStyle} className="p-5 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="p-2 rounded-xl text-indigo-400"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <CalendarIcon size={17} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {MONTH_NAMES[month]} {year}
            </h3>
            <p className="text-[10px] text-slate-500">Streak Kalender 7-Hari</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.25)',
              color: '#818cf8',
            }}
          >
            <Flame size={12} className={currentStreak > 0 ? 'text-orange-400 animate-pulse' : 'text-slate-500'} />
            <span>{currentStreak} Hari Beruntun</span>
          </div>

          {/* Month navigation */}
          <div
            className="flex items-center rounded-xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(100,150,220,0.15)' }}
          >
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DAYS_HEADER.map((d, i) => (
          <div
            key={d}
            className="text-[10px] font-semibold py-1 uppercase tracking-wider"
            style={{ color: i === 0 ? 'rgba(248,113,113,0.7)' : 'rgba(100,116,139,0.8)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysArray.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`e-${idx}`}
                className="h-9 sm:h-10 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.01)' }}
              />
            );
          }

          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const completedList = completedMap[dateKey] || [];
          const hasCompleted  = completedList.length > 0;
          const isToday       = isCurrentMonth && day === todayDay;

          return (
            <button
              key={`d-${day}`}
              type="button"
              onClick={() => handleDayClick(day, dateKey, completedList)}
              className="relative h-9 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-150 select-none group hover:scale-105 active:scale-95"
              style={{
                background: hasCompleted
                  ? 'rgba(55, 70, 120, 0.45)'
                  : isToday
                    ? 'rgba(99,102,241,0.08)'
                    : 'rgba(255,255,255,0.03)',
                border: isToday
                  ? '1.5px solid rgba(99,102,241,0.7)'
                  : hasCompleted
                    ? '1px solid rgba(99,102,241,0.3)'
                    : '1px solid rgba(100,150,220,0.08)',
                boxShadow: isToday ? '0 0 12px -3px rgba(99,102,241,0.35)' : 'none',
              }}
              title={`${day} ${MONTH_NAMES[month]}`}
            >
              {hasCompleted ? (
                <div className="flex items-center justify-center">
                  {renderIcon(completedList)}
                </div>
              ) : (
                <span
                  className="text-xs font-medium"
                  style={{ color: isToday ? '#a5b4fc' : 'rgba(148,163,184,0.7)' }}
                >
                  {day}
                </span>
              )}

              {isToday && (
                <span
                  className="absolute bottom-1 w-1 h-1 rounded-full"
                  style={{ background: '#818cf8' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div
        className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-slate-500"
        style={{ borderTop: '1px solid rgba(100,150,220,0.1)' }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm inline-block" style={{ border: '1px solid rgba(99,102,241,0.6)' }} />
            Hari Ini
          </span>
          <span className="flex items-center gap-1">
            <Check size={11} className="text-indigo-400" />
            Target Selesai
          </span>
          <span className="flex items-center gap-1">
            <Activity size={11} className="text-amber-400" />
            Olahraga
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={11} className="text-blue-400" />
            Belajar
          </span>
        </div>
        <span className="text-slate-600 text-[9px]">
          Klik tanggal untuk cek detail
        </span>
      </div>

      {/* History Modal */}
      {selectedHistoryDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div
            className="w-full max-w-sm rounded-2xl p-5 shadow-2xl animate-scale-in max-h-[80vh] overflow-y-auto"
            style={{ background: 'rgba(6,16,45,0.96)', border: '1px solid rgba(100,150,220,0.2)' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(100,150,220,0.1)' }}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl text-indigo-400" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <ListCheck size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {selectedHistoryDate.day} {selectedHistoryDate.monthName} {selectedHistoryDate.year}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {selectedHistoryDate.tasks.length} tugas diselesaikan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedHistoryDate(null)}
                className="p-1.5 rounded-lg transition-colors text-slate-500 hover:text-white"
                style={{ hover: { background: 'rgba(255,255,255,0.05)' } }}
              >
                <X size={15} />
              </button>
            </div>

            <div className="my-4 space-y-2">
              {selectedHistoryDate.tasks.length === 0 ? (
                <div className="py-8 text-center">
                  <Sparkles size={22} className="mx-auto text-slate-700 mb-2" />
                  <p className="text-sm text-slate-400 font-medium">Tidak ada tugas selesai</p>
                  <p className="text-[11px] text-slate-600 mt-1">pada tanggal ini.</p>
                </div>
              ) : (
                selectedHistoryDate.tasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(100,150,220,0.1)' }}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-indigo-400"
                      style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}
                    >
                      <Check size={11} className="stroke-[3]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-200 truncate">{t.title}</p>
                      <span className="text-[10px] text-slate-500">{t.category || 'General'}</span>
                    </div>
                    <TaskCategoryIcon category={t.category} title={t.title} size={14} />
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2" style={{ borderTop: '1px solid rgba(100,150,220,0.08)' }}>
              <button
                onClick={() => setSelectedHistoryDate(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(100,150,220,0.12)' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
