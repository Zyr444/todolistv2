import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  BookOpen, 
  Calendar, 
  Flame 
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function DashboardAnalytics({ tasks = [] }) {
  const currentMonthDate = new Date();
  const currentYear = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth();

  // Filter tasks belonging to current month
  const monthlyTasks = tasks.filter(t => {
    const d = t.completed_date ? new Date(t.completed_date) : new Date(t.created_at);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const totalMonthly = monthlyTasks.length;
  const completedMonthly = monthlyTasks.filter(t => t.status === 'completed').length;
  const pendingOrSkipped = totalMonthly - completedMonthly;
  const completionRate = totalMonthly > 0 ? Math.round((completedMonthly / totalMonthly) * 100) : 0;

  // Category counts
  const olahragaTasks = monthlyTasks.filter(t => (t.category || '').toLowerCase().includes('olahraga'));
  const olahragaCompleted = olahragaTasks.filter(t => t.status === 'completed').length;

  const belajarTasks = monthlyTasks.filter(t => (t.category || '').toLowerCase().includes('belajar'));
  const belajarCompleted = belajarTasks.filter(t => t.status === 'completed').length;

  const otherTasks = monthlyTasks.filter(t => {
    const c = (t.category || '').toLowerCase();
    return !c.includes('olahraga') && !c.includes('belajar');
  });
  const otherCompleted = otherTasks.filter(t => t.status === 'completed').length;

  // Chart 1: Completed vs Skipped/Pending (Doughnut)
  const completionDoughnutData = {
    labels: ['Tugas Selesai', 'Pending / Dilewati'],
    datasets: [
      {
        data: [completedMonthly, pendingOrSkipped || (totalMonthly === 0 ? 1 : 0)],
        backgroundColor: [
          '#10b981', // emerald-500
          '#3f3f46'  // neutral-700
        ],
        borderColor: [
          '#059669',
          '#27272a'
        ],
        borderWidth: 1.5,
        hoverOffset: 6
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#a3a3a3',
          font: { family: 'Inter', size: 12 },
          boxWidth: 12,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: '#1f1f23',
        titleColor: '#fff',
        bodyColor: '#e4e4e7',
        borderColor: '#3f3f46',
        borderWidth: 1,
        padding: 10
      }
    }
  };

  // Chart 2: Category Breakdown: Olahraga vs Belajar vs Others (Bar Chart)
  const categoryBarData = {
    labels: ['Olahraga', 'Belajar', 'Lainnya'],
    datasets: [
      {
        label: 'Selesai',
        data: [olahragaCompleted, belajarCompleted, otherCompleted],
        backgroundColor: '#6366f1', // indigo-500
        borderRadius: 8
      },
      {
        label: 'Total Terjadwal',
        data: [olahragaTasks.length, belajarTasks.length, otherTasks.length],
        backgroundColor: '#27272a', // neutral-800
        borderRadius: 8
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#a3a3a3',
          font: { family: 'Inter', size: 12 },
          boxWidth: 12
        }
      },
      tooltip: {
        backgroundColor: '#1f1f23',
        titleColor: '#fff',
        bodyColor: '#e4e4e7',
        borderColor: '#3f3f46',
        borderWidth: 1,
        padding: 10
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#a3a3a3', font: { family: 'Inter', size: 12 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#737373', stepSize: 1, font: { family: 'Inter' } }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tasks */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Total Bulan Ini</span>
            <div className="p-2 rounded-xl bg-neutral-800 text-neutral-300">
              <Calendar size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{totalMonthly}</p>
          <span className="text-[11px] text-neutral-500">Tugas aktif & jadwal</span>
        </div>

        {/* Completion Rate */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Tingkat Penyelesaian</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400">{completionRate}%</p>
          <span className="text-[11px] text-emerald-500/80">{completedMonthly} dari {totalMonthly} tercapai</span>
        </div>

        {/* Olahraga Sessions */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Olahraga Sukses</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <Activity size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-orange-400">{olahragaCompleted}</p>
          <span className="text-[11px] text-neutral-500">{olahragaTasks.length} total sesi</span>
        </div>

        {/* Belajar Sessions */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Belajar Sukses</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <BookOpen size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-400">{belajarCompleted}</p>
          <span className="text-[11px] text-neutral-500">{belajarTasks.length} total sesi</span>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doughnut Chart: Completed vs Skipped */}
        <div className="glass-panel p-5 rounded-2xl shadow-xl flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              Rasio Selesai vs Dilewati (Bulan Berjalan)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Evaluasi konsistensi eksekusi terhadap target Anda.
            </p>
          </div>

          <div className="relative h-64 flex items-center justify-center">
            <Doughnut data={completionDoughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
              <span className="text-3xl font-black text-white">{completionRate}%</span>
              <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">Sukses</span>
            </div>
          </div>
        </div>

        {/* Bar Chart: Olahraga vs Belajar Breakdown */}
        <div className="glass-panel p-5 rounded-2xl shadow-xl flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame size={16} className="text-indigo-400" />
              Perbandingan Kategori: Olahraga vs Belajar
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Keseimbangan antara aktivitas fisik dan pengembangan intelektual.
            </p>
          </div>

          <div className="h-64">
            <Bar data={categoryBarData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
