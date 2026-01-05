
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { supabase } from './supabaseClient';
import { 
  ArrowRight, 
  CheckCircle2, 
  Heart, 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  MessageSquare, 
  Activity,
  ChevronRight,
  Menu,
  X,
  BookOpen,
  Clock,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  LogOut,
  Mail,
  Lock,
  Loader2,
  User
} from 'lucide-react';

// --- Types ---
interface NavLink {
  name: string;
  href: string;
}

interface Article {
  id: number;
  title: string;
  description: string;
  fullText: string;
  category: string;
  readTime: string;
  image: string;
}

// --- Data ---
const ARTICLES_DATA: Article[] = [
  {
    id: 1,
    title: 'Что такое пульсовые зоны и как их рассчитать?',
    description: 'Разбираемся в аэробной базе, ПАНО и почему «бежать быстрее» не всегда значит «тренироваться лучше».',
    category: 'Теория',
    readTime: '6 мин',
    image: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&q=80&w=1200',
    fullText: `Пульсовые зоны — это диапазоны частоты сердечных сокращений (ЧСС), которые определяют интенсивность вашей тренировки и то, какой ресурс организма вы развиваете в данный момент. Для большинства новичков понимание этих зон становится ключом к прогрессу без травм.`
  },
  {
    id: 2,
    title: 'Сколько времени нужно, чтобы подготовиться к забегу?',
    description: 'От дивана до первых 5 км за 8 недель. Реальные сроки подготовки без риска для здоровья.',
    category: 'Планирование',
    readTime: '5 мин',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=1200',
    fullText: `Оптимальный срок для подготовки к первым 5 км с "нуля" составляет 8-10 недель. За это время организм успеет привыкнуть к ударной нагрузке без риска получить воспаление надкостницы.`
  }
];

// --- Components ---

const AuthModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
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
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Проверьте почту для подтверждения регистрации!');
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-card w-full max-w-md p-8 rounded-[2.5rem] relative animate-in zoom-in-95 duration-300 border-white/10 shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl italic mx-auto mb-4">RC</div>
          <h2 className="text-3xl font-bold mb-2">{isLogin ? 'С возвращением' : 'Создать аккаунт'}</h2>
          <p className="text-slate-400 text-sm">Ваш путь к первым 5 км начинается здесь</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 flex gap-2 items-center">
            <X size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-colors text-white"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-colors text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black py-4 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Navbar: React.FC<{ 
  onLogoClick: () => void, 
  user: any, 
  onAuthClick: () => void,
  onLogout: () => void 
}> = ({ onLogoClick, user, onAuthClick, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links: NavLink[] = [
    { name: 'Блог', href: '#blog' },
    { name: 'Как это работает', href: '#how-it-works' },
    { name: 'Тарифы', href: '#pricing' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onLogoClick}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold italic tracking-tighter text-white">RC</div>
          <span className="text-xl font-bold tracking-tight">RUN Coach</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <a key={link.name} href={link.href} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              {link.name}
            </a>
          ))}
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center border border-white/10">
                  <User size={14} />
                </div>
                <span className="max-w-[120px] truncate">{user.email}</span>
              </div>
              <button 
                onClick={onLogout}
                className="text-slate-500 hover:text-white transition-colors"
                title="Выйти"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onAuthClick}
              className="bg-white text-black px-6 py-2 rounded-full text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Войти
            </button>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

const Hero: React.FC<{ onCtaClick: () => void }> = ({ onCtaClick }) => {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = useCallback(async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: 'High-end cinematic minimalist shot of a runner, graphite blue tones, HUD UI elements, SaaS 2025 aesthetic.' }] },
        config: { imageConfig: { aspectRatio: "16:9" } },
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setHeroImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      setHeroImage('https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=2000');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  useEffect(() => { generateImage(); }, [generateImage]);

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 mb-8">
          <Sparkles size={14} className="animate-pulse" />
          Авторизация через Supabase подключена
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6 gradient-text tracking-tight">
          Бегайте в удовольствие.<br />Прогрессируйте с AI.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Персональный план подготовки к 5 км или 10 км, который адаптируется под вас. Регистрируйтесь и начните путь сегодня.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onCtaClick}
            className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-white/5"
          >
            Начать 7 дней бесплатно
          </button>
          <button 
            onClick={generateImage}
            disabled={isGenerating}
            className="w-full sm:w-auto px-6 py-4 bg-white/5 border border-white/10 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <RefreshCw size={20} />}
            Обновить визуал
          </button>
        </div>

        <div className="mt-20 relative mx-auto max-w-4xl">
          <div className="aspect-[16/9] rounded-2xl glass-card overflow-hidden shadow-2xl relative group">
            {isGenerating || !heroImage ? (
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Sparkles className="text-blue-500 animate-bounce" size={48} />
                  <p className="text-slate-500 text-sm font-medium">Генерируем атмосферу...</p>
                </div>
              </div>
            ) : (
              <img src={heroImage} alt="Hero" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-[2000ms]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};

// ... Остальные секции (ProblemSection, HowItWorks и т.д.) переиспользуются из предыдущего кода ...

const App: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Проверка текущей сессии
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Слушатель изменений авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleCtaClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      alert('Вы уже вошли! Ваш план тренировок скоро появится здесь.');
    }
  };

  return (
    <main className="min-h-screen selection:bg-blue-500 selection:text-white">
      <Navbar 
        onLogoClick={() => setSelectedArticle(null)} 
        user={user} 
        onAuthClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      
      {selectedArticle ? (
        <ArticleDetailView article={selectedArticle} onBack={() => setSelectedArticle(null)} />
      ) : (
        <>
          <Hero onCtaClick={handleCtaClick} />
          {/* Здесь можно вставить BlogSection, HowItWorks и т.д. */}
          
          <section id="pricing" className="py-24">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-4xl font-bold mb-12">Готовы к старту?</h2>
              <div className="glass-card p-12 rounded-[3rem] border-blue-500/20">
                <p className="text-6xl font-bold mb-4">990₽<span className="text-xl text-slate-500">/мес</span></p>
                <button 
                  onClick={handleCtaClick}
                  className="bg-white text-black px-12 py-5 rounded-full font-bold text-xl hover:scale-105 transition-all mb-4"
                >
                  Начать 7 дней бесплатно
                </button>
                <p className="text-slate-500 text-sm">Требуется регистрация для сохранения прогресса</p>
              </div>
            </div>
          </section>
        </>
      )}
      
      <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm">
        © 2025 RUN Coach. Работает на Supabase & Gemini AI.
      </footer>
    </main>
  );
};

// Вспомогательные компоненты (упрощенно для краткости примера)
const ArticleDetailView: React.FC<{article: Article, onBack: () => void}> = ({ article, onBack }) => (
  <div className="pt-32 px-6 max-w-4xl mx-auto">
    <button onClick={onBack} className="text-blue-400 mb-8">← Назад</button>
    <h1 className="text-4xl font-bold mb-6">{article.title}</h1>
    <p className="text-slate-400 whitespace-pre-wrap">{article.fullText}</p>
  </div>
);

export default App;
