import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowRight, X, Loader2, Info, ArrowLeft, 
  Activity, Cpu, Watch, Trophy, CheckCircle2, 
  BarChart3, Zap, Globe
} from 'lucide-react';
// 👇 ИМПОРТ БИБЛИОТЕКИ АНИМАЦИИ
import { motion, AnimatePresence } from 'framer-motion';

// --- ИНИЦИАЛИЗАЦИЯ SUPABASE ---
const supabaseUrl = 'https://hiaqscvvxrkfmxufqyur.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYXFzY3Z2eHJrZm14dWZxeXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzM3NTgsImV4cCI6MjA4MzIwOTc1OH0.D_Y_RI2HgOXFPS-nIH5lAv79R2mEwiM3VoT1eaAxKYY';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- ДАННЫЕ СТАТЕЙ ---
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
    fullText: `Бег в низкой пульсовой зоне (Z2) развивает митохондрии и капиллярную сеть, что является фундаментом для любой выносливости. Основное правило: вы должны быть способны поддерживать разговор во время бега.`
  },
  {
    id: 2,
    title: 'Как выбрать первые кроссовки',
    description: 'Пронация, амортизация и почему не нужны самые дорогие модели.',
    category: 'Экипировка',
    readTime: '5 мин',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200',
    fullText: `Ваши кроссовки — это единственный инструмент, который отделяет вас от асфальта. Определите тип своей пронации. Не гонитесь за карбоновыми пластинами на старте.`
  },
  {
    id: 3,
    title: 'Психология первого старта',
    description: 'Как справиться с волнением перед забегом.',
    category: 'Психология',
    readTime: '4 мин',
    image: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&q=80&w=1200',
    fullText: `Мандраж — это нормально. Разделите дистанцию на кусочки. Не думайте "мне бежать еще 10 км", думайте "добегу до того поворота".`
  }
];

// --- ВАРИАНТЫ АНИМАЦИЙ (Framer Motion Variants) ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }
};

// --- КОМПОНЕНТ AUTH MODAL ---
const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Используем AnimatePresence для плавног появления/исчезновения
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Фон (Backdrop) */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl" 
            onClick={onClose} 
          />
          
          {/* Само модальное окно */}
          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-[#111]/80 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center font-bold text-3xl italic mx-auto mb-4 text-white shadow-xl shadow-blue-500/20">RC</div>
              <motion.h2 
                key={isLogin ? 'login' : 'register'} // Ключ для анимации смены текста
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-black text-white mb-2"
              >
                {isLogin ? 'С возвращением' : 'Новый атлет'}
              </motion.h2>
              <p className="text-slate-400 text-sm font-medium">Твой AI-тренер готов к работе</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold mb-6 flex items-start gap-3 overflow-hidden">
                <Info size={16} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-500 ml-3 tracking-widest">Электронная почта</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white outline-none transition-all font-medium" placeholder="name@email.com" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-500 ml-3 tracking-widest">Пароль</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white outline-none transition-all font-medium" placeholder="••••••••" />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 shadow-lg shadow-blue-600/30"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Войти в систему' : 'Создать план')}
              </motion.button>
            </form>

            <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="w-full text-center text-[10px] font-black text-slate-500 hover:text-white mt-8 transition-colors uppercase tracking-[0.2em]">
              {isLogin ? 'Нет аккаунта? Стать участником' : 'Уже в команде? Авторизация'}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- ГЛАВНАЯ СТРАНИЦА ---
const LandingPage: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Анимация открытия статьи на весь экран
  if (selectedArticle) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
        className="min-h-screen bg-[#09090b] text-white pt-20 pb-20 px-6"
      >
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2 text-slate-500 hover:text-white mb-10 transition-colors font-black text-xs uppercase tracking-widest group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Назад к знаниям
          </button>
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="aspect-[21/9] w-full rounded-[2.5rem] overflow-hidden mb-10 shadow-2xl border border-white/5">
            <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
          </motion.div>
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-4 mb-8">
            <span className="px-4 py-1.5 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">{selectedArticle.category}</span>
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{selectedArticle.readTime}</span>
          </motion.div>

          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-4xl md:text-6xl font-black mb-10 leading-tight tracking-tighter">{selectedArticle.title}</motion.h1>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="h-1 w-20 bg-blue-600 mb-10 origin-left" />
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-xl text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">{selectedArticle.fullText}</motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-[#09090b] min-h-screen text-white font-sans selection:bg-blue-600/40 overflow-x-hidden">
      
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Навигация с анимацией появления */}
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="fixed top-0 left-0 right-0 z-50 py-6 px-8 backdrop-blur-xl border-b border-white/5 bg-[#09090b]/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-black italic text-white shadow-lg">RC</motion.div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">Run Coach</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Функции</a>
            <a href="#articles" className="hover:text-white transition-colors">База знаний</a>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAuthModalOpen(true)} className="bg-white text-black px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all hover:bg-blue-500 hover:text-white shadow-xl shadow-white/5">
            Войти
          </motion.button>
        </div>
      </motion.nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Hero секция с каскадной анимацией при загрузке */}
      <section className="relative pt-48 pb-32 px-6 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-6xl mx-auto relative z-10">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-10">
            <Zap size={14} className="text-blue-500 fill-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">AI-Powered Training V2.0</span>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-6xl md:text-[10rem] font-black mb-10 tracking-[ -0.05em] leading-[0.85] uppercase italic">
            Беги умнее,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">а не больше.</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-14 font-medium leading-relaxed">
            Научный подход TrainingPeaks и простота Runna. Персональный AI-план, который адаптируется к твоему прогрессу в реальном времени.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(37,99,235,0.5)" }} whileTap={{ scale: 0.98 }}
              onClick={() => setIsAuthModalOpen(true)} 
              className="px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] flex items-center gap-3 group"
            >
              Начать тренировки <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </motion.button>
            {/* Аватарки */}
            <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (<div key={i} className="w-10 h-10 rounded-full border-2 border-[#09090b] bg-slate-800 overflow-hidden"><img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" /></div>))}
               <div className="pl-6 text-slate-500 text-[10px] font-black uppercase tracking-widest self-center">1500+ атлетов уже с нами</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Bar (появление при скролле) */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
        className="px-6 mb-32"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Тренировок', value: '50k+', icon: Activity },
            { label: 'Точность зон', value: '98.4%', icon: BarChart3 },
            { label: 'Атлетов', value: '1.2k', icon: Globe },
            { label: 'Медалей', value: '450+', icon: Trophy }
          ].map((stat, i) => (
            <motion.div variants={fadeInUp} key={i} whileHover={{ y: -5, borderColor: 'rgba(59,130,246,0.5)' }} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm text-center group transition-all">
              <stat.icon size={20} className="mx-auto mb-4 text-blue-500" />
              <div className="text-3xl font-black mb-1 tracking-tighter">{stat.value}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features Section (появление при скролле) */}
      <motion.section id="features" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="py-20 px-6 max-w-7xl mx-auto mb-32">
        <motion.div variants={fadeInUp} className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black uppercase italic mb-6">Технологии победы</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Твой успех — наша математика</p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "AI-адаптация", desc: "План пересчитывается после каждой тренировки на основе твоего пульса.", icon: Cpu },
            { title: "Смарт-часы", desc: "Прямая выгрузка тренировок в Garmin, Apple Watch и COROS.", icon: Watch },
            { title: "Любой уровень", desc: "От первой пробежки в парке до квалификации на Boston Marathon.", icon: CheckCircle2 }
          ].map((f, i) => (
            <motion.div variants={fadeInUp} key={i} whileHover={{ scale: 1.03 }} className="group p-10 bg-gradient-to-b from-white/10 to-transparent border border-white/5 rounded-[3rem] hover:border-blue-500/30 transition-all">
              <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <f.icon size={28} className="text-blue-500" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase italic">{f.title}</h3>
              <p className="text-slate-400 font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* База знаний (появление при скролле) */}
      <motion.section id="articles" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="py-20 px-6 max-w-7xl mx-auto mb-32">
        <motion.div variants={fadeInUp} className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic mb-4 tracking-tighter">База знаний</h2>
            <p className="text-blue-500 font-black uppercase tracking-widest text-xs">Становись сильнее с каждым текстом</p>
          </div>
          <button className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors border-b border-white/10 pb-2">Смотреть все статьи</button>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {ARTICLES.map((article, i) => (
            <motion.div variants={fadeInUp} key={article.id} onClick={() => setSelectedArticle(article)} whileHover={{ y: -10 }} className="group cursor-pointer relative">
              <div className="absolute -inset-2 bg-blue-600/0 rounded-[2.5rem] group-hover:bg-blue-600/5 transition-all duration-500" />
              <div className="relative bg-[#111] border border-white/5 rounded-[2rem] overflow-hidden transition-all group-hover:border-blue-500/30">
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                  <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                    {article.category}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-black mb-4 leading-tight tracking-tight group-hover:text-blue-400 transition-colors uppercase italic">{article.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 font-medium">{article.description}</p>
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{article.readTime}</span>
                    <ArrowRight size={16} className="text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <footer className="border-t border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="flex items-center gap-3">
              <motion.div whileHover={{ rotate: 20 }} className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black italic text-white">RC</motion.div>
              <span className="text-xl font-black tracking-tighter uppercase italic">Run Coach</span>
           </div>
           <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Конфиденциальность</a>
              <a href="#" className="hover:text-white transition-colors">Условия</a>
              <a href="#" className="hover:text-white transition-colors">Поддержка</a>
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 italic">© 2026 Run Coach Systems. Pro Grade.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
