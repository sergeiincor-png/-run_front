import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Activity, Mail, ChevronRight, Sparkles } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      alert("Ошибка: " + error.message);
    } else {
      setIsSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Заголовок */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black mb-6 uppercase tracking-widest">
            <Sparkles size={12} /> AI RUNNING COACH
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-tight mb-4">
            БЕГИ <span className="text-blue-500">УМНЕЕ</span>
          </h1>
          <p className="text-slate-400 text-sm">Входим без паролей — пришлем ссылку на почту</p>
        </div>

        {/* Форма авторизации */}
        {!isSent ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="email" 
                placeholder="Твоя почта (email)" 
                required
                className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 transition-all font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
            >
              {loading ? "ОТПРАВЛЯЕМ..." : "ПОЛУЧИТЬ ССЫЛКУ ДЛЯ ВХОДА"}
              {!loading && <ChevronRight size={20} />}
            </button>
          </form>
        ) : (
          <div className="bg-emerald-500/10 border-2 border-emerald-500/20 p-8 rounded-3xl text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <Mail size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Письмо отправлено!</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Проверь почту <b>{email}</b> и нажми на ссылку в письме, чтобы войти в приложение.
            </p>
            <button 
              onClick={() => setIsSent(false)} 
              className="mt-6 text-sm text-slate-500 font-bold hover:text-white"
            >
              Использовать другую почту
            </button>
          </div>
        )}

        {/* Футер */}
        <p className="text-center text-[10px] text-slate-600 uppercase font-bold mt-10 tracking-[0.2em]">
          NO PASSWORDS • SECURE • AI DRIVEN
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
