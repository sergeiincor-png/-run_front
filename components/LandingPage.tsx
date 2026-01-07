import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  ArrowRight, X, Loader2, Info, ArrowLeft
} from 'lucide-react';

// --- ТИПЫ И ДАННЫЕ ---
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
    title: 'Пульсовые зоны: Z2 — ваш лучший друг',
    description: 'Почему медленный бег — самый быстрый путь к результату.',
    category: 'Теория',
    readTime: '6 мин',
    image: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&q=80&w=1200',
    fullText: `Бег в низкой пульсовой зоне (Z2) развивает митохондрии и капиллярную сеть, что является фундаментом для любой выносливости. Многие новички бегают слишком быстро, загоняя себя в "серую зону", где усталость накапливается, а прогресс стоит на месте.\n\nОсновное правило: вы должны быть способны поддерживать разговор во время бега.`
  },
  {
    id: 2,
    title: 'Как выбрать первые кроссовки',
    description: 'Пронация, амортизация и почему не нужны самые дорогие модели.',
    category: 'Экипировка',
    readTime: '5 мин',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200',
    fullText: `Ваши кроссовки — это единственный инструмент, который отделяет вас от асфальта. Для начала определите тип своей пронации (нейтральная, гиперпронация или гипопронация). Не гонитесь за карбоновыми пластинами на старте — они требуют подготовленных икр и ахилла.`
  },
  {
    id: 3,
    title: 'Психология первого старта',
    description: 'Как справиться с волнением перед забегом.',
    category: 'Психология',
    readTime: '4 мин',
    image: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&q=80&w=1200',
    fullText: `Мандраж — это нормально. Это признак того, что событие для вас важно. Разделите дистанцию на кусочки. Не думайте "мне бежать еще 10 км", думайте "добегу до того поворота".`
  }
];

// --- МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ ---
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
      
      // Если успешный вход/регистрация — закрываем окно (App.tsx сам переключит на Dashboard)
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#111] border border-white/10 p-8 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-2xl italic mx-auto mb-4 text-white shadow-lg shadow-blue-900/50">RC</div>
          <h2 className="text-3xl font-black text-white mb-1">{isLogin ? 'С возвращением' : 'Создать аккаунт'}</h2>
          <p className="text-slate-400 text-sm">Твой персональный план бега</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-bold mb-6 flex items-start gap-2">
            <Info size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 px-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white outline-none transition-all font-medium placeholder:text-slate-600" 
              placeholder="runner@example.com" 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-2">Пароль</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-black/50 border border-white/10 rounded-xl py-3.5 px-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white outline-none transition-all font-medium placeholder:text-slate-600" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-white hover:bg-slate-200 text-black py-4 rounded-xl font-black text-base transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        <button 
          onClick={() => { setIsLogin(!isLogin); setError(null); }} 
          className="w-full text-center text-xs font-bold text-slate-500 hover:text-white mt-6 transition-colors uppercase tracking-wide"
        >
          {isLogin ? 'Нет аккаунта? Регистрация' : 'Есть аккаунт? Вход'}
        </button>
      </div>
    </div>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ ---
const LandingPage: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Если открыта статья — показываем её на весь экран
  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white pt-10 pb-20 px-6 overflow-y-auto animate-in fade-in duration-300">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => setSelectedArticle(null)} 
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 group transition-colors font-bold text-sm uppercase tracking-wider"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Назад
          </button>
          
          <div className="aspect-video w-full rounded-3xl overflow-hidden mb-8 shadow-2xl shadow-blue-900/10">
            <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/20">
              {selectedArticle.category}
            </span>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              {selectedArticle.readTime} чтения
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-8 leading-tight">{selectedArticle.title}</h1>
          <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">{selectedArticle.fullText}</p>
        </div>
      </div>
    );
  }

  // Главная страница
  return (
    <div className="bg-[#09090b] min-h-screen text-white font-sans selection:bg-blue-500/30">
      
      {/* Навигация */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-6 px-6 backdrop-blur-md border-b border-white/5 bg-[#09090b]/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold italic text-white shadow-lg">RC</div>
            <span className="text-xl font-bold tracking-tighter">RUN Coach</span>
          </div>
          <button 
            onClick={() => setIsAuthModalOpen(true)} 
            className="bg-white hover:bg-slate-200 text-black px-5 py-2 rounded-full text-sm font-bold transition-colors"
          >
            Войти
          </button>
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Hero секция */}
      <section className="relative pt-40 pb-20 px-6 text-center overflow-hidden">
        {/* Фоновые пятна */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
            Беги умнее,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">а не больше.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-medium">
            Персональные тренировочные планы, адаптирующиеся под твой пульс, темп и восстановление.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => setIsAuthModalOpen(true)} 
              className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2"
            >
              Начать тренировки <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Секция статей (Блог) */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">База знаний</h2>
          <p className="hidden md:block text-slate-500 font-bold uppercase tracking-widest text-sm">Полезное чтение</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {ARTICLES.map((article) => (
            <div 
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="group cursor-pointer bg-[#111] border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all hover:-translate-y-1"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
                  {article.category}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-blue-400 transition-colors">{article.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{article.description}</p>
                <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-wider text-slate-600">
                  {article.readTime} чтения
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Футер */}
      <footer className="border-t border-white/5 py-12 text-center text-slate-500 text-sm font-medium">
        <p>&copy; 2025 Run Coach AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
