import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  X, ArrowLeft, Loader2, Info
} from 'lucide-react';

interface Article {
  id: number;
  title: string;
  description: string;
  fullText: string;
  category: string;
  readTime: string;
  image: string;
}

// Модальное окно авторизации
const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = isLogin 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      if (error) throw error;
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-card w-full max-w-md p-10 rounded-[3rem] relative border border-white/10 bg-[#1c1c1f] shadow-2xl">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-3xl italic mx-auto mb-6 text-white text-white">RC</div>
          <h2 className="text-4xl font-black mb-2 tracking-tight text-white">{isLogin ? 'Вход' : 'Регистрация'}</h2>
          <p className="text-slate-400 font-medium">Твой AI-тренер ждет тебя</p>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm mb-6 flex gap-2"><Info size={16}/>{error}</div>}
        <form onSubmit={handleAuth} className="space-y-5">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-blue-500 text-white outline-none" placeholder="athlete@run.coach" />
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-blue-500 text-white outline-none" placeholder="••••••••" />
          <button type="submit" disabled={loading} className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={24} /> : (isLogin ? 'Войти' : 'Создать аккаунт')}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-sm text-slate-400 hover:text-white mt-8 font-medium">{isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть профиль? Войдите'}</button>
      </div>
    </div>
  );
};
