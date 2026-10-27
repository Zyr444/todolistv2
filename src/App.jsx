import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { 
  runScheduleAutoInjectionAndMissedCheck, 
  formatDateKey 
} from './services/scheduleService';
import Navbar from './components/Navbar';
import AuthScreen from './components/AuthScreen';
import TaskList from './components/TaskList';
import CalendarStreak from './components/CalendarStreak';
import DashboardAnalytics from './components/DashboardAnalytics';
import ScheduleModal from './components/ScheduleModal';
import PomodoroWidget from './components/PomodoroWidget';
import Footer from './components/Footer';
import ParticlesBackground from './components/ParticlesBackground';
import { BellRing } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [activeView, setActiveView] = useState('tasks'); // 'tasks' | 'analytics'
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [notificationBanner, setNotificationBanner] = useState(null);

  // 1. Supabase Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const user = session?.user;

  // 2. Fetch Tasks & Schedules
  const fetchTasksAndSchedules = useCallback(async (currentUser) => {
    if (!currentUser || !isSupabaseConfigured) return;
    setTasksLoading(true);

    try {
      const { data: taskData, error: taskErr } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });

      if (taskErr) throw taskErr;
      setTasks(taskData || []);

      const { data: schedData, error: schedErr } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (schedErr) throw schedErr;
      setSchedules(schedData || []);
    } catch (err) {
      console.error('[FlowDo] Error loading data:', err);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  // 3. Client-Side Check on Load & Auto-Injection
  useEffect(() => {
    if (!user) return;

    const executeAutoInjection = async () => {
      const result = await runScheduleAutoInjectionAndMissedCheck(user);
      if (result.injected > 0 || result.missedCount > 0) {
        if (result.injected > 0) {
          setNotificationBanner(`✨ ${result.injected} tugas rutin harian otomatis ditambahkan untuk hari ini.`);
        }
        if (result.missedCount > 0) {
          setNotificationBanner(`🚨 Perhatian: ${result.missedCount} tugas kemarin terlewat.`);
        }
        setTimeout(() => setNotificationBanner(null), 6000);
      }
      fetchTasksAndSchedules(user);
    };

    executeAutoInjection();
  }, [user, fetchTasksAndSchedules]);

  // 4. Task CRUD Handlers
  const handleAddTask = async ({ title, category, priority = 'medium', subtasks = [] }) => {
    if (!user) return;

    const newTask = {
      user_id: user.id,
      title,
      category: category || 'General',
      priority: priority || 'medium',
      subtasks: subtasks || [],
      status: 'pending',
      completed_date: null,
      position: tasks.length,
      created_at: new Date().toISOString()
    };

    const tempId = `temp-${Date.now()}`;
    setTasks(prev => [{ ...newTask, id: tempId }, ...prev]);

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) {
        if (error.message && (error.message.includes('priority') || error.message.includes('subtasks'))) {
          const fallbackTask = {
            user_id: user.id,
            title,
            category: category || 'General',
            status: 'pending',
            completed_date: null,
            position: tasks.length,
            created_at: new Date().toISOString()
          };
          const { data: fbData } = await supabase.from('tasks').insert([fallbackTask]).select().single();
          if (fbData) {
            setTasks(prev => prev.map(t => t.id === tempId ? { ...fbData, priority, subtasks } : t));
            return;
          }
        }
        throw error;
      }
      if (data) {
        setTasks(prev => prev.map(t => t.id === tempId ? data : t));
      }
    } catch (err) {
      console.error('[FlowDo] Error creating task:', err);
      fetchTasksAndSchedules(user);
    }
  };

  const handleEditTask = async (taskId, { title, category, priority }) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, title, category, priority } : t)));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ title, category, priority })
        .eq('id', taskId);

      if (error) {
        if (error.message && error.message.includes('priority')) {
          await supabase.from('tasks').update({ title, category }).eq('id', taskId);
          return;
        }
        throw error;
      }
    } catch (err) {
      console.error('[FlowDo] Error editing task:', err);
      fetchTasksAndSchedules(user);
    }
  };

  const handleUpdateSubtasks = async (taskId, newSubtasks) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, subtasks: newSubtasks } : t)));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ subtasks: newSubtasks })
        .eq('id', taskId);

      if (error) {
        console.warn('[FlowDo] Subtasks column pending in database migration:', error.message);
      }
    } catch (err) {
      console.error('[FlowDo] Error updating subtasks:', err);
    }
  };

  const handleToggleStatus = async (task) => {
    const isNowCompleted = task.status !== 'completed';
    const todayStr = formatDateKey(new Date());

    const updatedTask = {
      ...task,
      status: isNowCompleted ? 'completed' : 'pending',
      completed_date: isNowCompleted ? todayStr : null
    };

    setTasks(prev => prev.map(t => (t.id === task.id ? updatedTask : t)));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: updatedTask.status,
          completed_date: updatedTask.completed_date
        })
        .eq('id', task.id);

      if (error) throw error;
    } catch (err) {
      console.error('[FlowDo] Error toggling status:', err);
      fetchTasksAndSchedules(user);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } catch (err) {
      console.error('[FlowDo] Error deleting task:', err);
      fetchTasksAndSchedules(user);
    }
  };

  const handleReorderTasks = async (newOrderedTasks) => {
    setTasks(newOrderedTasks);

    try {
      for (let i = 0; i < newOrderedTasks.length; i++) {
        const item = newOrderedTasks[i];
        if (!item.id.toString().startsWith('temp-')) {
          await supabase
            .from('tasks')
            .update({ position: i })
            .eq('id', item.id);
        }
      }
    } catch (err) {
      console.warn('[FlowDo] Error syncing order positions:', err);
    }
  };

  // 5. Schedule CRUD Handlers
  const handleAddSchedule = async ({ task_title, category, days_of_week }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('schedules')
        .insert([{ user_id: user.id, task_title, category, days_of_week }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSchedules(prev => [data, ...prev]);
        runScheduleAutoInjectionAndMissedCheck(user).then(() => {
          fetchTasksAndSchedules(user);
        });
      }
    } catch (err) {
      console.error('[FlowDo] Error adding schedule:', err);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;
    } catch (err) {
      console.error('[FlowDo] Error deleting schedule:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setTasks([]);
    setSchedules([]);
  };

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ParticlesBackground />
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          </div>
          <span className="text-sm font-medium text-blue-300/70">Menghubungkan ke FlowDo...</span>
        </div>
      </div>
    );
  }

  // Route Guard: Unauthenticated users see Auth Screen
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col justify-between relative">
        <ParticlesBackground />
        <AuthScreen onAuthSuccess={(newSession) => setSession(newSession)} />
        <Footer />
      </div>
    );
  }

  // Authenticated Dashboard & Task View
  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative">
      <ParticlesBackground />

      {/* Top Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenSchedules={() => setIsScheduleModalOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Auto-Injection Notification Banner */}
      {notificationBanner && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full mt-3">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <BellRing size={14} className="shrink-0 text-blue-400 animate-bounce" />
              <span>{notificationBanner}</span>
            </div>
            <button
              onClick={() => setNotificationBanner(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-0.5 hover:bg-white/5 rounded"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7 w-full flex-1">
        {activeView === 'tasks' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Motivational Quote + Tasks */}
            <div className="lg:col-span-7 space-y-5">
              {/* Islamic Motivational Quote */}
              <div className="px-1">
                <p className="motivational-quote text-xl sm:text-2xl font-light leading-relaxed text-center lg:text-left">
                  Sometimes the process might be painful and hard,<br />
                  <span className="font-medium">but Allah's plan is always the best.</span>
                </p>
              </div>

              <TaskList
                tasks={tasks}
                onAddTask={handleAddTask}
                onToggleStatus={handleToggleStatus}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
                onUpdateSubtasks={handleUpdateSubtasks}
                onReorderTasks={handleReorderTasks}
                loading={tasksLoading}
              />
            </div>

            {/* Right Column: Calendar Streak */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <CalendarStreak tasks={tasks} />
            </div>
          </div>
        ) : (
          <DashboardAnalytics tasks={tasks} />
        )}
      </main>

      {/* Floating Pomodoro Focus Timer Widget */}
      <PomodoroWidget />

      {/* Recurring Schedules Management Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        schedules={schedules}
        onAddSchedule={handleAddSchedule}
        onDeleteSchedule={handleDeleteSchedule}
        user={user}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
