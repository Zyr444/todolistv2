import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Radio 
} from 'lucide-react';
import { sendDiscordAccountabilityAlert } from '../services/scheduleService';

const DAYS = [
  { id: 0, label: 'Min' },
  { id: 1, label: 'Sen' },
  { id: 2, label: 'Sel' },
  { id: 3, label: 'Rab' },
  { id: 4, label: 'Kam' },
  { id: 5, label: 'Jum' },
  { id: 6, label: 'Sab' },
];

export default function ScheduleModal({
  isOpen,
  onClose,
  schedules = [],
  onAddSchedule,
  onDeleteSchedule,
  user
}) {
  const [taskTitle, setTaskTitle] = useState('');
  const [category, setCategory] = useState('Olahraga');
  const [selectedDays, setSelectedDays] = useState([1, 3, 5]); // Mon, Wed, Fri by default
  const [testStatus, setTestStatus] = useState('');

  if (!isOpen) return null;

  const toggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(d => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId].sort());
    }
  };

  const handleCreateSchedule = (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || selectedDays.length === 0) return;

    onAddSchedule({
      task_title: taskTitle.trim(),
      category,
      days_of_week: selectedDays
    });

    setTaskTitle('');
    setSelectedDays([1, 3, 5]);
  };

  const handleSendTestWebhook = async () => {
    setTestStatus('Mengirim notifikasi tes...');
    try {
      await sendDiscordAccountabilityAlert({
        userEmail: user?.email || 'test-user@flowdo.app',
        taskTitle: 'TES DISCORD WEBHOOK: Jogging 5km (Uji Coba Sistem)',
        category: 'Olahraga',
        missedDate: 'Kemarin'
      });
      setTestStatus('Tes Discord webhook berhasil dikirim! Silakan periksa channel Discord.');
      setTimeout(() => setTestStatus(''), 5000);
    } catch (err) {
      setTestStatus('Gagal mengirim webhook.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl relative border border-neutral-700/70 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Jadwal Otomatis (Schedules)</h3>
              <p className="text-xs text-neutral-400">Injeksi tugas otomatis & pemantauan Discord webhook</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Discord Webhook Test Button */}
        <div className="my-4 p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <Radio size={14} className="text-indigo-400 animate-pulse" />
              Discord Accountability Webhook
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Tugas yang terlewat kemarin otomatis dilaporkan ke webhook Discord.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSendTestWebhook}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <Send size={13} />
            <span>Kirim Tes Alert</span>
          </button>
        </div>

        {testStatus && (
          <div className="mb-4 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{testStatus}</span>
          </div>
        )}

        {/* Form Add Schedule */}
        <form onSubmit={handleCreateSchedule} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Nama Jadwal Rutin
            </label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="cth: 'Jogging Pagi 30 Menit' atau 'Belajar Algoritma'"
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-800/90 border border-neutral-700 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-800/90 border border-neutral-700 text-sm text-neutral-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Olahraga">Olahraga (Jogging, Gym, Renang)</option>
              <option value="Belajar">Belajar (Coding, Buku, Kursus)</option>
              <option value="Pekerjaan">Pekerjaan</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-2">
              Hari Pelaksanaan (Pilih minimal 1 hari)
            </label>
            <div className="flex gap-1.5">
              {DAYS.map(day => {
                const isSelected = selectedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-neutral-800/80 text-neutral-400 hover:text-white border border-neutral-700/60'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={!taskTitle.trim() || selectedDays.length === 0}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            <Plus size={16} />
            <span>Simpan Jadwal Rutin</span>
          </button>
        </form>

        {/* Existing Schedules List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
            Jadwal Aktif Anda ({schedules.length})
          </h4>

          {schedules.length === 0 ? (
            <p className="text-xs text-neutral-500 italic py-4 text-center border border-dashed border-neutral-800 rounded-xl">
              Belum ada jadwal rutin. Buat jadwal di atas untuk auto-injection harian!
            </p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {schedules.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/60 text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-semibold text-neutral-100 truncate">{item.task_title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                      <span className="text-indigo-400 font-medium">{item.category}</span>
                      <span>•</span>
                      <span>
                        {(item.days_of_week || []).map(d => DAYS.find(x => x.id === d)?.label).join(', ')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteSchedule(item.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Hapus jadwal"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
