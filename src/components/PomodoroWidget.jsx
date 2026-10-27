import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  ChevronUp, 
  Coffee, 
  Sparkles,
  Volume2,
  CheckCircle2
} from 'lucide-react';

const MODES = {
  focus: { label: 'Fokus', minutes: 25, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  shortBreak: { label: 'Istirahat', minutes: 5, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  longBreak: { label: 'Rehat Panjang', minutes: 15, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' }
};

export default function PomodoroWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const timerRef = useRef(null);

  // Play gentle web audio synth chime when timer completes
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.warn('Audio context blocked or unsupported', e);
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playChime();

            if (mode === 'focus') {
              setSessionsCompleted((s) => s + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, mode]);

  const handleModeChange = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].minutes * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODES[mode].minutes * 60);
  };

  const toggleRunning = () => {
    if (timeLeft === 0) {
      setTimeLeft(MODES[mode].minutes * 60);
    }
    setIsRunning(!isRunning);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentModeConfig = MODES[mode];
  const totalSeconds = currentModeConfig.minutes * 60;
  const progressPercent = Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100);

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      {!isOpen ? (
        /* Floating Collapsed Pill */
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full glass-panel bg-neutral-900/90 border border-neutral-700 hover:border-indigo-500/60 shadow-2xl shadow-black/60 transition-all duration-300 hover:scale-105"
          title="Buka Focus Timer (Pomodoro)"
        >
          <div className="relative">
            <Timer size={18} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
            {isRunning && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <span className="text-xs font-mono font-bold text-neutral-200">
            {formattedTime}
          </span>
          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
            {currentModeConfig.label}
          </span>
        </button>
      ) : (
        /* Expanded Glassmorphism Panel */
        <div className="w-80 sm:w-84 rounded-3xl glass-panel bg-neutral-900/95 border border-neutral-700/80 p-5 shadow-2xl shadow-black/80 backdrop-blur-xl animate-fade-in relative">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Timer size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Focus Flow Timer</h4>
                <p className="text-[10px] text-neutral-400">Pomodoro Technique</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex gap-1.5 my-4 p-1 rounded-xl bg-neutral-800/80 border border-neutral-700/50">
            {Object.entries(MODES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleModeChange(key)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  mode === key
                    ? 'bg-neutral-700 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>

          {/* Time Display */}
          <div className="my-6 text-center">
            <div className="inline-block relative">
              <span className="text-5xl font-black font-mono tracking-tight text-white drop-shadow-sm">
                {formattedTime}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-48 mx-auto mt-3 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-neutral-400 mt-2">
              {isRunning ? 'Sedang berlangsung... Fokus penuh' : 'Siap untuk memulai sesi'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="p-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={toggleRunning}
              className={`flex-1 py-2.5 px-4 rounded-2xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause size={16} className="fill-current" />
                  <span>Jeda</span>
                </>
              ) : (
                <>
                  <Play size={16} className="fill-current ml-0.5" />
                  <span>Mulai Fokus</span>
                </>
              )}
            </button>
          </div>

          {/* Session Counter Footer */}
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Sesi Fokus Selesai:</span>
            <span className="font-mono font-bold text-indigo-400">
              {sessionsCompleted} sesi
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
