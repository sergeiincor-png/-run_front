
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../supabaseClient';
import { 
  ArrowRight, CheckCircle2, Zap, ShieldCheck, Activity, ChevronRight, Menu, X, Clock, ArrowLeft, RefreshCw, Sparkles, LogOut, Mail, Lock, Loader2, Smartphone, Info, Trophy, BarChart3, Heart, MessageSquare
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

const ARTICLES: Article[] = [
  {
    id: 1,
    title: 'Пульсовые зоны для новичков: Z2 — ваш лучший друг',
    description: 'Почему бегать медленно — это самый быстрый путь к результату и здоровому сердцу.',
    category: 'Теория',
    readTime: '6 мин',
    image: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&q=80&w=1200',
    fullText: `Многие новички совершают одну и ту же ошибку...`
  },
  {
    id: 2,
    title: 'Как выбрать первые кроссовки и не разориться',
    description: 'Разбираемся в пронации, амортизации и том, стоит ли покупать флагманские модели.',
    category: 'Экипировка',
    readTime: '5 мин',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200',
    fullText: `Ваши кроссовки — это единственный инструмент...`
  },
  {
    id: 3,
    title: 'Психология первого старта: как победить мандраж',
    description: 'Практические советы по подготовке к дню забега: от сна до завтрака.',
    category: 'Психология',
    readTime: '4 мин',
    image: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&q=80&w=1200',
    fullText: `Забег — это праздник...`
  }
];

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
      <div className="glass-card w-full max-w-md p-10 rounded-[3rem] relative border-white/10 shadow-2xl">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-3xl italic mx-auto mb-6 text-white">RC</div>
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

const LandingPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    generateHeroImage();
  }, []);

  const generateHeroImage = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: 'Cinematic runner at blue hour, futuristic minimalist aesthetic, graphite tones, high-end SaaS 2025 style.' }] },
        config: { imageConfig: { aspectRatio: "16:9" } },
      });
      const base64 = response.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData?.data;
      if (base64) setHeroImage(`data:image/png;base64,${base64}`);
    } catch (e) {
      setHeroImage('https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=2000');
    } finally {
      setIsGenerating(false);
    }
  };

  if (selectedArticle) {
    return (
      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-10 group transition-colors">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Назад в блог
        </button>
        <h1 className="text-4xl md:text-6xl font-bold mb-8 text-white">{selectedArticle.title}</h1>
        <p className="text-xl text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedArticle.fullText}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#09090b]">
      <nav className="fixed top-0 left-0 right-0 z-[60] py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold italic text-white shadow-lg">RC</div>
            <span className="text-2xl font-bold tracking-tighter text-white">RUN Coach</span>
          </div>
          <button onClick={() => setIsAuthModalOpen(true)} className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold">Начать бесплатно</button>
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <section className="relative pt-48 pb-32 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-6xl md:text-9xl font-black mb-8 tracking-tighter text-white leading-[0.9]">Твой бег.<br />Наш интеллект.</h1>
          <div className="flex justify-center gap-5">
            <button onClick={() => setIsAuthModalOpen(true)} className="px-12 py-5 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-all shadow-2xl">Начать 7 дней бесплатно</button>
          </div>
          <div className="mt-24 relative mx-auto max-w-5xl rounded-[3rem] overflow-hidden glass-card p-3">
             <img src={heroImage || ''} className="w-full aspect-video object-cover opacity-80 rounded-[2.5rem]" alt="Hero" />
          </div>
        </div>
      </section>

      {/* Другие секции можно перенести аналогично для краткости... */}
      <section className="py-32 px-6 max-w-7xl mx-auto text-center">
         <h2 className="text-4xl md:text-6xl font-bold text-white mb-12">Готовы к первой тренировке?</h2>
         <button onClick={() => setIsAuthModalOpen(true)} className="px-10 py-5 bg-blue-600 text-white rounded-full font-bold text-xl hover:bg-blue-700 transition-all">Зарегистрироваться</button>
      </section>
    </div>
  );
};

export default LandingPage;
