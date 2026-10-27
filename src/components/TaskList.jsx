import React, { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import TaskCard from './TaskCard';

const CATEGORIES = [
  { id: 'Olahraga', label: 'Olahraga' },
  { id: 'Belajar',  label: 'Belajar' },
  { id: 'Pekerjaan', label: 'Pekerjaan' },
  { id: 'General',  label: 'General' },
];

const PRIORITIES = [
  { id: 'high',   label: 'Tinggi',  dot: 'bg-red-400' },
  { id: 'medium', label: 'Sedang',  dot: 'bg-amber-400' },
  { id: 'low',    label: 'Rendah',  dot: 'bg-blue-400' },
];

const FILTER_TABS = [
  { id: 'all',       label: 'Semua' },
  { id: 'pending',   label: 'Tertunda' },
  { id: 'completed', label: 'Selesai' },
  { id: 'olahraga',  label: 'Olahraga' },
  { id: 'belajar',   label: 'Belajar' },
];

export default function TaskList({
  tasks = [],
  onAddTask,
  onToggleStatus,
  onDeleteTask,
  onEditTask,
  onUpdateSubtasks,
  onReorderTasks,
  loading
}) {
  const [newTitle,    setNewTitle]    = useState('');
  const [newCategory, setNewCategory] = useState('Olahraga');
  const [newPriority, setNewPriority] = useState('medium');
  const [activeFilter, setActiveFilter] = useState('all');
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({ title: newTitle.trim(), category: newCategory, priority: newPriority, subtasks: [] });
    setNewTitle('');
  };

  // Drag and Drop
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updatedTasks = [...tasks];
    const [draggedItem] = updatedTasks.splice(draggedIndex, 1);
    updatedTasks.splice(targetIndex, 0, draggedItem);

    setDraggedIndex(null);
    if (onReorderTasks) onReorderTasks(updatedTasks);
  };

  // Filter
  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'pending')   return t.status === 'pending';
    if (activeFilter === 'completed') return t.status === 'completed';
    if (activeFilter === 'olahraga')  return (t.category || '').toLowerCase() === 'olahraga';
    if (activeFilter === 'belajar')   return (t.category || '').toLowerCase() === 'belajar';
    return true;
  });

  const totalCount     = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const percent        = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4">

      {/* ─── Quick Add Bar ─── */}
      <form
        onSubmit={handleCreate}
        className="glass-panel p-3 rounded-2xl shadow-xl"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Tambah target baru... (cth: 'Jogging 5km' atau 'B"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(100,150,220,0.18)',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(100,150,220,0.18)'}
          />

          <div className="flex items-center gap-2">
            {/* Category */}
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-xs text-slate-200 focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(100,150,220,0.18)',
              }}
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#0d1a33' }}>{c.label}</option>
              ))}
            </select>

            {/* Add Button */}
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Plus size={15} />
              <span>Tambah</span>
            </button>
          </div>
        </div>
      </form>

      {/* ─── Progress & Filters ─── */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100 tracking-wide">
                Daftar Tugas &amp; Kebiasaan
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono text-slate-400"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {completedCount}/{totalCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tarik (drag) untuk menyusun prioritas tugas Anda.
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full sm:w-44 flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>Progress Selesai</span>
              <span className="text-indigo-400 font-bold">{percent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percent}%`,
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-3" style={{ borderTop: '1px solid rgba(100,150,220,0.1)' }}>
          {FILTER_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              style={activeFilter !== tab.id ? {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(100,150,220,0.12)',
              } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Task List Items ─── */}
      <div className="space-y-2">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin mx-auto mb-2" />
            Memuat data tugas...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-10 px-4 rounded-2xl text-center"
            style={{ border: '1px dashed rgba(100,150,220,0.2)' }}>
            <Sparkles size={26} className="mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">Tidak ada tugas ditemukan</p>
            <p className="text-xs text-slate-500 mt-1">
              Tambahkan tugas baru di atas atau buat jadwal otomatis!
            </p>
          </div>
        ) : (
          filteredTasks.map((task, idx) => (
            <TaskCard
              key={task.id}
              task={task}
              index={idx}
              onToggleStatus={onToggleStatus}
              onDelete={onDeleteTask}
              onEditTask={onEditTask}
              onUpdateSubtasks={onUpdateSubtasks}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={draggedIndex === idx}
            />
          ))
        )}
      </div>
    </div>
  );
}
