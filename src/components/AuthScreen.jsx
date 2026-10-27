import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Lock, Mail, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(100,150,220,0.2)',
  color: '#e2e8f0',
};

export default function AuthScreen({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email,       setEmail]      = useState('');
  const [password,    setPassword]   = useState('');
  const [showPwd,     setShowPwd]    = useState(false);
  const [loading,     setLoading]    = useState(false);
  const [errorMsg,    setErrorMsg]   = useState('');
  const [infoMsg,     setInfoMsg]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setInfoMsg('');

    if (!isSupabaseConfigured) {
      setErrorMsg('Konfigurasi Supabase belum lengkap. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env');
      return;
    }
    if (!email || !password) { setErrorMsg('Mohon isi email dan password.'); return; }
    if (password.length < 6) { setErrorMsg('Password minimal 6 karakter.'); return; }

    setLoading(true);
    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data?.user && data?.session) {
          setInfoMsg('Pendaftaran berhasil!');
          if (onAuthSuccess) onAuthSuccess(data.session);
        } else {
          setInfoMsg('Berhasil! Cek email Anda untuk konfirmasi akun.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data?.session && onAuthSuccess) onAuthSuccess(data.session);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat otentikasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.25)',
              boxShadow: '0 0 40px -10px rgba(99,102,241,0.3)',
            }}
          >
            <Sparkles size={30} className="text-indigo-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Flow<span className="text-indigo-400">Do</span>
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Discipline &amp; Flow • Habit tracking with automated accountability
          </p>
        </div>

        {/* Supabase config warning */}
        {!isSupabaseConfigured && (
          <div
            className="mb-5 p-4 rounded-xl text-amber-200 text-sm flex gap-3 items-start"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            <AlertCircle className="shrink-0 mt-0.5 text-amber-400" size={17} />
            <div>
              <p className="font-semibold text-amber-300 text-sm">Konfigurasi Supabase Diperlukan</p>
              <p className="text-xs text-amber-200/70 mt-1">
                Tambahkan <code className="bg-black/30 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> dan{' '}
                <code className="bg-black/30 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> ke file <code className="bg-black/30 px-1 py-0.5 rounded">.env</code>
              </p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div
          className="p-7 rounded-2xl relative overflow-hidden"
          style={{
            background: 'rgba(6, 16, 45, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(100,150,220,0.18)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Background glows */}
          <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }} />

          {/* Tab selector */}
          <div
            className="flex p-0.5 mb-6 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(100,150,220,0.12)' }}
          >
            {[
              { label: 'Masuk', value: false },
              { label: 'Daftar Baru', value: true },
            ].map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => { setIsRegister(tab.value); setErrorMsg(''); setInfoMsg(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-[10px] transition-all ${
                  isRegister === tab.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl text-red-300 text-xs flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {infoMsg && (
            <div className="mb-4 p-3 rounded-xl text-emerald-300 text-xs flex items-center gap-2"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder-slate-600 focus:outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(100,150,220,0.2)'}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm placeholder-slate-600 focus:outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(100,150,220,0.2)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                {isRegister ? 'Minimal 6 karakter.' : 'Masukkan kata sandi terdaftar Anda.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>{isRegister ? 'Buat Akun FlowDo' : 'Masuk ke FlowDo'}</span>
                </>
              )}
            </button>
          </form>

          {/* Security note */}
          <div className="mt-5 pt-4 flex items-center justify-center gap-2 text-xs text-slate-600"
            style={{ borderTop: '1px solid rgba(100,150,220,0.08)' }}>
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Terproteksi Supabase Auth &amp; PostgreSQL RLS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
