import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, ChevronRight, Activity, UserPlus, LogIn } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Переключатель: Вход или Регистрация

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // РЕГИСТРАЦИЯ
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) alert("Ошибка регистрации: " + error.message);
      else alert("Регистрация успешна! Теперь вы можете войти.");
    } else {
      // ВХОД
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) alert("Ошибка входа: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        
        {/* Лого */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-600/20 rotate-3">
            <Activity size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-tight">
            RUNNA <span className="text-blue-500">CLONE</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">AI Running Coach</p>
        </div>

        {/* Форма */}
        <div className="bg-[#111] border border-white/5 p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
          
          <h2 className="text-xl font-bold mb-6 text-center">
            {isSignUp ? 'Создать аккаунт' : 'С возвращением!'}
          </h2>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="email" 
                  placeholder="email@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 transition-all font-bold text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 transition-all font-bold text-sm"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 uppercase tracking-widest mt-4 shadow-lg shadow-blue-600/20"
            >
              {loading ? "Загрузка..." : (isSignUp ? "Зарегистрироваться" : "Войти")}
              {isSignUp ? <UserPlus size={18}/> : <LogIn size={18} />}
            </button>
          </form>

          {/* Переключатель Вход/Регистрация */}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full mt-6 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors tracking-widest"
          >
            {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>
        </div>

        <p className="text-center text-[9px] text-slate-700 uppercase font-black mt-10 tracking-[0.4em]">
          TRAIN LIKE A PRO • DATA BY AI
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
