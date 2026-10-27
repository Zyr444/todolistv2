import React, { useState } from 'react';
import { 
  Check, 
  Trash2, 
  Pencil, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  GripVertical, 
  ListTodo
} from 'lucide-react';
import TaskCategoryIcon, { getTaskIconInfo } from './TaskCategoryIcon';

export default function TaskCard({
  task,
  index,
  onToggleStatus,
  onDelete,
  onEditTask,
  onUpdateSubtasks,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging
}) {
  const [isEditing,      setIsEditing]      = useState(false);
  const [editTitle,      setEditTitle]      = useState(task.title || '');
  const [editCategory,   setEditCategory]   = useState(task.category || 'General');
  const [editPriority,   setEditPriority]   = useState(task.priority || 'medium');
  const [isExpanded,     setIsExpanded]     = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const isCompleted = task.status === 'completed';
  const subtasks    = Array.isArray(task.subtasks) ? task.subtasks : [];
  const totalSubs   = subtasks.length;
  const doneSubs    = subtasks.filter(s => s.completed).length;
  const subPct      = totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : 0;

  // Card bg based on state
  const cardStyle = {
    background: isCompleted
      ? 'rgba(6, 18, 40, 0.55)'
      : 'rgba(10, 24, 55, 0.7)',
    border: isDragging
      ? '1px solid rgba(99,102,241,0.55)'
      : isCompleted
        ? '1px solid rgba(100,150,220,0.08)'
        : '1px solid rgba(100,150,220,0.15)',
    opacity: isDragging ? 0.45 : isCompleted ? 0.72 : 1,
    transition: 'all 0.18s',
    transform: isDragging ? 'scale(0.98)' : 'scale(1)',
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    if (onEditTask) onEditTask(task.id, { title: editTitle.trim(), category: editCategory, priority: editPriority });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title || '');
    setEditCategory(task.category || 'General');
    setEditPriority(task.priority || 'medium');
    setIsEditing(false);
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSub = { id: `sub-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false };
    if (onUpdateSubtasks) onUpdateSubtasks(task.id, [...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id) => {
    const updated = subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
    if (onUpdateSubtasks) onUpdateSubtasks(task.id, updated);
  };

  const handleDeleteSubtask = (id) => {
    if (onUpdateSubtasks) onUpdateSubtasks(task.id, subtasks.filter(s => s.id !== id));
  };

  const inputBase = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(99,102,241,0.5)',
    color: '#e2e8f0',
  };

  const selectBase = {
    background: 'rgba(10,18,40,0.9)',
    border: '1px solid rgba(100,150,220,0.2)',
    color: '#cbd5e1',
  };

  return (
    <div
      draggable={!isEditing}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className="rounded-2xl group"
      style={cardStyle}
    >
      {/* Main Row */}
      <div className="flex items-center justify-between p-3 sm:p-3.5">
        {isEditing ? (
          /* ── Edit Mode ── */
          <form onSubmit={handleSaveEdit} className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl text-sm focus:outline-none"
              style={inputBase}
              autoFocus
            />
            <div className="flex items-center gap-1.5">
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl text-xs focus:outline-none"
                style={selectBase}
              >
                <option value="Olahraga">Olahraga</option>
                <option value="Belajar">Belajar</option>
                <option value="Pekerjaan">Pekerjaan</option>
                <option value="General">General</option>
              </select>

              <button type="submit"
                className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                title="Simpan">
                <Check size={16} />
              </button>
              <button type="button" onClick={handleCancelEdit}
                className="p-1.5 text-slate-400 hover:bg-white/5 rounded-lg transition-colors"
                title="Batal">
                <X size={16} />
              </button>
            </div>
          </form>
        ) : (
          /* ── Display Mode ── */
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Drag Grip */}
            <div className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing transition-colors shrink-0">
              <GripVertical size={15} />
            </div>

            {/* Checkbox */}
            <button
              type="button"
              onClick={() => onToggleStatus(task)}
              className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                isCompleted
                  ? 'bg-indigo-500 border-indigo-500 text-white'
                  : 'border-slate-600 hover:border-indigo-400 text-transparent'
              }`}
              style={!isCompleted ? { background: 'rgba(255,255,255,0.03)' } : {}}
              title={isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
            >
              <Check size={12} className={isCompleted ? 'stroke-[3]' : ''} />
            </button>

            {/* Category Icon */}
            <div className="shrink-0">
              <TaskCategoryIcon category={task.category} title={task.title} size={15} />
            </div>

            {/* Task Details */}
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium truncate transition-all ${
                isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
              }`}>
                {task.title}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                {/* Category badge */}
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}
                >
                  {task.category || 'General'}
                </span>

                {/* Subtask count */}
                {totalSubs > 0 && (
                  <span
                    className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <ListTodo size={10} className="text-indigo-400" />
                    <span>{doneSubs}/{totalSubs}</span>
                  </span>
                )}

                {/* Completed date */}
                {isCompleted && task.completed_date && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Check size={10} />
                    {task.completed_date}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isEditing && (
          <div className="flex items-center gap-0.5 shrink-0 ml-2">
            {/* Subtask expand */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1.5 rounded-lg transition-colors ${
                isExpanded || totalSubs > 0
                  ? 'text-indigo-400'
                  : 'text-slate-600 opacity-0 group-hover:opacity-100 hover:text-slate-300'
              }`}
              style={isExpanded || totalSubs > 0
                ? { background: 'rgba(99,102,241,0.12)' }
                : {}}
              title={isExpanded ? 'Tutup sub-tugas' : 'Lihat sub-tugas'}
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Edit */}
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg transition-colors text-slate-600 opacity-0 group-hover:opacity-100 hover:text-indigo-300"
              style={{}}
              title="Edit tugas"
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Pencil size={13} />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-lg transition-colors text-slate-600 opacity-0 group-hover:opacity-100 hover:text-red-400"
              title="Hapus tugas"
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Subtasks Expansion Panel ── */}
      {isExpanded && (
        <div
          className="px-4 pb-4 pt-2 rounded-b-2xl space-y-2.5 animate-fade-in"
          style={{ borderTop: '1px solid rgba(100,150,220,0.1)', background: 'rgba(5,14,35,0.5)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ListTodo size={13} className="text-indigo-400" />
              Sub-Tugas ({doneSubs}/{totalSubs})
            </span>
            {totalSubs > 0 && (
              <span className="font-mono text-indigo-400 font-medium">{subPct}%</span>
            )}
          </div>

          {/* Progress */}
          {totalSubs > 0 && (
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${subPct}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
              />
            </div>
          )}

          {/* Subtask list */}
          <div className="space-y-1 max-h-44 overflow-y-auto pr-0.5">
            {subtasks.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between py-1.5 px-2.5 rounded-xl group/sub transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(100,150,220,0.08)' }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(sub.id)}
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all shrink-0 ${
                      sub.completed
                        ? 'bg-indigo-500 border-indigo-500 text-white'
                        : 'border-slate-600 hover:border-indigo-400 text-transparent'
                    }`}
                  >
                    <Check size={9} className={sub.completed ? 'stroke-[3]' : ''} />
                  </button>
                  <span className={`text-xs truncate ${sub.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                    {sub.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSubtask(sub.id)}
                  className="p-0.5 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover/sub:opacity-100 ml-1"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Add subtask form */}
          <form onSubmit={handleAddSubtask} className="flex gap-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="+ Tambah sub-tugas..."
              className="flex-1 px-3 py-1.5 rounded-xl text-xs focus:outline-none placeholder-slate-600"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(100,150,220,0.15)', color: '#e2e8f0' }}
            />
            <button
              type="submit"
              disabled={!newSubtaskTitle.trim()}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
              style={{ background: '#4f46e5', color: 'white' }}
            >
              Tambah
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
